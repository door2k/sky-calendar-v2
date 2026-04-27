import type { Day, Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { WEEK } from "../data/week";
import { PersonAvatar } from "../components/PersonAvatar";
import { Sticker } from "../components/Sticker";
import { ActIcon } from "../components/ActIcon";
import { Confetti } from "../components/Confetti";
import type { ReactNode } from "react";

interface Props {
  theme: Theme;
  lang?: Lang;
  avatarScale?: number;
  avatarHalo?: boolean;
}

const printSafeTheme = (theme: Theme): Theme => ({
  ...theme,
  paper: "#ffffff",
  paperDeep: "#faf6ee",
  ink: "#1a1410",
  inkSoft: "#5a4a38",
  cardBg: "#ffffff",
  cardBorder: theme.cardBorder.match(/^#[0-9a-f]{6}/i) ? theme.cardBorder : "#d8c8a8",
});

const PrintTime = ({ t, time }: { t: Theme; time: string }) => (
  <div
    style={{
      background: t.cardBg,
      border: `2px solid ${t.ink}`,
      borderRadius: 99,
      padding: "2px 10px",
      fontFamily: t.fontHead,
      fontWeight: 700,
      fontSize: 13,
      color: t.ink,
      boxShadow: `2px 2px 0 ${t.accent}`,
    }}
  >
    {time}
  </div>
);

const PrintActivity = ({ t, a, lang }: { t: Theme; a: Day["after"] | NonNullable<Day["activities"]>[number]; lang: Lang }) => {
  if (!a) return null;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  return (
    <div
      style={{
        background: t.cardBg,
        border: `2.5px solid ${t.accent}`,
        borderRadius: 14,
        padding: "6px 10px 6px 6px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        boxShadow: `3px 3px 0 ${t.ink}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${t.ink}`,
          flexShrink: 0,
        }}
      >
        <ActIcon k={a.icon} size={18} color="#fff" />
      </div>
      <div style={{ lineHeight: 1.15, minWidth: 0 }}>
        <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 13, color: t.ink }}>{tx(a.name, a.nameHe)}</div>
        <div style={{ fontSize: 9.5, color: t.inkSoft, fontWeight: 600 }}>{a.at} · {a.where}</div>
      </div>
    </div>
  );
};

