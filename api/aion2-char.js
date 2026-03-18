export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    // 1. 공홈 API — iLv, CP, level, job
    const searchUrl = `https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character?keyword=${encodeURIComponent(name)}&serverId=${serverid}&page=1&size=30`;
    const searchRes = await fetch(searchUrl, {
      headers: { "user-agent": "Mozilla/5.0", "accept": "application/json", "referer": "https://aion2.plaync.com/" },
    });
    const searchJson = await searchRes.json();
    const characterId = searchJson?.list?.[0]?.characterId;
    if (!characterId) return res.status(404).json({ error: "캐릭터 못찾음" });

    const decodedId = decodeURIComponent(characterId);
    const infoUrl = `https://aion2.plaync.com/api/character/info?lang=ko&characterId=${encodeURIComponent(decodedId)}&serverId=${serverid}`;
    const infoRes = await fetch(infoUrl, {
      headers: { "user-agent": "Mozilla/5.0", "accept": "application/json", "referer": "https://aion2.plaync.com/" },
    });
    const data = await infoRes.json();

    const profile = data?.profile ?? {};
    const stats = data?.stat?.statList ?? [];
    const itemLevel = stats.find(s => s.name === "아이템레벨")?.value ?? null;
    const combatPower = profile.combatPower ?? null;

    // 2. 아툴 API — atoolScore만
    let atoolScore = null;
    try {
      const race = Number(serverid) >= 2000 ? 2 : 1;
      const atoolRes = await fetch(
        `https://aion2tool.com/api/character/search`,
        {
          method: "POST",
          headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
            "origin": "https://aion2tool.com",
            "referer": "https://aion2tool.com/",
            "user-agent": "Mozilla/5.0",
          },
          body: JSON.stringify({
            keyword: name,
            server_id: Number(serverid),
            serverId: Number(serverid),
            race,
            raceId: race,
            page: 1,
            limit: 20,
          }),
        }
      );
      const atoolText = await atoolRes.text();
      console.log("아툴 raw 응답:", atoolText.slice(0, 500));
      const atoolJson = JSON.parse(atoolText);
      atoolScore = atoolJson?.data?.combat_score ?? null;
      console.log("atoolScore:", atoolScore);
    } catch (e) {
      console.error("아툴 fetch 실패:", e);
    }

    return res.status(200).json({
      name: profile.characterName ?? name,
      job: profile.className ?? null,
      level: profile.characterLevel ?? null,
      combat_power: combatPower,
      item_level: itemLevel,
      atool_score: atoolScore,
      gear: {},
      arcana: {}
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}