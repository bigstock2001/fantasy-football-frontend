// components/MessageBoard.js
import React from "react";
import Section from "./Section";

export default function MessageBoard({ title = "Message Board", messages = [] }) {
  return (
    <Section title={title}>
      {messages.length === 0 ? (
        <div style={{ opacity: 0.85 }}>No messages yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {messages.map((m, i) => (
            <li
              key={i}
              style={{
                padding: "10px 12px",
                marginBottom: 8,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
