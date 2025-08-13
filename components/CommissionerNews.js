// components/CommissionerNews.js
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function CommissionerNews() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const posts = await apiGet(
          "/wp-json/wp/v2/posts?per_page=5&_fields=id,title,link,date"
        );
        setItems(
          posts.map(p => ({
            id: p.id,
            title: p.title?.rendered ?? "Untitled",
            link: p.link,
            date: new Date(p.date).toLocaleDateString(),
          }))
        );
      } catch (e) {
        setErr(e);
      }
    })();
  }, []);

  if (err?.message?.includes("HTTP 404")) return <div>Not configured yet.</div>;
  if (!items) return <div>Loading…</div>;

  return (
    <ul>
      {items.map(i => (
        <li key={i.id}>
          <a href={i.link} target="_blank" rel="noreferrer">{i.title}</a> — {i.date}
        </li>
      ))}
    </ul>
  );
}
