export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";
    const debug = req.query.debug === "1";

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
      return res.status(502).json({ error: "외부 API가 JSON을 반환하지 않음", httpStatus: r.status, preview: text.slice(0, 300) });
    }

    const parsed = JSON.parse(text);
    const char = parsed?.data;
    if (!char || typeof char !== "object" || Array.isArray(char)) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    }

    const accessories = char.accessories ?? [];

    // 아르카나는 char 안의 별도 키로 존재할 수 있음 — 디버그로 확인
    if (debug) {
      const arcanaCandidate = char.arcanas ?? char.arcana ?? char.arcana_list ?? null;
      return res.status(200).json({
        charKeys: Object.keys(char),
        accessorySlots: accessories.map(item => ({
          name: item.name,
          category_name: item.category_name,
          is_accessory: item.is_accessory,
          slotPosName: item.raw_data?.slotPosName,
          skillCount: item.sub_skills?.length ?? 0,
        })),
        arcanaCandidate: arcanaCandidate
          ? (Array.isArray(arcanaCandidate)
              ? arcanaCandidate.map(a => ({ name: a.name, category_name: a.category_name, slotPosName: a.raw_data?.slotPosName, skillCount: a.sub_skills?.length ?? 0 }))
              : arcanaCandidate)
          : "없음 — charKeys 확인 필요",
      });
    }

    // slotPosName → gear 슬롯 ID 매핑
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
      Chest:     "chest",
      Pants:     "legs",
      Gloves:    "hands",
      Boots:     "feet",
      Cloak:     "cloak",
    };

    // 아르카나: slotPosName Arcana1~6 → 성배/양피지/나침반/종/거울/천칭
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

    // accessories 배열에 악세서리 + 아르카나가 함께 있을 수 있음
    const allItems = [
      ...accessories,
      ...(char.arcanas ?? char.arcana ?? char.arcana_list ?? []),
    ];

    for (const item of allItems) {
      const subs = item.sub_skills ?? [];
      if (subs.length === 0) continue;

      const skills = subs
        .filter(s => s?.name)
        .map(s => ({ skillName: s.name, level: Number(s.level ?? 1) }));

      const posName = item.raw_data?.slotPosName ?? "";

      // 아르카나 슬롯
      if (ARCANA_SLOT_MAP[posName]) {
        arcana[ARCANA_SLOT_MAP[posName]].push(...skills);
        continue;
      }

      // 일반 장비 슬롯
      const slotId = SLOT_MAP[posName];
      if (slotId && gear[slotId]) {
        gear[slotId].push(...skills);
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
