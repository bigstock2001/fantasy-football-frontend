// components/Section.js
import React from "react";

export default function Section({ title, children, style }) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {title ? (
        <h2 style={{ marginTop: 0, marginBottom: 12, color: "#fff" }}>{title}</h2>
      ) : null}
      <div style={{ color: "#e6f2ff" }}>{children}</div>
    </section>
  );
}
