import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import type { DbActivity, DbPerson } from "../lib/db-types";
import { useCreateActivity, useUpdateActivity, useDeleteActivity } from "../hooks/useActivities";
import { ActIcon } from "./ActIcon";
import { PersonAvatar } from "./PersonAvatar";
import { buildPersonSlugMap } from "../lib/adapters";

interface Props {
  open: boolean;
  onClose: () => void;
  activity: DbActivity | null;
  dbPeople: DbPerson[];
  theme: Theme;
  lang: Lang;
}

interface FormState {
  name: string;
  default_time: string;
  is_recurring: boolean;
  recurrence_day: string;
  address: string;
  maps_url: string;
  contact_phone: string;
  note: string;
  icon: string;
  associated_person_ids: string[];
}

const ICON_OPTIONS: string[] = [
  "music", "dance", "swim", "park", "gym", "beach", "pizza", "art", "book", "ball", "default",
];

const DAY_OPTIONS = [
  { value: "", labelEn: "— not recurring —", labelHe: "— לא חוזר —" },
  { value: "sunday", labelEn: "Sunday", labelHe: "ראשון" },
  { value: "monday", labelEn: "Monday", labelHe: "שני" },
  { value: "tuesday", labelEn: "Tuesday", labelHe: "שלישי" },
  { value: "wednesday", labelEn: "Wednesday", labelHe: "רביעי" },
  { value: "thursday", labelEn: "Thursday", labelHe: "חמישי" },
  { value: "friday", labelEn: "Friday", labelHe: "שישי" },
  { value: "saturday", labelEn: "Saturday", labelHe: "שבת" },
];

const fromDb = (a: DbActivity | null): FormState => ({
  name: a?.name || "",
  default_time: a?.default_time || "",
  is_recurring: !!a?.is_recurring,
  recurrence_day: a?.recurrence_day || "",
  address: a?.address || "",
  maps_url: a?.maps_url || "",
  contact_phone: a?.contact_phone || "",
  note: a?.note || "",
  icon: a?.icon || "default",
  associated_person_ids: a?.associated_person_ids || [],
});

