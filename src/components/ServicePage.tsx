import { ArrowRight, Check } from "lucide-react";
import { colors, type Page } from "../data/images";
import { Heading, PrimaryButton, SectionLabel } from "./ui";

export type Package = {
  icon: string;
  name: string;
  price: string;
  duration?: string;
  includes: string[];
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export function ServicePage({
  hero,
  tag,
  title,
  intro,
  packages,
  gallery,
  faqs,
  setPage,
}: {
  hero: string;
  tag: string;
  title: string;
  intro: string;
  packages: Package[];
  gallery: GalleryImage[];
  faqs?: readonly { question: string; answer: string }[];
  setPage: (page: Page) => void;
}) {
  const go = (page: Page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const packageGridClass =
    packages.length === 1
      ? "max-w-sm mx-auto"
      : packages.length === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <div>
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: "70vh", backgroundColor: colors.cream }}
      >
        <img
          src={hero}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(92,75,67,0.45)" }}
        />
        <div className="relative z-10 px-6 text-center">
          <SectionLabel>{tag}</SectionLabel>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 300,
              color: "#fff",
            }}
          >
            {title}
          </h1>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p
            className="text-base leading-relaxed"
            style={{
              color: colors.taupe,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              lineHeight: 1.9,
            }}
          >
            {intro}
          </p>
        </div>
      </section>

      <section className="pb-24" style={{ backgroundColor: colors.cream }}>
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-14 text-center">
            <SectionLabel>Pricing</SectionLabel>
            <Heading>Choose Your Package</Heading>
          </div>
          <div className={`grid gap-6 ${packageGridClass}`}>
            {packages.map((pkg, index) => {
              const featured = index === 1;
              return (
                <div
                  key={pkg.name}
                  className="flex flex-col p-8 transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: featured ? colors.green : "#fff",
                    border: `1px solid ${featured ? colors.green : "rgba(184,169,154,0.3)"}`,
                  }}
                >
                  <div className="mb-4 text-3xl">{pkg.icon}</div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.6rem",
                      fontWeight: 400,
                      color: featured ? "#fff" : colors.brown,
                    }}
                  >
                    {pkg.name}
                  </h3>
                  {pkg.duration && (
                    <p
                      className="mb-4 text-xs tracking-widest uppercase"
                      style={{
                        color: featured ? colors.gold : colors.taupe,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {pkg.duration}
                    </p>
                  )}
                  <p
                    className="mb-6 text-3xl"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      color: featured ? colors.gold : colors.brown,
                    }}
                  >
                    {pkg.price}
                  </p>
                  <ul className="mb-8 flex-1 space-y-3">
                    {pkg.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm"
                        style={{
                          color: featured
                            ? "rgba(245,241,234,0.85)"
                            : colors.taupe,
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 300,
                        }}
                      >
                        <Check
                          size={14}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: colors.gold }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go("booking")}
                    className="w-full py-3.5 text-xs tracking-[0.18em] uppercase transition-all"
                    style={{
                      backgroundColor: featured ? colors.gold : colors.green,
                      color: featured ? colors.brown : "#fff",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Book Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="mb-12 text-center">
            <SectionLabel>Gallery</SectionLabel>
            <Heading>A Glimpse of the Work</Heading>
          </div>
          <div className="columns-2 gap-3 space-y-3 md:columns-3">
            {gallery.map((image, i) => (
              <div
                key={i}
                className="group break-inside-avoid overflow-hidden"
                style={{ backgroundColor: "#e8e2da" }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="block h-auto w-full transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {faqs && faqs.length > 0 && (
        <section className="py-24" style={{ backgroundColor: colors.cream }}>
          <div className="mx-auto max-w-3xl px-6 md:px-12">
            <div className="mb-10 text-center">
              <SectionLabel>Good to know</SectionLabel>
              <Heading>Frequently Asked Questions</Heading>
            </div>
            <div className="space-y-0">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="group border-b py-5"
                  style={{ borderColor: "rgba(184,169,154,0.35)" }}
                >
                  <summary
                    className="cursor-pointer list-none text-left text-base marker:content-none [&::-webkit-details-marker]:hidden"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: colors.brown,
                      fontSize: "1.25rem",
                    }}
                  >
                    {item.question}
                  </summary>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{
                      color: colors.taupe,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="py-20 text-center"
        style={{ backgroundColor: colors.gold }}
      >
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: colors.brown,
          }}
        >
          Ready to book?
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
          Check availability and secure your date today.
        </p>
        <PrimaryButton onClick={() => go("booking")}>
          Check Availability <ArrowRight size={14} />
        </PrimaryButton>
      </section>
    </div>
  );
}
