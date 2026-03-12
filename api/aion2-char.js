export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

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
        race: 1,
        raceId: 1,
        page: 1,
        limit: 20,
      }),
    });

    const text = await r.text();

    if (!text.trimStart().startsWith("{") && !text.trimStart().startsWith("[")) {
      return res.status(502).json({
        error: "외부 API가 JSON을 반환하지 않음",
        httpStatus: r.status,
        preview: text.slice(0, 300),
      });
    }

    const parsed = JSON.parse(text);

    // data가 객체 (캐릭터 직접)
    const char = parsed?.data;
    if (!char || typeof char !== "object" || Array.isArray(char)) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    }

    const items = char.accessories ?? [];

    const SLOT_MAP = {
      Weapon:    "weapon",
      Gauntlet:  "gauntlet",
      Helm:      "head",
      Shoulder:  "shoulder",
      Chest:     "chest",
      Pants:     "legs",
      Gloves:    "hands",
      Boots:     "feet",
      Cloak:     "cloak",
      Necklace:  "necklace",
      Earring:   "earring1",
      Ring:      "ring1",
    };

    const ARCANA_MAP = {
      "성배": "성배", "양피지": "양피지", "나침반": "나침반",
      "종": "종", "거울": "거울", "천칭": "천칭",
    };

    const gear = {
      weapon: [], gauntlet: [],
      head: [], shoulder: [], chest: [], legs: [], hands: [], feet: [], cloak: [],
      necklace: [], earring1: [], earring2: [], ring1: [], ring2: [],
    };

    const arcana = {
      성배: [], 양피지: [], 나침반: [], 종: [], 거울: [], 천칭: [],
    };

    const earringFilled = { earring1: false, earring2: false };
    const ringFilled    = { ring1: false, ring2: false };

    for (const item of items) {
      const subs = item.sub_skills ?? [];
      if (subs.length === 0) continue;

      const skills = subs
        .filter(s => s?.name)
        .map(s => ({ skillName: s.name, level: Number(s.level ?? 1) }));

      if (!item.is_accessory) {
        const arcanaKey = ARCANA_MAP[item.category_name];
        if (arcanaKey) arcana[arcanaKey].push(...skills);
        continue;
      }

      const posName = item.raw_data?.slotPosName ?? "";

      if (posName === "Earring") {
        const slot = !earringFilled.earring1 ? "earring1" : "earring2";
        earringFilled[slot] = true;
        gear[slot].push(...skills);
      } else if (posName === "Ring") {
        const slot = !ringFilled.ring1 ? "ring1" : "ring2";
        ringFilled[slot] = true;
        gear[slot].push(...skills);
      } else {
        const slotId = SLOT_MAP[posName];
        if (slotId && gear[slotId]) gear[slotId].push(...skills);
      }
    }

    return res.status(200).json({
      name: char.nickname ?? char.name ?? name,
      job: char.job ?? null,
      level: char.level ?? null,
      gear,
      arcana,
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