export const EditActivityModal = ({ open, onClose, activity, dbPeople, theme, lang }: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const isNew = !activity;

  const [form, setForm] = useState<FormState>(() => fromDb(activity));
  const [saveError, setSaveError] = useState<string | null>(null);
  const create = useCreateActivity();
  const update = useUpdateActivity();
  const del = useDeleteActivity();
  const pending = create.isPending || update.isPending || del.isPending;
  const peopleSlugMap = useMemo(() => buildPersonSlugMap(dbPeople), [dbPeople]);

  useEffect(() => {
    if (open) {
      setForm(fromDb(activity));
      setSaveError(null);
    }
  }, [open, activity]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const togglePerson = (id: string) => {
    setForm((f) => ({
      ...f,
      associated_person_ids: f.associated_person_ids.includes(id)
        ? f.associated_person_ids.filter((x) => x !== id)
        : [...f.associated_person_ids, id],
    }));
  };

  const handleSave = async () => {
    setSaveError(null);
    if (!form.name.trim()) {
      setSaveError(tx("Name is required", "שם הוא שדה חובה"));
      return;
    }
    const payload = {
      name: form.name.trim(),
      default_time: form.default_time || undefined,
      is_recurring: form.is_recurring,
      recurrence_day: form.is_recurring && form.recurrence_day ? form.recurrence_day : undefined,
      address: form.address.trim() || undefined,
      maps_url: form.maps_url.trim() || undefined,
      contact_phone: form.contact_phone.trim() || undefined,
      note: form.note.trim() || undefined,
      icon: form.icon,
      associated_person_ids: form.associated_person_ids.length > 0 ? form.associated_person_ids : undefined,
    };
    try {
      if (isNew) {
        await create.mutateAsync(payload);
      } else if (activity) {
        await update.mutateAsync({ id: activity.id, ...payload });
      }
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    if (!window.confirm(tx(
      `Delete "${activity.name}"? This removes it from any day it's assigned to.`,
      `למחוק את "${activity.name}"? זה גם יסיר אותו מכל יום שהוא משויך אליו.`
    ))) return;
    setSaveError(null);
    try {
      await del.mutateAsync(activity.id);
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

  return (
    <div
      onClick={() => !pending && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,15,10,.55)",
        zIndex: 1100,
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
          maxWidth: 580,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `3px solid ${t.ink}`,
          boxShadow: `8px 8px 0 ${t.accent}, 0 30px 80px rgba(0,0,0,.4)`,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: t.paperDeep,
            borderBottom: `2px dashed ${t.cardBorder}`,
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
              {isNew ? tx("New activity", "פעילות חדשה") : tx("Edit activity", "ערוך פעילות")}
            </div>
            {!isNew && form.is_recurring && (
              <div style={{ fontSize: 11, color: t.accent2, marginTop: 2, fontWeight: 700 }}>
                {tx("Recurring — changes apply to every", "חוזר — שינוי יחול על כל")}{" "}
                {tx(
                  DAY_OPTIONS.find((d) => d.value === form.recurrence_day)?.labelEn || "",
                  DAY_OPTIONS.find((d) => d.value === form.recurrence_day)?.labelHe || ""
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={pending}
            aria-label="close"
            style={{
              background: "transparent",
              border: `2px solid ${t.ink}`,
              color: t.ink,
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: pending ? "default" : "pointer",
              fontSize: 16,
              fontWeight: 700,
              opacity: pending ? 0.5 : 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Name", "שם")}</div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={tx("e.g. Ninja class", "למשל שיעור נינג'ה")}
              style={inputStyle}
              autoFocus
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Icon", "אייקון")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICON_OPTIONS.map((k) => (
                <button
                  key={k}
                  onClick={() => set("icon", k)}
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: form.icon === k ? `2px solid ${t.accent}` : `1.5px solid ${t.cardBorder}`,
                    background: form.icon === k ? `${t.accent}22` : t.paper,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={k}
                >
                  <ActIcon k={k} size={18} color={form.icon === k ? t.accent : t.inkSoft} />
                </button>
              ))}
            </div>
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("When", "מתי")}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <select
                value={form.recurrence_day}
                onChange={(e) => {
                  const v = e.target.value;
                  set("recurrence_day", v);
                  set("is_recurring", !!v);
                }}
                style={{ ...inputStyle, flex: 2 }}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {tx(d.labelEn, d.labelHe)}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={form.default_time}
                onChange={(e) => set("default_time", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <div style={{ fontSize: 10.5, color: t.inkSoft, fontStyle: "italic" }}>
              {tx(
                "Recurring activities show automatically on every matching weekday.",
                "פעילויות חוזרות מופיעות אוטומטית בכל יום מתאים בשבוע."
              )}
            </div>
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Where", "איפה")}</div>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder={tx("Address", "כתובת")}
              style={inputStyle}
            />
            <input
              type="url"
              value={form.maps_url}
              onChange={(e) => set("maps_url", e.target.value)}
              placeholder="https://maps.google.com/…"
              style={{ ...inputStyle, marginTop: 6 }}
            />
            <input
              type="tel"
              value={form.contact_phone}
              onChange={(e) => set("contact_phone", e.target.value)}
              placeholder={tx("Contact phone", "טלפון")}
              style={{ ...inputStyle, marginTop: 6 }}
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Notes", "הערות")}</div>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
              placeholder={tx("Anything to remember about this activity…", "משהו שצריך לזכור על הפעילות…")}
              style={{ ...inputStyle, resize: "vertical", fontFamily: t.fontBody }}
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Who's involved", "מי משתתף")}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dbPeople.map((p) => {
                const sel = form.associated_person_ids.includes(p.id);
                const slug = peopleSlugMap.get(p.id) || p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePerson(p.id)}
                    title={p.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px 4px 4px",
                      borderRadius: 99,
                      border: sel ? `2px solid ${t.accent}` : `1.5px solid ${t.cardBorder}`,
                      background: sel ? `${t.accent}22` : t.paper,
                      color: t.ink,
                      fontFamily: t.fontHead,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background .15s, border-color .15s",
                    }}
                  >
                    <PersonAvatar id={slug} size={28} halo={false} theme={t} />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
            {dbPeople.length === 0 && (
              <div style={{ fontSize: 11, color: t.inkSoft, fontStyle: "italic" }}>
                {tx("No people yet", "אין אנשים עדיין")}
              </div>
            )}
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          {!isNew ? (
            <button
              onClick={handleDelete}
              disabled={pending}
              style={{
                padding: "8px 14px",
                background: "transparent",
                color: t.fridayAccent,
                border: `2px solid ${t.fridayAccent}`,
                borderRadius: 99,
                fontFamily: t.fontHead,
                fontSize: 12,
                fontWeight: 700,
                cursor: pending ? "default" : "pointer",
                opacity: pending ? 0.5 : 1,
              }}
            >
              {tx("Delete", "מחק")}
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={pending}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: t.inkSoft,
                border: `2px solid ${t.cardBorder}`,
                borderRadius: 99,
                fontFamily: t.fontHead,
                fontSize: 13,
                fontWeight: 700,
                cursor: pending ? "default" : "pointer",
                opacity: pending ? 0.5 : 1,
              }}
            >
              {tx("Cancel", "ביטול")}
            </button>
            <button
              onClick={handleSave}
              disabled={pending}
              style={{
                padding: "8px 22px",
                background: t.accent,
                color: "#fff",
                border: `2px solid ${t.ink}`,
                borderRadius: 99,
                fontFamily: t.fontHead,
                fontSize: 13,
                fontWeight: 700,
                cursor: pending ? "default" : "pointer",
                boxShadow: `2px 2px 0 ${t.ink}`,
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? tx("Saving…", "שומר…") : isNew ? tx("Create", "צור") : tx("Save", "שמור")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
