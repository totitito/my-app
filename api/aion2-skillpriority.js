// ./api/aion2-skillpriority.js

export default async function handler(req, res) {
  try {
    const job = (req.query.job || "").trim();
    if (!job) return res.status(400).json({ success: false, error: "job required" });

    const url = `https://www.aion2tool.com/api/skill-priorities?job=${encodeURIComponent(job)}`;

    const r = await fetch(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        // Cloudflare/정책에 따라 referer가 필요할 수도 있어서 넣어둠
        referer: "https://www.aion2tool.com/statistics/skill",
        "user-agent": req.headers["user-agent"] || "Mozilla/5.0",
      },
    });

    const text = await r.text();

    // aion2tool이 JSON이 아닌 HTML(차단 페이지)을 줄 수도 있어서 방어
    if (!r.ok) {
      return res.status(r.status).json({
        success: false,
        error: `upstream error ${r.status}`,
        raw: text.slice(0, 500),
      });
    }

    // JSON 파싱
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e) });
  }
}