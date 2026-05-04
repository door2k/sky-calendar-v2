import { addDays, format, parseISO } from "date-fns";
import { PEOPLE, registerPerson, syntheticPerson } from "../data/people";
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

const KNOWN_SLUGS = PEOPLE.map((p) => p.id);

function dateLabel(date: Date): { en: string; he: string } {
  return {
    en: format(date, "MMM d"),
    he: `${date.getDate()} ${HE_MONTHS[date.getMonth()]}`,
  };
}

function nameToSlug(name: string): string {
  const lower = name.toLowerCase();
  for (const slug of KNOWN_SLUGS) {
    if (lower.includes(slug)) return slug;
  }
  // unknown name → register a synthetic procedural avatar, slug from name
  const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `p-${Math.abs(hash(name))}`;
  registerPerson(syntheticPerson(slug, name));
  return slug;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function dbPersonSlug(p: DbPerson): string {
  // Combined entries like "Gili & Yossi" → "gili+yossi"
  if (p.name.includes("&")) {
    const parts = p.name.split("&").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return parts.slice(0, 2).map(nameToSlug).join("+");
    }
  }
  return nameToSlug(p.name);
}

export function buildPersonSlugMap(dbPeople: DbPerson[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of dbPeople) {
    map.set(p.id, dbPersonSlug(p));
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

  const slugFor = (id: string | null | undefined): string | undefined => {
    if (!id) return undefined;
    return slugMap.get(id);
  };

  const days: Day[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStartDate, i);
    const dayLabel = DAY_NAMES[i];
    const dl = dateLabel(date);
    const isFri = i === 5;
    const isSat = i === 6;
    const fridayIsLast = !!weekData.fridayIsLastOfMonth;
    const dateIso = format(date, "yyyy-MM-dd");

    if (isSat) {
      const sat = weekData.saturday;
      const activities: Activity[] =
        sat?.activities
          ?.map((sa: DbSaturdayActivity) =>
            adaptActivity(activityMap.get(sa.activity_id), sa.custom_name, sa.custom_name_he, sa.time)
          )
          .filter((a): a is Activity => !!a) || [];

      days.push({
        day: dayLabel.en,
        dayHe: dayLabel.he,
        date: dl.en,
        dateHe: dl.he,
        dateIso,
        noGan: true,
        isSaturday: true,
        activities,
        notes: sat?.notes || "",
        notesHe: sat?.notes_he || "",
      });
      continue;
    }

    if (isFri && fridayIsLast) {
      const lastFri = weekData.lastFriday;
      const activities: Activity[] =
        lastFri?.activities
          ?.map((sa: DbSaturdayActivity) =>
            adaptActivity(activityMap.get(sa.activity_id), sa.custom_name, sa.custom_name_he, sa.time)
          )
          .filter((a): a is Activity => !!a) || [];

      const dinnerHostId = lastFri?.family_dinner_person_id;
      const dinnerHost = dinnerHostId ? peopleById.get(dinnerHostId) : null;

      days.push({
        day: dayLabel.en,
        dayHe: dayLabel.he,
        date: dl.en,
        dateHe: dl.he,
        dateIso,
        isFriday: true,
        noGan: true,
        activities,
        dinner:
          dinnerHost && slugFor(dinnerHostId)
            ? {
                host: slugFor(dinnerHostId)!,
                at: lastFri?.family_dinner_time || "16:00",
                where: dinnerHost.role ? `${dinnerHost.role} ${dinnerHost.name}'s` : "",
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
    const dropoffSlug = slugFor(ds?.dropoff_person_id);
    const pickupSlug = slugFor(ds?.pickup_person_id);
    const bedtimeSlug = slugFor(ds?.bedtime_person_id);
    const dinnerSlug = isFri ? slugFor(ds?.family_dinner_person_id) : undefined;
    const dinnerHost = isFri && ds?.family_dinner_person_id ? peopleById.get(ds.family_dinner_person_id) : null;

    let gan: Day["gan"] | undefined;
    if (ds?.is_no_gan) {
      gan = {
        label: ds.no_gan_reason || "No Gan",
        labelHe: ds.no_gan_reason_he || ds.no_gan_reason || "אין גן",
      };
    } else if (ganLabel) {
      gan = { label: ganLabel, labelHe: ganLabelHe };
    }

    days.push({
      day: dayLabel.en,
      dayHe: dayLabel.he,
      date: dl.en,
      dateHe: dl.he,
      dateIso,
      isFriday: isFri,
      noGan: !!ds?.is_no_gan,
      noGanReason: ds?.no_gan_reason || undefined,
      noGanReasonHe: ds?.no_gan_reason_he || undefined,
      dropoff: dropoffSlug ? { by: dropoffSlug, at: "08:00" } : undefined,
      gan,
      after: after || undefined,
      pickup: pickupSlug ? { by: pickupSlug, at: "15:30" } : undefined,
      bedtime: bedtimeSlug ? { by: bedtimeSlug } : undefined,
      dinner:
        dinnerSlug && dinnerHost
          ? {
              host: dinnerSlug,
              at: ds?.family_dinner_time || "16:00",
              where: dinnerHost.role ? `${dinnerHost.role} ${dinnerHost.name}'s` : "",
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
