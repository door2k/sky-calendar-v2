import type { CSSProperties } from "react";
import type { Lang } from "../types";

interface Props {
  lang: Lang;
  /** Human-readable label for the current period (e.g. week range or month name). */
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const arrowBtn: CSSProperties = {
  border: "1px solid rgba(255,255,255,.2)",
  background: "rgba(255,255,255,.1)",
  color: "#fff",
  borderRadius: 8,
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/**
 * Floating, screen-only navigation for the print preview views. Marked
 * `no-print` so it never shows up in the actual printout. Lets the user move
 * the print preview off the current week/month (e.g. to print next week).
 */
export const PrintNav = ({ lang, label, onPrev, onNext, onToday }: Props) => (
  <div
    className="no-print"
    style={{
      position: "fixed",
      bottom: 18,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#0f0c0a",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: 99,
      padding: "6px 10px",
      boxShadow: "0 8px 24px rgba(0,0,0,.45)",
      fontFamily: "system-ui, sans-serif",
      direction: "ltr",
    }}
  >
    <button onClick={onPrev} title={lang === "he" ? "הקודם" : "Previous"} style={arrowBtn}>‹</button>
    <span style={{ color: "rgba(255,255,255,.9)", fontSize: 12, fontWeight: 600, minWidth: 140, textAlign: "center" }}>
      {label}
    </span>
    <button onClick={onNext} title={lang === "he" ? "הבא" : "Next"} style={arrowBtn}>›</button>
    <button
      onClick={onToday}
      style={{
        border: "1px solid rgba(255,255,255,.2)",
        background: "rgba(255,255,255,.1)",
        color: "#fff",
        borderRadius: 8,
        padding: "0 12px",
        height: 30,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        marginInlineStart: 4,
      }}
    >
      {lang === "he" ? "היום" : "Today"}
    </button>
  </div>
);
