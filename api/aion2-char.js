export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
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
    const found = (searchJson?.list ?? []).find((x) => x?.characterName === name) ?? searchJson?.list?.[0] ?? null;
    const characterId = found?.characterId;

    if (!characterId) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    }

    const decodedId = decodeURIComponent(characterId);    

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

      const equipmentUrl = `https://aion2.plaync.com/api/character/equipment?lang=ko&characterId=${encodeURIComponent(decodedId)}&serverId=${serverid}`;

      const equipmentRes = await fetch(equipmentUrl, {
        headers: {
          "user-agent": "Mozilla/5.0",
          "accept": "application/json",
          "referer": "https://aion2.plaync.com/",
        },
      });

      const equipmentJson = await equipmentRes.json();
      const equippedItems = equipmentJson?.equipment?.equipmentList ?? [];

      const officialSlotMap = {
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

      const itemDetails = await Promise.all(
        equippedItems.map(async (eq) => {
          const itemUrl =
            `https://aion2.plaync.com/api/character/equipment/item` +
            `?id=${eq.id}` +
            `&enchantLevel=${eq.enchantLevel ?? 0}` +
            `&characterId=${encodeURIComponent(decodedId)}` +
            `&serverId=${serverid}` +
            `&slotPos=${eq.slotPos}` +
            `&lang=ko`;

          const itemRes = await fetch(itemUrl, {
            headers: {
              "user-agent": "Mozilla/5.0",
              "accept": "application/json",
              "referer": "https://aion2.plaync.com/",
            },
          });

          const itemJson = await itemRes.json();
          return { eq, itemJson };
        })
      );

      for (const { eq, itemJson } of itemDetails) {
        const skills = (itemJson?.subSkills ?? [])
          .filter((s) => s?.name)
          .map((s) => ({
            skillName: s.name,
            level: Number(s.level ?? 1),
          }));

        if (skills.length === 0) continue;

        const posName = eq?.slotPosName ?? "";

        if (ARCANA_SLOT_MAP[posName]) {
          arcana[ARCANA_SLOT_MAP[posName]].push(...skills);
          continue;
        }

        const slotId = officialSlotMap[posName];
        if (slotId && gear[slotId]) {
          gear[slotId].push(...skills);
        }
      }

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
