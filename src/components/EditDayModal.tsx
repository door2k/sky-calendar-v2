import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import type { DbActivity, DbDaySchedule, DbPerson } from "../lib/db-types";
import { useUpdateDaySchedule } from "../hooks/useSchedule";
import { lf } from "../lib/i18n-field";

interface Props {
  open: boolean;
  onClose: () => void;
  dateIso: string;
  dayIdx: number;
  dayLabelEn: string;
  dayLabelHe: string;
  dateLabelEn: string;
  dateLabelHe: string;
  current: DbDaySchedule | null;
  dbPeople: DbPerson[];
  dbActivities: DbActivity[];
  theme: Theme;
  lang: Lang;
}

interface FormState {
  dropoff_person_id: string;
  pickup_person_id: string;
  bedtime_person_id: string;
  gan_activity: string;
  is_no_gan: boolean;
  no_gan_reason: string;
  after_gan_activity_id: string;
  after_gan_time: string;
  family_dinner_person_id: string;
  family_dinner_time: string;
  notes: string;
}

const blank = (): FormState => ({
  dropoff_person_id: "",
  pickup_person_id: "",
  bedtime_person_id: "",
  gan_activity: "",
  is_no_gan: false,
  no_gan_reason: "",
  after_gan_activity_id: "",
  after_gan_time: "",
  family_dinner_person_id: "",
  family_dinner_time: "",
  notes: "",
});

const fromDb = (d: DbDaySchedule | null): FormState => ({
  dropoff_person_id: d?.dropoff_person_id || "",
  pickup_person_id: d?.pickup_person_id || "",
  bedtime_person_id: d?.bedtime_person_id || "",
  gan_activity: d?.gan_activity || "",
  is_no_gan: !!d?.is_no_gan,
  no_gan_reason: d?.no_gan_reason || "",
  after_gan_activity_id: d?.after_gan_activity_id || "",
  after_gan_time: d?.after_gan_time || "",
  family_dinner_person_id: d?.family_dinner_person_id || "",
  family_dinner_time: d?.family_dinner_time || "",
  notes: d?.notes || "",
});

export const EditDayModal = ({
  open,
  onClose,
  dateIso,
  dayIdx,
  dayLabelEn,
  dayLabelHe,
  dateLabelEn,
  dateLabelHe,
  current,
  dbPeople,
  dbActivities,
  theme,
  lang,
}: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const isFri = dayIdx === 5;

  const [form, setForm] = useState<FormState>(() => fromDb(current));
  const [saveError, setSaveError] = useState<string | null>(null);
  const update = useUpdateDaySchedule();

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

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaveError(null);
    const payload: Partial<DbDaySchedule> & { date: string } = {
      date: dateIso,
      dropoff_person_id: form.dropoff_person_id || null,
      pickup_person_id: form.pickup_person_id || null,
      bedtime_person_id: form.bedtime_person_id || null,
      is_no_gan: form.is_no_gan,
      gan_activity: form.is_no_gan ? null : form.gan_activity || null,
      no_gan_reason: form.is_no_gan ? form.no_gan_reason || null : null,
      after_gan_activity_id: form.after_gan_activity_id || null,
      after_gan_time: form.after_gan_time || null,
      notes: form.notes || null,
    };
    if (isFri) {
      payload.family_dinner_person_id = form.family_dinner_person_id || null;
      payload.family_dinner_time = form.family_dinner_time || null;
    }
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

  const personOptions = (
    <>
      <option value="">{tx("— none —", "— ללא —")}</option>
      {dbPeople.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}{p.role ? ` (${p.role})` : ""}
        </option>
      ))}
    </>
  );

  const activityOptions = (
    <>
      <option value="">{tx("— none —", "— ללא —")}</option>
      {dbActivities.map((a) => (
        <option key={a.id} value={a.id}>
          {lf(a as unknown as Record<string, unknown>, "name", lang) || a.name}
        </option>
      ))}
    </>
  );

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
          maxWidth: 560,
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
              {tx(dayLabelEn, dayLabelHe)} · {tx(dateLabelEn, dateLabelHe)}
            </div>
            <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 2 }}>
              {tx("Edit Sky's day", "ערוך את היום של סקיי")}
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
          <section style={{ ...stickerCard, background: form.is_no_gan ? `${t.fridayAccent}11` : t.cardBg, borderColor: form.is_no_gan ? t.fridayAccent : t.ink }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.is_no_gan}
                onChange={(e) => set("is_no_gan", e.target.checked)}
              />
              <span style={{ fontFamily: t.fontHead, fontSize: 14 }}>
                {tx("No gan today", "אין גן היום")}
              </span>
            </label>
            {form.is_no_gan && (
              <input
                type="text"
                value={form.no_gan_reason}
                onChange={(e) => set("no_gan_reason", e.target.value)}
                placeholder={tx("Why? (e.g., holiday, sick)", "למה? (חג, חולה...)")}
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
            {!form.is_no_gan && (
              <div style={{ marginTop: 8 }}>
                <div style={sectionLabel}>{tx("At gan", "בגן")}</div>
                <input
                  type="text"
                  value={form.gan_activity}
                  onChange={(e) => set("gan_activity", e.target.value)}
                  placeholder={tx("What's happening at gan today", "מה קורה בגן היום")}
                  style={inputStyle}
                />
              </div>
            )}
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("After gan", "אחרי הגן")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={form.after_gan_activity_id}
                onChange={(e) => set("after_gan_activity_id", e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
              >
                {activityOptions}
              </select>
              <input
                type="time"
                value={form.after_gan_time}
                onChange={(e) => set("after_gan_time", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("People", "אנשים")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Row label={tx("Drop-off", "מסירה")} t={t}>
                <select value={form.dropoff_person_id} onChange={(e) => set("dropoff_person_id", e.target.value)} style={inputStyle}>
                  {personOptions}
                </select>
              </Row>
              <Row label={tx("Pick-up", "איסוף")} t={t}>
                <select value={form.pickup_person_id} onChange={(e) => set("pickup_person_id", e.target.value)} style={inputStyle}>
                  {personOptions}
                </select>
              </Row>
              <Row label={tx("Bedtime", "שינה")} t={t}>
                <select value={form.bedtime_person_id} onChange={(e) => set("bedtime_person_id", e.target.value)} style={inputStyle}>
                  {personOptions}
                </select>
              </Row>
            </div>
          </section>

          {isFri && (
            <section style={{ ...stickerCard, background: `${t.fridayAccent}11`, borderColor: t.fridayAccent }}>
              <div style={{ ...sectionLabel, color: t.fridayAccent }}>{tx("Friday dinner", "ארוחת שישי")}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={form.family_dinner_person_id}
                  onChange={(e) => set("family_dinner_person_id", e.target.value)}
                  style={{ ...inputStyle, flex: 2 }}
                >
                  {personOptions}
                </select>
                <input
                  type="time"
                  value={form.family_dinner_time}
                  onChange={(e) => set("family_dinner_time", e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </section>
          )}

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Notes", "הערות")}</div>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
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
              background: t.accent,
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

const Row = ({ label, t, children }: { label: string; t: Theme; children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        width: 70,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        color: t.inkSoft,
        fontFamily: t.fontHead,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);
