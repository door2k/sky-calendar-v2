import type { Day, Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { WEEK } from "../data/week";
import { PersonAvatar } from "../components/PersonAvatar";
import { Sticker } from "../components/Sticker";
import { ActIcon } from "../components/ActIcon";
import { Confetti } from "../components/Confetti";

interface Props {
  theme: Theme;
  lang?: Lang;
}

const CombinedDayCard = ({ d, t, lang, dayIdx }: { d: Day; t: Theme; lang: Lang; dayIdx: number }) => {
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const tint = t.dayTints[dayIdx];
  const isFri = !!d.isFriday;
  const isSat = !!d.isSaturday;
  return (
    <div
      style={{
        background: d.noGan
          ? `linear-gradient(180deg, ${t.fridayAccent}33, ${tint}, ${t.cardBg} 80%)`
          : `linear-gradient(180deg, ${tint}, ${t.cardBg} 70%)`,
        border: `${d.noGan ? 2.5 : 2}px solid ${d.noGan ? t.fridayAccent : t.ink}`,
        borderRadius: d.noGan ? "4px 18px 4px 18px" : 10,
        padding: "6px 6px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        boxShadow: `2px 2px 0 ${t.ink}33`,
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", fontFamily: t.fontHead }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: d.noGan ? t.fridayAccent : t.ink,
            textTransform: "uppercase",
          }}
        >
          {tx(d.day, d.dayHe)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.ink, lineHeight: 1 }}>{d.date.split(" ")[1] || d.date}</div>
      </div>
      {!isSat && d.dropoff && <PersonAvatar id={d.dropoff.by} size={32} halo={true} theme={t} />}
      {isSat && d.activities && (
        <div style={{ fontSize: 18 }}>{d.activities[0].name.match(/\p{Emoji}/u)?.[0] || "✦"}</div>
      )}
      {isFri && d.dinner && <PersonAvatar id={d.dinner.host} size={32} halo={true} theme={t} />}
      {d.after && <ActIcon k={d.after.icon} size={16} color={t.accent} />}
      {!isSat && d.pickup && <PersonAvatar id={d.pickup.by} size={28} halo={false} theme={t} />}
    </div>
  );
};

export const PrintCombined = ({ theme, lang = "en" }: Props) => {
  const t = { ...theme, paper: "#ffffff", paperDeep: "#faf6ee", ink: "#1a1410", inkSoft: "#5a4a38", cardBg: "#ffffff" };
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  return (
    <div
      style={{
        ...themeStyle(t),
        background: t.paper,
        color: t.ink,
        fontFamily: t.fontBody,
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr",
        position: "relative",
        overflow: "hidden",
        gap: 12,
      }}
    >
      <Confetti t={t} count={16} seed={5} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Sticker char={t.sticker} color={t.accent} size={36} rotate={-10} />
        <div
          style={{
            textAlign: "center",
            background: t.cardBg,
            padding: "10px 30px",
            borderRadius: 99,
            border: `3px solid ${t.ink}`,
            boxShadow: `4px 4px 0 ${t.fridayAccent}`,
          }}
        >
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 26, letterSpacing: -0.6, lineHeight: 1, color: t.ink }}>
            {tx("Sky's Schedule", "הלו״ז של סקיי")}
          </div>
          <div style={{ fontSize: 10, color: t.inkSoft, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
            {tx("Week + Month", "שבוע + חודש")}
          </div>
        </div>
        <Sticker char={t.sticker} color={t.accent2} size={36} rotate={10} />
      </div>

      <div style={{ position: "relative", zIndex: 2, flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: t.fontHead,
            color: t.inkSoft,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 6,
            paddingLeft: 4,
          }}
        >
          ★ {tx("This Week", "השבוע")}
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, minHeight: 0 }}>
          {WEEK.map((d, i) => <CombinedDayCard key={d.day} d={d} t={t} lang={lang} dayIdx={i} />)}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, flex: "0 0 35%", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: t.fontHead,
            color: t.inkSoft,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginBottom: 6,
            paddingLeft: 4,
          }}
        >
          📅 {tx("April 2026", "אפריל 2026")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {(lang === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["S", "M", "T", "W", "T", "F", "S"]).map((l, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: t.fontHead,
                color: i === 5 ? t.fridayAccent : t.inkSoft,
                letterSpacing: 1,
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: "repeat(5, 1fr)",
            gap: 4,
            minHeight: 0,
          }}
        >
          {Array.from({ length: 35 }).map((_, i) => {
            const n = i - 1;
            const dow = i % 7;
            const isFri = dow === 5;
            const isToday = n === 27;
            const has = n > 0 && n <= 30;
            return (
              <div
                key={i}
                style={{
                  background: !has ? t.paperDeep + "33" : isFri ? `${t.fridayAccent}15` : t.cardBg,
                  border: `1.5px solid ${isToday ? t.accent : t.cardBorder}`,
                  borderRadius: 8,
                  padding: "4px 5px",
                  fontSize: 11,
                  fontFamily: t.fontHead,
                  fontWeight: 700,
                  color: isToday ? t.accent : isFri ? t.fridayAccent : t.ink,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  boxShadow: isToday ? `2px 2px 0 ${t.accent}` : "none",
                }}
              >
                {has ? n : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: t.inkSoft, fontStyle: "italic", position: "relative", zIndex: 2 }}>
        ✿ {tx("Sky · age 4", "סקיי · בת 4")} ✿
      </div>
    </div>
  );
};
