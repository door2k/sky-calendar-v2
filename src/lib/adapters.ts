import { addDays, format, parseISO } from "date-fns";
import { PEOPLE } from "../data/people";
import type { Day, Activity } from "../types";
import type {
  DbPerson,
  DbActivity,
  DbDaySchedule,
  DbSaturdaySchedule,
  DbWeekData,
  DbSaturdayActivity,
} from "./db-types";
import { activityIconKey } from "./activityIcon";

const DAY_NAMES = [
  { en: "Sun", he: "ראשון" },
  { en: "Mon", he: "שני" },
  { en: "Tue", he: "שלישי" },
  { en: "Wed", he: "רביעי" },
  { en: "Thu", he: "חמישי" },
  { en: "Fri", he: "שישי" },
  { en: "Sat", he: "שבת" },
];

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function dateLabel(date: Date): { en: string; he: string } {
  const en = format(date, "MMM d");
  const he = `${date.getDate()} ${HE_MONTHS[date.getMonth()]}`;
  return { en, he };
}

export function buildPersonSlugMap(dbPeople: DbPerson[]): Map<string, string> {
  const map = new Map<string, string>();
  const knownSlugs = new Set(PEOPLE.map((p) => p.id));

  for (const p of dbPeople) {
    const lower = p.name.toLowerCase();
    let matched: string | null = null;
    for (const slug of knownSlugs) {
      if (lower.includes(slug)) {
        matched = slug;
        break;
      }
    }
    map.set(p.id, matched || PEOPLE[0].id);
  }
  return map;
}

function adaptActivity(
  db: DbActivity | undefined,
  customName: string | null | undefined,
  customNameHe: string | null | undefined,
  at: string | null | undefined
): Activity | null {
  const name = customName || db?.name || "";
  if (!name && !at) return null;
  const nameHe = customNameHe || db?.name_he || name;
  return {
    name,
    nameHe,
    at: at || db?.default_time || "",
    where: db?.address || "",
    icon: db?.icon || activityIconKey(name),
  };
}

export interface AdapterContext {
  weekStartDate: Date;
  weekData: DbWeekData;
  dbPeople: DbPerson[];
  dbActivities: DbActivity[];
}

export function adaptWeekToDays(ctx: AdapterContext): Day[] {
  const { weekStartDate, weekData, dbPeople, dbActivities } = ctx;
  const slugMap = buildPersonSlugMap(dbPeople);
  const activityMap = new Map(dbActivities.map((a) => [a.id, a]));
  const peopleById = new Map(dbPeople.map((p) => [p.id, p]));

  const slugFor = (id: string | null | undefined): string => {
    if (!id) return PEOPLE[0].id;
    return slugMap.get(id) || PEOPLE[0].id;
  };

  const days: Day[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStartDate, i);
    const dayLabel = DAY_NAMES[i];
    const dl = dateLabel(date);
    const isFri = i === 5;
    const isSat = i === 6;
    const fridayIsLast = !!weekData.fridayIsLastOfMonth;

    if (isSat) {
      const sat = weekData.saturday;
      const activities: Activity[] =
        sat?.activities?.map((sa: DbSaturdayActivity) =>
          adaptActivity(activityMap.get(sa.activity_id), sa.custom_name, sa.custom_name_he, sa.time)
        ).filter((a): a is Activity => !!a) || [];

      days.push({
        day: dayLabel.en,
        dayHe: dayLabel.he,
        date: dl.en,
        dateHe: dl.he,
        noGan: true,
        isSaturday: true,
        activities,
        bedtime: { by: slugFor(sat?.family_dinner_person_id) },
        notes: sat?.notes || "",
        notesHe: sat?.notes_he || "",
      });
      continue;
    }

    if (isFri && fridayIsLast) {
      const lastFri = weekData.lastFriday;
      const activities: Activity[] =
        lastFri?.activities?.map((sa: DbSaturdayActivity) =>
          adaptActivity(activityMap.get(sa.activity_id), sa.custom_name, sa.custom_name_he, sa.time)
        ).filter((a): a is Activity => !!a) || [];

      const dinnerHostId = lastFri?.family_dinner_person_id;
      const dinnerHost = dinnerHostId ? peopleById.get(dinnerHostId) : null;

      days.push({
        day: dayLabel.en,
        dayHe: dayLabel.he,
        date: dl.en,
        dateHe: dl.he,
        isFriday: true,
        noGan: true,
        activities,
        bedtime: { by: slugFor(dinnerHostId) },
        dinner: dinnerHost
          ? {
              host: slugFor(dinnerHostId),
              at: lastFri?.family_dinner_time || "16:00",
              where: "",
            }
          : undefined,
        notes: lastFri?.notes || "",
        notesHe: lastFri?.notes_he || "",
      });
      continue;
    }

    const ds = weekData.days[i];
    const after = ds?.after_gan_activity_id
      ? adaptActivity(activityMap.get(ds.after_gan_activity_id), null, null, ds.after_gan_time)
      : null;

    const ganLabel = ds?.gan_activity || "";
    const ganLabelHe = ds?.gan_activity_he || ganLabel;

    days.push({
      day: dayLabel.en,
      dayHe: dayLabel.he,
      date: dl.en,
      dateHe: dl.he,
      isFriday: isFri,
      noGan: !!ds?.is_no_gan,
      dropoff: ds?.dropoff_person_id ? { by: slugFor(ds.dropoff_person_id), at: "08:00" } : undefined,
      gan: ganLabel || ds?.is_no_gan
        ? { label: ds?.is_no_gan ? ds.no_gan_reason || "No Gan" : ganLabel, labelHe: ds?.is_no_gan ? ds.no_gan_reason_he || "אין גן" : ganLabelHe }
        : undefined,
      after: after || undefined,
      pickup: ds?.pickup_person_id ? { by: slugFor(ds.pickup_person_id), at: "15:30" } : undefined,
      bedtime: { by: slugFor(ds?.bedtime_person_id) },
      dinner:
        isFri && ds?.family_dinner_person_id
          ? {
              host: slugFor(ds.family_dinner_person_id),
              at: ds.family_dinner_time || "16:00",
              where: "",
            }
          : undefined,
      notes: ds?.notes || "",
      notesHe: ds?.notes_he || "",
    });
  }

  return days;
}

export function todayIndex(weekStartDate: Date): number {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  for (let i = 0; i < 7; i++) {
    if (format(addDays(weekStartDate, i), "yyyy-MM-dd") === todayStr) return i;
  }
  return -1;
}

export function parseWeekStart(s: string): Date {
  return parseISO(s);
}
