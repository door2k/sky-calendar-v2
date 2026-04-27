import type { ReactNode } from "react";
import type { Theme } from "../types";

interface Props {
  t: Theme;
  tint: string;
  icon: string;
  label: string;
  time?: string;
  small?: boolean;
  children: ReactNode;
}

export const SlotRow = ({ t, tint, icon, label, time, small, children }: Props) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: small ? 9.5 : 10 }}>
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 8, color: t.inkSoft, letterSpacing: 0.6, fontWeight: 700, fontFamily: t.fontHead }}>
        {label.toUpperCase()}
      </div>
      {time && <div style={{ fontSize: 10, fontWeight: 700, fontFamily: t.fontHead, color: t.ink }}>{time}</div>}
    </div>
    {children}
  </div>
);
