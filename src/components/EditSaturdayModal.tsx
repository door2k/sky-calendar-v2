import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import type {
  DbActivity,
  DbPerson,
  DbSaturdayActivity,
  DbSaturdaySchedule,
} from "../lib/db-types";
import { useUpdateSaturdaySchedule } from "../hooks/useSchedule";
import { lf } from "../lib/i18n-field";

interface Props {
  open: boolean;
  onClose: () => void;
  dateIso: string;
  dayLabelEn: string;
  dayLabelHe: string;
  dateLabelEn: string;
  dateLabelHe: string;
  current: DbSaturdaySchedule | null;
  dbPeople: DbPerson[];
  dbActivities: DbActivity[];
  theme: Theme;
  lang: Lang;
  variant: "saturday" | "last-friday";
}

interface FormActivity extends DbSaturdayActivity {
  _key: string;
}

interface FormState {
  activities: FormActivity[];
  family_dinner_person_id: string;
  family_dinner_time: string;
  notes: string;
}

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const fromDb = (d: DbSaturdaySchedule | null): FormState => ({
  activities: (d?.activities || []).map((a) => ({ ...a, _key: newKey() })),
  family_dinner_person_id: d?.family_dinner_person_id || "",
  family_dinner_time: d?.family_dinner_time || "",
  notes: d?.notes || "",
});

