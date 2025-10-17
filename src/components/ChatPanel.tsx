import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/ChatPanel.css";

type ChatMessage = {
  id: string;
  author: "You" | "Guest";
  text: string;
  ts: number; // epoch ms
};

interface ChatPanelProps {
  // Optional: start collapsed for small screens
  defaultCollapsed?: boolean;
}

// Frontend-only ephemeral chat inspired by Meet's right-side chat
export default function ChatPanel({ defaultCollapsed = false }: ChatPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Persist to localStorage so a refresh doesn't wipe chat immediately
  useEffect(() => {
    try {
      const raw = localStorage.getItem("owlboard_chat_messages");
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("owlboard_chat_messages", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, collapsed]);

  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const getId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: getId(),
      author: "You",
      text,
      ts: Date.now(),
    };
    setMessages((prev: ChatMessage[]) => [...prev, msg]);
    setDraft("");
  };

  const clear = (): void => setMessages([]);

  return (
    <aside className={`chat-panel ${collapsed ? "collapsed" : ""}`}>
      <header className="chat-header">
        <div className="chat-title">Chat</div>
        <div className="chat-actions">
          <button className="chat-btn" title={collapsed ? "Expand" : "Collapse"} onClick={() => setCollapsed((c: boolean) => !c)}>
            {collapsed ? "⟩" : "⟨"}
          </button>
          {!collapsed && (
            <button className="chat-btn" title="Clear chat" onClick={clear}>
              🗑️
            </button>
          )}
        </div>
      </header>

      {!collapsed && (
        <>
          <div ref={listRef} className="chat-messages" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet. Say hello!</div>
            ) : (
              messages.map((m: ChatMessage) => (
                <div key={m.id} className={`chat-bubble ${m.author === "You" ? "me" : "them"}`}>
                  <div className="chat-meta">
                    <span className="chat-author">{m.author}</span>
                    <span className="chat-time">{timeFmt.format(m.ts)}</span>
                  </div>
                  <div className="chat-text">{m.text}</div>
                </div>
              ))
            )}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message…"
              value={draft}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
                  setDraft((d: string) => d + "\n");
                }
              }}
            />
            <button type="submit" className="chat-send" disabled={!draft.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
