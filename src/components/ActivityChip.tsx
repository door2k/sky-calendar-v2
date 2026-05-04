import type { Activity, Lang, Theme } from "../types";
import { ActIcon } from "./ActIcon";
import { PersonAvatar } from "./PersonAvatar";

interface Props {
  t: Theme;
  a: Activity;
  lang: Lang;
  onClick?: () => void;
  recurring?: boolean;
}

export const ActivityChip = ({ t, a, lang, onClick, recurring }: Props) => {
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const accent = recurring ? t.accent2 : t.accent;
  return (
    <div
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onClick(); } } : undefined}
      style={{
        background: t.cardBg,
        border: `1.5px ${recurring ? "dashed" : "solid"} ${accent}`,
        borderRadius: 10,
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: `2px 2px 0 ${accent}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: `${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        <ActIcon k={a.icon} size={14} color={accent} />
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
        <div style={{ fontSize: 9, color: t.inkSoft }}>{a.at}{a.where ? ` · ${a.where}` : ""}</div>
      </div>
      {a.withSlugs && a.withSlugs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", marginInlineStart: 2 }}>
          {a.withSlugs.slice(0, 3).map((slug, i) => (
            <div key={slug + i} style={{ marginInlineStart: i === 0 ? 0 : -8 }} title={slug}>
              <PersonAvatar id={slug} size={20} halo={false} theme={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
