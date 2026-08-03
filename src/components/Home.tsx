import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";
import { colors, images, type Page } from "../data/images";
import {
  Heading,
  OutlineButton,
  PrimaryButton,
  SectionLabel,
  Stars,
} from "./ui";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";
import {
  extraPackages,
  journeySteps,
  miniPerfectFor,
  miniSessionIncludes,
} from "../data/packages";
import augustFlyer from "../assets/august-mini-sessions.png";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { socialLinks } from "../data/social";

type GalleryItem = {
  id: number;
  src: string;
  alt: string;
  cat: string;
  tall: boolean;
};

const gallery: GalleryItem[] = [
  { id: 1, src: images.coupleHill, alt: "Scottish handfasting ceremony", cat: "Weddings", tall: true },
  { id: 2, src: images.newbornPink, alt: "First birthday jungle theme", cat: "Newborn", tall: false },
  { id: 3, src: images.familyCarry, alt: "Christmas family portrait", cat: "Family", tall: false },
  { id: 4, src: images.cakeGirl, alt: "Safari cake smash laughter", cat: "Cake Smash", tall: true },
  { id: 5, src: images.heroBride, alt: "Bride preparing in the mirror", cat: "Weddings", tall: false },
  { id: 6, src: images.babyField, alt: "Baby in safari crown", cat: "Newborn", tall: true },
  { id: 7, src: images.familyKiss, alt: "Christmas mother and toddler", cat: "Family", tall: true },
  { id: 8, src: images.weddingRings, alt: "Wedding rings on the certificate", cat: "Weddings", tall: false },
  { id: 9, src: images.cakeKid, alt: "Rock and roll cake smash", cat: "Cake Smash", tall: false },
  { id: 10, src: images.familyRoseColor, alt: "Toddler with a white rose", cat: "Family", tall: false },
  { id: 11, src: images.cakeRockSmash, alt: "Born to rock birthday session", cat: "Cake Smash", tall: false },
  { id: 12, src: images.cakeBirthday, alt: "Jungle cake smash", cat: "Cake Smash", tall: false },
  { id: 13, src: images.familyReindeer, alt: "Holiday toddler portrait", cat: "Family", tall: true },
  { id: 14, src: images.cakeSafariLook, alt: "Wild One birthday portrait", cat: "Cake Smash", tall: false },
  { id: 15, src: images.familyBaby, alt: "Black and white rose portrait", cat: "Newborn", tall: false },
];

type Testimonial = {
  quote: string;
  name: string;
  type: string;
  rating: number;
};

const services = [
  {
    icon: "💍",
    title: "Weddings",
    page: "weddings" as Page,
    items: [
      { name: "Full Day", price: "£550" },
      { name: "Half Day", price: "£400" },
    ],
  },
  {
    icon: "👶",
    title: "Tiny Toes",
    page: "newborn" as Page,
    items: [{ name: "Newborn Session", price: "£150–£200" }],
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family",
    page: "family" as Page,
    items: [{ name: "Family Session", price: "£175–£200" }],
  },
  {
    icon: "🎂",
    title: "Cake Smash",
    page: "cakesmash" as Page,
    items: [{ name: "Let's Celebrate", price: "£150" }],
  },
];

const instagramGrid = [
  images.heroBride,
  images.coupleHill,
  images.familyCarry,
  images.cakeKid,
  images.babyField,
  images.familyKiss,
  images.cakeBirthday,
  images.familyRoseColor,
  images.weddingRings,
];

