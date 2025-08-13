// components/MessageBoard.js
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setError("");
    try {
      // next.config.js rewrites /bff/message-board -> /api/message-board
      const data = await apiGet("/message-board");
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await apiPost("/message-board", { text: text.trim() });
      const msg = res?.message || { id: String(Date.now()), text: text.trim(), when: new Date().toISOString() };
      setMessages((m) => [...m, msg]);
      setText("");
    } catch (e) {
      setError(e?.message || "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {loading ? (
        <div>Loading messages…</div>
      ) : error ? (
        <div style={{ color: "#b91c1c" }}>Error: {error}</div>
      ) : (
        <>
          {messages.length === 0 ? (
            <div>No messages yet.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {messages.map((m) => (
                <li
                  key={m.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 10,
                    background: "#fff",
                  }}
                >
                  <div style={{ marginBottom: 4 }}>{m.text}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {m.when ? new Date(m.when).toLocaleString() : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Say something to the league…"
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            />
            <button
              disabled={submitting || !text.trim()}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#111827",
                color: "#fff",
                border: "1px solid #111827",
                cursor: "pointer",
              }}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
