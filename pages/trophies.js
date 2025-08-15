// pages/trophies.js
import React, { useEffect, useState } from "react";
import Section from "../components/Section";

export default function TrophiesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Call local app route directly
        const res = await fetch("/api/trophies", { cache: "no-store" });
        const ctype = res.headers.get("content-type") || "";

        if (!res.ok) {
          // Try to read text to show a useful message
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}${text ? " – " + text.slice(0, 80) : ""}`);
        }
        if (!ctype.includes("application/json")) {
          const text = await res.text().catch(() => "");
          throw new Error(`Unexpected content-type (${ctype})${text ? " – " + text.slice(0, 80) : ""}`);
        }

        const json = await res.json();
        setData(json || {});
        setErr("");
      } catch (e) {
        setErr(e?.message || "Failed to load trophies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const champions = Array.isArray(data?.champions) ? data.champions : [];
  const records = Array.isArray(data?.records) ? data.records : [];
  const awards = Array.isArray(data?.awards) ? data.awards : [];

  return (
    <div style={styles.page}>
      <Section title="Hall of Champions">
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div style={styles.err}>Error: {err}</div>
        ) : champions.length === 0 ? (
          <div>No champions have been recorded yet.</div>
        ) : (
          <div style={styles.grid}>
            {champions.map((c, i) => (
              <div key={`${c.year}-${c.team}-${i}`} style={styles.champCard}>
                <div style={styles.champYear}>{c.year}</div>
                <div style={styles.champTeam}>{c.team}</div>
                {c.owner && <div style={styles.champMeta}>Owner: {c.owner}</div>}
                {c.record && <div style={styles.champMeta}>Record: {c.record}</div>}
                {c.note && <div style={styles.champMeta}>{c.note}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="League Records">
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div style={styles.err}>Error: {err}</div>
        ) : records.length === 0 ? (
          <div>No records have been recorded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Value</th>
                  <th>Holder</th>
                  <th>Season/Week</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>{r.value}</td>
                    <td>{r.holder}</td>
                    <td>{r.when || "-"}</td>
                    <td>{r.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Awards">
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div style={styles.err}>Error: {err}</div>
        ) : awards.length === 0 ? (
          <div>No awards yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Award</th>
                  <th>Recipient</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((a, i) => (
                  <tr key={i}>
                    <td>{a.year}</td>
                    <td>{a.title}</td>
                    <td>{a.recipient}</td>
                    <td>{a.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

/* styles */
const styles = {
  page: {
    maxWidth: 1000,
    margin: "20px auto",
    padding: "0 16px 40px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#111827",
  },
  err: { color: "#b91c1c", whiteSpace: "pre-wrap" },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  },
  champCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
  },
  champYear: { fontWeight: 800, fontSize: 22, marginBottom: 6 },
  champTeam: { fontWeight: 700, fontSize: 16 },
  champMeta: { color: "#6b7280", fontSize: 13, marginTop: 4 },
  table: { width: "100%", borderCollapse: "collapse" },
};
