import type { CSSProperties } from "react";
import type { Lang, Person, Theme } from "../types";
import { byId } from "../data/people";

interface Props {
  id: string;
  size?: number;
  halo?: boolean;
  theme?: Theme | (Partial<Theme> & { halo?: string; accent?: string });
  label?: boolean;
  lang?: Lang;
  style?: CSSProperties;
}

const SingleAvatar = ({
  p,
  size,
  halo,
  theme,
}: {
  p: Person;
  size: number;
  halo: boolean;
  theme?: Theme | (Partial<Theme> & { halo?: string; accent?: string });
}) => {
  const haloColor = theme?.halo || "#f5d28a";
  const ring = halo ? size * 0.08 : 0;
  const inner = size - ring * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: halo
          ? `conic-gradient(from 200deg, ${haloColor}, ${theme?.accent || haloColor}, ${haloColor})`
          : "transparent",
        padding: ring,
        boxShadow: halo ? `0 ${size * 0.04}px ${size * 0.12}px rgba(20,15,10,.18)` : "none",
        position: "relative",
      }}
    >
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 100 100"
        style={{ borderRadius: "50%", background: `hsl(${p.hue}, 70%, 88%)`, display: "block" }}
      >
        <ellipse cx="50" cy="40" rx="38" ry="32" fill={p.hair} />
        <ellipse cx="50" cy="58" rx="28" ry="32" fill={p.skin} />
        <path
          d={
            p.kid
              ? "M22 42 Q35 28 50 32 Q66 28 78 44 Q72 38 60 40 Q50 36 40 40 Q28 38 22 42"
              : "M22 44 Q35 30 50 34 Q66 30 78 46 Q70 42 60 44 Q50 40 40 44 Q30 42 22 44"
          }
          fill={p.hair}
        />
        <circle cx="40" cy="56" r="2.6" fill="#2a1810" />
        <circle cx="60" cy="56" r="2.6" fill="#2a1810" />
        <circle cx="34" cy="66" r="3.5" fill="#f5a8a8" opacity="0.6" />
        <circle cx="66" cy="66" r="3.5" fill="#f5a8a8" opacity="0.6" />
        <path d="M42 70 Q50 76 58 70" stroke="#7a3a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {p.glasses && (
          <g stroke="#2a1810" strokeWidth="1.6" fill="none">
            <circle cx="40" cy="56" r="7" />
            <circle cx="60" cy="56" r="7" />
            <path d="M47 56h6" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const PersonAvatar = ({ id, size = 56, halo = true, theme, label, lang = "en", style = {} }: Props) => {
  if (id.includes("+")) {
    const slugs = id.split("+").filter(Boolean);
    const people = slugs.map(byId).filter((p): p is Person => !!p);
    if (people.length === 0) return null;
    const small = Math.round(size * 0.7);
    const overlap = Math.round(small * 0.45);
    const labelText = people.map((p) => (lang === "he" ? p.nameHe : p.name)).join(" & ");
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: size * 0.08, ...style }}>
        <div style={{ display: "flex", alignItems: "center", height: small, gap: -overlap, position: "relative" }}>
          {people.slice(0, 2).map((p, i) => (
            <div key={p.id} style={{ marginInlineStart: i === 0 ? 0 : -overlap, zIndex: i === 0 ? 1 : 2 }}>
              <SingleAvatar p={p} size={small} halo={halo} theme={theme} />
            </div>
          ))}
        </div>
        {label && (
          <div
            style={{
              fontSize: size * 0.18,
              fontWeight: 700,
              color: "var(--ink)",
              fontFamily: "var(--fontHead)",
              letterSpacing: 0.2,
              textAlign: "center",
              maxWidth: size * 1.6,
            }}
          >
            {labelText}
          </div>
        )}
      </div>
    );
  }

  const p = byId(id);
  if (!p) return null;
  const name = lang === "he" ? p.nameHe : p.name;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: size * 0.08, ...style }}>
      <SingleAvatar p={p} size={size} halo={halo} theme={theme} />
      {label && (
        <div
          style={{
            fontSize: size * 0.22,
            fontWeight: 700,
            color: "var(--ink)",
            fontFamily: "var(--fontHead)",
            letterSpacing: 0.2,
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