export function Home({ setPage }: { setPage: (page: Page) => void }) {
  const go = (page: Page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filtered =
    filter === "All" ? gallery : gallery.filter((item) => item.cat === filter);

  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const next = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(next);
  }, []);

  useEffect(() => {
    const onUp = () => {
      dragging.current = false;
    };
    const onMove = (e: MouseEvent) => {
      if (dragging.current) updateSlider(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (dragging.current) updateSlider(e.touches[0].clientX);
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [updateSlider]);

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("name,session_type,quote,rating")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (cancelled || error) return;
      setTestimonials(
        (data ?? []).map((row) => ({
          name: row.name,
          type: row.session_type,
          quote: row.quote,
          rating: row.rating ?? 5,
        })),
      );
      setTestimonialIndex(0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section
        className="relative flex h-screen items-center justify-center overflow-hidden"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="absolute inset-0">
          <img
            src={images.heroBride}
            alt="Bride preparing for her wedding day"
            className="h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(92,75,67,0.3) 0%, rgba(92,75,67,0.5) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p
            className="mb-6 text-xs tracking-[0.3em] uppercase"
            style={{
              color: colors.gold,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Wedding · Newborn · Family Photography
          </p>
          <h1
            className="mb-8 leading-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            Capturing Life's
            <br />
            <em>Most Precious Moments</em>
          </h1>
          <p
            className="mb-10 text-sm font-light"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "'Montserrat', sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            Based in Barrhead, Glasgow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton onClick={() => go("booking")}>
              View Packages
            </PrimaryButton>
            <OutlineButton onClick={() => go("booking")} light>
              Book Consultation
            </OutlineButton>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} color={colors.gold} />
        </div>
      </section>

      <section
        id="about"
        className="py-24 md:py-32"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:px-12 lg:grid-cols-2">
          <div className="relative">
            <img
              src={images.photographer}
              alt="Ko&Mo Photography family session"
              className="w-full object-cover"
              style={{ maxHeight: "620px" }}
            />
            <div
              className="absolute -right-5 -bottom-5 hidden md:block"
              style={{ backgroundColor: colors.gold, padding: "10px" }}
            >
              <img
                src={logo}
                alt="Ko&Mo Photography"
                className="h-24 w-24 object-contain"
              />
            </div>
          </div>
          <div>
            <SectionLabel>About Me</SectionLabel>
            <Heading>Hi, I'm Morgan McAllister</Heading>
            <div
              className="mb-8 space-y-4"
              style={{
                color: colors.taupe,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                lineHeight: 1.8,
                fontSize: "0.95rem",
              }}
            >
              <p>
                Ko&Mo Photography began with a simple belief — that the most
                meaningful images aren't just seen, they're felt. I specialise in
                weddings, newborns and families throughout Scotland.
              </p>
              <p>
                I believe the best photographs come from real connections,
                genuine moments and feeling completely at ease. My goal is to
                create timeless, heartfelt images you'll treasure for generations.
              </p>
              <p>
                More than photos — we create heirlooms. Every family has a unique
                story worth telling beautifully.
              </p>
            </div>
            <div
              className="mb-10 flex flex-wrap gap-10 pt-8"
              style={{ borderTop: "1px solid rgba(184,169,154,0.3)" }}
            >
              {(
                [
                  ["Scotland", "Based & Shooting"],
                  ["Personal", "Every Session"],
                  ["Heirloom", "Images You'll Keep"],
                ] as const
              ).map(([stat, label]) => (
                <div key={label}>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.2rem",
                      color: colors.brown,
                      fontWeight: 400,
                    }}
                  >
                    {stat}
                  </p>
                  <p
                    className="mt-1 text-xs tracking-widest uppercase"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <PrimaryButton
              onClick={() => {
                setFilter("All");
                document
                  .getElementById("portfolio")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View My Portfolio <ArrowRight size={14} />
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32" style={{ backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-16 text-center">
            <SectionLabel>What I Offer</SectionLabel>
            <Heading>Services & Packages</Heading>
            <p
              className="mx-auto max-w-xl text-sm leading-relaxed"
              style={{
                color: colors.taupe,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
              }}
            >
              Every session is tailored to you. Browse the options below or get
              in touch to create something bespoke.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="group cursor-pointer p-8 transition-all duration-300 hover:shadow-lg"
                style={{
                  border: "1px solid rgba(184,169,154,0.25)",
                  backgroundColor: colors.cream,
                }}
                onClick={() => go(service.page)}
              >
                <div className="mb-5 text-3xl">{service.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.5rem",
                    color: colors.brown,
                    fontWeight: 400,
                    marginBottom: "1rem",
                  }}
                >
                  {service.title}
                </h3>
                <div className="mb-6 space-y-3">
                  {service.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-xs"
                        style={{
                          color: colors.taupe,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: colors.brown,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs tracking-widest uppercase transition-all group-hover:gap-3"
                  style={{
                    color: colors.brown,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  View Details <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="extras"
        className="py-24 md:py-32"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-14 text-center">
            <SectionLabel>Add something special</SectionLabel>
            <Heading>Extra Packages</Heading>
            <p
              className="mx-auto max-w-xl text-sm leading-relaxed"
              style={{
                color: colors.taupe,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
              }}
            >
              Finish your collection with beautiful keepsakes — add these when
              you book, or ask about them after your gallery is ready.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {extraPackages.map((extra) => (
              <div key={extra.id} className="text-center sm:text-left">
                <p className="mb-3 text-2xl" aria-hidden>
                  {extra.icon}
                </p>
                <h3
                  className="mb-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.45rem",
                    color: colors.brown,
                    fontWeight: 400,
                  }}
                >
                  {extra.name}
                </h3>
                <p
                  className="mb-3 text-sm tracking-widest uppercase"
                  style={{
                    color: colors.green,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  from {extra.price}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {extra.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <PrimaryButton onClick={() => go("booking")}>
              Add extras when you book <ArrowRight size={14} />
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section
        className="py-20 md:py-24"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <SectionLabel>The process</SectionLabel>
            <Heading>Your Journey With Me</Heading>
            <p
              className="mx-auto max-w-xl text-sm leading-relaxed"
              style={{
                color: colors.taupe,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
              }}
            >
              From first enquiry to images on your wall — here's how we work
              together.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {journeySteps.map((step, i) => (
              <div key={step.title}>
                <p
                  className="mb-2 text-xs tracking-[0.2em] uppercase"
                  style={{
                    color: colors.green,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.35rem",
                    color: colors.brown,
                    fontWeight: 400,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel>Limited release</SectionLabel>
              <Heading>August Mini Sessions</Heading>
              <p
                className="mb-2 text-sm tracking-[0.15em] uppercase"
                style={{
                  color: colors.green,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Short, sweet & so memorable
              </p>
              <p
                className="mb-8 leading-relaxed"
                style={{
                  color: colors.taupe,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  lineHeight: 1.8,
                }}
              >
                The most magical moments of the year deserve to be remembered
                forever. Perfect for updating your family photos, celebrating
                your little ones or simply capturing this beautiful season.
              </p>
              <div className="mb-8 flex flex-wrap gap-8">
                <div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.4rem",
                      color: colors.brown,
                    }}
                  >
                    £120
                  </p>
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: colors.taupe }}
                  >
                    Mini session
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.4rem",
                      color: colors.brown,
                    }}
                  >
                    20–30
                  </p>
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: colors.taupe }}
                  >
                    Minutes
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.4rem",
                      color: colors.brown,
                    }}
                  >
                    10
                  </p>
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: colors.taupe }}
                  >
                    Edited images
                  </p>
                </div>
              </div>
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {miniPerfectFor.map((item) => (
                  <div
                    key={item}
                    className="px-3 py-2 text-center text-xs tracking-widest uppercase"
                    style={{
                      border: "1px solid rgba(184,169,154,0.35)",
                      color: colors.brown,
                      fontFamily: "'Montserrat', sans-serif",
                      backgroundColor: "#fff",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <PrimaryButton onClick={() => go("booking")}>
                Book a Mini Session <ArrowRight size={14} />
              </PrimaryButton>
              <p
                className="mt-4 text-xs"
                style={{
                  color: colors.taupe,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Limited numbers — first-come, first-served once dates are
                announced.
              </p>
            </div>
            <div>
              <img
                src={augustFlyer}
                alt="August Mini Sessions pricing flyer"
                className="w-full shadow-lg"
              />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {miniSessionIncludes.map((item) => (
              <div
                key={item.title}
                className="p-6"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(184,169,154,0.25)",
                }}
              >
                <h3
                  className="mb-2 text-xs tracking-widest uppercase"
                  style={{
                    color: colors.brown,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: colors.taupe,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="portfolio"
        className="py-24 md:py-32"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <SectionLabel>Selected Work</SectionLabel>
            <Heading>The Portfolio</Heading>
          </div>
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {["All", "Weddings", "Newborn", "Family", "Cake Smash"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className="px-5 py-2 text-xs tracking-[0.15em] uppercase transition-all duration-300"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    backgroundColor:
                      filter === cat ? colors.green : "transparent",
                    color: filter === cat ? "#fff" : colors.brown,
                    border: `1px solid ${filter === cat ? colors.green : "rgba(92,75,67,0.3)"}`,
                  }}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
          <div className="columns-2 gap-3 space-y-3 md:columns-3 lg:columns-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer break-inside-avoid overflow-hidden"
                style={{ backgroundColor: "#e8e2da" }}
                onClick={() => setLightbox(item.id)}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="block h-auto w-full transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(92,75,67,0.7) 0%, transparent 60%)",
                  }}
                >
                  <span
                    className="text-xs tracking-widest uppercase"
                    style={{
                      color: colors.gold,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {item.cat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null &&
        (() => {
          const item = filtered.find((g) => g.id === lightbox);
          const index = filtered.findIndex((g) => g.id === lightbox);
          if (!item) return null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(92,75,67,0.95)" }}
              onClick={() => setLightbox(null)}
            >
              <button
                type="button"
                className="absolute top-5 right-5 p-2"
                onClick={() => setLightbox(null)}
                style={{ color: colors.gold }}
                aria-label="Close"
              >
                <X size={24} />
              </button>
              {index > 0 && (
                <button
                  type="button"
                  className="absolute left-4 p-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(filtered[index - 1].id);
                  }}
                  style={{ color: colors.gold }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={28} />
                </button>
              )}
              {index < filtered.length - 1 && (
                <button
                  type="button"
                  className="absolute right-4 p-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(filtered[index + 1].id);
                  }}
                  style={{ color: colors.gold }}
                  aria-label="Next"
                >
                  <ChevronRight size={28} />
                </button>
              )}
              <img
                src={item.src}
                alt={item.alt}
                className="max-h-[88vh] max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        })()}

      {testimonials.length > 0 && (
      <section className="py-24 md:py-32" style={{ backgroundColor: colors.brown }}>
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <SectionLabel>Kind Words</SectionLabel>
          <h2
            className="mb-12"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 400,
              color: colors.cream,
            }}
          >
            What My Clients Say
          </h2>
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <Stars n={t.rating ?? 5} />
                    <blockquote
                      className="mb-8 leading-relaxed"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(1.25rem, 2.5vw, 1.7rem)",
                        color: colors.cream,
                        fontStyle: "italic",
                        fontWeight: 300,
                      }}
                    >
                      "{t.quote}"
                    </blockquote>
                    <div>
                      <p
                        className="text-sm font-medium tracking-widest"
                        style={{
                          color: colors.gold,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="mt-1 text-xs tracking-widest uppercase"
                        style={{
                          color: colors.taupe,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {t.type} Photography
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  className="h-2 w-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      testimonialIndex === i
                        ? colors.gold
                        : "rgba(216,197,166,0.3)",
                  }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setTestimonialIndex((i) => Math.max(0, i - 1))
              }
              className="p-2 transition-opacity hover:opacity-60"
              style={{
                color: colors.gold,
                border: "1px solid rgba(216,197,166,0.4)",
              }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setTestimonialIndex((i) =>
                  Math.min(testimonials.length - 1, i + 1),
                )
              }
              className="p-2 transition-opacity hover:opacity-60"
              style={{
                color: colors.gold,
                border: "1px solid rgba(216,197,166,0.4)",
              }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
      )}

      <section className="py-24 md:py-32" style={{ backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <SectionLabel>The Edit</SectionLabel>
            <Heading>Before & After</Heading>
            <p
              className="text-sm"
              style={{
                color: colors.taupe,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
              }}
            >
              Drag the slider to see the difference professional editing makes
            </p>
          </div>
          <div
            ref={sliderRef}
            className="relative cursor-col-resize overflow-hidden select-none"
            style={{
              userSelect: "none",
              height: "500px",
              backgroundColor: "#e8e2da",
            }}
            onMouseDown={(e) => {
              dragging.current = true;
              updateSlider(e.clientX);
            }}
            onTouchStart={(e) => {
              dragging.current = true;
              updateSlider(e.touches[0].clientX);
            }}
          >
            <img
              src={images.coupleHill}
              alt="After editing — handfasting ceremony"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={images.coupleHill}
                alt="Before editing"
                className="absolute inset-0 h-full object-cover"
                style={{
                  width: `${100 / (sliderPos / 100)}%`,
                  filter: "saturate(0.15) brightness(1.15) contrast(0.9)",
                }}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${sliderPos}%`, backgroundColor: "#fff" }}
            >
              <div
                className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-lg"
                style={{
                  backgroundColor: "#fff",
                  border: `2px solid ${colors.gold}`,
                }}
              >
                <div className="flex gap-0.5">
                  <ChevronLeft size={12} style={{ color: colors.brown }} />
                  <ChevronRight size={12} style={{ color: colors.brown }} />
                </div>
              </div>
            </div>
            <div
              className="absolute top-4 left-4 px-3 py-1 text-xs tracking-widest uppercase"
              style={{
                backgroundColor: "rgba(92,75,67,0.75)",
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Before
            </div>
            <div
              className="absolute top-4 right-4 px-3 py-1 text-xs tracking-widest uppercase"
              style={{
                backgroundColor: "rgba(92,75,67,0.75)",
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              After
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>Follow Along</SectionLabel>
              <Heading>{socialLinks.handle}</Heading>
            </div>
            <div className="mb-2 flex items-center gap-4">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
                style={{
                  color: colors.brown,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <InstagramIcon size={14} /> Instagram
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
                style={{
                  color: colors.brown,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <TikTokIcon size={14} /> TikTok
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
                style={{
                  color: colors.brown,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <FacebookIcon size={14} /> Facebook
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {instagramGrid.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden"
                style={{ backgroundColor: "#e8e2da" }}
              >
                <img
                  src={src}
                  alt={`Instagram photo ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: "rgba(92,75,67,0.55)" }}
                >
                  <InstagramIcon size={24} color="#fff" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: colors.gold }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2
            className="mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              color: colors.brown,
            }}
          >
            Ready to create something beautiful?
          </h2>
          <p
            className="mb-8 text-sm"
            style={{
              color: colors.brown,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              opacity: 0.8,
            }}
          >
            I take limited bookings each month. Check availability and secure
            your date today.
          </p>
          <PrimaryButton onClick={() => go("booking")}>
            Book Your Session <ArrowRight size={14} />
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}
