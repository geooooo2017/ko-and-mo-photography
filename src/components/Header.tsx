import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { colors, type Page } from "../data/images";
import { PrimaryButton } from "./ui";

const navItems: { label: string; page?: Page }[] = [
  { label: "Home", page: "home" },
  { label: "Portfolio" },
  { label: "About" },
  { label: "Booking", page: "booking" },
];

const portfolioItems: { label: string; page: Page }[] = [
  { label: "Weddings", page: "weddings" },
  { label: "Newborn", page: "newborn" },
  { label: "Family", page: "family" },
  { label: "Cake Smash", page: "cakesmash" },
  { label: "Minis & Milestones", page: "minis" },
];

export function Header({
  page,
  setPage,
}: {
  page: Page;
  setPage: (page: Page) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (next: Page) => {
    setPage(next);
    setMenuOpen(false);
    setPortfolioOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(245,241,234,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(184,169,154,0.25)" : "none",
      }}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 md:px-12">
        <button
          type="button"
          onClick={() => go("home")}
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src={logo}
            alt="Ko&Mo Photography logo"
            className="h-16 w-16 object-contain"
          />
          <span
            className="ml-2 hidden text-xs tracking-[0.18em] uppercase sm:block"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: colors.brown,
              fontWeight: 500,
            }}
          >
            Ko&Mo Photography
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            if (item.label === "Portfolio") {
              return (
                <div
                  key="portfolio"
                  className="relative"
                  onMouseEnter={() => setPortfolioOpen(true)}
                  onMouseLeave={() => setPortfolioOpen(false)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs tracking-[0.14em] uppercase transition-colors"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      color: colors.brown,
                    }}
                  >
                    Portfolio <ChevronDown size={12} />
                  </button>
                  {portfolioOpen && (
                    <div
                      className="absolute top-full left-1/2 w-44 -translate-x-1/2 pt-4 pb-2 shadow-lg"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid rgba(184,169,154,0.3)",
                      }}
                    >
                      {portfolioItems.map((sub) => (
                        <button
                          key={sub.label}
                          type="button"
                          onClick={() => go(sub.page)}
                          className="w-full px-5 py-2.5 text-left text-xs tracking-[0.12em] uppercase transition-colors hover:bg-[#F5F1EA]"
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            color: colors.brown,
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (item.label === "About") {
              return (
                <button
                  key="about"
                  type="button"
                  onClick={() => {
                    go("home");
                    setTimeout(
                      () =>
                        document
                          .getElementById("about")
                          ?.scrollIntoView({ behavior: "smooth" }),
                      100,
                    );
                  }}
                  className="text-xs tracking-[0.14em] uppercase transition-colors hover:opacity-60"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: colors.brown,
                  }}
                >
                  About
                </button>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => item.page && go(item.page)}
                className="text-xs tracking-[0.14em] uppercase transition-colors hover:opacity-60"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: colors.brown,
                  borderBottom:
                    page === item.page
                      ? `1px solid ${colors.brown}`
                      : "1px solid transparent",
                }}
              >
                {item.label}
              </button>
            );
          })}
          <PrimaryButton onClick={() => go("booking")}>Book Now</PrimaryButton>
        </nav>

        <button
          type="button"
          className="p-1 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: colors.brown }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 md:hidden"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          backgroundColor: colors.cream,
          borderBottom: menuOpen
            ? "1px solid rgba(184,169,154,0.25)"
            : "none",
        }}
      >
        <div className="flex flex-col gap-5 px-6 py-6">
          <button
            type="button"
            onClick={() => go("home")}
            className="text-left text-sm tracking-widest uppercase"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: colors.brown,
            }}
          >
            Home
          </button>
          {portfolioItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => go(item.page)}
              className="pl-4 text-left text-sm tracking-widest uppercase"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: colors.taupe,
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go("booking")}
            className="text-left text-sm tracking-widest uppercase"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: colors.brown,
            }}
          >
            Booking
          </button>
          <PrimaryButton onClick={() => go("booking")} className="self-start">
            Book Now
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
