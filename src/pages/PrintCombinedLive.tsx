import { useMemo, useState } from "react";
import { startOfWeek, addDays, format } from "date-fns";
import type { Lang, Theme } from "../types";
import { PrintCombined } from "./PrintCombined";
import { PrintNav } from "../components/PrintNav";
import { useWeekSchedule, useMonthSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { adaptWeekToDays } from "../lib/adapters";
import { activityIconKey } from "../lib/activityIcon";

interface Props {
  theme: Theme;
  lang?: Lang;
  avatarScale?: number;
}

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PrintCombinedLive = ({ theme, lang = "en", avatarScale = 1 }: Props) => {
  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const weekStart = useMemo(() => startOfWeek(anchor, { weekStartsOn: 0 }), [anchor]);
  const monthYear = anchor.getFullYear();
  const monthIndex = anchor.getMonth();

  const week = useWeekSchedule(weekStart);
  const people = usePeople();
  const activities = useActivities();
  const month = useMonthSchedule(monthYear, monthIndex + 1);

  const days = useMemo(() => {
    if (!week.data || !people.data || !activities.data) return undefined;
    return adaptWeekToDays({
      weekStartDate: weekStart,
      weekData: week.data,
      dbPeople: people.data,
      dbActivities: activities.data,
    });
  }, [week.data, people.data, activities.data, weekStart]);

  const monthEntries = useMemo(() => {
    if (!month.data || !activities.data) return {} as Record<number, { hasSchedule?: boolean; recurringIcons?: string[]; isFridayDinner?: boolean }>;
    const out: Record<number, { hasSchedule?: boolean; recurringIcons?: string[]; isFridayDinner?: boolean }> = {};
    const yr = monthYear;
    const mo = monthIndex;
    const lastDay = new Date(yr, mo + 1, 0).getDate();

    for (const ds of month.data.daySchedules) {
      const n = parseInt(ds.date.slice(8, 10), 10);
      if (!out[n]) out[n] = {};
      if (
        ds.dropoff_person_id ||
        ds.pickup_person_id ||
        ds.bedtime_person_id ||
        ds.after_gan_activity_id ||
        ds.is_no_gan ||
        ds.gan_activity ||
        ds.notes
      ) {
        out[n].hasSchedule = true;
      }
      if (ds.family_dinner_person_id) {
        out[n].isFridayDinner = true;
      }
    }
    for (const ss of month.data.saturdaySchedules) {
      const n = parseInt(ss.date.slice(8, 10), 10);
      if (!out[n]) out[n] = {};
      if (ss.activities && ss.activities.length > 0) out[n].hasSchedule = true;
      if (ss.family_dinner_person_id) out[n].isFridayDinner = true;
    }

    // Apply recurring activities to every weekday matching
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let day = 1; day <= lastDay; day++) {
      const dow = new Date(yr, mo, day).getDay();
      const dayName = dayNames[dow];
      const recurring = activities.data.filter(
        (a) => a.is_recurring && a.recurrence_day?.toLowerCase() === dayName
      );
      if (recurring.length) {
        if (!out[day]) out[day] = {};
        out[day].recurringIcons = recurring.map((a) => a.icon || activityIconKey(a.name));
      }
    }
    return out;
  }, [month.data, activities.data, monthYear, monthIndex]);

  const realToday = new Date();
  const todayN =
    realToday.getFullYear() === monthYear && realToday.getMonth() === monthIndex
      ? realToday.getDate()
      : -1;

  const weekEnd = addDays(weekStart, 6);
  const navLabel =
    lang === "he"
      ? `${weekStart.getDate()} ${HE_MONTHS[weekStart.getMonth()]} — ${weekEnd.getDate()} ${HE_MONTHS[weekEnd.getMonth()]}`
      : `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d")}`;

  return (
    <>
      <PrintNav
        lang={lang}
        label={navLabel}
        onPrev={() => setAnchor((a) => addDays(a, -7))}
        onNext={() => setAnchor((a) => addDays(a, 7))}
        onToday={() => setAnchor(new Date())}
      />
      <PrintCombined
        theme={theme}
        lang={lang}
        days={days}
        monthLabelEn={`${EN_MONTHS[monthIndex]} ${monthYear}`}
        monthLabelHe={`${HE_MONTHS[monthIndex]} ${monthYear}`}
        monthYear={monthYear}
        monthIndex={monthIndex}
        todayN={todayN}
        monthEntries={monthEntries}
        avatarScale={avatarScale}
      />
    </>
  );
};
