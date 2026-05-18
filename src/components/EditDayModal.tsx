import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import type { DbActivity, DbDaySchedule, DbPerson } from "../lib/db-types";
import { useUpdateDaySchedule } from "../hooks/useSchedule";
import { useCreateActivity, useUpdateActivity } from "../hooks/useActivities";
import { PersonAvatar } from "./PersonAvatar";
import { buildPersonSlugMap } from "../lib/adapters";

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
  /** Free-form display name of the after-gan activity. Resolved to an ID on save. */
  after_gan_text: string;
  after_gan_time: string;
  /** People associated with the after-gan activity (mirrors activity.associated_person_ids). */
  after_gan_person_ids: string[];
  family_dinner_person_id: string;
  family_dinner_time: string;
  notes: string;
}

const fromDb = (d: DbDaySchedule | null, dbActivities: DbActivity[]): FormState => {
  const activity = d?.after_gan_activity_id
    ? dbActivities.find((a) => a.id === d.after_gan_activity_id)
    : undefined;
  return {
    dropoff_person_id: d?.dropoff_person_id || "",
    pickup_person_id: d?.pickup_person_id || "",
    bedtime_person_id: d?.bedtime_person_id || "",
    gan_activity: d?.gan_activity || "",
    is_no_gan: !!d?.is_no_gan,
    no_gan_reason: d?.no_gan_reason || "",
    after_gan_text: activity?.name || "",
    after_gan_time: d?.after_gan_time || "",
    after_gan_person_ids: activity?.associated_person_ids ? [...activity.associated_person_ids] : [],
    family_dinner_person_id: d?.family_dinner_person_id || "",
    family_dinner_time: d?.family_dinner_time || "",
    notes: d?.notes || "",
  };
};

const sortedKey = (xs: string[]) => [...xs].sort().join("|");

const shallowEqFormState = (a: FormState, b: FormState): boolean =>
  a.dropoff_person_id === b.dropoff_person_id &&
  a.pickup_person_id === b.pickup_person_id &&
  a.bedtime_person_id === b.bedtime_person_id &&
  a.gan_activity === b.gan_activity &&
  a.is_no_gan === b.is_no_gan &&
  a.no_gan_reason === b.no_gan_reason &&
  a.after_gan_text === b.after_gan_text &&
  a.after_gan_time === b.after_gan_time &&
  sortedKey(a.after_gan_person_ids) === sortedKey(b.after_gan_person_ids) &&
  a.family_dinner_person_id === b.family_dinner_person_id &&
  a.family_dinner_time === b.family_dinner_time &&
  a.notes === b.notes;

