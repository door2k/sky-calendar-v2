import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import type { DbPerson } from "../lib/db-types";
import { useCreatePerson, useUpdatePerson } from "../hooks/usePeople";

interface Props {
  open: boolean;
  onClose: () => void;
  person: DbPerson | null;
  theme: Theme;
  lang: Lang;
}

interface FormState {
  name: string;
  role: string;
  avatar_url: string;
  avatar_url_2: string;
}

const fromDb = (p: DbPerson | null): FormState => ({
  name: p?.name || "",
  role: p?.role || "",
  avatar_url: p?.avatar_url || "",
  avatar_url_2: p?.avatar_url_2 || "",
});

export const EditPersonModal = ({ open, onClose, person, theme, lang }: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const isNew = !person;

  const [form, setForm] = useState<FormState>(() => fromDb(person));
  const [saveError, setSaveError] = useState<string | null>(null);
  const create = useCreatePerson();
  const update = useUpdatePerson();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(fromDb(person));
      setSaveError(null);
    }
  }, [open, person]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  const handleSave = async () => {
    setSaveError(null);
    const trimmed = {
      name: form.name.trim(),
      role: form.role.trim(),
      avatar_url: form.avatar_url.trim() || undefined,
      avatar_url_2: form.avatar_url_2.trim() || undefined,
    };
    if (!trimmed.name) {
      setSaveError(tx("Name is required", "שם הוא שדה חובה"));
      return;
    }
    try {
      if (isNew) {
        await create.mutateAsync({ name: trimmed.name, role: trimmed.role, ...(trimmed.avatar_url ? { avatar_url: trimmed.avatar_url } : {}), ...(trimmed.avatar_url_2 ? { avatar_url_2: trimmed.avatar_url_2 } : {}) });
      } else if (person) {
        await update.mutateAsync({
          id: person.id,
          name: trimmed.name,
          role: trimmed.role,
          avatar_url: trimmed.avatar_url || null as unknown as undefined,
          avatar_url_2: trimmed.avatar_url_2 || null as unknown as undefined,
        });
      }
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
          maxWidth: 520,
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
              {isNew ? tx("Add person", "הוסף אדם") : tx("Edit person", "ערוך אדם")}
            </div>
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
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={tx('e.g. "Tamir" or "Gili & Yossi" for a pair', 'למשל "תמיר" או "גילי ויוסי" לזוג')}
              style={inputStyle}
              autoFocus
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Role", "תפקיד")}</div>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder={tx("e.g. Aba, Savta, Babysitter", "אבא, סבתא, בייביסיטר")}
              style={inputStyle}
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Avatar URL", "תמונה (כתובת)")}</div>
            <input
              type="url"
              value={form.avatar_url}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              placeholder="https://…/avatar.jpg"
              style={inputStyle}
            />
            <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 6, fontStyle: "italic" }}>
              {tx("Paste a public image URL. Upload via the v1 site if needed.", "הדבק כתובת תמונה ציבורית. ניתן להעלות באתר הישן.")}
            </div>
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Second avatar (for pairs)", "תמונה שנייה (לזוגות)")}</div>
            <input
              type="url"
              value={form.avatar_url_2}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url_2: e.target.value }))}
              placeholder="https://…/avatar2.jpg"
              style={inputStyle}
            />
          </section>

          {(form.avatar_url || form.avatar_url_2) && (
            <section style={{ ...stickerCard, background: t.paperDeep }}>
              <div style={sectionLabel}>{tx("Preview", "תצוגה מקדימה")}</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {form.avatar_url && (
                  <img
                    src={form.avatar_url}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${t.cardBorder}` }}
                  />
                )}
                {form.avatar_url_2 && (
                  <img
                    src={form.avatar_url_2}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${t.cardBorder}` }}
                  />
                )}
              </div>
            </section>
          )}

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
  );
};
