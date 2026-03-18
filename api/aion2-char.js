export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const race = Number(serverid) >= 2000 ? 2 : 1;

    const r = await fetch("https://aion2tool.com/api/character/search", {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "origin": "https://aion2tool.com",
        "referer": "https://aion2tool.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },

      body: JSON.stringify({
        keyword: name,
        server_id: Number(serverid),
        serverId: Number(serverid),
        race: race,
        raceId: race,
        page: 1,
        limit: 20,
      })
    });

    const text = await r.text();
    if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
      return res.status(502).json({ error: "외부 API가 JSON을 반환하지 않음", httpStatus: r.status, preview: text.slice(0, 300) });
    }

    const parsed = JSON.parse(text);
    const char = parsed?.data;
    if (!char || typeof char !== "object" || Array.isArray(char)) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    }

    // equipment: 일반 장비 + 아르카나
    // accessories: 귀걸이/반지/목걸이 등 악세서리
    // 둘 다 합쳐서 처리
    const items = [
      ...(char.equipment ?? []),
      ...(char.accessories ?? []),
    ];

    const SLOT_MAP = {
      Necklace:  "necklace",
      Earring1:  "earring1",
      Earring2:  "earring2",
      Ring1:     "ring1",
      Ring2:     "ring2",
      Weapon:    "weapon",
      Gauntlet:  "gauntlet",
      Helm:      "head",
      Shoulder:  "shoulder",
      Torso:     "chest",
      Pants:     "legs",
      Gloves:    "hands",
      Boots:     "feet",
      Cape:      "cloak",
    };

    const ARCANA_SLOT_MAP = {
      Arcana1: "성배",
      Arcana2: "양피지",
      Arcana3: "나침반",
      Arcana4: "종",
      Arcana5: "거울",
      Arcana6: "천칭",
    };

    const gear = {
      weapon: [], gauntlet: [],
      head: [], shoulder: [], chest: [], legs: [], hands: [], feet: [], cloak: [],
      necklace: [], earring1: [], earring2: [], ring1: [], ring2: [],
    };

    const arcana = {
      성배: [], 양피지: [], 나침반: [], 종: [], 거울: [], 천칭: [],
    };

    for (const item of items) {
      const subs = item.sub_skills ?? [];
      if (subs.length === 0) continue;

      const skills = subs
        .filter(s => s?.name)
        .map(s => ({ skillName: s.name, level: Number(s.level ?? 1) }));

      const posName = item.raw_data?.slotPosName ?? "";

      if (ARCANA_SLOT_MAP[posName]) {
        arcana[ARCANA_SLOT_MAP[posName]].push(...skills);
        continue;
      }

      const slotId = SLOT_MAP[posName];
      if (slotId && gear[slotId]) {
        gear[slotId].push(...skills);
      }
    }

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

    let officialJob = null;
    let officialLevel = null;
    let officialItemLevel = null;
    let officialCombatPower = null;
    let officialAvatarUrl = null;

    if (characterId) {
      const decodedId = decodeURIComponent(characterId);

      const infoUrl = `https://aion2.plaync.com/api/character/info?lang=ko&characterId=${encodeURIComponent(decodedId)}&serverId=${serverid}`;

      const infoRes = await fetch(infoUrl, {
        headers: {
          "user-agent": "Mozilla/5.0",
          "accept": "application/json",
          "referer": "https://aion2.plaync.com/",
        },
      });

      const infoJson = await infoRes.json();
      const profile = infoJson?.profile ?? {};
      const stats = infoJson?.stat?.statList ?? [];

      officialJob = profile?.className ?? null;
      officialLevel = profile?.characterLevel ?? null;
      officialCombatPower = profile?.combatPower ?? null;
      officialAvatarUrl = profile?.profileImage ?? null;
      officialItemLevel =
        stats.find((s) => s?.type === "ItemLevel" || s?.name === "아이템레벨")?.value ?? null;
    }

    return res.status(200).json({
      name: char.nickname ?? char.name ?? name,
      job: officialJob ?? char.job ?? null,
      level: officialLevel ?? char.level ?? null,
      item_level: officialItemLevel,
      combat_power: officialCombatPower,
      avatar_url: officialAvatarUrl,
      gear,
      arcana,
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