const PrintSlot = ({ t, label, children, flex }: { t: Theme; label: string; flex?: boolean; children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", flex: flex ? 1 : "none" }}>
    <div style={{ fontSize: 8, fontWeight: 700, fontFamily: t.fontHead, letterSpacing: 1.2, color: t.inkSoft }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{children}</div>
  </div>
);

const PrintDayRow = ({ d, t, lang, dayIdx, avatarScale = 1, avatarHalo = true }: { d: Day; t: Theme; lang: Lang; dayIdx: number; avatarScale: number; avatarHalo: boolean }) => {
  const sz = (px: number) => Math.round(px * avatarScale);
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const tint = t.dayTints[dayIdx];
  const isFri = !!d.isFriday;
  const isSat = !!d.isSaturday;
  const isNoGan = !!d.noGan;

  return (
    <div
      style={{
        background: d.noGan
          ? `linear-gradient(${lang === "he" ? "-90deg" : "90deg"}, ${t.fridayAccent}33 0%, ${tint} 50%, ${t.cardBg} 100%)`
          : `linear-gradient(${lang === "he" ? "-90deg" : "90deg"}, ${tint} 0%, ${t.cardBg} 30%)`,
        borderRadius: d.noGan ? "6px 24px 6px 24px" : 12,
        border: `${d.noGan ? 3.5 : 2}px solid ${d.noGan ? t.fridayAccent : t.ink}`,
        outline: d.noGan ? `2px dashed ${t.fridayAccent}88` : "none",
        outlineOffset: d.noGan ? 3 : 0,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: `3px 3px 0 ${isNoGan ? t.fridayAccent : t.accent}88`,
        position: "relative",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          width: 64,
          flexShrink: 0,
          textAlign: "center",
          background: t.cardBg,
          border: `2.5px solid ${isNoGan ? t.fridayAccent : t.ink}`,
          borderRadius: 14,
          padding: "6px 4px",
          fontFamily: t.fontHead,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: isNoGan ? t.fridayAccent : t.ink, textTransform: "uppercase" }}>
          {tx(d.day, d.dayHe)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, lineHeight: 1 }}>{d.date.split(" ")[1] || d.date}</div>
        {isNoGan && (
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.8, color: t.fridayAccent, marginTop: 2 }}>
            {tx("NO GAN", "בלי גן")}
          </div>
        )}
      </div>

      {!isSat && d.dropoff && (
        <PrintSlot t={t} label={tx("DROP", "מסירה")}>
          <PersonAvatar id={d.dropoff.by} size={sz(42)} halo={avatarHalo} theme={t} label lang={lang} />
          <PrintTime t={t} time={d.dropoff.at} />
        </PrintSlot>
      )}

      {!isSat && d.gan && !d.noGan && (
        <PrintSlot t={t} label={tx("AT GAN", "בגן")} flex>
          <div
            style={{
              background: t.paper,
              border: `2px dashed ${t.ink}`,
              borderRadius: 10,
              padding: "6px 10px",
              fontFamily: t.fontHead,
              fontWeight: 700,
              fontSize: 14,
              color: t.ink,
              lineHeight: 1.2,
            }}
          >
            {tx(d.gan.label, d.gan.labelHe)}
          </div>
        </PrintSlot>
      )}

      {d.after && (
        <PrintSlot t={t} label={tx("ACTIVITY", "פעילות")} flex>
          <PrintActivity t={t} a={d.after} lang={lang} />
        </PrintSlot>
      )}

      {isSat && d.activities && (
        <PrintSlot t={t} label={tx("SATURDAY FUN", "סופ״ש")} flex>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {d.activities.map((a, i) => <PrintActivity key={i} t={t} a={a} lang={lang} />)}
          </div>
        </PrintSlot>
      )}

      {!isSat && d.pickup && (
        <PrintSlot t={t} label={tx("PICK", "איסוף")}>
          <PersonAvatar id={d.pickup.by} size={sz(42)} halo={avatarHalo} theme={t} label lang={lang} />
          <PrintTime t={t} time={d.pickup.at} />
        </PrintSlot>
      )}

      {isFri && d.dinner && (
        <PrintSlot t={t} label={tx("FRI DINNER", "ארוחת שישי")}>
          <div
            style={{
              background: t.fridayAccent,
              color: "#fff",
              borderRadius: 14,
              padding: "4px 8px 6px",
              textAlign: "center",
              border: `2px solid ${t.ink}`,
              boxShadow: `2px 2px 0 ${t.ink}`,
            }}
          >
            <PersonAvatar id={d.dinner.host} size={sz(42)} halo={true} theme={{ ...t, halo: "#fff" }} label lang={lang} />
            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: t.fontHead, marginTop: 2 }}>{d.dinner.at}</div>
          </div>
        </PrintSlot>
      )}

      <PrintSlot t={t} label="🌙">
        <PersonAvatar id={d.bedtime.by} size={sz(36)} halo={false} theme={t} label lang={lang} />
      </PrintSlot>

      <Sticker
        char={["★", "♥", "✦", t.sticker][dayIdx % 4]}
        color={isFri ? t.fridayAccent : dayIdx % 2 ? t.accent : t.accent2}
        size={26}
        rotate={(dayIdx * 37) % 40 - 20}
        style={{ position: "absolute", top: -10, [lang === "he" ? "left" : "right"]: -8 }}
      />
    </div>
  );
};

export const PrintWeek = ({ theme, lang = "en", avatarScale = 1, avatarHalo = true }: Props) => {
  const t = printSafeTheme(theme);
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  return (
    <div
      style={{
        ...themeStyle(t),
        background: t.paper,
        color: t.ink,
        fontFamily: t.fontBody,
        padding: "28px 28px 24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Confetti t={t} count={14} seed={1} />

      <div style={{ textAlign: "center", marginBottom: 18, position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: t.cardBg,
            padding: "12px 32px",
            borderRadius: 99,
            border: `3px solid ${t.ink}`,
            boxShadow: `5px 5px 0 ${t.accent}`,
          }}
        >
          <span style={{ fontSize: 30 }}>{t.sticker}</span>
          <div>
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 30, letterSpacing: -1, lineHeight: 1, color: t.ink }}>
              {tx("Sky's Week!", "השבוע של סקיי!")}
            </div>
            <div style={{ fontSize: 12, color: t.inkSoft, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 3 }}>
              {tx("April 26 — May 2", "26 אפריל — 2 מאי")}
            </div>
          </div>
          <span style={{ fontSize: 30, transform: "scaleX(-1)", display: "inline-block" }}>{t.sticker}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 2, minHeight: 0 }}>
        {WEEK.map((d, i) => (
          <PrintDayRow key={d.day} d={d} t={t} lang={lang} dayIdx={i} avatarScale={avatarScale} avatarHalo={avatarHalo} />
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: t.inkSoft,
          marginTop: 12,
          fontStyle: "italic",
          position: "relative",
          zIndex: 2,
        }}
      >
        ✿ {tx("Made with love for Sky", "עם הרבה אהבה לסקיי")} ✿
      </div>
    </div>
  );
};
