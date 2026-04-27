import type { Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { PersonAvatar } from "../components/PersonAvatar";
import { Sticker } from "../components/Sticker";
import { ActIcon } from "../components/ActIcon";
import { Confetti } from "../components/Confetti";

interface Props {
  theme: Theme;
  lang?: Lang;
}

export const PrintMonth = ({ theme, lang = "en" }: Props) => {
  const t = { ...theme, paper: "#ffffff", paperDeep: "#faf6ee", ink: "#1a1410", inkSoft: "#5a4a38", cardBg: "#ffffff" };
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const monthLabels = lang === "he" ? ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days: { n: number | null; idx: number }[] = [];
  for (let i = 0; i < 35; i++) {
    const dn = i - 2;
    days.push({ n: dn > 0 && dn <= 30 ? dn : null, idx: i });
  }
  const today = 27;
  const peopleMap: Record<number, string> = {
    3: "tamir", 5: "asaf", 7: "gili", 10: "asaf", 12: "tamir", 14: "yossi",
    17: "asaf", 19: "tamir", 21: "gili", 24: "asaf", 26: "asaf", 27: "asaf", 28: "gili",
  };
  const actMap: Record<number, string> = {
    3: "dance", 5: "swim", 7: "music", 10: "dance", 12: "swim", 14: "gym",
    17: "dance", 19: "swim", 21: "music", 24: "dance", 26: "music", 27: "dance", 28: "swim",
  };
  const dinnerMap: Record<number, string> = { 1: "simcha", 8: "gili", 15: "simcha", 22: "yossi", 29: "simcha" };

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
              {tx("April 2026", "אפריל 2026")}
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
          gridTemplateRows: "repeat(5, 1fr)",
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
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 3, alignItems: "center" }}>
                {peopleMap[n] && <PersonAvatar id={peopleMap[n]} size={26} halo={false} theme={t} />}
                {dinnerMap[n] && (
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      fontFamily: t.fontHead,
                      color: t.fridayAccent,
                      background: `${t.fridayAccent}22`,
                      padding: "1px 5px",
                      borderRadius: 6,
                      letterSpacing: 0.4,
                    }}
                  >
                    🍽 {tx("dinner", "ארוחה")}
                  </div>
                )}
                {actMap[n] && (
                  <div
                    style={{
                      display: "inline-flex",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: `${t.accent}33`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActIcon k={actMap[n]} size={11} color={t.accent} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        {[
          ["dance", tx("Hip hop", "היפ הופ")],
          ["swim", tx("Swim", "שחייה")],
          ["music", tx("Music", "מוזיקה")],
          ["gym", tx("Gym", "התעמלות")],
        ].map(([k, l]) => (
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
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};
