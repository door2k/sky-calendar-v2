import type { Theme } from "../types";

interface Props {
  t: Theme;
  count?: number;
  seed?: number;
}

export const Confetti = ({ t, count = 8, seed = 0 }: Props) => {
  const stickers = [t.sticker, "★", "♥", "✦", "●"];
  const colors = [t.accent, t.accent2, t.fridayAccent, t.halo];
  const items: { char: string; color: string; x: number; y: number; rot: number; size: number }[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      char: stickers[i % stickers.length],
      color: colors[(i + seed) % colors.length],
      x: ((i * 47 + seed * 23) % 90) + 5,
      y: ((i * 31 + seed * 17) % 90) + 5,
      rot: ((i * 53 + seed * 7) % 60) - 30,
      size: 16 + (i % 3) * 4,
    });
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x + "%",
            top: s.y + "%",
            fontSize: s.size,
            color: s.color,
            transform: `rotate(${s.rot}deg)`,
            fontWeight: 900,
            opacity: 0.55,
            fontFamily: t.fontHead,
          }}
        >
          {s.char}
        </div>
      ))}
    </div>
  );
};
