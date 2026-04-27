import type { Lang, Theme } from "../types";

interface Props {
  t: Theme;
  lang: Lang;
}

export const AIStrip = ({ t, lang }: Props) => {
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  return (
    <div
      style={{
        borderTop: `2px dashed ${t.cardBorder}`,
        padding: "10px 16px",
        background: t.paperDeep,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: t.fontHead,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 3px 8px rgba(0,0,0,.12)",
        }}
      >
        ✨
      </div>
      <div
        style={{
          flex: 1,
          background: t.cardBg,
          borderRadius: 99,
          padding: "8px 14px",
          border: `1.5px solid ${t.cardBorder}`,
          fontSize: 12,
          color: t.inkSoft,
          fontStyle: "italic",
        }}
      >
        {tx('Tell me — "Maya picks up Tuesday & Wednesday"', 'ספרי לי — "מאיה אוספת בשלישי ורביעי"')}
      </div>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: t.accent,
          color: "#fff",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: t.fontHead,
          fontWeight: 700,
        }}
      >
        🎤
      </button>
      <button
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: t.ink,
          color: t.paper,
          fontSize: 14,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        ↑
      </button>
    </div>
  );
};