export const EditSaturdayModal = ({
  open,
  onClose,
  dateIso,
  dayLabelEn,
  dayLabelHe,
  dateLabelEn,
  dateLabelHe,
  current,
  dbPeople,
  dbActivities,
  theme,
  lang,
  variant,
}: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);

  const [form, setForm] = useState<FormState>(() => fromDb(current));
  const [saveError, setSaveError] = useState<string | null>(null);
  const update = useUpdateSaturdaySchedule();

  useEffect(() => {
    if (open) {
      setForm(fromDb(current));
      setSaveError(null);
    }
  }, [open, current]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !update.isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, update.isPending]);

  if (!open) return null;

  const setActivity = (key: string, patch: Partial<DbSaturdayActivity>) =>
    setForm((f) => ({
      ...f,
      activities: f.activities.map((a) => (a._key === key ? { ...a, ...patch } : a)),
    }));

  const removeActivity = (key: string) =>
    setForm((f) => ({ ...f, activities: f.activities.filter((a) => a._key !== key) }));

  const addActivity = () =>
    setForm((f) => ({
      ...f,
      activities: [...f.activities, { _key: newKey(), activity_id: "", time: "", custom_name: "" }],
    }));

  const handleSave = async () => {
    setSaveError(null);
    const cleanActivities: DbSaturdayActivity[] = form.activities
      .filter((a) => a.activity_id || (a.custom_name && a.custom_name.trim()))
      .map(({ _key: _ignore, ...rest }) => ({
        activity_id: rest.activity_id,
        time: rest.time || undefined,
        custom_name: rest.custom_name || undefined,
        custom_name_he: rest.custom_name_he || undefined,
      }));

    const payload: Partial<DbSaturdaySchedule> & { date: string } = {
      date: dateIso,
      activities: cleanActivities,
      family_dinner_person_id: form.family_dinner_person_id || null,
      family_dinner_time: form.family_dinner_time || null,
      notes: form.notes || null,
    };
    try {
      await update.mutateAsync(payload);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  const stickerCard: CSSProperties = {
    background: t.cardBg,
    border: `2px solid ${t.ink}`,
    borderRadius: 14,
    padding: "12px 14px",
    boxShadow: `4px 4px 0 ${t.accent}`,
  };

  const sectionLabel: CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1.4,
    color: t.inkSoft,
    fontFamily: t.fontHead,
    textTransform: "uppercase",
    marginBottom: 8,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    background: t.paper,
    border: `1.5px solid ${t.cardBorder}`,
    borderRadius: 8,
    fontFamily: t.fontBody,
    fontSize: 14,
    color: t.ink,
    boxSizing: "border-box",
  };

  const heading =
    variant === "last-friday"
      ? tx("Last Friday of the month", "שישי האחרון בחודש")
      : tx("Saturday plans", "תוכניות לשבת");

  return (
    <div
      onClick={() => !update.isPending && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,15,10,.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        direction: lang === "he" ? "rtl" : "ltr",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.paper,
          color: t.ink,
          fontFamily: t.fontBody,
          borderRadius: 20,
          maxWidth: 620,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `3px solid ${t.ink}`,
          boxShadow: `8px 8px 0 ${t.fridayAccent}, 0 30px 80px rgba(0,0,0,.4)`,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: `linear-gradient(135deg, ${t.fridayAccent}22, ${t.paperDeep})`,
            borderBottom: `2px dashed ${t.fridayAccent}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: t.fontHead,
                fontWeight: 700,
                fontSize: 18,
                lineHeight: 1.1,
                color: t.ink,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {tx(dayLabelEn, dayLabelHe)} · {tx(dateLabelEn, dateLabelHe)}
            </div>
            <div style={{ fontSize: 11, color: t.fridayAccent, marginTop: 2, fontWeight: 700 }}>
              {heading}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={update.isPending}
            aria-label="close"
            style={{
              background: "transparent",
              border: `2px solid ${t.ink}`,
              color: t.ink,
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: update.isPending ? "default" : "pointer",
              fontSize: 16,
              fontWeight: 700,
              opacity: update.isPending ? 0.5 : 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <section style={stickerCard}>
            <div style={{ ...sectionLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{tx("Activities", "פעילויות")}</span>
              <button
                onClick={addActivity}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  fontFamily: t.fontHead,
                  color: t.accent,
                  background: "transparent",
                  border: `1.5px dashed ${t.accent}`,
                  borderRadius: 99,
                  padding: "3px 10px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                + {tx("Add", "הוסף")}
              </button>
            </div>
            {form.activities.length === 0 && (
              <div style={{ fontSize: 12, color: t.inkSoft, fontStyle: "italic", padding: "4px 0" }}>
                {tx("No activities yet — tap Add", "אין פעילויות עדיין — לחץ הוסף")}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {form.activities.map((a) => (
                <div
                  key={a._key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 28px",
                    gap: 6,
                    alignItems: "center",
                    padding: 8,
                    background: t.paper,
                    borderRadius: 10,
                    border: `1px dashed ${t.cardBorder}`,
                  }}
                >
                  <select
                    value={a.activity_id}
                    onChange={(e) => setActivity(a._key, { activity_id: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">{tx("— choose activity —", "— בחר פעילות —")}</option>
                    {dbActivities.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {lf(opt as unknown as Record<string, unknown>, "name", lang) || opt.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={a.time || ""}
                    onChange={(e) => setActivity(a._key, { time: e.target.value })}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => removeActivity(a._key)}
                    aria-label="remove"
                    title={tx("Remove", "הסר")}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `1.5px solid ${t.fridayAccent}`,
                      background: "transparent",
                      color: t.fridayAccent,
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    value={a.custom_name || ""}
                    onChange={(e) => setActivity(a._key, { custom_name: e.target.value })}
                    placeholder={tx("Custom name (optional)", "שם מותאם (לא חובה)")}
                    style={{ ...inputStyle, gridColumn: "1 / span 3", fontSize: 12 }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...stickerCard, background: `${t.fridayAccent}11`, borderColor: t.fridayAccent }}>
            <div style={{ ...sectionLabel, color: t.fridayAccent }}>
              {variant === "last-friday" ? tx("Friday dinner", "ארוחת שישי") : tx("Family dinner", "ארוחה משפחתית")}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={form.family_dinner_person_id}
                onChange={(e) => setForm((f) => ({ ...f, family_dinner_person_id: e.target.value }))}
                style={{ ...inputStyle, flex: 2 }}
              >
                <option value="">{tx("— none —", "— ללא —")}</option>
                {dbPeople.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.role ? ` (${p.role})` : ""}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={form.family_dinner_time}
                onChange={(e) => setForm((f) => ({ ...f, family_dinner_time: e.target.value }))}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Notes", "הערות")}</div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder={tx("Anything to remember…", "משהו שצריך לזכור…")}
              style={{ ...inputStyle, resize: "vertical", fontFamily: t.fontBody }}
            />
          </section>

          {saveError && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                background: `${t.fridayAccent}22`,
                border: `1.5px solid ${t.fridayAccent}`,
                color: t.fridayAccent,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {tx("Couldn't save:", "שמירה נכשלה:")} {saveError}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "12px 20px",
            background: t.paperDeep,
            borderTop: `2px dashed ${t.cardBorder}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            disabled={update.isPending}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: t.inkSoft,
              border: `2px solid ${t.cardBorder}`,
              borderRadius: 99,
              fontFamily: t.fontHead,
              fontSize: 13,
              fontWeight: 700,
              cursor: update.isPending ? "default" : "pointer",
              opacity: update.isPending ? 0.5 : 1,
            }}
          >
            {tx("Cancel", "ביטול")}
          </button>
          <button
            onClick={handleSave}
            disabled={update.isPending}
            style={{
              padding: "8px 22px",
              background: t.fridayAccent,
              color: "#fff",
              border: `2px solid ${t.ink}`,
              borderRadius: 99,
              fontFamily: t.fontHead,
              fontSize: 13,
              fontWeight: 700,
              cursor: update.isPending ? "default" : "pointer",
              boxShadow: `2px 2px 0 ${t.ink}`,
              opacity: update.isPending ? 0.7 : 1,
            }}
          >
            {update.isPending ? tx("Saving…", "שומר…") : tx("Save", "שמור")}
          </button>
        </div>
      </div>
    </div>
  );
};
