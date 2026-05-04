import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";
import { themeStyle } from "../themes";
import { usePeople, useDeletePerson } from "../hooks/usePeople";
import type { DbPerson } from "../lib/db-types";
import { PersonAvatar } from "../components/PersonAvatar";
import { EditPersonModal } from "../components/EditPersonModal";
import { buildPersonSlugMap } from "../lib/adapters";

interface Props {
  theme: Theme;
  lang?: Lang;
}

export const PeopleEditor = ({ theme, lang = "en" }: Props) => {
  const t = theme;
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const people = usePeople();
  const deletePerson = useDeletePerson();
  const [editing, setEditing] = useState<DbPerson | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Populate EXTRA registry with avatar URLs so PersonAvatar can render real photos.
  const slugMap = useMemo(
    () => (people.data ? buildPersonSlugMap(people.data) : new Map<string, string>()),
    [people.data]
  );

  const headerCard: CSSProperties = {
    background: t.cardBg,
    border: `2px solid ${t.ink}`,
    borderRadius: 16,
    padding: "14px 18px",
    boxShadow: `4px 4px 0 ${t.accent}`,
    display: "flex",
    alignItems: "center",
    gap: 14,
  };

  const handleDelete = async (p: DbPerson) => {
    setDeleteError(null);
    if (!window.confirm(tx(`Delete ${p.name}? This can't be undone.`, `למחוק את ${p.name}? לא ניתן לבטל.`))) return;
    try {
      await deletePerson.mutateAsync(p.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

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
        overflow: "auto",
      }}
    >
      <header
        style={{
          padding: "18px 24px",
          borderBottom: `2px dashed ${t.cardBorder}`,
          background: t.paperDeep,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `conic-gradient(from 0deg, ${t.accent}, ${t.accent2}, ${t.accent})`,
            padding: 3,
            boxShadow: `0 4px 10px rgba(0,0,0,.12)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: t.cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: t.fontHead,
              fontWeight: 700,
              fontSize: 20,
              color: t.accent,
            }}
          >
            👤
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 22, letterSpacing: -0.4, lineHeight: 1 }}>
            {tx("People", "אנשים")}
          </div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 3 }}>
            {tx("Manage everyone in Sky's world", "נהל את כל מי שנמצא בעולם של סקיי")}
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{
            padding: "8px 18px",
            borderRadius: 99,
            border: `2px solid ${t.ink}`,
            background: t.accent,
            color: "#fff",
            fontFamily: t.fontHead,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `2px 2px 0 ${t.ink}`,
          }}
        >
          + {tx("Add Person", "הוסף אדם")}
        </button>
      </header>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
        {people.isLoading && (
          <div style={{ color: t.inkSoft, fontStyle: "italic" }}>{tx("Loading…", "טוען…")}</div>
        )}
        {people.error && (
          <div style={{ color: t.fridayAccent, fontWeight: 600 }}>
            {tx("Couldn't load people:", "שגיאה בטעינה:")} {String(people.error)}
          </div>
        )}
        {deleteError && (
          <div style={{ color: t.fridayAccent, fontWeight: 600 }}>
            {tx("Couldn't delete:", "שגיאה במחיקה:")} {deleteError}
          </div>
        )}
        {(people.data || []).map((p) => (
          <div key={p.id} style={headerCard}>
            <PersonAvatar id={slugMap.get(p.id) || p.id} size={52} halo={true} theme={t} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 16, color: t.ink }}>{p.name}</div>
              {p.role && <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{p.role}</div>}
            </div>
            <button
              onClick={() => setEditing(p)}
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: `1.5px solid ${t.cardBorder}`,
                background: "transparent",
                color: t.ink,
                fontFamily: t.fontHead,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {tx("Edit", "ערוך")}
            </button>
            <button
              onClick={() => handleDelete(p)}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                border: `1.5px solid ${t.fridayAccent}`,
                background: "transparent",
                color: t.fridayAccent,
                fontFamily: t.fontHead,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
        {people.data && people.data.length === 0 && (
          <div style={{ color: t.inkSoft, fontStyle: "italic", textAlign: "center", padding: 40 }}>
            {tx("No people yet — tap Add Person", "אין אנשים עדיין — הוסף בכפתור למעלה")}
          </div>
        )}
      </div>

      <EditPersonModal
        open={adding}
        onClose={() => setAdding(false)}
        person={null}
        theme={t}
        lang={lang}
      />
      <EditPersonModal
        open={!!editing}
        onClose={() => setEditing(null)}
        person={editing}
        theme={t}
        lang={lang}
      />
    </div>
  );
};
