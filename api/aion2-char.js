export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { keyword, server_id } = req.body ?? {};
    const kw = String(keyword ?? "").trim();
    const sid = Number(server_id);

    if (!kw || !Number.isFinite(sid)) {
      return res.status(400).json({ error: "keyword/server_id invalid" });
    }

    const searchUrl =
      `https://aion2.plaync.com/ko-kr/api/search/aion2/search/v2/character` +
      `?keyword=${encodeURIComponent(kw)}` +
      `&serverId=${sid}&page=1&size=30`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json",
        "referer": "https://aion2.plaync.com/",
      },
    });

    const searchJson = await searchRes.json();
    const found =
      (searchJson?.list ?? []).find((x) => x?.characterName === kw) ??
      searchJson?.list?.[0] ??
      null;

    if (!found?.characterId) {
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    }

    const characterId = decodeURIComponent(found.characterId);

    const infoUrl =
      `https://aion2.plaync.com/api/character/info` +
      `?lang=ko&characterId=${encodeURIComponent(characterId)}&serverId=${sid}`;

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
    const itemLevel =
      stats.find((s) => s?.type === "ItemLevel" || s?.name === "아이템레벨")?.value ?? null;

    return res.status(200).json({
      combat_power: profile?.combatPower ?? null,
      combat_score: null,
      combat_score_max: null,
      character_id: characterId,
      level: profile?.characterLevel ?? null,
      job: profile?.className ?? null,
      avatar_url: profile?.profileImage ?? null,
      item_level: itemLevel,
      raw: found,
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
}