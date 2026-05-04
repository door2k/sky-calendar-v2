import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import type { Lang, Theme } from "../types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface Props {
  t: Theme;
  lang: Lang;
  messages?: ChatMessage[];
  onSend?: (text: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const AIStrip = ({ t, lang, messages = [], onSend, isLoading }: Props) => {
  const tx = (en: string, he: string) => (lang === "he" ? he : en);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recent = messages.slice(-(expanded ? 20 : 2));

  useEffect(() => {
    if (messages.length > 0) setExpanded(false);
  }, [messages.length]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || !onSend || isLoading) return;
    setInput("");
    await onSend(text);
    inputRef.current?.focus();
  };

  const interactive = !!onSend;

  const inputBox: CSSProperties = {
    flex: 1,
    background: t.cardBg,
    borderRadius: 99,
    padding: "8px 14px",
    border: `1.5px solid ${t.cardBorder}`,
    fontSize: 13,
    color: t.ink,
    outline: "none",
    fontFamily: t.fontBody,
    minWidth: 0,
  };

  return (
    <div
      style={{
        borderTop: `2px dashed ${t.cardBorder}`,
        background: t.paperDeep,
      }}
    >
      {messages.length > 0 && (
        <div
          style={{
            padding: "10px 16px 4px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: expanded ? 240 : 80,
            overflow: "auto",
            transition: "max-height .2s",
          }}
        >
          {recent.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                padding: "6px 12px",
                borderRadius: 14,
                background: m.role === "user" ? `${t.accent}22` : m.isError ? `${t.fridayAccent}22` : t.cardBg,
                border: `1px solid ${m.role === "user" ? `${t.accent}55` : m.isError ? t.fridayAccent : t.cardBorder}`,
                color: m.isError ? t.fridayAccent : t.ink,
                fontSize: 12.5,
                lineHeight: 1.35,
                whiteSpace: "pre-wrap",
                fontFamily: t.fontBody,
              }}
            >
              {m.content}
            </div>
          ))}
          {messages.length > 2 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                alignSelf: "center",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: t.fontHead,
                letterSpacing: 0.5,
                color: t.inkSoft,
                background: "transparent",
                border: `1px dashed ${t.cardBorder}`,
                borderRadius: 99,
                padding: "2px 10px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {tx(`Show all ${messages.length}`, `הצג הכל ${messages.length}`)}
            </button>
          )}
        </div>
      )}

      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: t.fontHead,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 3px 8px rgba(0,0,0,.12)",
            flexShrink: 0,
          }}
        >
          {isLoading ? "…" : "✨"}
        </div>
        {interactive ? (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            disabled={isLoading}
            placeholder={tx('Tell me — "Maya picks up Tuesday & Wednesday"', 'ספרי לי — "מאיה אוספת בשלישי ורביעי"')}
            style={{ ...inputBox, opacity: isLoading ? 0.6 : 1 }}
          />
        ) : (
          <div style={{ ...inputBox, color: t.inkSoft, fontStyle: "italic" }}>
            {tx('Tell me — "Maya picks up Tuesday & Wednesday"', 'ספרי לי — "מאיה אוספת בשלישי ורביעי"')}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!interactive || isLoading || !input.trim()}
          aria-label="send"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: t.ink,
            color: t.paper,
            fontSize: 14,
            cursor: interactive && !isLoading && input.trim() ? "pointer" : "default",
            fontWeight: 700,
            opacity: interactive && !isLoading && input.trim() ? 1 : 0.4,
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
};
