import { useCallback, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import type { Lang, Theme } from "../types";
import { WebWeekView } from "./WebWeekView";
import { useWeekSchedule, useUpdateDaySchedule, useUpdateSaturdaySchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { supabase } from "../lib/supabase";
import type { DbDaySchedule, DbSaturdaySchedule } from "../lib/db-types";
import { useRealtimeSchedule } from "../hooks/useRealtimeSchedule";
import { adaptWeekToDays, todayIndex } from "../lib/adapters";
import { EditDayModal } from "../components/EditDayModal";
import { EditSaturdayModal } from "../components/EditSaturdayModal";
import { EditActivityModal } from "../components/EditActivityModal";
import type { ChatMessage } from "../components/AIStrip";

interface AssistantAction {
  type: string;
  date?: string;
  text?: string;
  updates?: Record<string, unknown>;
  activities?: Array<{ activity_id?: string; time?: string; custom_name?: string }>;
  notes?: string;
  family_dinner_person_id?: string | null;
  family_dinner_time?: string | null;
}

interface Props {
  theme: Theme;
  lang?: Lang;
  avatarScale?: number;
  avatarHalo?: boolean;
  onOpenPeople?: () => void;
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

export const WebWeekViewLive = ({ theme, lang = "en", avatarScale = 1, avatarHalo = true, onOpenPeople }: Props) => {
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const weekStart = useMemo(() => startOfWeek(anchorDate, { weekStartsOn: 0 }), [anchorDate]);

  const week = useWeekSchedule(weekStart);
  const people = usePeople();
  const activities = useActivities();
  useRealtimeSchedule();
  const updateDay = useUpdateDaySchedule();
  const updateSat = useUpdateSaturdaySchedule();

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
    setOpenIdx(i);
  };

  const handleCopyLastWeek = useCallback(async () => {
    if (!activities.data) return;
    const lastWeekStart = addDays(weekStart, -7);
    const lastDates = Array.from({ length: 7 }, (_, i) => format(addDays(lastWeekStart, i), "yyyy-MM-dd"));
    const newDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));

    const proceed = window.confirm(
      lang === "he"
        ? "להעתיק את כל המינויים מהשבוע שעבר? זה ידרוס את המינויים הקיימים בשבוע הזה (לא נעתיק פעילויות חוזרות שכבר מופיעות אוטומטית)."
        : "Copy all assignments from last week? This overwrites this week's existing assignments. Recurring activities that already auto-appear will be skipped."
    );
    if (!proceed) return;

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const recurringMatchesDay = (activityId: string, dow: number) => {
      const a = activities.data!.find((x) => x.id === activityId);
      return !!(a?.is_recurring && a.recurrence_day?.toLowerCase() === dayNames[dow]);
    };

    setChatLoading(true);
    setChatMessages((h) => [...h, { role: "user", content: lang === "he" ? "העתק שבוע שעבר" : "Copy last week" }]);

    try {
      const { data: lastDay, error: e1 } = await supabase
        .from("day_schedules")
        .select("*")
        .in("date", lastDates.slice(0, 6));
      if (e1) throw e1;
      const lastSatRange = lastDates.slice(5);
      const { data: lastSat, error: e2 } = await supabase
        .from("saturday_schedules")
        .select("*")
        .in("date", lastSatRange);
      if (e2) throw e2;

      let copied = 0;
      let skippedRecurring = 0;

      for (let i = 0; i < 6; i++) {
        const src = (lastDay as DbDaySchedule[] | null)?.find((d) => d.date === lastDates[i]);
        if (!src) continue;
        let after_gan_activity_id: string | null = src.after_gan_activity_id ?? null;
        let after_gan_time: string | null = src.after_gan_time ?? null;
        if (after_gan_activity_id && recurringMatchesDay(after_gan_activity_id, i)) {
          after_gan_activity_id = null;
          after_gan_time = null;
          skippedRecurring++;
        }
        await updateDay.mutateAsync({
          date: newDates[i],
          dropoff_person_id: src.dropoff_person_id ?? null,
          pickup_person_id: src.pickup_person_id ?? null,
          bedtime_person_id: src.bedtime_person_id ?? null,
          gan_activity: src.gan_activity ?? null,
          gan_activity_he: src.gan_activity_he ?? null,
          is_no_gan: !!src.is_no_gan,
          no_gan_reason: src.no_gan_reason ?? null,
          no_gan_reason_he: src.no_gan_reason_he ?? null,
          after_gan_activity_id,
          after_gan_time,
          family_dinner_person_id: src.family_dinner_person_id ?? null,
          family_dinner_time: src.family_dinner_time ?? null,
          notes: src.notes ?? null,
          notes_he: src.notes_he ?? null,
        });
        copied++;
      }

      for (const ss of (lastSat as DbSaturdaySchedule[] | null) || []) {
        const offset = lastDates.indexOf(ss.date);
        if (offset < 0) continue;
        const filteredActivities = (ss.activities || []).filter((sa) => {
          if (sa.activity_id && recurringMatchesDay(sa.activity_id, offset)) {
            skippedRecurring++;
            return false;
          }
          return true;
        });
        await updateSat.mutateAsync({
          date: newDates[offset],
          activities: filteredActivities,
          notes: ss.notes ?? undefined,
          family_dinner_person_id: ss.family_dinner_person_id ?? undefined,
          family_dinner_time: ss.family_dinner_time ?? undefined,
        });
        copied++;
      }

      const summary =
        lang === "he"
          ? `הועתקו ${copied} ימים מהשבוע שעבר${skippedRecurring ? ` (דילוג על ${skippedRecurring} פעילויות חוזרות)` : ""}.`
          : `Copied ${copied} days from last week${skippedRecurring ? ` (skipped ${skippedRecurring} recurring item${skippedRecurring === 1 ? "" : "s"})` : ""}.`;
      setChatMessages((h) => [...h, { role: "assistant", content: summary }]);
    } catch (err) {
      setChatMessages((h) => [
        ...h,
        { role: "assistant", content: err instanceof Error ? err.message : String(err), isError: true },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [activities.data, weekStart, lang, updateDay, updateSat]);

  const handleChatSend = useCallback(
    async (text: string) => {
      if (!people.data || !activities.data || !week.data) return;
      const userMsg: ChatMessage = { role: "user", content: text };
      const historyForRequest = chatMessages.filter((m) => !m.isError);
      setChatMessages((h) => [...h, userMsg]);
      setChatLoading(true);
      try {
        const schedules = (week.data?.days || []).filter((d): d is NonNullable<typeof d> => !!d);
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            people: people.data,
            activities: activities.data,
            schedules,
            currentWeekStart: format(weekStart, "yyyy-MM-dd"),
            conversationHistory: historyForRequest.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { details?: string; error?: string };
          const raw = err.details || err.error || `${res.status} ${res.statusText}`;
          let pretty = raw;
          const m = raw.match(/"message"\s*:\s*"([^"]+)"/);
          if (m) pretty = m[1];
          setChatMessages((h) => [...h, { role: "assistant", content: pretty, isError: true }]);
          return;
        }
        const { actions } = (await res.json()) as { actions: AssistantAction[] };
        const replyParts: string[] = [];
        const skipped: string[] = [];
        for (const a of actions || []) {
          if (a.type === "message" && a.text) {
            replyParts.push(a.text);
          } else if (a.type === "update_day" && a.date && a.updates) {
            await updateDay.mutateAsync({ date: a.date, ...(a.updates as Record<string, never>) });
          } else if (a.type === "update_saturday" && a.date) {
            await updateSat.mutateAsync({
              date: a.date,
              activities: (a.activities || []).map((x) => ({
                activity_id: x.activity_id || "",
                time: x.time,
                custom_name: x.custom_name,
              })),
              notes: a.notes,
              family_dinner_person_id: a.family_dinner_person_id ?? undefined,
              family_dinner_time: a.family_dinner_time ?? undefined,
            });
          } else {
            skipped.push(a.type);
          }
        }
        if (skipped.length) {
          replyParts.push(`(skipped unsupported actions: ${skipped.join(", ")})`);
        }
        if (replyParts.length === 0) replyParts.push("Done.");
        setChatMessages((h) => [...h, { role: "assistant", content: replyParts.join("\n") }]);
      } catch (err) {
        setChatMessages((h) => [
          ...h,
          { role: "assistant", content: err instanceof Error ? err.message : String(err), isError: true },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [people.data, activities.data, week.data, weekStart, chatMessages, updateDay, updateSat]
  );

  const isSaturdayStyle =
    openIdx === 6 || (openIdx === 5 && !!week.data?.fridayIsLastOfMonth);

  const modalCtx = useMemo(() => {
    if (openIdx === null || !week.data || !people.data || !activities.data) return null;
    const date = addDays(weekStart, openIdx);
    const dateIso = format(date, "yyyy-MM-dd");
    return {
      dateIso,
      dayIdx: openIdx,
      dayLabelEn: DAY_NAMES[openIdx].en,
      dayLabelHe: DAY_NAMES[openIdx].he,
      dateLabelEn: format(date, "MMM d"),
      dateLabelHe: `${date.getDate()} ${HE_MONTHS[date.getMonth()]}`,
      dbPeople: people.data,
      dbActivities: activities.data,
      currentDay: openIdx <= 5 ? week.data.days[openIdx] : null,
      currentSat:
        openIdx === 6
          ? week.data.saturday
          : openIdx === 5 && week.data.fridayIsLastOfMonth
          ? week.data.lastFriday || null
          : null,
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
        onCopyLastWeek={handleCopyLastWeek}
        onDayClick={handleDayClick}
        onActivityClick={(id) => setOpenActivityId(id)}
        chatMessages={chatMessages}
        onChatSend={handleChatSend}
        chatLoading={chatLoading}
        onOpenPeople={onOpenPeople}
      />
      {modalCtx && !isSaturdayStyle && (
        <EditDayModal
          open
          onClose={() => setOpenIdx(null)}
          dateIso={modalCtx.dateIso}
          dayIdx={modalCtx.dayIdx}
          dayLabelEn={modalCtx.dayLabelEn}
          dayLabelHe={modalCtx.dayLabelHe}
          dateLabelEn={modalCtx.dateLabelEn}
          dateLabelHe={modalCtx.dateLabelHe}
          current={modalCtx.currentDay}
          dbPeople={modalCtx.dbPeople}
          dbActivities={modalCtx.dbActivities}
          theme={theme}
          lang={lang}
        />
      )}
      {modalCtx && isSaturdayStyle && (
        <EditSaturdayModal
          open
          onClose={() => setOpenIdx(null)}
          dateIso={modalCtx.dateIso}
          dayLabelEn={modalCtx.dayLabelEn}
          dayLabelHe={modalCtx.dayLabelHe}
          dateLabelEn={modalCtx.dateLabelEn}
          dateLabelHe={modalCtx.dateLabelHe}
          current={modalCtx.currentSat}
          dbPeople={modalCtx.dbPeople}
          dbActivities={modalCtx.dbActivities}
          theme={theme}
          lang={lang}
          variant={openIdx === 6 ? "saturday" : "last-friday"}
        />
      )}
      {openActivityId && people.data && activities.data && (
        <EditActivityModal
          open
          onClose={() => setOpenActivityId(null)}
          activity={activities.data.find((a) => a.id === openActivityId) || null}
          dbPeople={people.data}
          theme={theme}
          lang={lang}
        />
      )}
    </>
  );
};
