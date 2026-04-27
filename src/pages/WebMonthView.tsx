import type { Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { PersonAvatar } from "../components/PersonAvatar";
import { ActIcon } from "../components/ActIcon";

interface Props {
  theme: Theme;
  lang?: Lang;
}

const btnIcon = (t: Theme) => ({
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  color: t.ink,
  fontSize: 18,
  cursor: "pointer",
  borderRadius: "50%",
  fontFamily: t.fontHead,
  fontWeight: 700,
  lineHeight: 1,
});

export const WebMonthView = ({ theme, lang = "en" }: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const monthLabels = lang === "he" ? ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"] : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const days: { n: number | null; idx: number }[] = [];
  for (let i = 0; i < 35; i++) {
    const dn = i - 2;
    days.push({ n: dn > 0 && dn <= 30 ? dn : null, idx: i });
  }
  const today = 27;
  const dotMap: Record<number, string[]> = {
    3: ["dance"], 5: ["swim"], 7: ["music"], 10: ["dance"], 12: ["swim"],
    14: ["music", "gym"], 17: ["dance"], 19: ["swim"], 21: ["music"],
    24: ["dance"], 26: ["music"], 27: ["dance"], 28: ["swim"], 30: ["gym"],
  };
  const peopleMap: Record<number, string> = { 3: "tamir", 5: "asaf", 7: "gili", 10: "asaf", 12: "tamir", 14: "yossi", 27: "asaf" };

  return (
    <div
      style={{
        ...themeStyle(t),
        background: t.paper,
        color: t.ink,
        fontFamily: t.fontBody,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr",
      }}
    >
      <header
        style={{
          padding: "16px 24px",
          borderBottom: `2px dashed ${t.cardBorder}`,
          background: t.paperDeep,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 24, letterSpacing: -0.4 }}>
            {tx("April 2026", "אפריל 2026")}
          </div>
          <div style={{ fontSize: 11, color: t.inkSoft }}>{tx("Sky's Month", "החודש של סקיי")}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={btnIcon(t)}>‹</button>
          <button style={btnIcon(t)}>›</button>
        </div>
      </header>

      <div style={{ padding: "14px 18px 6px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {monthLabels.map((l) => (
          <div key={l} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, fontFamily: t.fontHead, color: t.inkSoft, letterSpacing: 1.2 }}>
            {l}
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: "0 18px 14px",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          gap: 6,
        }}
      >
        {days.map(({ n, idx }) => {
          const dow = idx % 7;
          const isFri = dow === 5;
          const isSat = dow === 6;
          const isToday = n === today;
          if (!n) return <div key={idx} style={{ background: t.paperDeep + "66", borderRadius: 10, opacity: 0.4 }} />;
          return (
            <div
              key={idx}
              style={{
                background: isFri ? `${t.fridayAccent}15` : t.cardBg,
                borderRadius: 10,
                border: `1.5px solid ${isToday ? t.accent : t.cardBorder}`,
                boxShadow: isToday ? `0 0 0 3px ${t.halo}` : "none",
                padding: "6px 7px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: t.fontHead,
                    color: isToday ? t.accent : isFri ? t.fridayAccent : t.ink,
                  }}
                >
                  {n}
                </div>
                {isFri && <span style={{ fontSize: 9 }}>🕯</span>}
                {isSat && <span style={{ fontSize: 9 }}>✦</span>}
              </div>
              {peopleMap[n] && <PersonAvatar id={peopleMap[n]} size={22} halo={false} theme={t} />}
              {dotMap[n] && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: "auto" }}>
                  {dotMap[n].map((k, i) => (
                    <div
                      key={i}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: `${t.accent}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActIcon k={k} size={9} color={t.accent} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
