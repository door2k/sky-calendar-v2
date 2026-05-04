import { useMemo } from "react";
import { startOfWeek } from "date-fns";
import type { Lang, Theme } from "../types";
import { PrintCombined } from "./PrintCombined";
import { useWeekSchedule, useMonthSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { adaptWeekToDays } from "../lib/adapters";
import { activityIconKey } from "../lib/activityIcon";

interface Props {
  theme: Theme;
  lang?: Lang;
}

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PrintCombinedLive = ({ theme, lang = "en" }: Props) => {
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 0 }), [today]);

  const week = useWeekSchedule(weekStart);
  const people = usePeople();
  const activities = useActivities();
  const month = useMonthSchedule(today.getFullYear(), today.getMonth() + 1);

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
    const yr = today.getFullYear();
    const mo = today.getMonth();
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
  }, [month.data, activities.data, today]);

  return (
    <PrintCombined
      theme={theme}
      lang={lang}
      days={days}
      monthLabelEn={`${EN_MONTHS[today.getMonth()]} ${today.getFullYear()}`}
      monthLabelHe={`${HE_MONTHS[today.getMonth()]} ${today.getFullYear()}`}
      monthYear={today.getFullYear()}
      monthIndex={today.getMonth()}
      todayN={today.getDate()}
      monthEntries={monthEntries}
    />
  );
};
