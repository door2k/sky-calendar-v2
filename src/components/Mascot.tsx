import type { CSSProperties } from "react";
import type { Theme } from "../types";

interface Props {
  t: Theme;
  /** Position presets for where the mascot peeks from */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: number;
  /** Optional rotation in degrees (defaults to a small playful tilt) */
  rotate?: number;
  /** Index into theme.mascots; falls back to first */
  index?: number;
}

const POSITIONS: Record<NonNullable<Props["position"]>, CSSProperties> = {
  "bottom-right": { bottom: -8, right: -4 },
  "bottom-left": { bottom: -8, left: -4 },
  "top-right": { top: -4, right: -4 },
  "top-left": { top: -4, left: -4 },
};

/** A single peeking themed character. Decoration only — pointer-events disabled. */
export const Mascot = ({ t, position = "bottom-right", size = 80, rotate, index = 0 }: Props) => {
  const chars = t.mascots && t.mascots.length > 0 ? t.mascots : [t.sticker];
  const char = chars[index % chars.length];
  const tilt = rotate ?? (position.includes("right") ? -12 : 12);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        ...POSITIONS[position],
        fontSize: size,
        lineHeight: 1,
        transform: `rotate(${tilt}deg)`,
        opacity: 0.95,
        pointerEvents: "none",
        textShadow: `2px 3px 0 rgba(0,0,0,.08)`,
        userSelect: "none",
        zIndex: 1,
      }}
    >
      {char}
    </div>
  );
};

interface ScatterSpot {
  /** vertical: top|bottom value, percentage from edge */
  v: { edge: "top" | "bottom"; pct: number };
  /** horizontal: left|right value, percentage from edge */
  h: { edge: "left" | "right"; pct: number };
  size: number;
  rotate: number;
}

/** Default scatter for 3 mascots — distinct corners/edges so they read as separate */
const DEFAULT_SPOTS: ScatterSpot[] = [
  { v: { edge: "top", pct: 8 },    h: { edge: "left",  pct: 1 },  size: 38, rotate: -12 },
  { v: { edge: "top", pct: 45 },   h: { edge: "right", pct: 1 },  size: 44, rotate: 14 },
  { v: { edge: "bottom", pct: 4 }, h: { edge: "left",  pct: 38 }, size: 36, rotate: -8 },
];

/** Themed mascots scattered around the container at distinct positions */
export const MascotScatter = ({ t, lang }: { t: Theme; lang?: "en" | "he" }) => {
  const mascots = t.mascots && t.mascots.length > 0 ? t.mascots : [t.sticker];
  const items = mascots.slice(0, 3).map((c, i) => ({ char: c, ...DEFAULT_SPOTS[i % DEFAULT_SPOTS.length] }));
  const flipH = lang === "he";
  return (
    <>
      {items.map((it, i) => {
        const horizKey: "left" | "right" = flipH
          ? it.h.edge === "left" ? "right" : "left"
          : it.h.edge;
        return (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              [it.v.edge]: `${it.v.pct}%`,
              [horizKey]: `${it.h.pct}%`,
              fontSize: it.size,
              transform: `rotate(${it.rotate}deg)`,
              opacity: 0.85,
              textShadow: "1px 2px 0 rgba(0,0,0,.07)",
              userSelect: "none",
              lineHeight: 1,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {it.char}
          </div>
        );
      })}
    </>
  );
};
