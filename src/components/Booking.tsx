import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { colors, images } from "../data/images";
import { SectionLabel } from "./ui";
import {
  isSupabaseConfigured,
  supabase,
  type AvailabilityStatus,
} from "../lib/supabase";
import {
  extraPackages,
  type ExtraPackageId,
} from "../data/packages";

type Extras = Record<ExtraPackageId, number>;

type FormState = {
  name: string;
  email: string;
  phone: string;
  date: string;
  type: string;
  location: string;
  message: string;
};

const basePrices: Record<string, number> = {
  "Wedding Full Day": 550,
  "Wedding Half Day": 400,
  "Mini Session": 120,
  Newborn: 175,
  Family: 185,
  "Cake Smash": 150,
};

const deposits: Record<string, number> = {
  "Wedding Full Day": 110,
  "Wedding Half Day": 80,
  "Mini Session": 50,
  Newborn: 50,
  Family: 50,
  "Cake Smash": 50,
};

const emptyExtras = Object.fromEntries(
  extraPackages.map((extra) => [extra.id, 0]),
) as Extras;

const sessionTypes = [
  "Wedding Full Day",
  "Wedding Half Day",
  "Mini Session",
  "Newborn",
  "Family",
  "Cake Smash",
] as const;

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function Booking() {
  const [sessionType, setSessionType] = useState<string>("Wedding Full Day");
  const [extras, setExtras] = useState<Extras>(emptyExtras);
  const deposit = deposits[sessionType] ?? 0;
  const total =
    basePrices[sessionType] +
    extraPackages.reduce(
      (sum, extra) => sum + extras[extra.id] * extra.priceValue,
      0,
    );

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    date: "",
    type: "Wedding Full Day",
    location: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [calMonth, setCalMonth] = useState(() => new Date());
  const [availability, setAvailability] = useState<
    Record<string, AvailabilityStatus>
  >({});

  const daysInMonth = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth(),
    1,
  ).getDay();
  const monthLabel = calMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!supabase) return;
    const start = toDateKey(calMonth.getFullYear(), calMonth.getMonth(), 1);
    const end = toDateKey(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
    void supabase
      .from("availability")
      .select("date,status")
      .gte("date", start)
      .lte("date", end)
      .then(({ data }) => {
        const map: Record<string, AvailabilityStatus> = {};
        data?.forEach((row) => {
          map[row.date] = row.status as AvailabilityStatus;
        });
        setAvailability(map);
      });
  }, [calMonth]);

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const extrasSummary = extraPackages
      .filter((extra) => extras[extra.id] > 0)
      .map((extra) =>
        extra.perUnit
          ? `${extra.name} × ${extras[extra.id]} (£${extra.priceValue * extras[extra.id]})`
          : `${extra.name} (£${extra.priceValue})`,
      )
      .join(", ");

    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from("enquiries").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        event_date: form.date || null,
        event_type: form.type,
        location: form.location || null,
        message: form.message || null,
        estimated_total: total,
      });
      if (error) {
        setSubmitting(false);
        setSubmitError(error.message);
        return;
      }
    }

    try {
      const notifyPayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        type: form.type,
        location: form.location,
        message: form.message,
        estimated_total: total,
        extras: extrasSummary || "None",
      };

      const notifyRes = await fetch("/api/notify-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifyPayload),
      });
      const notifyJson = (await notifyRes.json().catch(() => ({}))) as {
        provider?: string;
      };

      // No Resend key configured — email from the browser via FormSubmit.
      if (notifyJson.provider === "client-fallback") {
        await fetch(
          "https://formsubmit.co/ajax/konmophotography@gmail.com",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `New Ko&Mo enquiry from ${form.name}`,
              _template: "table",
              _captcha: false,
              _replyto: form.email,
              name: form.name,
              email: form.email,
              phone: form.phone || "",
              session_type: form.type,
              preferred_date: form.date || "",
              location: form.location || "",
              extras: extrasSummary || "None",
              estimated_total: `£${total}`,
              message: form.message || "",
            }),
          },
        );
      }
    } catch {
      // Enquiry is already saved — don't block success if email notify fails.
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: colors.cream, paddingTop: "72px" }}>
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: "50vh" }}
      >
        <img
          src={images.brideSoft}
          alt="Handfasting ceremony detail"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(92,75,67,0.5)" }}
        />
        <div className="relative z-10 px-6 text-center">
          <SectionLabel>Get in Touch</SectionLabel>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 300,
              color: "#fff",
            }}
          >
            Book Your Session
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="space-y-14">
            <div>
              <SectionLabel>Availability</SectionLabel>
              <h2
                className="mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.8rem",
                  fontWeight: 400,
                  color: colors.brown,
                }}
              >
                Check My Calendar
              </h2>
              <div
                className="p-6 shadow-sm"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setCalMonth(
                        new Date(
                          calMonth.getFullYear(),
                          calMonth.getMonth() - 1,
                          1,
                        ),
                      )
                    }
                    style={{ color: colors.brown }}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span
                    className="text-sm font-medium tracking-widest uppercase"
                    style={{
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalMonth(
                        new Date(
                          calMonth.getFullYear(),
                          calMonth.getMonth() + 1,
                          1,
                        ),
                      )
                    }
                    style={{ color: colors.brown }}
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="mb-2 grid grid-cols-7">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="py-1 text-center text-xs tracking-widest"
                      style={{
                        color: colors.taupe,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const key = toDateKey(
                      calMonth.getFullYear(),
                      calMonth.getMonth(),
                      day,
                    );
                    const status = availability[key] ?? "available";
                    const isBooked = status === "booked";
                    const isLimited = status === "limited";
                    return (
                      <div
                        key={day}
                        className="rounded-sm py-2 text-center text-xs"
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          backgroundColor: isBooked
                            ? "rgba(92,75,67,0.12)"
                            : isLimited
                              ? "rgba(216,197,166,0.4)"
                              : "transparent",
                          color: isBooked ? colors.taupe : colors.brown,
                          textDecoration: isBooked ? "line-through" : "none",
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div
                  className="mt-5 flex flex-wrap gap-5 pt-5"
                  style={{ borderTop: "1px solid rgba(184,169,154,0.25)" }}
                >
                  {(
                    [
                      ["Available", "#fff", colors.brown],
                      ["Limited", "rgba(216,197,166,0.4)", colors.brown],
                      ["Booked", "rgba(92,75,67,0.12)", colors.taupe],
                    ] as const
                  ).map(([label, bg, text]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-sm"
                        style={{
                          backgroundColor: bg,
                          border: "1px solid rgba(184,169,154,0.4)",
                        }}
                      />
                      <span
                        className="text-xs"
                        style={{
                          color: text,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Pricing</SectionLabel>
              <h2
                className="mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.8rem",
                  fontWeight: 400,
                  color: colors.brown,
                }}
              >
                Pricing Calculator
              </h2>
              <div
                className="p-6 shadow-sm"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                <p
                  className="mb-3 text-xs tracking-widest uppercase"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Session Type
                </p>
                <div className="mb-6 grid grid-cols-2 gap-2">
                  {sessionTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSessionType(type)}
                      className="px-4 py-2.5 text-xs tracking-widest uppercase transition-all"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        backgroundColor:
                          sessionType === type ? colors.green : "transparent",
                        color: sessionType === type ? "#fff" : colors.brown,
                        border: `1px solid ${sessionType === type ? colors.green : "rgba(184,169,154,0.4)"}`,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div
                  className="mb-5 flex items-center justify-between pb-5"
                  style={{ borderBottom: "1px solid rgba(184,169,154,0.25)" }}
                >
                  <span
                    className="text-sm"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Base price
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    £{basePrices[sessionType]}
                    {deposit > 0
                      ? ` (£${deposit} booking fee)`
                      : ""}
                  </span>
                </div>
                <p
                  className="mb-4 text-xs"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Portrait sessions: £50 booking fee; balance due 48 hours before.
                  Wedding balances due 3 weeks before the day.
                </p>
                <p
                  className="mb-2 text-xs tracking-widest uppercase"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Extra Packages
                </p>
                <p
                  className="mb-4 text-xs leading-relaxed"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Optional keepsakes you can add to any session.
                </p>
                <div className="mb-6 space-y-4">
                  {extraPackages.map((extra) =>
                    extra.perUnit ? (
                      <div
                        key={extra.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className="block text-sm"
                            style={{
                              color: colors.brown,
                              fontFamily: "'Montserrat', sans-serif",
                              fontWeight: 300,
                            }}
                          >
                            {extra.name}
                          </span>
                          <span
                            className="mt-0.5 block text-xs leading-relaxed"
                            style={{
                              color: colors.taupe,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            {extra.text}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className="text-sm"
                            style={{
                              color: colors.taupe,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            £{extra.priceValue} each
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={extras[extra.id]}
                            onChange={(e) =>
                              setExtras((prev) => ({
                                ...prev,
                                [extra.id]: Math.max(
                                  0,
                                  Math.min(100, Number(e.target.value) || 0),
                                ),
                              }))
                            }
                            className="w-16 px-2 py-1.5 text-center text-sm outline-none"
                            style={{
                              border: "1px solid rgba(184,169,154,0.45)",
                              backgroundColor: colors.cream,
                              color: colors.brown,
                              fontFamily: "'Montserrat', sans-serif",
                            }}
                            aria-label={`Number of ${extra.name}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <label
                        key={extra.id}
                        className="group flex cursor-pointer items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center transition-all"
                            style={{
                              border: `1px solid ${extras[extra.id] ? colors.brown : "rgba(184,169,154,0.5)"}`,
                              backgroundColor: extras[extra.id]
                                ? colors.green
                                : "transparent",
                            }}
                            onClick={() =>
                              setExtras((prev) => ({
                                ...prev,
                                [extra.id]: prev[extra.id] ? 0 : 1,
                              }))
                            }
                          >
                            {extras[extra.id] > 0 && (
                              <Check size={10} color="#fff" />
                            )}
                          </div>
                          <div>
                            <span
                              className="block text-sm"
                              style={{
                                color: colors.brown,
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 300,
                              }}
                            >
                              {extra.name}
                            </span>
                            <span
                              className="mt-0.5 block text-xs leading-relaxed"
                              style={{
                                color: colors.taupe,
                                fontFamily: "'Montserrat', sans-serif",
                              }}
                            >
                              {extra.text}
                            </span>
                          </div>
                        </div>
                        <span
                          className="shrink-0 text-sm"
                          style={{
                            color: colors.taupe,
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          +£{extra.priceValue}
                        </span>
                      </label>
                    ),
                  )}
                </div>
                <div
                  className="flex items-center justify-between p-4"
                  style={{
                    backgroundColor: colors.cream,
                    border: "1px solid rgba(184,169,154,0.3)",
                  }}
                >
                  <span
                    className="text-sm tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Estimated Total
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.8rem",
                      color: colors.brown,
                      fontWeight: 400,
                    }}
                  >
                    £{total}
                  </span>
                </div>
                <p
                  className="mt-3 text-xs"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  * Prices are a guide. Final quote confirmed after consultation.
                </p>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Enquire</SectionLabel>
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                color: colors.brown,
              }}
            >
              Send an Enquiry
            </h2>
            {submitted ? (
              <div
                className="p-10 text-center"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                <Heart
                  size={32}
                  style={{ color: colors.gold, margin: "0 auto 1rem" }}
                />
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.6rem",
                    color: colors.brown,
                    fontWeight: 400,
                    marginBottom: "0.5rem",
                  }}
                >
                  Thank You!
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  I'll be in touch within 24–48 hours to confirm your
                  availability.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submitEnquiry}
                className="space-y-5 p-6 shadow-sm md:p-8"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.3)",
                }}
              >
                {(
                  [
                    {
                      label: "Full Name",
                      key: "name",
                      type: "text",
                      placeholder: "Your full name",
                    },
                    {
                      label: "Email Address",
                      key: "email",
                      type: "email",
                      placeholder: "your@email.com",
                    },
                    {
                      label: "Phone Number",
                      key: "phone",
                      type: "tel",
                      placeholder: "+44 7700 000000",
                    },
                  ] as const
                ).map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label
                      className="mb-2 block text-xs tracking-widest uppercase"
                      style={{
                        color: colors.taupe,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      required={key !== "phone"}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        border: "1px solid rgba(184,169,154,0.35)",
                        color: colors.brown,
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        backgroundColor: colors.cream,
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label
                    className="mb-2 block text-xs tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Wedding / Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      border: "1px solid rgba(184,169,154,0.35)",
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      backgroundColor: colors.cream,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-xs tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Event Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid rgba(184,169,154,0.35)",
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      backgroundColor: colors.cream,
                    }}
                  >
                    <option>Wedding Full Day</option>
                    <option>Wedding Half Day</option>
                    <option>Mini Session</option>
                    <option>Newborn</option>
                    <option>Family</option>
                    <option>Cake Smash</option>
                    <option>Maternity</option>
                    <option>Pets</option>
                    <option>Couples</option>
                    <option>Children</option>
                  </select>
                </div>

                <div>
                  <label
                    className="mb-2 block text-xs tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Barrhead, Glasgow, Highlands"
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid rgba(184,169,154,0.35)",
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      backgroundColor: colors.cream,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-xs tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Tell Me About Your Day
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share anything that will help me understand what you're looking for..."
                    value={form.message}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full resize-none px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid rgba(184,169,154,0.35)",
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      backgroundColor: colors.cream,
                    }}
                  />
                </div>

                {submitError && (
                  <p className="text-sm" style={{ color: "#8B3A3A" }}>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 py-4 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: colors.green,
                    color: "#fff",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {submitting ? "Sending…" : "Check Availability"}{" "}
                  {!submitting && <ArrowRight size={14} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
