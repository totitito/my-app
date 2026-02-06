export default async function handler(req, res) {
  try {
    const name = (req.query.name || "").trim();
    if (!name) return res.status(400).json({ error: "name required" });

    const jwt = process.env.LOA_JWT;
    if (!jwt) return res.status(500).json({ error: "Missing LOA_JWT env" });

    const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(name)}/profiles`;

    const r = await fetch(url, {
      headers: {
        accept: "application/json",
        authorization: `bearer ${jwt}`,
      },
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: "LOA API error", raw: text });

    const data = JSON.parse(text);

    // 필요한 값만 얇게 내려주기
    res.status(200).json({
      CharacterName: data.CharacterName,
      ServerName: data.ServerName,
      ItemAvgLevel: data.ItemAvgLevel,
      CombatPower: data.CombatPower,
      raw: data,
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}