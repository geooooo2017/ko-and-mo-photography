-- Ko&Mo Photography: enquiries + availability
create extension if not exists pgcrypto;

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  status text not null check (status in ('available', 'limited', 'booked')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  event_date date,
  event_type text not null,
  location text,
  message text,
  estimated_total numeric,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists availability_date_idx on public.availability (date);
create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.availability enable row level security;
alter table public.enquiries enable row level security;

-- Public can read availability
create policy "Public read availability"
  on public.availability for select
  to anon, authenticated
  using (true);

-- Only authenticated (photographer) can manage availability
create policy "Auth manage availability"
  on public.availability for all
  to authenticated
  using (true)
  with check (true);

-- Public can submit enquiries
create policy "Public insert enquiries"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

-- Only authenticated can read/update enquiries
create policy "Auth read enquiries"
  on public.enquiries for select
  to authenticated
  using (true);

create policy "Auth update enquiries"
  on public.enquiries for update
  to authenticated
  using (true)
  with check (true);
