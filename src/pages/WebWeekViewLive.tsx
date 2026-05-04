import { useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import type { Lang, Theme } from "../types";
import { WebWeekView } from "./WebWeekView";
import { useWeekSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { useRealtimeSchedule } from "../hooks/useRealtimeSchedule";
import { adaptWeekToDays, todayIndex } from "../lib/adapters";
import { EditDayModal } from "../components/EditDayModal";

interface Props {
  theme: Theme;
  lang?: Lang;
  avatarScale?: number;
  avatarHalo?: boolean;
}

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const DAY_NAMES = [
  { en: "Sun", he: "ראשון" },
  { en: "Mon", he: "שני" },
  { en: "Tue", he: "שלישי" },
  { en: "Wed", he: "רביעי" },
  { en: "Thu", he: "חמישי" },
  { en: "Fri", he: "שישי" },
  { en: "Sat", he: "שבת" },
];

export const WebWeekViewLive = ({ theme, lang = "en", avatarScale = 1, avatarHalo = true }: Props) => {
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const weekStart = useMemo(() => startOfWeek(anchorDate, { weekStartsOn: 0 }), [anchorDate]);

  const week = useWeekSchedule(weekStart);
  const people = usePeople();
  const activities = useActivities();
  useRealtimeSchedule();

  const days = useMemo(() => {
    if (!week.data || !people.data || !activities.data) return undefined;
    return adaptWeekToDays({
      weekStartDate: weekStart,
      weekData: week.data,
      dbPeople: people.data,
      dbActivities: activities.data,
    });
  }, [week.data, people.data, activities.data, weekStart]);

  const tIdx = useMemo(() => todayIndex(weekStart), [weekStart]);

  const today = new Date();
  const todayInWeek = tIdx >= 0;
  const dayName = format(today, "EEEE");
  const dayNameHe = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][today.getDay()];
  const labelEn = todayInWeek
    ? `Today is ${dayName} · ${format(today, "MMM d")}`
    : `Week of ${format(weekStart, "MMM d")}`;
  const labelHe = todayInWeek
    ? `היום ${dayNameHe} · ${today.getDate()} ${HE_MONTHS[today.getMonth()]}`
    : `שבוע של ${weekStart.getDate()} ${HE_MONTHS[weekStart.getMonth()]}`;

  const loading = week.isLoading || people.isLoading || activities.isLoading;
  const error = week.error || people.error || activities.error;

  const handleDayClick = (i: number) => {
    if (i === 6) return;
    if (i === 5 && week.data?.fridayIsLastOfMonth) return;
    setOpenIdx(i);
  };

  const modalCtx = useMemo(() => {
    if (openIdx === null || !week.data || !people.data || !activities.data) return null;
    const date = addDays(weekStart, openIdx);
    const dateIso = format(date, "yyyy-MM-dd");
    const current = openIdx <= 5 ? week.data.days[openIdx] : null;
    return {
      dateIso,
      dayIdx: openIdx,
      dayLabelEn: DAY_NAMES[openIdx].en,
      dayLabelHe: DAY_NAMES[openIdx].he,
      dateLabelEn: format(date, "MMM d"),
      dateLabelHe: `${date.getDate()} ${HE_MONTHS[date.getMonth()]}`,
      current,
      dbPeople: people.data,
      dbActivities: activities.data,
    };
  }, [openIdx, week.data, people.data, activities.data, weekStart]);

  if (error) {
    return (
      <div style={{ padding: 24, color: theme.ink, fontFamily: theme.fontBody }}>
        <h2 style={{ fontFamily: theme.fontHead, color: theme.accent }}>Connection error</h2>
        <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{String(error)}</pre>
      </div>
    );
  }

  return (
    <>
      <WebWeekView
        theme={theme}
        lang={lang}
        avatarScale={avatarScale}
        avatarHalo={avatarHalo}
        days={days}
        todayIdx={tIdx}
        weekLabelEn={labelEn}
        weekLabelHe={labelHe}
        loading={loading && !days}
        onPrevWeek={() => setAnchorDate((d) => addDays(d, -7))}
        onNextWeek={() => setAnchorDate((d) => addDays(d, 7))}
        onThisWeek={() => setAnchorDate(new Date())}
        onDayClick={handleDayClick}
      />
      {modalCtx && (
        <EditDayModal
          open={openIdx !== null}
          onClose={() => setOpenIdx(null)}
          dateIso={modalCtx.dateIso}
          dayIdx={modalCtx.dayIdx}
          dayLabelEn={modalCtx.dayLabelEn}
          dayLabelHe={modalCtx.dayLabelHe}
          dateLabelEn={modalCtx.dateLabelEn}
          dateLabelHe={modalCtx.dateLabelHe}
          current={modalCtx.current}
          dbPeople={modalCtx.dbPeople}
          dbActivities={modalCtx.dbActivities}
          theme={theme}
          lang={lang}
        />
      )}
    </>
  );
};
