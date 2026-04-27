import type { CSSProperties } from "react";

interface Props {
  char?: string;
  color?: string;
  size?: number;
  rotate?: number;
  style?: CSSProperties;
}

export const Sticker = ({ char = "★", color = "#e63a3a", size = 28, rotate = 0, style = {} }: Props) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#fff",
      color,
      fontSize: size * 0.62,
      boxShadow: `0 2px 4px rgba(0,0,0,.15), 0 0 0 2px ${color}`,
      transform: `rotate(${rotate}deg)`,
      fontWeight: 900,
      fontFamily: "var(--fontHead)",
      ...style,
    }}
  >
    {char}
  </span>
);
