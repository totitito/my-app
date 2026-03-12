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

    // data 구조 디버그용 — 확인 후 제거 예정
    const topLevelKeys = Object.keys(parsed ?? {});
    const dataVal = parsed?.data;
    const dataType = Array.isArray(dataVal) ? "array" : typeof dataVal;
    const dataKeys = dataType === "object" && dataVal ? Object.keys(dataVal) : null;
    const dataLen  = dataType === "array" ? dataVal.length : null;

    return res.status(200).json({
      _debug: true,
      topLevelKeys,
      dataType,
      dataKeys,
      dataLen,
      // data 안에 result가 있으면 그 첫 번째 항목 키도 확인
      resultKeys: Array.isArray(dataVal?.result) && dataVal.result[0]
        ? Object.keys(dataVal.result[0])
        : Array.isArray(dataVal) && dataVal[0]
          ? Object.keys(dataVal[0])
          : null,
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
