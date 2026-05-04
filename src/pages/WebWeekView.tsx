import type { Day, Lang, Theme } from "../types";
import { THEMES, themeStyle } from "../themes";
import { WEEK } from "../data/week";
import { DayCardWeb } from "../components/DayCardWeb";
import { AIStrip, type ChatMessage } from "../components/AIStrip";

interface Props {
  theme: Theme;
  lang?: Lang;
  avatarScale?: number;
  avatarHalo?: boolean;
  days?: Day[];
  todayIdx?: number;
  weekLabelEn?: string;
  weekLabelHe?: string;
  loading?: boolean;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onThisWeek?: () => void;
  onCopyLastWeek?: () => void;
  onDayClick?: (dayIdx: number) => void;
  chatMessages?: ChatMessage[];
  onChatSend?: (text: string) => Promise<void> | void;
  chatLoading?: boolean;
  onOpenPeople?: () => void;
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

const btnPill = (t: Theme): React.CSSProperties => ({
  padding: "5px 12px",
  borderRadius: 99,
  fontFamily: t.fontHead,
  fontWeight: 600,
  fontSize: 12,
  background: "transparent",
  color: t.ink,
  border: "none",
  cursor: "pointer",
});

const ThemeBadgeRow = ({ t }: { t: Theme }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: t.cardBg,
      borderRadius: 99,
      padding: "4px 8px",
      border: `1px solid ${t.cardBorder}`,
    }}
  >
    {Object.values(THEMES).slice(0, 5).map((th, i) => (
      <div
        key={i}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${th.accent}, ${th.accent2})`,
          boxShadow: th.name === t.name ? `0 0 0 2px ${t.cardBg}, 0 0 0 4px ${t.ink}` : "none",
          cursor: "pointer",
        }}
      />
    ))}
  </div>
);

export const WebWeekView = ({
  theme,
  lang = "en",
  avatarScale = 1,
  avatarHalo = true,
  days,
  todayIdx,
  weekLabelEn,
  weekLabelHe,
  loading,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onCopyLastWeek,
  onDayClick,
  chatMessages,
  onChatSend,
  chatLoading,
  onOpenPeople,
}: Props) => {
  const t = theme;
  const week = days ?? WEEK;
  const tIdx = todayIdx ?? 1;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);

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
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: `2px dashed ${t.cardBorder}`,
          background: t.paperDeep,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `conic-gradient(from 0deg, ${t.accent}, ${t.accent2}, ${t.accent})`,
            padding: 3,
            boxShadow: `0 4px 10px rgba(0,0,0,.12)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: t.cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: t.fontHead,
              fontWeight: 700,
              fontSize: 18,
              color: t.accent,
            }}
          >
            S
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 22, letterSpacing: -0.4, lineHeight: 1 }}>
            {tx("Sky's Week", "השבוע של סקיי")}
          </div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 3 }}>
            {weekLabelEn || weekLabelHe
              ? tx(weekLabelEn || "", weekLabelHe || "")
              : tx("Today is Monday · Apr 27", "היום שני · 27 אפריל")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: t.cardBg,
            borderRadius: 99,
            padding: "4px 6px",
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <button style={btnIcon(t)} onClick={onPrevWeek}>‹</button>
          <button
            style={{ ...btnPill(t), background: t.accent, color: "#fff", border: "none" }}
            onClick={onThisWeek}
          >
            {tx("This Week", "השבוע")}
          </button>
          <button style={btnIcon(t)} onClick={onNextWeek}>›</button>
        </div>

        <button
          title={tx("Copy from last week", "העתק מהשבוע שעבר")}
          onClick={onCopyLastWeek}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 99,
            border: `1.5px dashed ${t.accent}`,
            background: `${t.accent}11`,
            color: t.accent,
            fontFamily: t.fontHead,
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ↺ {tx("Copy last week", "העתק שבוע שעבר")}
        </button>

        {onOpenPeople && (
          <button
            title={tx("Manage people", "ניהול אנשים")}
            onClick={onOpenPeople}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 99,
              border: `2px solid ${t.ink}`,
              background: t.cardBg,
              color: t.ink,
              fontFamily: t.fontHead,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: `2px 2px 0 ${t.accent}`,
            }}
          >
            👤 {tx("People", "אנשים")}
          </button>
        )}

        <ThemeBadgeRow t={t} />
      </header>

      <div
        style={{
          flex: 1,
          padding: "18px 18px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {week.map((d, i) => (
          <DayCardWeb
            key={`${d.date}-${i}`}
            d={d}
            t={t}
            lang={lang}
            isToday={i === tIdx}
            dayIdx={i}
            avatarScale={avatarScale}
            avatarHalo={avatarHalo}
            onClick={onDayClick ? () => onDayClick(i) : undefined}
          />
        ))}
        {loading && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              fontSize: 11,
              color: t.inkSoft,
              opacity: 0.7,
            }}
          >
            {tx("loading…", "טוען…")}
          </div>
        )}
      </div>

      <AIStrip t={t} lang={lang} messages={chatMessages} onSend={onChatSend} isLoading={chatLoading} />
    </div>
  );
};
