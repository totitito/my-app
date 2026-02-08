export default async function handler(req, res) {
  try {
    const name = (req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name required" });

    const jwt = process.env.LOA_JWT;
    if (!jwt) return res.status(500).json({ error: "Missing LOA_JWT env" });

    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(name)}/profiles`;

    const r = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${jwt}`, // ✅ 핵심
      },
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: "LOA API error", raw: text });

    const data = JSON.parse(text);

    res.status(200).json({
      CharacterName: data.CharacterName,
      CharacterClassName: data.CharacterClassName,
      ServerName: data.ServerName,
      CharacterLevel: data.CharacterLevel ?? null,
      ItemMaxLevel: data.ItemMaxLevel ?? data.ItemAvgLevel ?? null,
      CombatPower:
        data.CombatPower ??
        (Array.isArray(data.Stats) ? data.Stats.find(s => s.Type === "전투력")?.Value : null) ??
        null,
      raw: data,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}