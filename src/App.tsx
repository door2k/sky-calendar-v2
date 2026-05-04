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

function readDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has("demo")) return params.get("demo") !== "0";
  if (params.has("live")) return params.get("live") === "0";
  return localStorage.getItem("sky:demo") === "1";
}

export default function App() {
  const [themeKey, setThemeKey] = useState<string>("pup");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<ViewKey>("week");
  const [avatarSize, setAvatarSize] = useState(56);
  const [avatarHalo, setAvatarHalo] = useState(true);
  const [demo, setDemo] = useState<boolean>(readDemoMode);
  const [showDevControls, setShowDevControls] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("dev");
  });

  const setDemoPersisted = (v: boolean) => {
    setDemo(v);
    if (typeof window !== "undefined") {
      localStorage.setItem("sky:demo", v ? "1" : "0");
    }
  };

  const theme = THEMES[themeKey];
  const avatarScale = avatarSize / 56;
  const live = !demo;

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
        demo={demo}
        onDemoChange={setDemoPersisted}
        showDevControls={showDevControls}
        onToggleDevControls={() => setShowDevControls((v) => !v)}
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
  demo: boolean;
  onDemoChange: (b: boolean) => void;
  showDevControls: boolean;
  onToggleDevControls: () => void;
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
  demo,
  onDemoChange,
  showDevControls,
  onToggleDevControls,
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
      <div style={{ fontWeight: 700, letterSpacing: -0.3, fontSize: 14 }}>Sky's Calendar</div>

      {demo && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            padding: "3px 8px",
            borderRadius: 99,
            background: "rgba(245,180,80,.18)",
            color: "#f5b450",
            border: "1px solid rgba(245,180,80,.4)",
          }}
          title="Showing sample/demo data instead of the real schedule"
        >
          DEMO DATA
        </span>
      )}

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

      {showDevControls && (
        <>
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

          <label
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.7)" }}
          >
            <input type="checkbox" checked={avatarHalo} onChange={(e) => onAvatarHaloChange(e.target.checked)} />
            Halo
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: demo ? "#f5b450" : "rgba(255,255,255,.7)",
              fontWeight: demo ? 700 : 400,
              padding: "3px 8px",
              borderRadius: 6,
              background: demo ? "rgba(245,180,80,.12)" : "transparent",
              border: demo ? "1px solid rgba(245,180,80,.4)" : "1px solid transparent",
            }}
            title="Show sample/demo data instead of real schedule"
          >
            <input type="checkbox" checked={demo} onChange={(e) => onDemoChange(e.target.checked)} />
            DEMO
          </label>
        </>
      )}

      <div style={{ flex: 1 }} />
      <button
        onClick={onToggleDevControls}
        title="Toggle dev controls"
        style={{
          padding: "5px 10px",
          background: showDevControls ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.12)",
          color: "rgba(255,255,255,.7)",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        ⚙
      </button>
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
