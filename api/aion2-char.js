export default async function handler(req, res) {
  try {
    const name = req.query.name;
    const serverid = req.query.serverid ?? "1016";

    if (!name) {
      return res.status(400).json({ error: "name required" });
    }

    const url =
      `https://aion2tool.com/api/character/search-all-servers?name=` +
      encodeURIComponent(name);

    const r = await fetch(url);
    const data = await r.json();

    const accessories = data?.data?.accessories ?? [];

    const skills = [];

    accessories.forEach(acc => {
      const subs = acc?.sub_skills ?? [];
      subs.forEach(s => {
        if (s?.name && s?.level) {
          skills.push(`${s.name} +${s.level}`);
        }
      });
    });

    return res.status(200).json({ skills });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}