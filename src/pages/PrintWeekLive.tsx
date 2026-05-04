import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import type { Lang, Theme } from "../types";
import { PrintWeek } from "./PrintWeek";
import { useWeekSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { adaptWeekToDays } from "../lib/adapters";

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

export const PrintWeekLive = ({ theme, lang = "en", avatarScale = 1, avatarHalo = true }: Props) => {
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
  const week = useWeekSchedule(weekStart);
  const people = usePeople();
  const activities = useActivities();

  const days = useMemo(() => {
    if (!week.data || !people.data || !activities.data) return undefined;
    return adaptWeekToDays({
      weekStartDate: weekStart,
      weekData: week.data,
      dbPeople: people.data,
      dbActivities: activities.data,
    });
  }, [week.data, people.data, activities.data, weekStart]);

  const weekEnd = addDays(weekStart, 6);
  const labelEn = `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d")}`;
  const labelHe = `${weekStart.getDate()} ${HE_MONTHS[weekStart.getMonth()]} — ${weekEnd.getDate()} ${HE_MONTHS[weekEnd.getMonth()]}`;

  return (
    <PrintWeek
      theme={theme}
      lang={lang}
      avatarScale={avatarScale}
      avatarHalo={avatarHalo}
      days={days}
      weekLabelEn={labelEn}
      weekLabelHe={labelHe}
    />
  );
};
