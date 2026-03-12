export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const url = "https://aion2tool.com/api/character/search";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "origin": "https://aion2tool.com",
        "referer": "https://aion2tool.com/",
      },
      body: JSON.stringify({
        keyword: name,
        server_id: Number(serverid),
        serverId: Number(serverid),
        race: 1,
        raceId: 1,
        page: 1,
        limit: 20,
      }),
    });

    const text = await r.text();
    return res.status(200).send(text.slice(0, 2000));

    const accessories = data?.data?.[0]?.accessories ?? [];

    const skills = [];

    accessories.forEach(acc => {
      const subs = acc?.sub_skills ?? [];
      subs.forEach(s => {
        if (s?.name && s?.level) {
          skills.push(`${s.name} +${s.level}`);
        }
      });
    });

    return res.status(200).json({ skills });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}