import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { colors, type Page } from "../data/images";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";
import { socialLinks } from "../data/social";

const links: [string, Page][] = [
  ["Home", "home"],
  ["Weddings", "weddings"],
  ["Newborn", "newborn"],
  ["Family", "family"],
  ["Cake Smash", "cakesmash"],
  ["Book Now", "booking"],
];

export function Footer({ setPage }: { setPage: (page: Page) => void }) {
  const go = (page: Page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer style={{ backgroundColor: colors.brown }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-3 md:px-12">
        <div className="flex flex-col gap-3">
          <img
            src={logo}
            alt="Ko&Mo Photography"
            className="h-20 w-20 object-contain"
          />
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "rgba(240,243,238,0.65)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
            }}
          >
            Wedding · Newborn · Family Photography
            <br />
            Based in Barrhead, Glasgow.
          </p>
        </div>

        <div>
          <p
            className="mb-5 text-xs tracking-widest uppercase"
            style={{
              color: colors.gold,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Navigation
          </p>
          <div className="flex flex-col gap-3">
            {links.map(([label, page]) => (
              <button
                key={page}
                type="button"
                onClick={() => go(page)}
                className="text-left text-sm transition-opacity hover:opacity-60"
                style={{
                  color: "rgba(245,241,234,0.75)",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="mb-5 text-xs tracking-widest uppercase"
            style={{
              color: colors.gold,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Contact
          </p>
          <div
            className="space-y-3 text-sm"
            style={{
              color: "rgba(245,241,234,0.75)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
            }}
          >
            <p>konmophotography@gmail.com</p>
            <p>07719 140 368</p>
            <p>Barrhead, Glasgow</p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
                style={{ color: colors.gold }}
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
                style={{ color: colors.gold }}
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
                style={{ color: colors.gold }}
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-t py-6"
        style={{ borderColor: "rgba(245,241,234,0.1)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-center sm:flex-row sm:text-left md:px-12">
          <p
            className="text-xs"
            style={{
              color: "rgba(245,241,234,0.35)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            © {new Date().getFullYear()} Ko&Mo Photography. All rights reserved.
          </p>
          <Link
            to="/admin"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            style={{
              color: "rgba(245,241,234,0.28)",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Staff sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
