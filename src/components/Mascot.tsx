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

/** Floating themed motif characters — like Confetti but bigger and corner-clustered. */
export const MascotCluster = ({ t, position = "bottom-right" }: { t: Theme; position?: Props["position"] }) => {
  const mascots = t.mascots && t.mascots.length > 0 ? t.mascots : [t.sticker];
  const items = mascots.slice(0, 3).map((c, i) => ({
    char: c,
    size: 48 - i * 10,
    offset: i * 14,
    rotate: ((i % 2 === 0 ? -1 : 1) * (8 + i * 4)),
  }));
  const isRight = (position || "bottom-right").includes("right");
  const isBottom = (position || "bottom-right").includes("bottom");
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        [isBottom ? "bottom" : "top"]: 0,
        [isRight ? "right" : "left"]: 0,
        width: 160,
        height: 120,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            [isBottom ? "bottom" : "top"]: -8 + it.offset * (isBottom ? -1 : 1),
            [isRight ? "right" : "left"]: -8 + it.offset,
            fontSize: it.size,
            transform: `rotate(${it.rotate}deg)`,
            opacity: 0.9 - i * 0.18,
            textShadow: "1px 2px 0 rgba(0,0,0,.06)",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          {it.char}
        </div>
      ))}
    </div>
  );
};