type SaveStatus = "idle" | "saving" | "saved" | "error";

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

  const baseline = useMemo(() => fromDb(current, dbActivities), [current, dbActivities]);
  const [form, setForm] = useState<FormState>(() => baseline);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const update = useUpdateDaySchedule();
  const create = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const peopleSlugMap = useMemo(() => buildPersonSlugMap(dbPeople), [dbPeople]);
  const saveTimerRef = useRef<number | null>(null);
  const savedFlashRef = useRef<number | null>(null);
  const latestFormRef = useRef<FormState>(form);
  latestFormRef.current = form;

  useEffect(() => {
    if (open) {
      setForm(baseline);
      setStatus("idle");
      setSaveError(null);
    }
  }, [open, baseline]);

  const performSave = async (snapshot: FormState) => {
    setStatus("saving");
    setSaveError(null);
    try {
      // Resolve after-gan free-form text → activity id (find or create)
      let after_gan_activity_id: string | null = null;
      let resolvedActivity: DbActivity | undefined;
      const txt = snapshot.after_gan_text.trim();
      if (txt) {
        const lc = txt.toLowerCase();
        const existing = dbActivities.find((a) => a.name.trim().toLowerCase() === lc);
        if (existing) {
          after_gan_activity_id = existing.id;
          resolvedActivity = existing;
        } else {
          const created = (await create.mutateAsync({
            name: txt,
            is_recurring: false,
            associated_person_ids: snapshot.after_gan_person_ids.length > 0
              ? snapshot.after_gan_person_ids
              : undefined,
          })) as DbActivity;
          after_gan_activity_id = created.id;
          resolvedActivity = created;
        }
      }

      // Sync people on the resolved activity if they differ.
      if (after_gan_activity_id && resolvedActivity) {
        const currentPeople = resolvedActivity.associated_person_ids ?? [];
        const wantPeople = snapshot.after_gan_person_ids;
        if (sortedKey(currentPeople) !== sortedKey(wantPeople)) {
          await updateActivity.mutateAsync({
            id: after_gan_activity_id,
            associated_person_ids: wantPeople,
          });
        }
      }

      const payload: Partial<DbDaySchedule> & { date: string } = {
        date: dateIso,
        dropoff_person_id: snapshot.dropoff_person_id || null,
        pickup_person_id: snapshot.pickup_person_id || null,
        bedtime_person_id: snapshot.bedtime_person_id || null,
        is_no_gan: snapshot.is_no_gan,
        gan_activity: snapshot.is_no_gan ? null : snapshot.gan_activity || null,
        no_gan_reason: snapshot.is_no_gan ? snapshot.no_gan_reason || null : null,
        after_gan_activity_id,
        after_gan_time: after_gan_activity_id ? snapshot.after_gan_time || null : null,
        notes: snapshot.notes || null,
      };
      if (isFri) {
        payload.family_dinner_person_id = snapshot.family_dinner_person_id || null;
        payload.family_dinner_time = snapshot.family_dinner_time || null;
      }
      await update.mutateAsync(payload);
      setStatus("saved");
      if (savedFlashRef.current) window.clearTimeout(savedFlashRef.current);
      savedFlashRef.current = window.setTimeout(() => {
        setStatus((s) => (s === "saved" ? "idle" : s));
      }, 1500);
    } catch (err) {
      setStatus("error");
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  // Debounced auto-save when form differs from baseline
  useEffect(() => {
    if (!open) return;
    if (shallowEqFormState(form, baseline)) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void performSave(latestFormRef.current);
    }, 800);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
    // We intentionally don't include performSave in deps — it closes over mutations
    // which are stable enough across renders for this debounce loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, baseline, open]);

  const handleClose = async () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    if (!shallowEqFormState(latestFormRef.current, baseline) && !update.isPending) {
      await performSave(latestFormRef.current);
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !update.isPending) void handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, update.isPending]);

  if (!open) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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

  const datalistId = `after-gan-suggestions-${dateIso}`;

  const statusLine = (() => {
    if (status === "saving") {
      return { text: tx("Saving…", "שומר…"), color: t.inkSoft };
    }
    if (status === "saved") {
      return { text: tx("✓ Saved", "✓ נשמר"), color: t.inkSoft };
    }
    if (status === "error") {
      return { text: tx("Couldn't save", "שמירה נכשלה"), color: t.fridayAccent };
    }
    return null;
  })();

  return (
    <div
      onClick={() => !update.isPending && !create.isPending && void handleClose()}
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
            <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{tx("Edit Sky's day", "ערוך את היום של סקיי")}</span>
              {statusLine && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: statusLine.color,
                    fontFamily: t.fontHead,
                    letterSpacing: 0.6,
                  }}
                >
                  · {statusLine.text}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => void handleClose()}
            disabled={update.isPending || create.isPending || updateActivity.isPending}
            aria-label="close"
            style={{
              background: "transparent",
              border: `2px solid ${t.ink}`,
              color: t.ink,
              width: 32,
              height: 32,
              borderRadius: "50%",
              cursor: update.isPending || create.isPending || updateActivity.isPending ? "default" : "pointer",
              fontSize: 16,
              fontWeight: 700,
              opacity: update.isPending || create.isPending || updateActivity.isPending ? 0.5 : 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <section
            style={{
              ...stickerCard,
              background: form.is_no_gan ? `${t.fridayAccent}11` : t.cardBg,
              borderColor: form.is_no_gan ? t.fridayAccent : t.ink,
            }}
          >
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
              <input
                type="text"
                list={datalistId}
                value={form.after_gan_text}
                onChange={(e) => set("after_gan_text", e.target.value)}
                placeholder={tx("Type or pick an activity", "הקלד או בחר פעילות")}
                style={{ ...inputStyle, flex: 2 }}
              />
              <datalist id={datalistId}>
                {dbActivities.map((a) => (
                  <option key={a.id} value={a.name} />
                ))}
              </datalist>
              <input
                type="time"
                value={form.after_gan_time}
                onChange={(e) => set("after_gan_time", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 6, fontStyle: "italic" }}>
              {tx(
                "Free text — if it doesn't match an existing activity, a new one is added.",
                "טקסט חופשי — אם זה לא תואם פעילות קיימת, תיווצר חדשה."
              )}
            </div>
            {form.after_gan_text.trim() && (
              <div style={{ marginTop: 10 }}>
                <div style={{ ...sectionLabel, marginBottom: 6 }}>
                  {tx("Who's joining?", "מי מצטרף?")}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {dbPeople.map((p) => {
                    const sel = form.after_gan_person_ids.includes(p.id);
                    const slug = peopleSlugMap.get(p.id) || p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            after_gan_person_ids: f.after_gan_person_ids.includes(p.id)
                              ? f.after_gan_person_ids.filter((x) => x !== p.id)
                              : [...f.after_gan_person_ids, p.id],
                          }))
                        }
                        title={p.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px 3px 3px",
                          borderRadius: 99,
                          border: sel ? `2px solid ${t.accent}` : `1.5px solid ${t.cardBorder}`,
                          background: sel ? `${t.accent}22` : t.paper,
                          color: t.ink,
                          fontFamily: t.fontHead,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "background .15s, border-color .15s",
                        }}
                      >
                        <PersonAvatar id={slug} size={22} halo={false} theme={t} />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 10, color: t.inkSoft, marginTop: 6, fontStyle: "italic" }}>
                  {tx(
                    "Edits the activity's associated people (affects every day using this activity).",
                    "עורך את האנשים של הפעילות (משפיע על כל יום שמשתמש בה)."
                  )}
                </div>
              </div>
            )}
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

          {status === "error" && saveError && (
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
            padding: "10px 20px",
            background: t.paperDeep,
            borderTop: `2px dashed ${t.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            fontFamily: t.fontHead,
            fontSize: 11,
            color: t.inkSoft,
          }}
        >
          <span style={{ fontWeight: 600, letterSpacing: 0.4 }}>
            {tx("Changes save automatically", "שינויים נשמרים אוטומטית")}
          </span>
          <button
            onClick={() => void handleClose()}
            disabled={update.isPending || create.isPending || updateActivity.isPending}
            style={{
              padding: "6px 18px",
              background: t.accent,
              color: "#fff",
              border: `2px solid ${t.ink}`,
              borderRadius: 99,
              fontFamily: t.fontHead,
              fontSize: 12,
              fontWeight: 700,
              cursor: update.isPending || create.isPending || updateActivity.isPending ? "default" : "pointer",
              boxShadow: `2px 2px 0 ${t.ink}`,
              opacity: update.isPending || create.isPending || updateActivity.isPending ? 0.7 : 1,
            }}
          >
            {tx("Done", "סיום")}
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
