import { useState } from "react";
import type { Lang } from "./types";
import { THEMES } from "./themes";
import { WebWeekView } from "./pages/WebWeekView";
import { WebWeekViewLive } from "./pages/WebWeekViewLive";
import { WebMonthView } from "./pages/WebMonthView";
import { WebMonthViewLive } from "./pages/WebMonthViewLive";
import { PrintWeek } from "./pages/PrintWeek";
import { PrintMonth } from "./pages/PrintMonth";
import { PrintCombined } from "./pages/PrintCombined";

type ViewKey = "week" | "month" | "print-week" | "print-month" | "print-combined";

const VIEWS: { key: ViewKey; label: string; labelHe: string }[] = [
  { key: "week", label: "Week", labelHe: "שבוע" },
  { key: "month", label: "Month", labelHe: "חודש" },
  { key: "print-week", label: "Print · Week", labelHe: "הדפסה · שבוע" },
  { key: "print-month", label: "Print · Month", labelHe: "הדפסה · חודש" },
  { key: "print-combined", label: "Print · Combined", labelHe: "הדפסה · משולב" },
];

const THEME_KEYS = Object.keys(THEMES);

export default function App() {
  const [themeKey, setThemeKey] = useState<string>("pup");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<ViewKey>("week");
  const [avatarSize, setAvatarSize] = useState(56);
  const [avatarHalo, setAvatarHalo] = useState(true);
  const [live, setLive] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.has("live")) return params.get("live") !== "0";
    return localStorage.getItem("sky:live") === "1";
  });

  const setLivePersisted = (v: boolean) => {
    setLive(v);
    if (typeof window !== "undefined") {
      localStorage.setItem("sky:live", v ? "1" : "0");
    }
  };

  const theme = THEMES[themeKey];
  const avatarScale = avatarSize / 56;

  const renderView = () => {
    switch (view) {
      case "week":
        return live ? (
          <WebWeekViewLive theme={theme} lang={lang} avatarScale={avatarScale} avatarHalo={avatarHalo} />
        ) : (
          <WebWeekView theme={theme} lang={lang} avatarScale={avatarScale} avatarHalo={avatarHalo} />
        );
      case "month":
        return live ? (
          <WebMonthViewLive theme={theme} lang={lang} />
        ) : (
          <WebMonthView theme={theme} lang={lang} />
        );
      case "print-week":
        return <PrintWeek theme={theme} lang={lang} avatarScale={avatarScale} avatarHalo={avatarHalo} />;
      case "print-month":
        return <PrintMonth theme={theme} lang={lang} />;
      case "print-combined":
        return <PrintCombined theme={theme} lang={lang} />;
    }
  };

  const isPrintView = view.startsWith("print-");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#1a1410" }}>
      <Toolbar
        themeKey={themeKey}
        onThemeChange={setThemeKey}
        lang={lang}
        onLangChange={setLang}
        view={view}
        onViewChange={setView}
        avatarSize={avatarSize}
        onAvatarSizeChange={setAvatarSize}
        avatarHalo={avatarHalo}
        onAvatarHaloChange={setAvatarHalo}
        live={live}
        onLiveChange={setLivePersisted}
      />
      <main
        style={{
          flex: 1,
          minHeight: 0,
          padding: 16,
          background: isPrintView ? "#2c2828" : "transparent",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isPrintView ? 1200 : 1400,
            aspectRatio: isPrintView ? "1.414 / 1" : undefined,
            height: isPrintView ? "auto" : "100%",
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,.4)",
          }}
        >
          {renderView()}
        </div>
      </main>
    </div>
  );
}

interface ToolbarProps {
  themeKey: string;
  onThemeChange: (k: string) => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  view: ViewKey;
  onViewChange: (v: ViewKey) => void;
  avatarSize: number;
  onAvatarSizeChange: (n: number) => void;
  avatarHalo: boolean;
  onAvatarHaloChange: (b: boolean) => void;
  live: boolean;
  onLiveChange: (b: boolean) => void;
}

function Toolbar({
  themeKey,
  onThemeChange,
  lang,
  onLangChange,
  view,
  onViewChange,
  avatarSize,
  onAvatarSizeChange,
  avatarHalo,
  onAvatarHaloChange,
  live,
  onLiveChange,
}: ToolbarProps) {
  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    color: "rgba(255,255,255,.5)",
    textTransform: "uppercase",
    marginRight: 8,
  };
  return (
    <header
      className="no-print"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: "#0f0c0a",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, letterSpacing: -0.3, fontSize: 14 }}>Sky's Calendar — v2 preview</div>

      <span style={labelStyle}>View</span>
      <select
        value={view}
        onChange={(e) => onViewChange(e.target.value as ViewKey)}
        style={selStyle}
      >
        {VIEWS.map((v) => (
          <option key={v.key} value={v.key}>
            {lang === "he" ? v.labelHe : v.label}
          </option>
        ))}
      </select>

      <span style={labelStyle}>Theme</span>
      <div style={{ display: "flex", gap: 4 }}>
        {THEME_KEYS.map((k) => {
          const t = THEMES[k];
          const sel = k === themeKey;
          return (
            <button
              key={k}
              onClick={() => onThemeChange(k)}
              title={t.name}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                borderRadius: "50%",
                border: sel ? "2px solid #fff" : "1px solid rgba(255,255,255,.2)",
                background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
                cursor: "pointer",
                outline: sel ? "1px solid #000" : "none",
              }}
            />
          );
        })}
      </div>

      <span style={labelStyle}>Lang</span>
      <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,.08)", borderRadius: 6, padding: 2 }}>
        {(["en", "he"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            style={{
              padding: "4px 10px",
              border: "none",
              background: l === lang ? "rgba(255,255,255,.18)" : "transparent",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <span style={labelStyle}>Avatar</span>
      <input
        type="range"
        min={28}
        max={84}
        value={avatarSize}
        onChange={(e) => onAvatarSizeChange(Number(e.target.value))}
        style={{ width: 100 }}
      />
      <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", minWidth: 32 }}>{avatarSize}px</span>

      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.7)" }}>
        <input
          type="checkbox"
          checked={avatarHalo}
          onChange={(e) => onAvatarHaloChange(e.target.checked)}
        />
        Halo
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: live ? "#7ef0a0" : "rgba(255,255,255,.7)",
          fontWeight: live ? 700 : 400,
          padding: "3px 8px",
          borderRadius: 6,
          background: live ? "rgba(126,240,160,.12)" : "transparent",
          border: live ? "1px solid rgba(126,240,160,.4)" : "1px solid transparent",
        }}
        title="Use real Supabase data instead of sample data"
      >
        <input
          type="checkbox"
          checked={live}
          onChange={(e) => onLiveChange(e.target.checked)}
        />
        LIVE
      </label>

      <div style={{ flex: 1 }} />
      <button
        onClick={() => window.print()}
        style={{
          padding: "5px 12px",
          background: "rgba(255,255,255,.12)",
          border: "1px solid rgba(255,255,255,.18)",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Print
      </button>
    </header>
  );
}

const selStyle: React.CSSProperties = {
  padding: "5px 8px",
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.18)",
  color: "#fff",
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "system-ui, sans-serif",
  cursor: "pointer",
};
