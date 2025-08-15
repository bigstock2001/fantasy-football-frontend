// pages/stats.js
import React, { useEffect, useMemo, useState } from "react";
import Section from "../components/Section";
import { apiGet } from "../lib/api";

const LEAGUE_ID = "61408";

/** helpers */
function safeNum(n, def = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : def;
}
function parseStreak(s) {
  // "W3" -> {type:"W", len:3}, "L2" -> {type:"L", len:2}
  if (typeof s !== "string" || !s.length) return { type: "", len: 0 };
  const m = s.match(/^([WL])(\d+)/i);
  return m ? { type: m[1].toUpperCase(), len: Number(m[2]) } : { type: "", len: 0 };
}
function recordTuple(t) {
  // sort: wins desc, ties desc, losses asc, then PF desc
  return [
    -safeNum(t.wins),           // fewer negative -> more wins
    -safeNum(t.ties),
    safeNum(t.losses),
    -safeNum(t.pointsFor),
  ];
}

export default function StatsPage() {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/standings?leagueId=${LEAGUE_ID}`);
        setStandings(Array.isArray(data) ? data : []);
        setErr("");
      } catch (e) {
        setErr(e?.message || "Failed to load standings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const leaders = useMemo(() => {
    const rows = Array.isArray(standings) ? standings.slice() : [];

    // Best records (top 5)
    const bestRecords = rows
      .slice()
      .sort((a, b) => {
        const A = recordTuple(a);
        const B = recordTuple(b);
        for (let i = 0; i < A.length; i++) {
          if (A[i] !== B[i]) return A[i] - B[i];
        }
        return 0;
      })
      .slice(0, 5);

    // Most Points For (top 5)
    const mostPF = rows
      .slice()
      .sort((a, b) => safeNum(b.pointsFor) - safeNum(a.pointsFor))
      .slice(0, 5);

    // Fewest Points Against (top 5)
    const fewestPA = rows
      .slice()
      .sort((a, b) => safeNum(a.pointsAgainst) - safeNum(b.pointsAgainst))
      .slice(0, 5);

    // Longest current win streaks (top 5, W only)
    const winStreaks = rows
      .map((t) => ({ ...t, _streak: parseStreak(t.streak) }))
      .filter((t) => t._streak.type === "W")
      .sort((a, b) => b._streak.len - a._streak.len || safeNum(b.wins) - safeNum(a.wins))
      .slice(0, 5);

    return { bestRecords, mostPF, fewestPA, winStreaks };
  }, [standings]);

  return (
    <div style={styles.page}>
      <Section title="League Stats Overview">
        {loading ? (
          <div>Loading…</div>
        ) : err ? (
          <div style={styles.err}>Error: {err}</div>
        ) : !Array.isArray(standings) || standings.length === 0 ? (
          <div>No standings yet.</div>
        ) : (
          <div style={styles.grid}>
            <StatsTable title="Best Records" rows={leaders.bestRecords} cols={["Team", "Record", "PF", "PA", "Streak"]} render={(t) => [
              t.teamName || t.name,
              `${safeNum(t.wins)}-${safeNum(t.losses)}${safeNum(t.ties) ? `-${safeNum(t.ties)}` : ""}`,
              safeNum(t.pointsFor).toFixed(1),
              safeNum(t.pointsAgainst).toFixed(1),
              t.streak ?? "-",
            ]} />

            <StatsTable title="Most Points For" rows={leaders.mostPF} cols={["Team", "PF", "Record"]} render={(t) => [
              t.teamName || t.name,
              safeNum(t.pointsFor).toFixed(1),
              `${safeNum(t.wins)}-${safeNum(t.losses)}${safeNum(t.ties) ? `-${safeNum(t.ties)}` : ""}`,
            ]} />

            <StatsTable title="Fewest Points Against" rows={leaders.fewestPA} cols={["Team", "PA", "Record"]} render={(t) => [
              t.teamName || t.name,
              safeNum(t.pointsAgainst).toFixed(1),
              `${safeNum(t.wins)}-${safeNum(t.losses)}${safeNum(t.ties) ? `-${safeNum(t.ties)}` : ""}`,
            ]} />

            <StatsTable title="Longest Win Streaks" rows={leaders.winStreaks} cols={["Team", "Streak", "Record"]} render={(t) => [
              t.teamName || t.name,
              t.streak ?? "-",
              `${safeNum(t.wins)}-${safeNum(t.losses)}${safeNum(t.ties) ? `-${safeNum(t.ties)}` : ""}`,
            ]} />
          </div>
        )}
      </Section>
    </div>
  );
}

function StatsTable({ title, rows, cols, render }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              {cols.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.teamId || t.id || (t.teamName || t.name) || i}>
                <td>{i + 1}</td>
                {render(t).map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  err: { color: "#b91c1c" },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gap: 10,
  },
  cardHead: { fontWeight: 700, fontSize: 16 },
  table: { width: "100%", borderCollapse: "collapse" },
};
