import { useEffect, useRef, useState } from "react";
import type { CSSProperties, DragEvent } from "react";
import type { Lang, Theme } from "../types";
import type { DbPerson } from "../lib/db-types";
import { useCreatePerson, useUpdatePerson } from "../hooks/usePeople";
import { supabase } from "../lib/supabase";

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
  const [uploadingField, setUploadingField] = useState<"avatar_url" | "avatar_url_2" | null>(null);
  const create = useCreatePerson();
  const update = useUpdatePerson();
  const pending = create.isPending || update.isPending || uploadingField !== null;

  const uploadAvatar = async (file: File, field: "avatar_url" | "avatar_url_2") => {
    setUploadingField(field);
    setSaveError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const personId = person?.id || "temp";
      const fileName = `${personId}-${field}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true, contentType: file.type || `image/${ext}` });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setForm((f) => ({ ...f, [field]: data.publicUrl }));
    } catch (err) {
      setSaveError(`${tx("Upload failed:", "העלאה נכשלה:")} ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingField(null);
    }
  };

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
            <div style={sectionLabel}>{tx("Photo", "תמונה")}</div>
            <AvatarDropZone
              t={t}
              tx={tx}
              currentUrl={form.avatar_url}
              uploading={uploadingField === "avatar_url"}
              disabled={pending && uploadingField !== "avatar_url"}
              onFile={(f) => uploadAvatar(f, "avatar_url")}
              onUrlChange={(v) => setForm((s) => ({ ...s, avatar_url: v }))}
              onClear={() => setForm((s) => ({ ...s, avatar_url: "" }))}
            />
          </section>

          <section style={stickerCard}>
            <div style={sectionLabel}>{tx("Second photo (for pairs)", "תמונה שנייה (לזוגות)")}</div>
            <AvatarDropZone
              t={t}
              tx={tx}
              currentUrl={form.avatar_url_2}
              uploading={uploadingField === "avatar_url_2"}
              disabled={pending && uploadingField !== "avatar_url_2"}
              onFile={(f) => uploadAvatar(f, "avatar_url_2")}
              onUrlChange={(v) => setForm((s) => ({ ...s, avatar_url_2: v }))}
              onClear={() => setForm((s) => ({ ...s, avatar_url_2: "" }))}
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

interface DropZoneProps {
  t: Theme;
  tx: (en: string, he: string) => string;
  currentUrl: string;
  uploading: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
  onUrlChange: (v: string) => void;
  onClear: () => void;
}

const AvatarDropZone = ({ t, tx, currentUrl, uploading, disabled, onFile, onUrlChange, onClear }: DropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading || disabled) return;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  const dropStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: `2px ${dragOver ? "solid" : "dashed"} ${dragOver ? t.accent : t.cardBorder}`,
    background: dragOver ? `${t.accent}11` : t.paper,
    cursor: uploading || disabled ? "default" : "pointer",
    transition: "background .15s, border-color .15s",
  };

  return (
    <div>
      <div
        style={dropStyle}
        onClick={() => !uploading && !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading && !disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${t.cardBorder}`,
            background: t.paperDeep,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.inkSoft,
            fontSize: 24,
          }}
        >
          {currentUrl ? (
            <img
              src={currentUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            "📷"
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: t.fontHead, color: t.ink, lineHeight: 1.2 }}>
            {uploading
              ? tx("Uploading…", "מעלה…")
              : currentUrl
              ? tx("Drop a new photo or click to replace", "גרור תמונה חדשה או לחץ להחלפה")
              : tx("Drop a photo here, or click to choose", "גרור תמונה לכאן, או לחץ לבחירה")}
          </div>
          <div style={{ fontSize: 10, color: t.inkSoft, marginTop: 3, fontStyle: "italic" }}>
            {tx("JPG, PNG, GIF, WebP", "JPG, PNG, GIF, WebP")}
          </div>
        </div>
        {currentUrl && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{
              padding: "4px 10px",
              background: "transparent",
              border: `1.5px solid ${t.fridayAccent}`,
              borderRadius: 99,
              color: t.fridayAccent,
              fontFamily: t.fontHead,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
            title={tx("Remove", "הסר")}
          >
            ×
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: t.inkSoft,
            fontSize: 10.5,
            fontFamily: t.fontHead,
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {showUrlInput ? tx("hide URL", "הסתר כתובת") : tx("paste URL instead", "או הדבק כתובת")}
        </button>
      </div>
      {showUrlInput && (
        <input
          type="url"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://…/avatar.jpg"
          style={{
            width: "100%",
            padding: "8px 10px",
            background: t.paper,
            border: `1.5px solid ${t.cardBorder}`,
            borderRadius: 8,
            fontFamily: t.fontBody,
            fontSize: 13,
            color: t.ink,
            boxSizing: "border-box",
            marginTop: 4,
          }}
        />
      )}
    </div>
  );
};
