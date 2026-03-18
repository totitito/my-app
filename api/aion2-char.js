export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const race = Number(serverid) >= 2000 ? 2 : 1;

    const searchUrl = `https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character?keyword=${encodeURIComponent(name)}&serverId=${serverid}&page=1&size=30`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json",
        "referer": "https://aion2.plaync.com/",
      },
    });
    const searchJson = await searchRes.json();

    const characterId = searchJson?.list?.[0]?.characterId;
    const decodedId = decodeURIComponent(characterId);
    
    if (!characterId) {
      return res.status(404).json({ error: "캐릭터 못찾음" });
    }

    const infoUrl = `https://aion2.plaync.com/api/character/info?lang=ko&characterId=${encodeURIComponent(decodedId)}&serverId=${serverid}`;

    const infoRes = await fetch(infoUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json",
        "referer": "https://aion2.plaync.com/",
      },
    });
    const data = await infoRes.json();

    const profile = data?.profile ?? {};
    const stats = data?.statList ?? [];

    const itemLevel = stats.find(s => s.name === "아이템레벨")?.value ?? null;
    const combatPower = profile.combatPower ?? null;

    return res.status(200).json({
      name: profile.characterName ?? name,
      job: profile.className ?? null,
      level: profile.characterLevel ?? null,
      combat_power: combatPower,
      item_level: itemLevel,
      gear: {},
      arcana: {}
    });
    
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
