import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { colors } from "../data/images";
import {
  isSupabaseConfigured,
  SESSION_TYPES,
  supabase,
} from "../lib/supabase";
import { SectionLabel } from "./ui";

type InviteInfo = {
  id: string;
  customer_name: string | null;
  session_type: string | null;
  status: string;
  expires_at: string | null;
};

export function ReviewSubmit() {
  const { token = "" } = useParams<{ token: string }>();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [sessionType, setSessionType] = useState("Family");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !token) {
      setLoading(false);
      setError("This review link is not available.");
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error: rpcError } = await supabase.rpc("get_review_invite", {
        p_token: token,
      });
      if (cancelled) return;
      if (rpcError) {
        setError(rpcError.message);
        setLoading(false);
        return;
      }
      const row = (Array.isArray(data) ? data[0] : data) as InviteInfo | undefined;
      if (!row) {
        setError("This review link is invalid, used, or expired.");
        setLoading(false);
        return;
      }
      setInvite(row);
      if (row.customer_name) setName(row.customer_name);
      if (row.session_type) setSessionType(row.session_type);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !token) return;
    setBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("submit_review_via_invite", {
      p_token: token,
      p_name: name,
      p_quote: quote,
      p_rating: rating,
      p_session_type: sessionType,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen px-6 py-16" style={{ backgroundColor: colors.cream }}>
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm"
          style={{ color: colors.taupe }}
        >
          <ArrowLeft size={14} /> Ko&Mo Photography
        </Link>

        <div
          className="p-8"
          style={{ backgroundColor: "#fff", border: "1px solid rgba(184,169,154,0.3)" }}
        >
          <SectionLabel>Share your experience</SectionLabel>
          <h1
            className="mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.2rem",
              color: colors.brown,
              fontWeight: 400,
            }}
          >
            Leave a review
          </h1>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: colors.taupe }}>
            Thank you for choosing Ko&Mo. A few kind words help other families find us.
          </p>

          {loading && <p style={{ color: colors.taupe }}>Loading…</p>}

          {!loading && error && !done && (
            <p className="text-sm" style={{ color: "#8B3A3A" }}>
              {error}
            </p>
          )}

          {done && (
            <div>
              <p
                className="mb-4 text-lg"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: colors.brown,
                }}
              >
                Thank you — your review has been submitted.
              </p>
              <p className="mb-6 text-sm" style={{ color: colors.taupe }}>
                It will appear on the website once approved.
              </p>
              <Link
                to="/"
                className="inline-flex px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                style={{ backgroundColor: colors.green }}
              >
                Back to website
              </Link>
            </div>
          )}

          {!loading && !error && invite && !done && (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label
                  className="mb-2 block text-xs tracking-widest uppercase"
                  style={{ color: colors.taupe }}
                >
                  Your name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-xs tracking-widest uppercase"
                  style={{ color: colors.taupe }}
                >
                  Session type
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
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
              </div>

              <div>
                <label
                  className="mb-2 block text-xs tracking-widest uppercase"
                  style={{ color: colors.taupe }}
                >
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} stars`}
                      className="p-1"
                    >
                      <Star
                        size={22}
                        fill={value <= rating ? colors.gold : "transparent"}
                        stroke={colors.gold}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs tracking-widest uppercase"
                  style={{ color: colors.taupe }}
                >
                  Your review
                </label>
                <textarea
                  required
                  rows={5}
                  minLength={10}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Tell others what you loved about your session…"
                  className="w-full resize-y px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid rgba(184,169,154,0.35)",
                    backgroundColor: colors.cream,
                    color: colors.brown,
                  }}
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: "#8B3A3A" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 text-xs tracking-[0.18em] uppercase text-white"
                style={{ backgroundColor: colors.green }}
              >
                {busy ? "Sending…" : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
