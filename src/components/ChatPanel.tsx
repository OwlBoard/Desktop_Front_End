'use client';

import React, { useEffect, useRef, useState } from "react";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import "../styles/ChatPanel.css";

interface ChatPanelProps {
  dashboardId?: string;
  defaultCollapsed?: boolean;
}

// Real-time WebSocket chat panel
export default function ChatPanel({ dashboardId, defaultCollapsed = false }: ChatPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Get user info from localStorage
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Try to get from localStorage, or use defaults for testing
    let storedUserId = localStorage.getItem('user_id');
    let storedUsername = localStorage.getItem('user_name');
    
    // If not logged in, use temporary values for testing
    if (!storedUserId) {
      storedUserId = 'test-user-' + Math.random().toString(36).substring(7);
      storedUsername = 'Guest-' + Math.random().toString(36).substring(7);
      console.log('Using temporary user for chat:', storedUserId, storedUsername);
    }
    
    setUserId(storedUserId);
    setUsername(storedUsername || 'Anonymous');
  }, []);

  // WebSocket chat hook
  const { messages, connectedUsers, isConnected, error, sendMessage } = useChatWebSocket({
    dashboardId: dashboardId || null,
    userId,
    username,
    enabled: !!dashboardId && !!userId
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, collapsed]);

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    
    const success = sendMessage(text);
    if (success) {
      setDraft("");
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <aside className={`chat-panel ${collapsed ? "collapsed" : ""}`}>
      <header className="chat-header">
        <div className="chat-title">
          Chat
          {!collapsed && (
            <span className="chat-status" title={isConnected ? "Connected" : "Disconnected"}>
              {isConnected ? "🟢" : "🔴"}
            </span>
          )}
        </div>
        <div className="chat-actions">
          <button 
            className="chat-btn" 
            title={collapsed ? "Expand" : "Collapse"} 
            onClick={() => setCollapsed((c: boolean) => !c)}
          >
            {collapsed ? "⟩" : "⟨"}
          </button>
        </div>
      </header>

      {!collapsed && (
        <>
          {error && (
            <div className="chat-error">
              ⚠️ {error}
            </div>
          )}

          {!dashboardId && (
            <div className="chat-empty">
              Open a dashboard to start chatting
            </div>
          )}

          {dashboardId && !userId && (
            <div className="chat-empty">
              Please login to use chat
            </div>
          )}

          {dashboardId && userId && (
            <>
              <div className="chat-users">
                <strong>Online ({connectedUsers.length}):</strong>{" "}
                {connectedUsers.map(u => u.username).join(", ") || "None"}
              </div>

              <div ref={listRef} className="chat-messages" role="log" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="chat-empty">No messages yet. Say hello!</div>
                ) : (
                  messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`chat-bubble ${
                        m.message_type === 'system' ? 'system' : 
                        m.user_id === userId ? 'me' : 'them'
                      }`}
                    >
                      {m.message_type === 'system' ? (
                        <div className="chat-text system-msg">{m.message}</div>
                      ) : (
                        <>
                          <div className="chat-meta">
                            <span className="chat-author">{m.username}</span>
                            <span className="chat-time">{formatTime(m.timestamp)}</span>
                          </div>
                          <div className="chat-text">{m.message}</div>
                        </>
                      )}
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
                  placeholder={isConnected ? "Type a message…" : "Connecting..."}
                  value={draft}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
                  disabled={!isConnected}
                />
                <button 
                  type="submit" 
                  className="chat-send" 
                  disabled={!draft.trim() || !isConnected}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </>
      )}
    </aside>
  );
}
