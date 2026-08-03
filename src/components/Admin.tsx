import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  Inbox,
  LogOut,
  MessageSquareQuote,
  Plus,
  Send,
} from "lucide-react";
import { colors } from "../data/images";
import {
  isSupabaseConfigured,
  reviewInviteUrl,
  SESSION_TYPES,
  supabase,
  type AvailabilityStatus,
  type EnquiryRow,
  type ReviewInviteRow,
  type ReviewRow,
  type ReviewStatus,
} from "../lib/supabase";
import { SectionLabel } from "./ui";

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"availability" | "enquiries" | "reviews">(
    "availability",
  );
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<
    Record<string, AvailabilityStatus>
  >({});
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [invites, setInvites] = useState<ReviewInviteRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedToken, setCopiedToken] = useState("");
  const [reviewForm, setReviewForm] = useState({
    name: "",
    session_type: "Family",
    quote: "",
    rating: 5,
  });
  const [inviteForm, setInviteForm] = useState({
    customer_name: "",
    customer_email: "",
    session_type: "Family",
  });
  const [latestInviteUrl, setLatestInviteUrl] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAvailability = async () => {
    if (!supabase) return;
    const start = toDateKey(month.getFullYear(), month.getMonth(), 1);
    const end = toDateKey(month.getFullYear(), month.getMonth() + 1, 0);
    const { data, error } = await supabase
      .from("availability")
      .select("date,status")
      .gte("date", start)
      .lte("date", end);
    if (error) {
      setMessage(error.message);
      return;
    }
    const map: Record<string, AvailabilityStatus> = {};
    data?.forEach((row) => {
      map[row.date] = row.status as AvailabilityStatus;
    });
    setAvailability(map);
  };

  const loadEnquiries = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      setMessage(error.message);
      return;
    }
    setEnquiries((data as EnquiryRow[]) ?? []);
  };

  const loadReviews = async () => {
    if (!supabase) return;
    const [reviewsRes, invitesRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("review_invites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (reviewsRes.error) {
      setMessage(reviewsRes.error.message);
      return;
    }
    if (invitesRes.error) {
      setMessage(invitesRes.error.message);
      return;
    }
    setReviews((reviewsRes.data as ReviewRow[]) ?? []);
    setInvites((invitesRes.data as ReviewInviteRow[]) ?? []);
  };

  useEffect(() => {
    if (!session) return;
    void loadAvailability();
  }, [session, month]);

  useEffect(() => {
    if (!session || tab !== "enquiries") return;
    void loadEnquiries();
  }, [session, tab]);

  useEffect(() => {
    if (!session || tab !== "reviews") return;
    void loadReviews();
  }, [session, tab]);

  const daysInMonth = useMemo(
    () => new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    [month],
  );
  const firstDay = useMemo(
    () => new Date(month.getFullYear(), month.getMonth(), 1).getDay(),
    [month],
  );
  const monthLabel = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) setAuthError(error.message);
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const cycleStatus = async (day: number) => {
    if (!supabase || !session) return;
    const key = toDateKey(month.getFullYear(), month.getMonth(), day);
    const current = availability[key] ?? "available";
    const next: AvailabilityStatus =
      current === "available"
        ? "limited"
        : current === "limited"
          ? "booked"
          : "available";

    setBusy(true);
    setMessage("");
    const { error } = await supabase.from("availability").upsert(
      { date: key, status: next, updated_at: new Date().toISOString() },
      { onConflict: "date" },
    );
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setAvailability((prev) => ({ ...prev, [key]: next }));
  };

  const updateEnquiryStatus = async (
    id: string,
    status: EnquiryRow["status"],
  ) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setEnquiries((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  };

  const copyInvite = async (token: string) => {
    const url = reviewInviteUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setMessage("");
      setTimeout(() => setCopiedToken(""), 2000);
    } catch {
      setLatestInviteUrl(url);
      setMessage("Copy failed — link shown below.");
    }
  };

  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.from("reviews").insert({
      name: reviewForm.name.trim(),
      session_type: reviewForm.session_type,
      quote: reviewForm.quote.trim(),
      rating: reviewForm.rating,
      status: "published",
      source: "manual",
      published_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setReviewForm({ name: "", session_type: "Family", quote: "", rating: 5 });
    await loadReviews();
  };

  const createInvite = async (opts?: {
    customer_name?: string;
    customer_email?: string;
    session_type?: string;
  }) => {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const payload = {
      customer_name:
        (opts?.customer_name ?? inviteForm.customer_name).trim() || null,
      customer_email:
        (opts?.customer_email ?? inviteForm.customer_email).trim() || null,
      session_type: opts?.session_type ?? inviteForm.session_type,
    };
    const { data, error } = await supabase
      .from("review_invites")
      .insert(payload)
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const invite = data as ReviewInviteRow;
    setInviteForm({
      customer_name: "",
      customer_email: "",
      session_type: "Family",
    });
    setLatestInviteUrl(reviewInviteUrl(invite.token));
    await copyInvite(invite.token);
    if (tab !== "reviews") setTab("reviews");
    await loadReviews();
  };

  const updateReviewStatus = async (id: string, status: ReviewStatus) => {
    if (!supabase) return;
    const patch: Partial<ReviewRow> = { status };
    if (status === "published") {
      patch.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("reviews").update(patch).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setReviews((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const deleteReview = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setReviews((prev) => prev.filter((row) => row.id !== id));
  };

  const revokeInvite = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("review_invites")
      .update({ status: "revoked" })
      .eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setInvites((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: "revoked" as const } : row,
      ),
    );
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen px-6 py-20" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-lg text-center">
          <SectionLabel>Admin</SectionLabel>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.4rem",
              color: colors.brown,
            }}
          >
            Supabase not configured
          </h1>
          <p style={{ color: colors.taupe }}>
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable photographer
            login.
          </p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2" style={{ color: colors.brown }}>
            <ArrowLeft size={16} /> Back to site
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <p style={{ color: colors.taupe }}>Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen px-6 py-20" style={{ backgroundColor: colors.cream }}>
        <div
          className="mx-auto max-w-md p-8"
          style={{ backgroundColor: "#fff", border: "1px solid rgba(184,169,154,0.3)" }}
        >
          <SectionLabel>Photographer login</SectionLabel>
          <h1
            className="mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              color: colors.brown,
            }}
          >
            Manage availability
          </h1>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs tracking-widest uppercase" style={{ color: colors.taupe }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{
                  border: "1px solid rgba(184,169,154,0.35)",
                  backgroundColor: colors.cream,
                  color: colors.brown,
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs tracking-widest uppercase" style={{ color: colors.taupe }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{
                  border: "1px solid rgba(184,169,154,0.35)",
                  backgroundColor: colors.cream,
                  color: colors.brown,
                }}
              />
            </div>
            {authError && (
              <p className="text-sm" style={{ color: "#8B3A3A" }}>
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 text-xs tracking-[0.18em] uppercase text-white"
              style={{ backgroundColor: colors.green }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: colors.taupe }}>
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      <header
        className="border-b px-6 py-4"
        style={{ borderColor: "rgba(184,169,154,0.3)", backgroundColor: "#fff" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: colors.taupe }}>
              Ko&Mo Admin
            </p>
            <p className="text-sm" style={{ color: colors.brown }}>
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs tracking-widest uppercase" style={{ color: colors.brown }}>
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase"
              style={{ border: `1px solid ${colors.brown}`, color: colors.brown }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap gap-3">
          {(
            [
              ["availability", "Availability", CalendarDays],
              ["enquiries", "Enquiries", Inbox],
              ["reviews", "Reviews", MessageSquareQuote],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase"
              style={{
                backgroundColor: tab === id ? colors.green : "#fff",
                color: tab === id ? "#fff" : colors.brown,
                border: `1px solid ${tab === id ? colors.green : "rgba(184,169,154,0.4)"}`,
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {message && (
          <p className="mb-4 text-sm" style={{ color: "#8B3A3A" }}>
            {message}
          </p>
        )}

        {tab === "availability" && (
          <div
            className="p-6"
            style={{ backgroundColor: "#fff", border: "1px solid rgba(184,169,154,0.3)" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                }
                style={{ color: colors.brown }}
              >
                ←
              </button>
              <h2
                className="text-sm font-medium tracking-widest uppercase"
                style={{ color: colors.brown }}
              >
                {monthLabel}
              </h2>
              <button
                type="button"
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                }
                style={{ color: colors.brown }}
              >
                →
              </button>
            </div>
            <p className="mb-4 text-sm" style={{ color: colors.taupe }}>
              Click a date to cycle: Available → Limited → Booked
            </p>
            <div className="mb-2 grid grid-cols-7">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-xs tracking-widest"
                  style={{ color: colors.taupe }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = toDateKey(month.getFullYear(), month.getMonth(), day);
                const status = availability[key] ?? "available";
                const bg =
                  status === "booked"
                    ? "rgba(92,75,67,0.18)"
                    : status === "limited"
                      ? "rgba(216,197,166,0.55)"
                      : "#fff";
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={busy}
                    onClick={() => void cycleStatus(day)}
                    className="rounded-sm py-3 text-xs"
                    style={{
                      backgroundColor: bg,
                      color: colors.brown,
                      border: "1px solid rgba(184,169,154,0.35)",
                      textDecoration: status === "booked" ? "line-through" : "none",
                    }}
                    title={status}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "enquiries" && (
          <div className="space-y-4">
            {enquiries.length === 0 ? (
              <p style={{ color: colors.taupe }}>No enquiries yet.</p>
            ) : (
              enquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="p-5"
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid rgba(184,169,154,0.3)",
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.4rem",
                          color: colors.brown,
                        }}
                      >
                        {enquiry.name}
                      </h3>
                      <p className="text-sm" style={{ color: colors.taupe }}>
                        {enquiry.email}
                        {enquiry.phone ? ` · ${enquiry.phone}` : ""}
                      </p>
                    </div>
                    <select
                      value={enquiry.status}
                      onChange={(e) =>
                        void updateEnquiryStatus(
                          enquiry.id,
                          e.target.value as EnquiryRow["status"],
                        )
                      }
                      className="px-3 py-2 text-xs uppercase tracking-widest"
                      style={{
                        border: "1px solid rgba(184,169,154,0.4)",
                        color: colors.brown,
                        backgroundColor: colors.cream,
                      }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="booked">Booked</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <p className="text-sm" style={{ color: colors.brown }}>
                    {enquiry.event_type}
                    {enquiry.event_date ? ` · ${enquiry.event_date}` : ""}
                    {enquiry.location ? ` · ${enquiry.location}` : ""}
                    {enquiry.estimated_total != null
                      ? ` · £${enquiry.estimated_total}`
                      : ""}
                  </p>
                  {enquiry.message && (
                    <p className="mt-2 text-sm" style={{ color: colors.taupe }}>
                      {enquiry.message}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <p className="text-xs" style={{ color: colors.taupe }}>
                      {new Date(enquiry.created_at).toLocaleString()}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void createInvite({
                          customer_name: enquiry.name,
                          customer_email: enquiry.email,
                          session_type: enquiry.event_type || "Family",
                        })
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs tracking-widest uppercase"
                      style={{
                        border: `1px solid ${colors.brown}`,
                        color: colors.brown,
                      }}
                    >
                      <Send size={12} /> Invite review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <form
                onSubmit={addReview}
                className="space-y-4 p-6"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Plus size={16} style={{ color: colors.brown }} />
                  <h2
                    className="text-sm tracking-widest uppercase"
                    style={{ color: colors.brown }}
                  >
                    Add a review
                  </h2>
                </div>
                <p className="text-sm" style={{ color: colors.taupe }}>
                  Publish a review yourself (from Google, Facebook, messages, etc.).
                </p>
                <input
                  required
                  placeholder="Client name"
                  value={reviewForm.name}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
                <select
                  value={reviewForm.session_type}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      session_type: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      rating: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  placeholder="Review text"
                  value={reviewForm.quote}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, quote: e.target.value }))
                  }
                  className="w-full resize-y px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 text-xs tracking-[0.18em] uppercase text-white"
                  style={{ backgroundColor: colors.green }}
                >
                  Publish review
                </button>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void createInvite();
                }}
                className="space-y-4 p-6"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Send size={16} style={{ color: colors.brown }} />
                  <h2
                    className="text-sm tracking-widest uppercase"
                    style={{ color: colors.brown }}
                  >
                    Invite a customer
                  </h2>
                </div>
                <p className="text-sm" style={{ color: colors.taupe }}>
                  Creates a private link you can send by WhatsApp, text, or email.
                </p>
                <input
                  placeholder="Customer name (optional)"
                  value={inviteForm.customer_name}
                  onChange={(e) =>
                    setInviteForm((f) => ({
                      ...f,
                      customer_name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
                <input
                  type="email"
                  placeholder="Customer email (optional)"
                  value={inviteForm.customer_email}
                  onChange={(e) =>
                    setInviteForm((f) => ({
                      ...f,
                      customer_email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
                <select
                  value={inviteForm.session_type}
                  onChange={(e) =>
                    setInviteForm((f) => ({
                      ...f,
                      session_type: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 text-xs tracking-[0.18em] uppercase text-white"
                  style={{ backgroundColor: colors.green }}
                >
                  Create invite link
                </button>
                {latestInviteUrl && (
                  <div
                    className="break-all p-3 text-xs"
                    style={{
                      backgroundColor: colors.cream,
                      color: colors.brown,
                      border: "1px solid rgba(184,169,154,0.35)",
                    }}
                  >
                    <p className="mb-1 tracking-widest uppercase" style={{ color: colors.taupe }}>
                      Latest link
                    </p>
                    {latestInviteUrl}
                  </div>
                )}
              </form>
            </div>

            <div>
              <h2
                className="mb-4 text-sm tracking-widest uppercase"
                style={{ color: colors.brown }}
              >
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p style={{ color: colors.taupe }}>No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-5"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid rgba(184,169,154,0.3)",
                      }}
                    >
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: "1.35rem",
                              color: colors.brown,
                            }}
                          >
                            {review.name}
                          </h3>
                          <p className="text-sm" style={{ color: colors.taupe }}>
                            {review.session_type} · {review.rating}/5 · {review.source}
                          </p>
                        </div>
                        <select
                          value={review.status}
                          onChange={(e) =>
                            void updateReviewStatus(
                              review.id,
                              e.target.value as ReviewStatus,
                            )
                          }
                          className="px-3 py-2 text-xs uppercase tracking-widest"
                          style={{
                            border: "1px solid rgba(184,169,154,0.4)",
                            color: colors.brown,
                            backgroundColor: colors.cream,
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="published">Published</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </div>
                      <p className="text-sm italic" style={{ color: colors.brown }}>
                        “{review.quote}”
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs" style={{ color: colors.taupe }}>
                          {new Date(review.created_at).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => void deleteReview(review.id)}
                          className="text-xs tracking-widest uppercase"
                          style={{ color: "#8B3A3A" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2
                className="mb-4 text-sm tracking-widest uppercase"
                style={{ color: colors.brown }}
              >
                Invite links
              </h2>
              {invites.length === 0 ? (
                <p style={{ color: colors.taupe }}>No invites yet.</p>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid rgba(184,169,154,0.3)",
                      }}
                    >
                      <div>
                        <p style={{ color: colors.brown }}>
                          {invite.customer_name || "Customer"}
                          {invite.session_type ? ` · ${invite.session_type}` : ""}
                        </p>
                        <p className="text-xs" style={{ color: colors.taupe }}>
                          {invite.status}
                          {invite.customer_email ? ` · ${invite.customer_email}` : ""}
                          {" · "}
                          {new Date(invite.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {invite.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => void copyInvite(invite.token)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs tracking-widest uppercase"
                              style={{
                                border: `1px solid ${colors.brown}`,
                                color: colors.brown,
                              }}
                            >
                              {copiedToken === invite.token ? (
                                <>
                                  <Check size={12} /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={12} /> Copy link
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => void revokeInvite(invite.id)}
                              className="px-3 py-2 text-xs tracking-widest uppercase"
                              style={{ color: "#8B3A3A" }}
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
