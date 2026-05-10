import { useMemo } from "react";
import type { Lang, Theme } from "../types";
import { PrintMonth, type MonthDayEntry, type MonthDayEvent } from "./PrintMonth";
import { useMonthSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { buildPersonSlugMap } from "../lib/adapters";
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

const DAY_FULL = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const PrintMonthLive = ({ theme, lang = "en", avatarScale = 1 }: Props) => {
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

    const slugsForActivity = (a: { associated_person_ids?: string[] } | undefined): string[] | undefined => {
      if (!a?.associated_person_ids) return undefined;
      const slugs = a.associated_person_ids.map((id) => slugMap.get(id)).filter((s): s is string => !!s);
      return slugs.length > 0 ? slugs : undefined;
    };

    for (const ds of month.data.daySchedules) {
      const n = parseInt(ds.date.slice(8, 10), 10);
      const entry: MonthDayEntry = out[n] || { events: [] };
      if (!entry.events) entry.events = [];
      if (ds.dropoff_person_id) entry.dropoffSlug = slugMap.get(ds.dropoff_person_id);
      if (ds.pickup_person_id) entry.pickupSlug = slugMap.get(ds.pickup_person_id);
      if (ds.after_gan_activity_id) {
        const a = activities.data.find((x) => x.id === ds.after_gan_activity_id);
        if (a) {
          entry.events.push({
            icon: a.icon || activityIconKey(a.name),
            name: a.name,
            nameHe: a.name_he || a.name,
            at: ds.after_gan_time || a.default_time,
            withSlugs: slugsForActivity(a),
          });
        }
      }
      if (ds.family_dinner_person_id) {
        entry.dinner = {
          hostSlug: slugMap.get(ds.family_dinner_person_id) || "",
          at: ds.family_dinner_time || undefined,
        };
      }
      out[n] = entry;
    }

    for (const ss of month.data.saturdaySchedules) {
      const n = parseInt(ss.date.slice(8, 10), 10);
      const entry: MonthDayEntry = out[n] || { events: [] };
      if (!entry.events) entry.events = [];
      for (const sa of ss.activities || []) {
        const a = activities.data.find((x) => x.id === sa.activity_id);
        const name = sa.custom_name || a?.name || "";
        const nameHe = sa.custom_name_he || a?.name_he || name;
        if (!name) continue;
        entry.events.push({
          icon: a?.icon || activityIconKey(name),
          name,
          nameHe,
          at: sa.time || a?.default_time,
          withSlugs: slugsForActivity(a),
        });
      }
      if (ss.family_dinner_person_id) {
        entry.dinner = {
          hostSlug: slugMap.get(ss.family_dinner_person_id) || "",
          at: ss.family_dinner_time || undefined,
        };
      }
      out[n] = entry;
    }

    for (let day = 1; day <= lastDay; day++) {
      const dow = new Date(yr, mi, day).getDay();
      const dayName = DAY_FULL[dow];
      const recurring = activities.data.filter(
        (a) => a.is_recurring && a.recurrence_day?.toLowerCase() === dayName
      );
      if (recurring.length === 0) continue;
      const entry: MonthDayEntry = out[day] || { events: [] };
      if (!entry.events) entry.events = [];
      const existingKeys = new Set(entry.events.map((e) => `${e.name}|${e.at || ""}`));
      for (const a of recurring) {
        const ev: MonthDayEvent = {
          icon: a.icon || activityIconKey(a.name),
          name: a.name,
          nameHe: a.name_he || a.name,
          at: a.default_time || undefined,
          isRecurring: true,
          withSlugs: slugsForActivity(a),
        };
        const key = `${ev.name}|${ev.at || ""}`;
        if (!existingKeys.has(key)) {
          entry.events.push(ev);
          existingKeys.add(key);
        }
      }
      out[day] = entry;
    }

    return out;
  }, [month.data, activities.data, slugMap, yr, mi]);

  const legendIcons = useMemo(() => {
    if (!perDay || !activities.data) return undefined;
    const used = new Set<string>();
    for (const e of Object.values(perDay)) {
      if (e.events) for (const ev of e.events) used.add(ev.icon);
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
      avatarScale={avatarScale}
    />
  );
};
