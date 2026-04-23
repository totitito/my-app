export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = Number(req.query.serverid ?? "1016");

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const race = serverid >= 2000 ? 2 : 1;

    const r = await fetch("https://aion2tool.com/api/character/search", {
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
        keyword: String(name).trim(),
        server_id: serverid,
        serverId: serverid,
        race,
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
        preview: text.slice(0, 200),
      });
    }

    const obj = JSON.parse(text);
    const data = obj?.data?.result ?? obj?.data ?? obj?.result ?? obj;

    const SLOT_MAP = {
      MainHand: "weapon",
      SubHand: "gauntlet",
      Helmet: "head",
      Shoulder: "shoulder",
      Torso: "chest",
      Pants: "legs",
      Gloves: "hands",
      Boots: "feet",
      Cape: "cloak",
      Necklace: "necklace",
      Earring1: "earring1",
      Earring2: "earring2",
      Ring1: "ring1",
      Ring2: "ring2",
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
      weapon: [],
      gauntlet: [],
      head: [],
      shoulder: [],
      chest: [],
      legs: [],
      hands: [],
      feet: [],
      cloak: [],
      necklace: [],
      earring1: [],
      earring2: [],
      ring1: [],
      ring2: [],
    };

    const arcana = {
      성배: [],
      양피지: [],
      나침반: [],
      종: [],
      거울: [],
      천칭: [],
    };

    const equipmentList = data?.equipment ?? [];

    for (const item of equipmentList) {
      const skills = (item?.sub_skills ?? [])
        .filter((s) => s?.name)
        .map((s) => ({
          skillName: s.name,
          level: Number(s.level ?? 1),
        }));

      if (skills.length === 0) continue;

      const posName =
        item?.slot_pos_name ??
        item?.raw_data?.slotPosName ??
        "";

      if (ARCANA_SLOT_MAP[posName]) {
        arcana[ARCANA_SLOT_MAP[posName]].push(...skills);
        continue;
      }

      const slotId = SLOT_MAP[posName];
      if (slotId && gear[slotId]) {
        gear[slotId].push(...skills);
      }
    }

    return res.status(200).json({
      name,
      job: data?.job ?? null,
      level: data?.level ?? null,
      item_level: data?.combat_power ?? null,
      combat_power: data?.combat_power2 ?? null,
      avatar_url: data?.avatar_url ?? null,
      gear,
      arcana,
      raw: data ?? null,
    });
  } catch (e) {
    return res.status(500).json({
      error: String(e?.message ?? e),
    });
  }
}