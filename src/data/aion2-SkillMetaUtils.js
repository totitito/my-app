// src/data/skillColorUtils.js -> skillMetaUtils.js
// 아툴 스킬 우선순위 데이터 기반 자동 색상 매핑 유틸리티

import SKILL_PRIORITY_RAW from "./aion2-skillpriority.json";

/**
 * 색상 정의
 *
 * active  (액티브): 빨간 계열
 *   tier 1 (priority 1~3)  : #e53935  밝은 빨강
 *   tier 2 (priority 4~5)  : #b71c1c  중간 빨강
 *   tier 3 (priority 6~7)  : #7f0000  어두운 빨강
 *   tier 4 (priority 8+)   : null     (색상 없음)
 *
 * passive (패시브): 파란 계열
 *   tier 1 (priority 1~3)  : #1e88e5  밝은 파랑
 *   tier 2 (priority 4~5)  : #1565c0  중간 파랑
 *   tier 3 (priority 6~7)  : #0d3b7a  어두운 파랑
 *   tier 4 (priority 8+)   : null     (색상 없음)
 *
 * stigma  (각인): 보라 계열
 *   tier 1 (priority 1~3)  : #8e24aa  밝은 보라
 *   tier 2 (priority 4~5)  : #6a1b9a  중간 보라
 *   tier 3 (priority 6~7)  : #4a148c  어두운 보라
 *   tier 4 (priority 8+)   : null     (색상 없음)
 */

const TIER_COLORS = {
  active: {
    1: "#e53935",
    2: "#b71c1c",
    3: "#7f0000",
  },
  passive: {
    1: "#1e88e5",
    2: "#1565c0",
    3: "#0d3b7a",
  },
  stigma: {
    1: "#8e24aa",
    2: "#6a1b9a",
    3: "#4a148c",
  },
};

/**
 * priority → tier 변환
 * 1~3 → 1, 4~5 → 2, 6~7 → 3, 8+ → null
 */
function priorityToTier(priority) {
  if (priority <= 3) return 1;
  if (priority <= 5) return 2;
  if (priority <= 7) return 3;
  return null;
}

/**
 * 직업별 스킬 우선순위 조회 맵 빌드
 * { 직업명: { 스킬명: { type, priority, tier, color } } }
 */
const SKILL_MAP = {};

for (const [job, jobData] of Object.entries(SKILL_PRIORITY_RAW.jobs ?? SKILL_PRIORITY_RAW)) {
  SKILL_MAP[job] = {};
  const typeMap = jobData.data ?? jobData;
  for (const [skillType, skills] of Object.entries(typeMap)) {
    if (!Array.isArray(skills)) continue;
    for (const { skill_name, priority } of skills) {
      const tier = priorityToTier(priority);
      const color = tier ? (TIER_COLORS[skillType]?.[tier] ?? null) : null;
      // 같은 스킬명이 여러 타입에 있을 수 있으므로 타입별로 저장
      if (!SKILL_MAP[job][skill_name]) {
      SKILL_MAP[job][skill_name] = [];
      }
      SKILL_MAP[job][skill_name].push({ type: skillType, priority, tier, color });
    }
  }
}

/**
 * 스킬 색상 조회
 * @param {string} job        - 직업명 (예: "검성")
 * @param {string} skillName  - 스킬명 (예: "내려찍기")
 * @param {string} [skillType] - "active" | "passive" | "stigma" (없으면 첫 번째 매칭)
 * @returns {{ type, priority, tier, color } | null}
 */
export function getSkillMeta(job, skillName, skillType = null) {
  const jobMap = SKILL_MAP[job];
  if (!jobMap) return null;

  const entries = jobMap[skillName];
  if (!entries || entries.length === 0) return null;

  if (skillType) {
    return entries.find((e) => e.type === skillType) ?? null;
  }
  return entries[0];
}

/**
 * 스킬 배경색만 반환 (없으면 null)
 * @param {string} job
 * @param {string} skillName
 * @param {string} [skillType]
 * @returns {string | null}
 */
export function getSkillColor(job, skillName, skillType = null) {
  return getSkillMeta(job, skillName, skillType)?.color ?? null;
}

/**
 * ARCANA_SKILLS 스킬 목록에 color 정보를 자동으로 주입
 * @param {Object} arcanaSkills  - { 직업명: { 아르카나명: string[] | {name,type,tier}[] } }
 * @returns {Object}             - 동일 구조에 color 필드 추가
 */
export function injectSkillColors(arcanaSkills) {
  const result = {};

  for (const [job, arcanas] of Object.entries(arcanaSkills)) {
    result[job] = {};
    for (const [arcana, skills] of Object.entries(arcanas)) {
      result[job][arcana] = skills.map((skill) => {
        // 문자열이면 객체로 변환
        const skillObj = typeof skill === "string" ? { name: skill } : { ...skill };
        const info = getSkillMeta(job, skillObj.name, skillObj.type ?? null);
        return {
          ...skillObj,
          priority: info?.priority ?? null,
          tier: info?.tier ?? null,
          color: info?.color ?? null,
          skillType: info?.type ?? skillObj.type ?? null,
        };
      });
    }
  }

  return result;
}

export { TIER_COLORS, SKILL_MAP };