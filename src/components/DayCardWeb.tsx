import type { Day, Lang, Theme } from "../types";
import { PersonAvatar } from "./PersonAvatar";
import { Sticker } from "./Sticker";
import { SlotRow } from "./SlotRow";
import { ActivityChip } from "./ActivityChip";

interface Props {
  d: Day;
  t: Theme;
  lang: Lang;
  isToday: boolean;
  dayIdx: number;
  avatarScale?: number;
  avatarHalo?: boolean;
  onClick?: () => void;
}

export const DayCardWeb = ({ d, t, lang, isToday, dayIdx, avatarScale = 1, avatarHalo = true, onClick }: Props) => {
  const sz = (px: number) => Math.round(px * avatarScale);
  const tint = t.dayTints[dayIdx];
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const isFri = !!d.isFriday;
  const isSat = !!d.isSaturday;
  const isNoGan = !!d.noGan;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      style={{
        background: isNoGan ? `linear-gradient(180deg, ${t.fridayAccent}22 0%, ${t.cardBg} 60%)` : t.cardBg,
        borderRadius: isNoGan ? "8px 32px 8px 32px" : 16,
        border: `1.5px solid ${isToday ? t.accent : isNoGan ? t.fridayAccent : t.cardBorder}`,
        boxShadow: isToday
          ? `0 0 0 3px ${t.halo}, 0 8px 22px rgba(0,0,0,.10)`
          : isNoGan
          ? `0 4px 14px ${t.fridayAccent}33`
          : `0 2px 8px rgba(0,0,0,.06)`,
        padding: "10px 10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        minHeight: 0,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ textAlign: "center", borderBottom: `1.5px dashed ${t.cardBorder}`, paddingBottom: 6, position: "relative" }}>
        <div
          style={{
            fontFamily: t.fontHead,
            fontWeight: 700,
            fontSize: 15,
            color: isNoGan ? t.fridayAccent : isToday ? t.accent : t.ink,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {tx(d.day, d.dayHe)}
        </div>
        <div style={{ fontSize: 10, color: t.inkSoft, marginTop: 1 }}>{tx(d.date, d.dateHe)}</div>
        {isToday && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: t.accent,
              color: "#fff",
              fontSize: 8,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 99,
              fontFamily: t.fontHead,
              letterSpacing: 0.5,
            }}
          >
            {tx("TODAY", "היום")}
          </div>
        )}
        {isNoGan && (
          <Sticker char="✦" color={t.fridayAccent} size={22} rotate={-12} style={{ position: "absolute", top: -8, left: -8 }} />
        )}
        {isNoGan && (
          <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1, color: t.fridayAccent, marginTop: 2, fontFamily: t.fontHead }}>
            {tx("NO GAN", "בלי גן")}
          </div>
        )}
      </div>

      {!isSat && d.dropoff && (
        <SlotRow t={t} tint={tint} icon="↓" label={tx("Drop", "מסירה")} time={d.dropoff.at}>
          <PersonAvatar id={d.dropoff.by} size={sz(26)} halo={avatarHalo} theme={t} />
        </SlotRow>
      )}

      {!isSat && d.gan && !d.noGan && (
        <div
          style={{
            background: tint,
            borderRadius: 10,
            padding: "6px 8px",
            fontSize: 10.5,
            fontWeight: 600,
            fontFamily: t.fontHead,
            color: t.ink,
            lineHeight: 1.25,
          }}
        >
          <div style={{ fontSize: 8, color: t.inkSoft, letterSpacing: 1, fontWeight: 700, marginBottom: 2 }}>
            {tx("AT GAN", "בגן")}
          </div>
          {tx(d.gan.label, d.gan.labelHe)}
        </div>
      )}

      {d.after && <ActivityChip t={t} a={d.after} lang={lang} />}

      {d.recurring && d.recurring.map((a, i) => <ActivityChip key={`rec-${i}`} t={t} a={a} lang={lang} />)}

      {isSat && d.activities && d.activities.map((a, i) => <ActivityChip key={i} t={t} a={a} lang={lang} />)}

      {!isSat && d.pickup && (
        <SlotRow t={t} tint={tint} icon="↑" label={tx("Pick", "איסוף")} time={d.pickup.at}>
          <PersonAvatar id={d.pickup.by} size={sz(26)} halo={avatarHalo} theme={t} />
        </SlotRow>
      )}

      {isFri && d.dinner && (
        <div
          style={{
            background: `linear-gradient(135deg, ${t.fridayAccent}, ${t.fridayAccent}cc)`,
            color: "#fff",
            borderRadius: 14,
            padding: "8px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, opacity: 0.9, fontFamily: t.fontHead }}>
            {tx("FRIDAY DINNER", "ארוחת שישי")}
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <PersonAvatar id={d.dinner.host} size={sz(40)} halo={true} theme={{ ...t, halo: "#fff" }} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: t.fontHead }}>
            {d.dinner.at} · {d.dinner.where}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {d.bedtime && (
        <SlotRow t={t} tint={tint} icon="🌙" label={tx("Bed", "שינה")} small>
          <PersonAvatar id={d.bedtime.by} size={sz(22)} halo={false} theme={t} />
        </SlotRow>
      )}

      {(d.notes || (lang === "he" && d.notesHe)) && (
        <div
          style={{
            fontSize: 9.5,
            color: t.inkSoft,
            fontStyle: "italic",
            borderTop: `1px dashed ${t.cardBorder}`,
            paddingTop: 5,
            lineHeight: 1.3,
          }}
        >
          📌 {tx(d.notes || "", d.notesHe || "")}
        </div>
      )}
    </div>
  );
};
