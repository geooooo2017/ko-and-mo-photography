import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { ArrowLeft, CalendarDays, Inbox, LogOut } from "lucide-react";
import { colors } from "../data/images";
import {
  isSupabaseConfigured,
  supabase,
  type AvailabilityStatus,
  type EnquiryRow,
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
  const [tab, setTab] = useState<"availability" | "enquiries">("availability");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<
    Record<string, AvailabilityStatus>
  >({});
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    if (!session) return;
    void loadAvailability();
  }, [session, month]);

  useEffect(() => {
    if (!session || tab !== "enquiries") return;
    void loadEnquiries();
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
        <div className="mb-8 flex gap-3">
          {(
            [
              ["availability", "Availability", CalendarDays],
              ["enquiries", "Enquiries", Inbox],
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
                  <p className="mt-3 text-xs" style={{ color: colors.taupe }}>
                    {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
