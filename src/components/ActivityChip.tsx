import type { Activity, Lang, Theme } from "../types";
import { ActIcon } from "./ActIcon";

interface Props {
  t: Theme;
  a: Activity;
  lang: Lang;
}

export const ActivityChip = ({ t, a, lang }: Props) => {
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  return (
    <div
      style={{
        background: t.cardBg,
        border: `1.5px solid ${t.accent}`,
        borderRadius: 10,
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: `2px 2px 0 ${t.accent}`,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: `${t.accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.accent,
          flexShrink: 0,
        }}
      >
        <ActIcon k={a.icon} size={14} color={t.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: t.fontHead,
            color: t.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tx(a.name, a.nameHe)}
        </div>
        <div style={{ fontSize: 9, color: t.inkSoft }}>{a.at} · {a.where}</div>
      </div>
    </div>
  );
};
