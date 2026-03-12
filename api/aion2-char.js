export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  try {
    const name = String(req.query.name ?? "").trim();
    const serverid = String(req.query.serverid ?? "1016").trim();

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const url = `https://aion2tool.com/char/serverid=${encodeURIComponent(serverid)}/${encodeURIComponent(name)}`;

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });

    const html = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ error: "fetch failed" });
    }

    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(html);

  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
}