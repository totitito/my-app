// 아툴 스킬 페이지 F12 Console에 입력 후 결과 문자열 ./data/aion2-skillpriority.json 에 붙이기
(async () => {
  const jobs = ["검성","수호성","살성","궁성","마도성","정령성","치유성","호법성"];

  const sourceUpdatedAt = document
    .querySelector("#skill-stats-last-update")
    ?.textContent.replace("마지막 업데이트:", "")
    .trim();

  const out = {
    fetchedAt: new Date().toISOString(),
    sourceUpdatedAt,
    jobs: {}
  };

  for (const job of jobs) {
    const url = `/api/skill-priorities?job=${encodeURIComponent(job)}`;
    const r = await fetch(url, { credentials: "include" });

    if (!r.ok) {
      const t = await r.text();
      console.error(`[FAIL] ${job}: ${r.status}`, t.slice(0, 200));
      continue;
    }

    const data = await r.json();

    const allowed = new Set(
      (window.CLASS_SKILLS?.[job]?.stigma ?? [])
    );

    data.rows = data.rows?.filter(s => allowed.has(s.skill_name));

    out.jobs[job] = data;
    console.log("[OK]", job);
  }

  console.log(JSON.stringify(out, null, 2));
})();