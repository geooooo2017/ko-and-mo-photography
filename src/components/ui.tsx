import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { colors } from "../data/images";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-4 text-xs tracking-[0.25em] uppercase"
      style={{ color: colors.taupe, fontFamily: "'Montserrat', sans-serif" }}
    >
      {children}
    </p>
  );
}

export function Heading({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className="mb-6 leading-none"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
        fontWeight: 400,
        color: light ? colors.cream : colors.brown,
      }}
    >
      {children}
    </h2>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-[0.18em] uppercase transition-all duration-300 hover:opacity-80 ${className}`}
      style={{
        backgroundColor: colors.green,
        color: "#fff",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  light = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 border px-8 py-3.5 text-xs tracking-[0.18em] uppercase transition-all duration-300"
      style={{
        borderColor: light ? "rgba(255,255,255,0.6)" : colors.green,
        color: light ? "#fff" : colors.green,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="mb-4 flex gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} fill={colors.gold} strokeWidth={0} />
      ))}
    </div>
  );
}
