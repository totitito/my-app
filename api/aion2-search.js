export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { keyword, server_id } = req.body ?? {};
    const kw = String(keyword ?? "").trim();
    const sid = Number(server_id);

    if (!kw || !Number.isFinite(sid)) {
      return res.status(400).json({ error: "keyword/server_id invalid" });
    }

    const url = "https://aion2tool.com/api/character/search";
    const race = sid >= 2000 ? 2 : 1;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "origin": "https://aion2tool.com",
        "referer": "https://aion2tool.com/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      body: JSON.stringify({
        keyword: kw,
        server_id: sid,
        serverId: sid,
        race: race,
        raceId: race,
        page: 1,
        limit: 20,
      }),
    });

    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({
        error: `HTTP ${r.status}`,
        preview: text.slice(0, 200),
      });
    }

    if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
      return res.status(502).json({
        error: "외부 API가 JSON을 반환하지 않음",
        httpStatus: r.status,
        preview: text.slice(0, 200),
      });
    }

    const obj = JSON.parse(text);
    const data = obj?.data?.result ?? obj?.data ?? obj?.result ?? obj;

    return res.status(200).json({
      combat_power: data?.combat_power ?? null,
      combat_power2: data?.combat_power2 ?? null,
      combat_score: data?.combat_score ?? null,
      combat_score_max: data?.combat_score_max ?? null,
      character_id: data?.character_id ?? null,
      level: data?.level ?? null,
      job: data?.job ?? null,
      avatar_url: data?.avatar_url ?? null,
      raw: data ?? null,
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
}