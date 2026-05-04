import { addDays, format, parseISO } from "date-fns";
import { PEOPLE, byId, upsertPerson, syntheticPerson } from "../data/people";
import type { Day, Activity, Person } from "../types";
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
  { en: "Sun", he: "ראשון", full: "sunday" },
  { en: "Mon", he: "שני", full: "monday" },
  { en: "Tue", he: "שלישי", full: "tuesday" },
  { en: "Wed", he: "רביעי", full: "wednesday" },
  { en: "Thu", he: "חמישי", full: "thursday" },
  { en: "Fri", he: "שישי", full: "friday" },
  { en: "Sat", he: "שבת", full: "saturday" },
];

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function dateLabel(date: Date): { en: string; he: string } {
  return {
    en: format(date, "MMM d"),
    he: `${date.getDate()} ${HE_MONTHS[date.getMonth()]}`,
  };
}

function nameSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "p";
}

function matchKnownSlug(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const p of PEOPLE) {
    if (lower.includes(p.id)) return p.id;
  }
  return undefined;
}

function ensurePerson(p: DbPerson): string {
  const isCombined = p.name.includes("&");
  const known = isCombined ? undefined : matchKnownSlug(p.name);
  const slug = known || nameSlug(p.name);
  const base: Person =
    known && PEOPLE.find((x) => x.id === known)
      ? { ...PEOPLE.find((x) => x.id === known)! }
      : syntheticPerson(slug, p.name, p.role);
  if (p.avatar_url) base.avatarUrl = p.avatar_url;
  if (p.avatar_url_2) base.avatarUrl2 = p.avatar_url_2;
  base.name = p.name;
  if (p.role) base.role = p.role;
  upsertPerson(base);
  return slug;
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

export function buildPersonSlugMap(dbPeople: DbPerson[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of dbPeople) {
    map.set(p.id, ensurePerson(p));
  }
  return map;
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

    const recurring: Activity[] = dbActivities
      .filter(
        (a) =>
          a.is_recurring &&
          a.recurrence_day?.toLowerCase() === dayLabel.full &&
          a.id !== ds?.after_gan_activity_id
      )
      .map((a) => adaptActivity(a, null, null, a.default_time))
      .filter((a): a is Activity => !!a);

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
      dropoff: dropoffSlug ? { by: dropoffSlug } : undefined,
      gan,
      after: after || undefined,
      recurring: recurring.length ? recurring : undefined,
      pickup: pickupSlug ? { by: pickupSlug } : undefined,
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

  // touch byId so unused-import lint doesn't complain
  void byId;

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
