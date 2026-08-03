-- Reviews + customer invite links for Kind Words

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.review_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  customer_name text,
  customer_email text,
  session_type text,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'used', 'revoked')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  expires_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_type text not null default 'Session',
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  status text not null default 'pending'
    check (status in ('pending', 'published', 'hidden')),
  source text not null default 'manual'
    check (source in ('manual', 'invite')),
  invite_id uuid references public.review_invites (id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

create index if not exists review_invites_status_created_idx
  on public.review_invites (status, created_at desc);

alter table public.review_invites enable row level security;
alter table public.reviews enable row level security;

-- Published reviews are public on the homepage
create policy "Public read published reviews"
  on public.reviews for select
  to anon, authenticated
  using (status = 'published');

-- Photographer manages all reviews
create policy "Auth manage reviews"
  on public.reviews for all
  to authenticated
  using (true)
  with check (true);

-- Photographer manages invites
create policy "Auth manage review invites"
  on public.review_invites for all
  to authenticated
  using (true)
  with check (true);

-- Safe public lookup of an invite by token (no email leak via list)
create or replace function public.get_review_invite(p_token text)
returns table (
  id uuid,
  customer_name text,
  session_type text,
  status text,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    i.id,
    i.customer_name,
    i.session_type,
    i.status,
    i.expires_at
  from public.review_invites i
  where i.token = p_token
    and i.status = 'pending'
    and (i.expires_at is null or i.expires_at > now())
  limit 1;
$$;

revoke all on function public.get_review_invite(text) from public;
grant execute on function public.get_review_invite(text) to anon, authenticated;

-- Customer submits a review via invite token; starts as pending for approval
create or replace function public.submit_review_via_invite(
  p_token text,
  p_name text,
  p_quote text,
  p_rating int default 5,
  p_session_type text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.review_invites%rowtype;
  v_review_id uuid;
  v_name text;
  v_quote text;
  v_rating int;
  v_session text;
begin
  v_name := nullif(trim(p_name), '');
  v_quote := nullif(trim(p_quote), '');
  v_rating := coalesce(p_rating, 5);
  v_session := nullif(trim(coalesce(p_session_type, '')), '');

  if v_name is null or char_length(v_name) < 2 then
    raise exception 'Please enter your name';
  end if;
  if v_quote is null or char_length(v_quote) < 10 then
    raise exception 'Please write a short review';
  end if;
  if v_rating < 1 or v_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  select * into v_invite
  from public.review_invites
  where token = p_token
  for update;

  if not found then
    raise exception 'This review link is invalid';
  end if;
  if v_invite.status <> 'pending' then
    raise exception 'This review link has already been used';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at <= now() then
    raise exception 'This review link has expired';
  end if;

  insert into public.reviews (
    name,
    session_type,
    quote,
    rating,
    status,
    source,
    invite_id
  )
  values (
    v_name,
    coalesce(v_session, nullif(v_invite.session_type, ''), 'Session'),
    v_quote,
    v_rating,
    'pending',
    'invite',
    v_invite.id
  )
  returning id into v_review_id;

  update public.review_invites
  set status = 'used', used_at = now()
  where id = v_invite.id;

  return v_review_id;
end;
$$;

revoke all on function public.submit_review_via_invite(text, text, text, int, text) from public;
grant execute on function public.submit_review_via_invite(text, text, text, int, text) to anon, authenticated;
