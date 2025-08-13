// components/MessageBoard.js
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  async function load() {
    setError("");
    try {
      const data = await apiGet("/messages");
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(t);
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    try {
      await apiPost("/messages", { text });
      setText("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Say something to the league…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button style={styles.btn} disabled={posting}>
          {posting ? "Posting…" : "Post"}
        </button>
      </form>

      {loading ? (
        <div>Loading messages…</div>
      ) : error ? (
        <div style={styles.error}>Error: {error}</div>
      ) : messages.length === 0 ? (
        <div>No messages yet.</div>
      ) : (
        <ul style={styles.list}>
          {messages.map((m) => (
            <li key={m.id || m.createdAt} style={styles.item}>
              <div style={styles.msgHeader}>
                <strong>{m.user?.name || "Someone"}</strong>
                <span style={styles.time}>
                  {new Date(m.createdAt || m.timestamp || Date.now()).toLocaleString()}
                </span>
              </div>
              <div>{m.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  form: { display: "flex", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  error: { color: "#b91c1c" },
  list: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 },
  item: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
  },
  msgHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    color: "#374151",
    fontSize: 13,
  },
  time: { opacity: 0.7 },
};
