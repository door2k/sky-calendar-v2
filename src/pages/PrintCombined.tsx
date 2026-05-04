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
  days?: Day[];
  monthLabelEn?: string;
  monthLabelHe?: string;
  monthYear?: number;
  monthIndex?: number; // 0-11
  todayN?: number; // day-of-month to highlight
  monthEntries?: Record<number, { hasSchedule?: boolean; recurringIcons?: string[]; isFridayDinner?: boolean }>;
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

      {!isSat && d.dropoff && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.8, color: t.inkSoft, fontFamily: t.fontHead }}>↓</div>
          <PersonAvatar id={d.dropoff.by} size={28} halo={true} theme={t} />
        </div>
      )}

      {!isSat && d.pickup && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.8, color: t.inkSoft, fontFamily: t.fontHead }}>↑</div>
          <PersonAvatar id={d.pickup.by} size={28} halo={false} theme={t} />
        </div>
      )}

      {d.after && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            background: `${t.accent}1a`,
            padding: "3px 5px",
            borderRadius: 8,
            border: `1px solid ${t.accent}`,
            maxWidth: "100%",
          }}
          title={d.after.name}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ActIcon k={d.after.icon} size={11} color={t.accent} />
            <span style={{ fontSize: 8, fontWeight: 700, color: t.ink, fontFamily: t.fontHead }}>{d.after.at}</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 600, color: t.ink, fontFamily: t.fontHead, textAlign: "center", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80, whiteSpace: "nowrap" }}>
            {tx(d.after.name, d.after.nameHe)}
          </span>
        </div>
      )}

      {d.recurring && d.recurring.map((a, i) => (
        <div
          key={`rec-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            background: `${t.accent2}1a`,
            padding: "3px 5px",
            borderRadius: 8,
            border: `1px dashed ${t.accent2}`,
            maxWidth: "100%",
          }}
          title={a.name}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ActIcon k={a.icon} size={11} color={t.accent2} />
            <span style={{ fontSize: 8, fontWeight: 700, color: t.ink, fontFamily: t.fontHead }}>{a.at}</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 600, color: t.ink, fontFamily: t.fontHead, textAlign: "center", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80, whiteSpace: "nowrap" }}>
            {tx(a.name, a.nameHe)}
          </span>
        </div>
      ))}

      {isSat && d.activities && d.activities.map((a, i) => (
        <div
          key={`sat-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            background: `${t.accent}1a`,
            padding: "3px 5px",
            borderRadius: 8,
            border: `1px solid ${t.accent}`,
            maxWidth: "100%",
          }}
          title={a.name}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ActIcon k={a.icon} size={11} color={t.accent} />
            <span style={{ fontSize: 8, fontWeight: 700, color: t.ink, fontFamily: t.fontHead }}>{a.at || ""}</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 600, color: t.ink, fontFamily: t.fontHead, textAlign: "center", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80, whiteSpace: "nowrap" }}>
            {tx(a.name, a.nameHe)}
          </span>
        </div>
      ))}

      {isFri && d.dinner && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "2px 4px 4px",
            borderRadius: 8,
            background: `${t.fridayAccent}22`,
            border: `1.5px solid ${t.fridayAccent}`,
          }}
          title={`Friday Dinner ${d.dinner.at}`}
        >
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.6, color: t.fridayAccent, fontFamily: t.fontHead }}>
            🍽 {d.dinner.at}
          </div>
          <PersonAvatar id={d.dinner.host} size={28} halo={true} theme={{ ...t, halo: t.fridayAccent }} />
        </div>
      )}
    </div>
  );
};

export const PrintCombined = ({
  theme,
  lang = "en",
  days,
  monthLabelEn,
  monthLabelHe,
  monthYear,
  monthIndex,
  todayN,
  monthEntries,
}: Props) => {
  const t = { ...theme, paper: "#ffffff", paperDeep: "#faf6ee", ink: "#1a1410", inkSoft: "#5a4a38", cardBg: "#ffffff" };
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const week = days ?? WEEK;

  // Default month grid: April 2026 with today=27 (matches old hardcoded)
  const yr = monthYear ?? 2026;
  const mi = monthIndex ?? 3; // April default
  const labelEn = monthLabelEn ?? "April 2026";
  const labelHe = monthLabelHe ?? "אפריל 2026";
  const today = todayN ?? 27;

  const firstDow = new Date(yr, mi, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(yr, mi + 1, 0).getDate();

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
          {week.map((d, i) => <CombinedDayCard key={`${d.day}-${i}`} d={d} t={t} lang={lang} dayIdx={i} />)}
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
          📅 {tx(labelEn, labelHe)}
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
            gridTemplateRows: "repeat(6, 1fr)",
            gap: 4,
            minHeight: 0,
          }}
        >
          {Array.from({ length: 42 }).map((_, i) => {
            const n = i - firstDow + 1;
            const dow = i % 7;
            const isFri = dow === 5;
            const isToday = n === today;
            const has = n > 0 && n <= daysInMonth;
            const entry = has && monthEntries ? monthEntries[n] : undefined;
            return (
              <div
                key={i}
                style={{
                  background: !has ? t.paperDeep + "33" : isFri ? `${t.fridayAccent}15` : t.cardBg,
                  border: `1.5px solid ${isToday ? t.accent : t.cardBorder}`,
                  borderRadius: 8,
                  padding: "3px 5px",
                  fontSize: 10,
                  fontFamily: t.fontHead,
                  fontWeight: 700,
                  color: isToday ? t.accent : isFri ? t.fridayAccent : t.ink,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: isToday ? `2px 2px 0 ${t.accent}` : "none",
                  overflow: "hidden",
                }}
              >
                <span>{has ? n : ""}</span>
                {entry && (
                  <div style={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "flex-end" }}>
                    {entry.hasSchedule && <span style={{ width: 4, height: 4, borderRadius: "50%", background: t.accent }} />}
                    {entry.recurringIcons?.slice(0, 2).map((k, j) => (
                      <ActIcon key={j} k={k} size={9} color={t.accent2} />
                    ))}
                    {entry.isFridayDinner && <span style={{ fontSize: 8 }}>🍽</span>}
                  </div>
                )}
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
