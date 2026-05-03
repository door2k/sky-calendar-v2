import { useMemo, useState } from "react";
import type { Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { PersonAvatar } from "../components/PersonAvatar";
import { ActIcon } from "../components/ActIcon";
import { useMonthSchedule } from "../hooks/useSchedule";
import { usePeople } from "../hooks/usePeople";
import { useActivities } from "../hooks/useActivities";
import { useRealtimeSchedule } from "../hooks/useRealtimeSchedule";
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

const btnIcon = (t: Theme): React.CSSProperties => ({
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  color: t.ink,
  fontSize: 18,
  cursor: "pointer",
  borderRadius: "50%",
  fontFamily: t.fontHead,
  fontWeight: 700,
  lineHeight: 1,
});

export const WebMonthViewLive = ({ theme, lang = "en" }: Props) => {
  const t = theme;
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth() + 1;

  const sched = useMonthSchedule(year, month);
  const people = usePeople();
  const activities = useActivities();
  useRealtimeSchedule();

  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const monthLabels = lang === "he"
    ? ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
  const todayN = isCurrentMonth ? today.getDate() : -1;

  const firstOfMonth = new Date(year, month - 1, 1);
  const startDow = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const days: { n: number | null; idx: number }[] = [];
  for (let i = 0; i < 42; i++) {
    const dn = i - startDow + 1;
    days.push({ n: dn > 0 && dn <= daysInMonth ? dn : null, idx: i });
  }
  const totalRows = Math.ceil((startDow + daysInMonth) / 7);

  const slugMap = useMemo(
    () => (people.data ? buildPersonSlugMap(people.data) : new Map<string, string>()),
    [people.data]
  );

  const dayEntries = useMemo(() => {
    const m: Record<number, { person?: string; icons: string[] }> = {};
    if (!sched.data || !activities.data) return m;
    const actMap = new Map(activities.data.map((a) => [a.id, a]));

    for (const d of sched.data.daySchedules) {
      const day = parseInt(d.date.split("-")[2], 10);
      if (!m[day]) m[day] = { icons: [] };
      const personId = d.dropoff_person_id || d.pickup_person_id;
      if (personId && !m[day].person) m[day].person = slugMap.get(personId);
      if (d.after_gan_activity_id) {
        const a = actMap.get(d.after_gan_activity_id);
        m[day].icons.push(a?.icon || activityIconKey(a?.name));
      }
    }
    for (const s of sched.data.saturdaySchedules) {
      const day = parseInt(s.date.split("-")[2], 10);
      if (!m[day]) m[day] = { icons: [] };
      for (const sa of s.activities || []) {
        const a = actMap.get(sa.activity_id);
        m[day].icons.push(a?.icon || activityIconKey(a?.name || sa.custom_name));
      }
    }
    return m;
  }, [sched.data, activities.data, slugMap]);

  const monthLabelEn = `${EN_MONTHS[month - 1]} ${year}`;
  const monthLabelHe = `${HE_MONTHS[month - 1]} ${year}`;

  const goPrev = () => setAnchorDate(new Date(year, month - 2, 1));
  const goNext = () => setAnchorDate(new Date(year, month, 1));

  return (
    <div
      style={{
        ...themeStyle(t),
        background: t.paper,
        color: t.ink,
        fontFamily: t.fontBody,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        direction: lang === "he" ? "rtl" : "ltr",
      }}
    >
      <header
        style={{
          padding: "16px 24px",
          borderBottom: `2px dashed ${t.cardBorder}`,
          background: t.paperDeep,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 24, letterSpacing: -0.4 }}>
            {tx(monthLabelEn, monthLabelHe)}
          </div>
          <div style={{ fontSize: 11, color: t.inkSoft }}>{tx("Sky's Month", "החודש של סקיי")}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={btnIcon(t)} onClick={goPrev}>‹</button>
          <button style={btnIcon(t)} onClick={goNext}>›</button>
        </div>
      </header>

      <div style={{ padding: "14px 18px 6px", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {monthLabels.map((l) => (
          <div
            key={l}
            style={{
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: t.fontHead,
              color: t.inkSoft,
              letterSpacing: 1.2,
            }}
          >
            {l}
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: "0 18px 14px",
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${totalRows}, 1fr)`,
          gap: 6,
        }}
      >
        {days.slice(0, totalRows * 7).map(({ n, idx }) => {
          const dow = idx % 7;
          const isFri = dow === 5;
          const isSat = dow === 6;
          const isToday = n === todayN;
          if (!n)
            return <div key={idx} style={{ background: t.paperDeep + "66", borderRadius: 10, opacity: 0.4 }} />;
          const entry = dayEntries[n];
          return (
            <div
              key={idx}
              style={{
                background: isFri ? `${t.fridayAccent}15` : t.cardBg,
                borderRadius: 10,
                border: `1.5px solid ${isToday ? t.accent : t.cardBorder}`,
                boxShadow: isToday ? `0 0 0 3px ${t.halo}` : "none",
                padding: "6px 7px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: t.fontHead,
                    color: isToday ? t.accent : isFri ? t.fridayAccent : t.ink,
                  }}
                >
                  {n}
                </div>
                {isFri && <span style={{ fontSize: 9 }}>🕯</span>}
                {isSat && <span style={{ fontSize: 9 }}>✦</span>}
              </div>
              {entry?.person && <PersonAvatar id={entry.person} size={22} halo={false} theme={t} />}
              {entry?.icons && entry.icons.length > 0 && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: "auto" }}>
                  {entry.icons.slice(0, 3).map((k, i) => (
                    <div
                      key={i}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: `${t.accent}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActIcon k={k} size={9} color={t.accent} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
