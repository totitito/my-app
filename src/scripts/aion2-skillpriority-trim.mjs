import fs from "fs";
import { CLASS_SKILLS } from "../data/aion2-SkillList.js";

const raw = JSON.parse(
  fs.readFileSync("./src/data/aion2-skillpriority.json", "utf8")
);

const slim = {
  updatedAt: raw.updatedAt,
  jobs: {},
};

for (const job of Object.keys(raw.jobs)) {
  const skillSet = new Set([
    ...(CLASS_SKILLS[job]?.stigma ?? []),
    ...(CLASS_SKILLS[job]?.성배 ?? []),
    ...(CLASS_SKILLS[job]?.양피지 ?? []),
    ...(CLASS_SKILLS[job]?.나침반 ?? []),
    ...(CLASS_SKILLS[job]?.종 ?? []),
    ...(CLASS_SKILLS[job]?.거울 ?? []),
    ...(CLASS_SKILLS[job]?.천칭 ?? []),
  ]);

  const src = raw.jobs[job];

  slim.jobs[job] = {
    ...src,
    data: {
      ...src.data,
      active: (src.data?.active ?? []).filter(x => skillSet.has(x.skill_name)),
      passive: (src.data?.passive ?? []).filter(x => skillSet.has(x.skill_name)),
      stigma: (src.data?.stigma ?? []).filter(x => skillSet.has(x.skill_name)),
    },
  };
}

fs.writeFileSync(
  "./src/data/aion2-skillpriority-trimmed.json",
  JSON.stringify(slim, null, 2),
  "utf8"
);

console.log("saved: ./src/data/aion2-skillpriority-trimmed.json");