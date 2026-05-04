import { useMemo } from "react";
import type { Lang, Theme } from "../types";
import { PrintMonth, type MonthDayEntry } from "./PrintMonth";
import { useMonthSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { buildPersonSlugMap } from "../lib/adapters";
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

const DAY_FULL = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const PrintMonthLive = ({ theme, lang = "en" }: Props) => {
  const today = useMemo(() => new Date(), []);
  const yr = today.getFullYear();
  const mi = today.getMonth();

  const month = useMonthSchedule(yr, mi + 1);
  const people = usePeople();
  const activities = useActivities();

  const slugMap = useMemo(
    () => (people.data ? buildPersonSlugMap(people.data) : new Map<string, string>()),
    [people.data]
  );

  const perDay = useMemo(() => {
    if (!month.data || !activities.data) return undefined;
    const out: Record<number, MonthDayEntry> = {};
    const lastDay = new Date(yr, mi + 1, 0).getDate();

    for (const ds of month.data.daySchedules) {
      const n = parseInt(ds.date.slice(8, 10), 10);
      const entry: MonthDayEntry = out[n] || {};
      const personId = ds.pickup_person_id || ds.dropoff_person_id;
      if (personId) entry.person = slugMap.get(personId);
      if (ds.after_gan_activity_id) {
        const a = activities.data.find((x) => x.id === ds.after_gan_activity_id);
        if (a) entry.activityIcon = a.icon || activityIconKey(a.name);
      }
      if (ds.family_dinner_person_id) {
        entry.dinnerHost = slugMap.get(ds.family_dinner_person_id);
      }
      out[n] = entry;
    }

    for (const ss of month.data.saturdaySchedules) {
      const n = parseInt(ss.date.slice(8, 10), 10);
      const entry: MonthDayEntry = out[n] || {};
      if (ss.activities && ss.activities[0]) {
        const a = activities.data.find((x) => x.id === ss.activities[0].activity_id);
        if (a) entry.activityIcon = a.icon || activityIconKey(a.name);
      }
      if (ss.family_dinner_person_id) {
        entry.dinnerHost = slugMap.get(ss.family_dinner_person_id);
      }
      out[n] = entry;
    }

    // Apply recurring activities to weekdays that don't already have an icon.
    for (let day = 1; day <= lastDay; day++) {
      const dow = new Date(yr, mi, day).getDay();
      const dayName = DAY_FULL[dow];
      const recurring = activities.data.filter(
        (a) => a.is_recurring && a.recurrence_day?.toLowerCase() === dayName
      );
      if (recurring.length) {
        const entry: MonthDayEntry = out[day] || {};
        if (!entry.activityIcon) {
          entry.activityIcon = recurring[0].icon || activityIconKey(recurring[0].name);
        }
        out[day] = entry;
      }
    }
    return out;
  }, [month.data, activities.data, slugMap, yr, mi]);

  // Build a legend from the activity icons that actually appear this month.
  const legendIcons = useMemo(() => {
    if (!perDay || !activities.data) return undefined;
    const used = new Set<string>();
    for (const e of Object.values(perDay)) {
      if (e.activityIcon) used.add(e.activityIcon);
    }
    if (used.size === 0) return undefined;
    const map = new Map<string, { k: string; label: string }>();
    for (const a of activities.data) {
      const k = a.icon || activityIconKey(a.name);
      if (used.has(k) && !map.has(k)) {
        map.set(k, { k, label: lang === "he" ? a.name_he || a.name : a.name });
      }
    }
    return Array.from(map.values());
  }, [perDay, activities.data, lang]);

  return (
    <PrintMonth
      theme={theme}
      lang={lang}
      year={yr}
      monthIndex={mi}
      todayN={today.getDate()}
      perDay={perDay}
      monthLabelEn={`${EN_MONTHS[mi]} ${yr}`}
      monthLabelHe={`${HE_MONTHS[mi]} ${yr}`}
      legendIcons={legendIcons}
    />
  );
};
