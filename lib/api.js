export async function getJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(HTTP  );
  return res.json();
}
