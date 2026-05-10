import type { Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { PersonAvatar } from "../components/PersonAvatar";
import { Sticker } from "../components/Sticker";
import { ActIcon } from "../components/ActIcon";
import { Confetti } from "../components/Confetti";

export interface MonthDayEvent {
  icon: string;
  name: string;
  nameHe: string;
  at?: string;
  isRecurring?: boolean;
  withSlugs?: string[];
}

export interface MonthDayEntry {
  /** legacy fallback for the demo render */
  person?: string;
  /** legacy fallback for the demo render */
  activityIcon?: string;
  /** legacy fallback for the demo render */
  dinnerHost?: string;

  dropoffSlug?: string;
  pickupSlug?: string;
  events?: MonthDayEvent[];
  dinner?: { hostSlug: string; at?: string };
}

interface Props {
  theme: Theme;
  lang?: Lang;
  year?: number;
  monthIndex?: number; // 0-11
  todayN?: number;
  perDay?: Record<number, MonthDayEntry>;
  monthLabelEn?: string;
  monthLabelHe?: string;
  legendIcons?: { k: string; label: string }[];
  avatarScale?: number;
}

const DEFAULT_PEOPLE: Record<number, string> = {
  3: "tamir", 5: "asaf", 7: "gili", 10: "asaf", 12: "tamir", 14: "yossi",
  17: "asaf", 19: "tamir", 21: "gili", 24: "asaf", 26: "asaf", 27: "asaf", 28: "gili",
};
const DEFAULT_ACTS: Record<number, string> = {
  3: "dance", 5: "swim", 7: "music", 10: "dance", 12: "swim", 14: "gym",
  17: "dance", 19: "swim", 21: "music", 24: "dance", 26: "music", 27: "dance", 28: "swim",
};
const DEFAULT_DINNERS: Record<number, string> = { 1: "simcha", 8: "gili", 15: "simcha", 22: "yossi", 29: "simcha" };

export const PrintMonth = ({
  theme,
  lang = "en",
  year,
  monthIndex,
  todayN,
  perDay,
  monthLabelEn,
  monthLabelHe,
  legendIcons,
  avatarScale = 1,
}: Props) => {
  const t = { ...theme, paper: "#ffffff", paperDeep: "#faf6ee", ink: "#1a1410", inkSoft: "#5a4a38", cardBg: "#ffffff" };
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const sz = (n: number) => Math.round(n * avatarScale);
  const monthLabels = lang === "he" ? ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const yr = year ?? 2026;
  const mi = monthIndex ?? 3; // April default
  const labelEn = monthLabelEn ?? "April 2026";
  const labelHe = monthLabelHe ?? "אפריל 2026";
  const today = todayN ?? 27;

  const firstDow = new Date(yr, mi, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(yr, mi + 1, 0).getDate();
  const totalCells = firstDow + daysInMonth > 35 ? 42 : 35;
  const rows = totalCells / 7;

  const days: { n: number | null; idx: number }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const n = i - firstDow + 1;
    days.push({ n: n > 0 && n <= daysInMonth ? n : null, idx: i });
  }

  const entryAt = (n: number): MonthDayEntry => {
    if (perDay) return perDay[n] || {};
    return {
      person: DEFAULT_PEOPLE[n],
      activityIcon: DEFAULT_ACTS[n],
      dinnerHost: DEFAULT_DINNERS[n],
    };
  };

  return (
    <div
      style={{
        ...themeStyle(t),
        background: t.paper,
        color: t.ink,
        fontFamily: t.fontBody,
        padding: "28px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Confetti t={t} count={20} seed={3} />

      <div style={{ textAlign: "center", marginBottom: 18, position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: t.cardBg,
            padding: "10px 30px",
            borderRadius: 18,
            border: `3px solid ${t.ink}`,
            boxShadow: `5px 5px 0 ${t.accent}`,
          }}
        >
          <Sticker char="📅" color={t.accent} size={36} />
          <div>
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 32, letterSpacing: -1, lineHeight: 1, color: t.ink }}>
              {tx(labelEn, labelHe)}
            </div>
            <div style={{ fontSize: 11, color: t.inkSoft, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 3 }}>
              {tx("Sky's Big Month", "החודש הגדול של סקיי")}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6, position: "relative", zIndex: 2 }}>
        {monthLabels.map((l, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: t.fontHead,
              letterSpacing: 1.2,
              color: i === 5 ? t.fridayAccent : t.ink,
              padding: "6px",
              background: t.paperDeep,
              borderRadius: 8,
              border: `1.5px solid ${t.cardBorder}`,
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
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 6,
          position: "relative",
          zIndex: 2,
          minHeight: 0,
        }}
      >
        {days.map(({ n, idx }) => {
          const dow = idx % 7;
          const isFri = dow === 5;
          const isToday = n === today;
          if (!n)
            return <div key={idx} style={{ background: t.paperDeep + "55", borderRadius: 10, opacity: 0.4, border: `1.5px dashed ${t.cardBorder}` }} />;
          return (
            <div
              key={idx}
              style={{
                background: isFri ? `linear-gradient(135deg, ${t.fridayAccent}22, ${t.cardBg})` : t.cardBg,
                border: `2.5px solid ${isToday ? t.accent : t.ink}`,
                borderRadius: 12,
                padding: "4px 6px",
                display: "flex",
                flexDirection: "column",
                boxShadow: isToday ? `3px 3px 0 ${t.accent}` : `2px 2px 0 ${t.ink}33`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div
                  style={{
                    fontFamily: t.fontHead,
                    fontWeight: 700,
                    fontSize: 18,
                    color: isToday ? t.accent : isFri ? t.fridayAccent : t.ink,
                    background: isToday ? t.halo : "transparent",
                    borderRadius: "50%",
                    width: isToday ? 28 : "auto",
                    height: isToday ? 28 : "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                {isFri && <span style={{ fontSize: 14 }}>🕯</span>}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: 3, alignItems: "stretch", marginTop: 3 }}>
                {(() => {
                  const e = entryAt(n);
                  // People row: dropoff + pickup compact
                  const dropSlug = e.dropoffSlug;
                  const pickSlug = e.pickupSlug;
                  const legacyPerson = !e.dropoffSlug && !e.pickupSlug && !e.events && !e.dinner ? e.person : undefined;
                  const events = e.events || (e.activityIcon ? [{ icon: e.activityIcon, name: "", nameHe: "" }] : []);
                  const dinner = e.dinner || (e.dinnerHost ? { hostSlug: e.dinnerHost } : undefined);
                  return (
                    <>
                      {(dropSlug || pickSlug || legacyPerson) && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 4, alignItems: "center" }}>
                          {dropSlug && (
                            <div title="Drop-off" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                              <span style={{ fontSize: 7, color: t.inkSoft, fontWeight: 700, fontFamily: t.fontHead, letterSpacing: 0.4 }}>↓</span>
                              <PersonAvatar id={dropSlug} size={sz(22)} halo={false} theme={t} />
                            </div>
                          )}
                          {pickSlug && (
                            <div title="Pick-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                              <span style={{ fontSize: 7, color: t.inkSoft, fontWeight: 700, fontFamily: t.fontHead, letterSpacing: 0.4 }}>↑</span>
                              <PersonAvatar id={pickSlug} size={sz(22)} halo={false} theme={t} />
                            </div>
                          )}
                          {legacyPerson && <PersonAvatar id={legacyPerson} size={sz(22)} halo={false} theme={t} />}
                        </div>
                      )}
                      {events.map((ev, i) => (
                        <div
                          key={i}
                          title={ev.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 5px",
                            background: ev.isRecurring ? `${t.accent2}1a` : `${t.accent}1a`,
                            border: `1px ${ev.isRecurring ? "dashed" : "solid"} ${ev.isRecurring ? t.accent2 : t.accent}`,
                            borderRadius: 8,
                            minWidth: 0,
                          }}
                        >
                          <ActIcon k={ev.icon} size={11} color={ev.isRecurring ? t.accent2 : t.accent} />
                          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.05 }}>
                            <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: t.fontHead, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tx(ev.name || "", ev.nameHe || ev.name || "")}
                            </div>
                            {ev.at && (
                              <div style={{ fontSize: 7.5, color: t.inkSoft, fontWeight: 600, fontFamily: t.fontHead }}>{ev.at}</div>
                            )}
                          </div>
                          {ev.withSlugs && ev.withSlugs.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center" }}>
                              {ev.withSlugs.slice(0, 3).map((slug, j) => (
                                <div key={slug + j} style={{ marginInlineStart: j === 0 ? 0 : -6 }}>
                                  <PersonAvatar id={slug} size={sz(16)} halo={false} theme={t} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {dinner && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 5px",
                            background: `${t.fridayAccent}1a`,
                            border: `1px solid ${t.fridayAccent}`,
                            borderRadius: 8,
                          }}
                          title="Friday dinner"
                        >
                          <PersonAvatar id={dinner.hostSlug} size={sz(20)} halo={false} theme={t} />
                          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.05 }}>
                            <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: t.fontHead, color: t.fridayAccent }}>
                              🍽 {tx("Dinner", "ארוחה")}
                            </div>
                            {dinner.at && (
                              <div style={{ fontSize: 7.5, color: t.inkSoft, fontWeight: 600, fontFamily: t.fontHead }}>{dinner.at}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        {(legendIcons || [
          { k: "dance", label: tx("Hip hop", "היפ הופ") },
          { k: "swim", label: tx("Swim", "שחייה") },
          { k: "music", label: tx("Music", "מוזיקה") },
          { k: "gym", label: tx("Gym", "התעמלות") },
        ]).map(({ k, label }) => (
          <div key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, fontFamily: t.fontHead }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: `${t.accent}33`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActIcon k={k} size={11} color={t.accent} />
            </span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
