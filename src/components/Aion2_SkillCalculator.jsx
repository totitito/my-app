// src/components/Aion2_SkillCalculator.jsx
import { useState, useRef, useEffect } from "react";
import { ARCANA_SKILLS } from "../data/aion2-ArcanaSkillList";
import { getSkillMeta } from "../data/aion2-SkillMetaUtils";

const JOBS = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];
const ARCANAS = ["성배", "양피지", "나침반", "종", "거울", "천칭"];

const ARCANA_SKILL_INDEX = ARCANAS.reduce((acc, arcana) => {
  acc[arcana] = Object.values(ARCANA_SKILLS)
    .flatMap((job) => job[arcana] ?? [])
    .map((s) => (typeof s === "string" ? s : s.name));
  return acc;
}, {});

const ACTIVE_GEAR_SLOTS = [
  { id: "weapon", label: "무기", defaultOn: false },
  { id: "gauntlet", label: "가더", defaultOn: false },
  { id: "ring1", label: "반지1", defaultOn: false },
  { id: "ring2", label: "반지2", defaultOn: false },
];

const PASSIVE_GEAR_SLOTS = [
  { id: "head", label: "머리" },
  { id: "shoulder", label: "어깨" },
  { id: "chest", label: "가슴" },
  { id: "legs", label: "다리" },
  { id: "hands", label: "손" },
  { id: "feet", label: "발" },
  { id: "cloak", label: "망토" },
  { id: "necklace", label: "목걸이" },
  { id: "earring1", label: "귀걸이1" },
  { id: "earring2", label: "귀걸이2" },
];

const PRESET_GEAR_SLOTS = [
  { id: "weapon", label: "무기" },
  { id: "gauntlet", label: "가더" },
  { id: "head", label: "머리" },
  { id: "shoulder", label: "어깨" },
  { id: "chest", label: "가슴" },
  { id: "legs", label: "다리" },
  { id: "hands", label: "손" },
  { id: "feet", label: "발" },
  { id: "cloak", label: "망토" },
  { id: "necklace", label: "목걸이" },
  { id: "earring1", label: "귀걸이1" },
  { id: "earring2", label: "귀걸이2" },
  { id: "ring1", label: "반지1" },
  { id: "ring2", label: "반지2" },
];

const PRESET_ARCANA_SLOTS = [
  { id: "성배", label: "성배" },
  { id: "양피지", label: "양피지" },
  { id: "나침반", label: "나침반" },
  { id: "종", label: "종" },
  { id: "거울", label: "거울" },
  { id: "천칭", label: "천칭" },
];

const S = {
  bg: "#1a1a1a", surface: "#242424", surface2: "#2e2e2e",
  border: "#3a3a3a", text: "#e0e0e0", textDim: "#888",
  accent: "#5b9bd5", ok: "#4caf50", warn: "#f5a623", tip: "#5b9bd5",
};

const inputStyle = {
  width: "44px", backgroundColor: "#2e2e2e", color: "#e0e0e0",
  border: "1px solid #3a3a3a", borderRadius: "3px",
  padding: "3px 5px", fontSize: "12px",
  textAlign: "center",
};

function handleInputFocus(e) {
  e.target.select();
}

function handleInputKeyDown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    e.target.blur();
  }
}

const LS_KEY = "ghw-aion2-skill-calculator-v1";

function createSkillState(skillName, job) {
  const info = getSkillMeta(job, skillName);
  return {
    name: skillName,
    type: info?.type ?? null,
    priority: info?.priority ?? null,
    skillPoints: 10,
    devanion: 4,
    targetLevel: 20,
  };
}

function calcSkillLevel(skill, autoGearSlots = {}, autoArcanaLevels = {}) {
  const gear = Object.values(autoGearSlots).filter(Boolean).length;
  const arcana = Object.values(autoArcanaLevels).reduce((a, b) => a + b, 0);
  return skill.skillPoints + skill.devanion + gear + arcana;
}

function getAutoGearSlots(skill, equippedGear) {
  const result = {};

  for (const slot of PRESET_GEAR_SLOTS) {
    const entries = equippedGear?.[slot.id] ?? [];
    result[slot.id] = entries.some((entry) => entry.skillName === skill.name);
  }

  return result;
}

function getAutoArcanaLevels(skill, equippedArcana) {
  const result = {};

  for (const arcana of ARCANAS) {
    const entries = equippedArcana?.[arcana] ?? [];
    result[arcana] = entries
      .filter((entry) => entry.skillName === skill.name)
      .reduce((sum, entry) => sum + Number(entry.level || 0), 0);
  }

  return result;
}

function createPreset(job) {
  return {
    id: crypto.randomUUID(),
    name: "새 프리셋",
    job,
    skills: [],
    equippedGear: {
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
    },
    equippedArcana: {
      성배: [],
      양피지: [],
      나침반: [],
      종: [],
      거울: [],
      천칭: [],
    },
  };
}

// ─────────────────────────────────────────
// 커스텀 스킬 드롭다운
// ─────────────────────────────────────────
function SkillDropdown({ job, addedSkills, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

    const allSkills = [...new Set(
      Object.values(ARCANA_SKILLS[job] ?? {}).flat()
        .map((s) => typeof s === "string" ? s : s.name)
    )].filter((s) => !addedSkills.includes(s));

    const skillMeta = allSkills.map((name) => ({
      name,
      info: getSkillMeta(job, name)
    }));

    const activeSkills = skillMeta
      .filter((s) => s.info?.type === "active")
      .sort((a, b) => (a.info?.priority ?? 999) - (b.info?.priority ?? 999));

    const passiveSkills = skillMeta
      .filter((s) => s.info?.type === "passive")
      .sort((a, b) => (a.info?.priority ?? 999) - (b.info?.priority ?? 999));

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block", marginBottom: "14px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          backgroundColor: S.surface2, color: S.textDim,
          border: `1px solid ${S.border}`, borderRadius: "4px",
          padding: "7px 12px", fontSize: "13px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px",
        }}
      >
        + 스킬 추가
        <span style={{ fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 200,
          backgroundColor: S.surface, border: `1px solid ${S.border}`,
          borderRadius: "4px", marginTop: "2px",
          minWidth: "480px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          padding: "8px",
        }}>
          {allSkills.length === 0 && (
            <div style={{ padding: "10px", color: S.textDim, fontSize: "12px" }}>
              추가할 스킬 없음
            </div>
          )}

          {allSkills.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* 왼쪽: 액티브 */}
              <div>
                <div style={{
                  fontSize: "11px",
                  color: S.textDim,
                  marginBottom: "6px",
                  paddingBottom: "4px",
                  borderBottom: `1px solid ${S.border}`,
                }}>
                  ● 액티브 스킬
                </div>

                {activeSkills.length === 0 && (
                  <div style={{ padding: "8px 4px", color: S.textDim, fontSize: "12px" }}>
                    없음
                  </div>
                )}

                {activeSkills.map(({ name, info }) => {
                  return (
                    <div
                      key={name}
                      onClick={() => { onSelect(name); setOpen(false); }}
                      style={{
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderBottom: `1px solid ${S.border}`,
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = S.surface2}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <span style={{ color: "#ff4d4f", fontWeight: "500" }}>{name}</span>
                      {info && (
                        <span style={{ fontSize: "10px", color: S.textDim, marginLeft: "auto" }}>
                          {info.priority ? `${info.priority}위` : ""}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 오른쪽: 패시브 */}
              <div>
                <div style={{
                  fontSize: "11px",
                  color: S.textDim,
                  marginBottom: "6px",
                  paddingBottom: "4px",
                  borderBottom: `1px solid ${S.border}`,
                }}>
                  ● 패시브 스킬
                </div>

                {passiveSkills.length === 0 && (
                  <div style={{ padding: "8px 4px", color: S.textDim, fontSize: "12px" }}>
                    없음
                  </div>
                )}

                {passiveSkills.map(({ name, info }) => {
                  return (
                    <div
                      key={name}
                      onClick={() => { onSelect(name); setOpen(false); }}
                      style={{
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderBottom: `1px solid ${S.border}`,
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = S.surface2}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <span style={{ color: "#3b82f6", fontWeight: "500" }}>{name}</span>
                      {info && (
                        <span style={{ fontSize: "10px", color: S.textDim, marginLeft: "auto" }}>
                          {info.priority ? `${info.priority}위` : ""}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InlineSkillDropdown({
  job,
  mode = "all",
  value,
  placeholder = "스킬 선택",
  excludedSkills = [],
  allowedSkills = null,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const baseSkills = [...new Set(
    Object.values(ARCANA_SKILLS[job] ?? {}).flat()
      .map((s) => typeof s === "string" ? s : s.name)
  )];

  const allSkills = Array.isArray(allowedSkills) && allowedSkills.length > 0
    ? baseSkills.filter((s) => allowedSkills.includes(s))
    : baseSkills;

  const skillMeta = allSkills
    .map((name) => ({
      name,
      info: getSkillMeta(job, name),
    }))
    .filter((item) => item.info);

  const activeSkills = skillMeta
    .filter((item) => item.info?.type === "active")
    .sort((a, b) => (a.info?.priority ?? 999) - (b.info?.priority ?? 999));

  const passiveSkills = skillMeta
    .filter((item) => item.info?.type === "passive")
    .sort((a, b) => (a.info?.priority ?? 999) - (b.info?.priority ?? 999));

  function isDisabledSkill(name) {
    return name !== value && excludedSkills.includes(name);
  }

  const singleList =
    mode === "active" ? activeSkills :
    mode === "passive" ? passiveSkills :
    [];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedMeta =
    value
      ? skillMeta.find((item) => item.name === value)
      : null;

  const selectedColor =
    selectedMeta?.info?.type === "active"
      ? "#ff4d4f"
      : selectedMeta?.info?.type === "passive"
        ? "#3b82f6"
        : S.text;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          minWidth: "92px",
          backgroundColor: S.surface2,
          color: value ? selectedColor : S.textDim,
          border: `1px solid ${S.border}`,
          borderRadius: "3px",
          fontSize: "11px",
          textAlign: "center",
          padding: "0 8px",
          height: "22px",
          boxSizing: "border-box",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {value || placeholder}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 300,
            marginTop: "2px",
            backgroundColor: S.surface,
            border: `1px solid ${S.border}`,
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            padding: "8px",
            minWidth: mode === "all" ? "auto" : "180px",
          }}
        >
          {mode === "all" ? (
            (() => {
              const hasActive = activeSkills.length > 0;
              const hasPassive = passiveSkills.length > 0;
              const twoCols = hasActive && hasPassive;

              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: twoCols ? "1fr 1fr" : "1fr",
                    gap: "12px",
                    width: twoCols ? "520px" : "260px",
                  }}
                >
                  {hasActive && (
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: S.textDim,
                          marginBottom: "6px",
                          paddingBottom: "4px",
                          borderBottom: `1px solid ${S.border}`,
                        }}
                      >
                        ● 액티브
                      </div>

                      {activeSkills.map(({ name, info }) => (
                        <div
                          key={name}
                          onClick={() => {
                            if (isDisabledSkill(name)) return;
                            onSelect(name);
                            setOpen(false);
                          }}
                          style={{
                            padding: "6px 8px",
                            cursor: isDisabledSkill(name) ? "not-allowed" : "pointer",
                            opacity: isDisabledSkill(name) ? 0.35 : 1,
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            borderBottom: `1px solid ${S.border}`,
                          }}
                          onMouseOver={(e) => {
                            if (!isDisabledSkill(name)) e.currentTarget.style.backgroundColor = S.surface2;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span style={{ color: "#ff4d4f" }}>{name}</span>
                          <span style={{ fontSize: "10px", color: S.textDim, marginLeft: "auto" }}>
                            {info?.priority ? `${info.priority}위` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasPassive && (
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: S.textDim,
                          marginBottom: "6px",
                          paddingBottom: "4px",
                          borderBottom: `1px solid ${S.border}`,
                        }}
                      >
                        ● 패시브
                      </div>

                      {passiveSkills.map(({ name, info }) => (
                        <div
                          key={name}
                          onClick={() => {
                            if (isDisabledSkill(name)) return;
                            onSelect(name);
                            setOpen(false);
                          }}
                          style={{
                            padding: "6px 8px",
                            cursor: isDisabledSkill(name) ? "not-allowed" : "pointer",
                            opacity: isDisabledSkill(name) ? 0.35 : 1,
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            borderBottom: `1px solid ${S.border}`,
                          }}
                          onMouseOver={(e) => {
                            if (!isDisabledSkill(name)) e.currentTarget.style.backgroundColor = S.surface2;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <span style={{ color: "#3b82f6" }}>{name}</span>
                          <span style={{ fontSize: "10px", color: S.textDim, marginLeft: "auto" }}>
                            {info?.priority ? `${info.priority}위` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {singleList.map(({ name, info }) => (
                <div
                  key={name}
                  onClick={() => {
                    if (isDisabledSkill(name)) return;
                    onSelect(name);
                    setOpen(false);
                  }}
                  style={{
                    padding: "6px 8px",
                    cursor: isDisabledSkill(name) ? "not-allowed" : "pointer",
                    opacity: isDisabledSkill(name) ? 0.35 : 1,
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: `1px solid ${S.border}`,
                  }}
                  onMouseOver={(e) => {
                    if (!isDisabledSkill(name)) e.currentTarget.style.backgroundColor = S.surface2;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ color: mode === "active" ? "#ff4d4f" : "#3b82f6" }}>
                    {name}
                  </span>
                  <span style={{ fontSize: "10px", color: S.textDim, marginLeft: "auto" }}>
                    {info?.priority ? `${info.priority}위` : ""}
                  </span>
                </div>
              ))}

              <div
                onClick={() => {
                  onSelect("");
                  setOpen(false);
                }}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: S.textDim,
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = S.surface2)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                비우기
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 스킬 카드
// ─────────────────────────────────────────
function SkillCard({
  skill,
  autoGearSlots,
  autoArcanaLevels,
  onToggleGear,
  onSetArcanaLevel,
  onChange,
  onRemove,
}) {
  const level = calcSkillLevel(skill, autoGearSlots, autoArcanaLevels);
  const diff = skill.targetLevel - level;
  const gearSlots = skill.type === "active" ? ACTIVE_GEAR_SLOTS : PASSIVE_GEAR_SLOTS;
  const mergedGearSlots = autoGearSlots ?? {};
  const mergedArcanaLevels = autoArcanaLevels ?? {};
  const borderColor = skill.type === "active" ? "#ff4d4f" : "#1e88e5";

  return (
    <div style={{
      backgroundColor: S.surface, border: `1px solid ${borderColor}`,
      borderLeft: `3px solid ${borderColor}`, borderRadius: "6px",
      padding: "12px", marginBottom: "10px",
    }}>
      {/* 헤더 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: "10px",
          columnGap: "12px",
        }}
      >
        {/* 좌측: 스킬포인트 + 데바니온 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", justifySelf: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontSize: "10px", color: S.textDim }}>스킬포인트</label>
            <input
              type="number"
              value={skill.skillPoints}
              min={0}
              max={10}
              onChange={(e) => onChange({ ...skill, skillPoints: Number(e.target.value) })}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontSize: "10px", color: S.textDim }}>데바니온</label>
            <input
              type="number"
              value={skill.devanion}
              min={0}
              max={4}
              onChange={(e) => onChange({ ...skill, devanion: Number(e.target.value) })}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              style={inputStyle}
            />
          </div>
        </div>

        {/* 가운데: 이름 / 타입 / 우선순위 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifySelf: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: skill.type === "active" ? "#ff4d4f" : "#1e88e5",
            }}
          >
            {skill.name}
          </span>

          <span
            style={{
              fontSize: "11px",
              color: S.textDim,
              backgroundColor: S.surface2,
              padding: "1px 6px",
              borderRadius: "3px",
            }}
          >
            {skill.type === "active" ? "액티브" : skill.type === "passive" ? "패시브" : skill.type ?? "?"}
          </span>

          {skill.priority && (
            <span style={{ fontSize: "10px", color: S.textDim }}>
              우선순위 {skill.priority}위
            </span>
          )}
        </div>

        {/* 우측: 현재레벨 / 목표 / 삭제 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifySelf: "end",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: diff <= 0 ? S.ok : diff <= 3 ? S.warn : "#e57373",
            }}
          >
            Lv.{level}
          </span>

          <span style={{ fontSize: "11px", color: S.textDim }}>
            / 목표
            <input
              type="number"
              value={skill.targetLevel}
              min={1}
              max={40}
              onChange={(e) => onChange({ ...skill, targetLevel: Number(e.target.value) })}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              style={{
                width: "36px",
                marginLeft: "4px",
                backgroundColor: S.surface2,
                color: S.text,
                border: `1px solid ${S.border}`,
                borderRadius: "3px",
                padding: "1px 3px",
                fontSize: "11px",
                textAlign: "center",
              }}
            />
          </span>

          <button
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* 장비 슬롯 */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "10px", color: S.textDim, marginBottom: "5px" }}>
          장비 (+{Object.values(mergedGearSlots).filter(Boolean).length})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {gearSlots.map((slot) => {
            const on = mergedGearSlots[slot.id];
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onToggleGear(slot.id, on)}
                style={{
                  fontSize: "11px",
                  padding: "3px 7px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: on ? "#1e3a52" : S.surface2,
                  color: on ? "#7ec8f0" : S.textDim,
                  border: `1px solid ${on ? "#2e6a9e" : S.border}`,
                  opacity: on ? 1 : 0.85,
                }}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 아르카나 */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "10px", color: S.textDim, marginBottom: "5px" }}>
          아르카나 (+{Object.values(mergedArcanaLevels).reduce((a, b) => a + b, 0)})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {ARCANAS.map((arcana) => {
            const skillList = ARCANA_SKILL_INDEX[arcana] ?? [];
            const hasSkill = skillList.some((s) => (typeof s === "string" ? s : s.name) === skill.name);
            const val = mergedArcanaLevels[arcana] ?? 0;
            return (
              <div key={arcana} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", opacity: hasSkill ? 1 : 0.3 }}>
                <span style={{ fontSize: "10px", color: S.textDim }}>{arcana}</span>
                <input
                  type="number"
                  value={val}
                  min={0}
                  max={4}
                  disabled={!hasSkill}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const level = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(4, raw));
                    onSetArcanaLevel(arcana, level);
                  }}
                  onFocus={handleInputFocus}
                  onKeyDown={handleInputKeyDown}
                  style={{ ...inputStyle, width: "36px", textAlign: "center", opacity: hasSkill ? 1 : 0.4 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────
export default function Aion2_SkillCalculator() {
  const [presets, setPresets] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed.presets)) return [];

      return parsed.presets.map((p) => ({
        ...p,
        equippedGear: {
          weapon: Array.isArray(p.equippedGear?.weapon) ? p.equippedGear.weapon : [],
          gauntlet: Array.isArray(p.equippedGear?.gauntlet) ? p.equippedGear.gauntlet : [],
          head: Array.isArray(p.equippedGear?.head) ? p.equippedGear.head : [],
          shoulder: Array.isArray(p.equippedGear?.shoulder) ? p.equippedGear.shoulder : [],
          chest: Array.isArray(p.equippedGear?.chest) ? p.equippedGear.chest : [],
          legs: Array.isArray(p.equippedGear?.legs) ? p.equippedGear.legs : [],
          hands: Array.isArray(p.equippedGear?.hands) ? p.equippedGear.hands : [],
          feet: Array.isArray(p.equippedGear?.feet) ? p.equippedGear.feet : [],
          cloak: Array.isArray(p.equippedGear?.cloak) ? p.equippedGear.cloak : [],
          necklace: Array.isArray(p.equippedGear?.necklace) ? p.equippedGear.necklace : [],
          earring1: Array.isArray(p.equippedGear?.earring1) ? p.equippedGear.earring1 : [],
          earring2: Array.isArray(p.equippedGear?.earring2) ? p.equippedGear.earring2 : [],
          ring1: Array.isArray(p.equippedGear?.ring1) ? p.equippedGear.ring1 : [],
          ring2: Array.isArray(p.equippedGear?.ring2) ? p.equippedGear.ring2 : [],
        },
        equippedArcana: {
          성배: Array.isArray(p.equippedArcana?.성배) ? p.equippedArcana.성배 : [],
          양피지: Array.isArray(p.equippedArcana?.양피지) ? p.equippedArcana.양피지 : [],
          나침반: Array.isArray(p.equippedArcana?.나침반) ? p.equippedArcana.나침반 : [],
          종: Array.isArray(p.equippedArcana?.종) ? p.equippedArcana.종 : [],
          거울: Array.isArray(p.equippedArcana?.거울) ? p.equippedArcana.거울 : [],
          천칭: Array.isArray(p.equippedArcana?.천칭) ? p.equippedArcana.천칭 : [],
        },
      }));
    } catch {
      return [];
    }
  });

  const [activePresetId, setActivePresetId] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.activePresetId ?? null;
    } catch {
      return null;
    }
  });

  const [selectedJob, setSelectedJob] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return "수호성";
      const parsed = JSON.parse(raw);
      return parsed.selectedJob ?? "수호성";
    } catch {
      return "수호성";
    }
  });

  const filteredPresets = presets.filter((p) => p.job === selectedJob);
  const activePreset = filteredPresets.find((p) => p.id === activePresetId) ?? null;

  useEffect(() => {
    if (filteredPresets.length === 0) {
      if (activePresetId !== null) setActivePresetId(null);
      return;
    }

    const exists = filteredPresets.some((p) => p.id === activePresetId);
    if (!exists) {
      setActivePresetId(filteredPresets[0].id);
    }
  }, [selectedJob, filteredPresets, activePresetId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          presets,
          activePresetId,
          selectedJob,
        })
      );
    } catch {
      // 저장 실패 시 무시
    }
  }, [presets, activePresetId, selectedJob]);

  function handleJobChange(job) {
    setSelectedJob(job);

    const jobPresets = presets.filter((p) => p.job === job);

    if (jobPresets.length === 0) {
      const p = createPreset(job);
      setPresets((prev) => [...prev, p]);
      setActivePresetId(p.id);
    } else {
      setActivePresetId(jobPresets[0].id);
    }
  }

  function addPreset() {
    const p = createPreset(selectedJob);
    setPresets((prev) => [...prev, p]);
    setActivePresetId(p.id);
  }

  function removePreset(id) {
    const nextPresets = presets.filter((p) => p.id !== id);
    setPresets(nextPresets);

    if (activePresetId !== id) return;

    const sameJobFirst = nextPresets.find((p) => p.job === selectedJob);
    setActivePresetId(sameJobFirst?.id ?? nextPresets[0]?.id ?? null);
  }

  function renamePreset(id, name) {
    setPresets((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  }

  function addSkill(skillName) {
    if (!skillName || !activePreset) return;
    if (activePreset.skills.some((s) => s.name === skillName)) return;

    const skill = createSkillState(skillName, activePreset.job);

    setPresets((prev) => prev.map((p) => {
      if (p.id !== activePresetId) return p;

      const nextSkills = [...p.skills, skill].sort((a, b) => {
        const pa = a.priority ?? 999;
        const pb = b.priority ?? 999;
        return pa - pb;
      });

      return { ...p, skills: nextSkills };
    }));
  }

  function updateSkill(index, updated) {
    setPresets((prev) => prev.map((p) =>
      p.id === activePresetId
        ? { ...p, skills: p.skills.map((s, i) => i === index ? updated : s) }
        : p
    ));
  }

  function removeSkill(index) {
    setPresets((prev) => prev.map((p) =>
      p.id === activePresetId
        ? { ...p, skills: p.skills.filter((_, i) => i !== index) }
        : p
    ));
  }

  return (
    <div style={{ backgroundColor: S.bg, minHeight: "100%", padding: "16px", color: S.text, fontFamily: "inherit" }}>

      {/* 상단: 직업선택 > +프리셋 > 프리셋1,2,3... */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <select value={selectedJob} onChange={(e) => handleJobChange(e.target.value)}
          style={{ backgroundColor: S.surface2, color: S.text, border: `1px solid ${S.border}`, borderRadius: "4px", padding: "5px 8px", fontSize: "13px", flexShrink: 0 }}>
          {JOBS.map((j) => <option key={j}>{j}</option>)}
        </select>

        <button onClick={addPreset} style={{
          backgroundColor: "#1e3a52", color: "#7ec8f0",
          border: `1px solid #2e6a9e`, borderRadius: "4px",
          padding: "5px 10px", fontSize: "12px", cursor: "pointer", flexShrink: 0,
        }}>+ 프리셋</button>

        {filteredPresets.map((p) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: "4px",
            backgroundColor: activePresetId === p.id ? "#2a3a4a" : S.surface,
            border: `1px solid ${activePresetId === p.id ? S.accent : S.border}`,
            borderRadius: "6px", padding: "4px 8px", cursor: "pointer",
          }}
            onClick={() => setActivePresetId(p.id)}>
            <input
              value={p.name}
              onChange={(e) => { e.stopPropagation(); renamePreset(p.id, e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "none", border: "none", color: S.text, fontSize: "13px", cursor: "text", width: `${Math.max(p.name.length, 10)}ch` }}
            />
            <button onClick={(e) => { e.stopPropagation(); removePreset(p.id); }}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "14px", padding: 0 }}>
              ×
            </button>
          </div>
        ))}
      </div>

      {!activePreset && (
        <div style={{ textAlign: "center", color: S.textDim, marginTop: "60px", fontSize: "14px" }}>
          프리셋을 추가하고 직업과 스킬을 설정하세요
        </div>
      )}

      {activePreset && (
        <>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", color: S.textDim, marginBottom: "6px" }}>
              장비
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(14, minmax(92px, 1fr))",
                gap: "8px",
                alignItems: "start",
                marginBottom: "10px",
              }}
            >
              {[
                { id: "weapon", label: "무기", mode: "active" },
                { id: "gauntlet", label: "가더", mode: "active" },
                { id: "ring1", label: "반지1", mode: "active" },
                { id: "ring2", label: "반지2", mode: "active" },
                
                { id: "head", label: "머리", mode: "passive" },
                { id: "shoulder", label: "어깨", mode: "passive" },
                { id: "chest", label: "가슴", mode: "passive" },
                { id: "legs", label: "다리", mode: "passive" },
                { id: "hands", label: "손", mode: "passive" },
                { id: "feet", label: "발", mode: "passive" },
                { id: "cloak", label: "망토", mode: "passive" },
                { id: "necklace", label: "목걸이", mode: "passive" },
                { id: "earring1", label: "귀걸이1", mode: "passive" },
                { id: "earring2", label: "귀걸이2", mode: "passive" },
              ].map((slot) => {
                const entries = activePreset.equippedGear?.[slot.id] ?? [];

                return (
                  <div key={slot.id}>
                    <div style={{ fontSize: "11px", color: S.textDim, marginBottom: "3px" }}>
                      {slot.label}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {entries.map((entry, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-end", gap: "3px" }}>
                          <InlineSkillDropdown
                            job={activePreset.job}
                            mode={slot.mode}
                            value={entry.skillName ?? ""}
                            placeholder="스킬 선택"
                            excludedSkills={entries.map((e) => e.skillName).filter(Boolean)}
                            onSelect={(value) => {
                              setPresets((prev) =>
                                prev.map((p) => {
                                  if (p.id !== activePresetId) return p;
                                  const next = [...(p.equippedGear?.[slot.id] ?? [])];
                                  next[idx] = { skillName: value, level: 1 };
                                  return {
                                    ...p,
                                    equippedGear: {
                                      ...p.equippedGear,
                                      [slot.id]: next,
                                    },
                                  };
                                })
                              );
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setPresets((prev) =>
                                prev.map((p) => {
                                  if (p.id !== activePresetId) return p;
                                  const next = (p.equippedGear?.[slot.id] ?? []).filter((_, i) => i !== idx);
                                  return {
                                    ...p,
                                    equippedGear: {
                                      ...p.equippedGear,
                                      [slot.id]: next,
                                    },
                                  };
                                })
                              );
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              cursor: "pointer",
                              fontSize: "14px",
                              lineHeight: 1,
                              padding: "0 2px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <InlineSkillDropdown
                          job={activePreset.job}
                          mode={slot.mode}
                          value=""
                          placeholder="스킬 선택"
                          excludedSkills={entries.map((e) => e.skillName).filter(Boolean)}
                          onSelect={(value) => {
                            if (!value) return;

                            setPresets((prev) =>
                              prev.map((p) => {
                                if (p.id !== activePresetId) return p;
                                return {
                                  ...p,
                                  equippedGear: {
                                    ...p.equippedGear,
                                    [slot.id]: [...(p.equippedGear?.[slot.id] ?? []), { skillName: value, level: 1 }],
                                  },
                                };
                              })
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #444", margin: "12px 0" }} />
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", color: S.textDim, marginBottom: "6px" }}>
              아르카나
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(120px, 1fr))",
                gap: "8px",
              }}
            >
              {PRESET_ARCANA_SLOTS.map((slot) => {
                const entries = activePreset.equippedArcana?.[slot.id] ?? [];

                return (
                  <div key={slot.id}>
                    <div style={{ fontSize: "11px", color: S.textDim, marginBottom: "4px" }}>
                      {slot.label}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      {entries.map((entry, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "3px" }}>                          <InlineSkillDropdown
                            job={activePreset.job}
                            mode="all"
                            value={entry.skillName ?? ""}
                            placeholder="스킬 선택"
                            allowedSkills={ARCANA_SKILL_INDEX[slot.id] ?? []}
                            excludedSkills={entries.map((e) => e.skillName).filter(Boolean)}
                            onSelect={(value) => {
                              setPresets((prev) =>
                                prev.map((p) => {
                                  if (p.id !== activePresetId) return p;

                                  const list = [...(p.equippedArcana?.[slot.id] ?? [])];

                                  const filtered = list.filter(
                                    (e, i) => i === idx || e.skillName !== value
                                  );

                                  filtered[idx] = {
                                    skillName: value,
                                    level: entry.level ?? 1,
                                  };

                                  return {
                                    ...p,
                                    equippedArcana: {
                                      ...p.equippedArcana,
                                      [slot.id]: filtered,
                                    },
                                  };
                                })
                              );
                            }}
                          />

                          <input
                            type="number"
                            value={entry.level ?? 1}
                            min={0}
                            max={4}
                            onChange={(e) => {
                              const raw = Number(e.target.value);
                              const level = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(4, raw));

                              setPresets((prev) =>
                                prev.map((p) => {
                                  if (p.id !== activePresetId) return p;

                                  const next = [...(p.equippedArcana?.[slot.id] ?? [])];
                                  next[idx] = { ...next[idx], level };

                                  return {
                                    ...p,
                                    equippedArcana: {
                                      ...p.equippedArcana,
                                      [slot.id]: next,
                                    },
                                  };
                                })
                              );
                            }}
                            onFocus={handleInputFocus}
                            onKeyDown={handleInputKeyDown}
                            style={{
                              ...inputStyle,
                              width: "36px",
                              height: "22px",
                              padding: "0 4px",
                              fontSize: "11px",
                              boxSizing: "border-box",
                              marginBottom: "-3px"
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setPresets((prev) =>
                                prev.map((p) => {
                                  if (p.id !== activePresetId) return p;

                                  const next = (p.equippedArcana?.[slot.id] ?? []).filter((_, i) => i !== idx);

                                  return {
                                    ...p,
                                    equippedArcana: {
                                      ...p.equippedArcana,
                                      [slot.id]: next,
                                    },
                                  };
                                })
                              );
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              cursor: "pointer",
                              fontSize: "14px",
                              lineHeight: 1,
                              padding: "0 2px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <InlineSkillDropdown
                          job={activePreset.job}
                          mode="all"
                          value=""
                          placeholder="스킬 선택"
                          allowedSkills={ARCANA_SKILL_INDEX[slot.id] ?? []}
                          excludedSkills={entries.map((e) => e.skillName).filter(Boolean)}
                          onSelect={(value) => {
                            if (!value) return;

                            setPresets((prev) =>
                              prev.map((p) => {
                                if (p.id !== activePresetId) return p;
                                return {
                                  ...p,
                                  equippedArcana: {
                                    ...p.equippedArcana,
                                    [slot.id]: [
                                      ...(p.equippedArcana?.[slot.id] ?? []),
                                      { skillName: value, level: 1 },
                                    ],
                                  },
                                };
                              })
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #444", margin: "12px 0" }} />
          <SkillDropdown
            job={activePreset.job}
            addedSkills={activePreset.skills.map((s) => s.name)}
            onSelect={addSkill}
          />

          {activePreset.skills.length === 0 && (
            <div style={{ color: S.textDim, fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
              트래킹할 스킬을 추가하세요
            </div>
          )}
          {(() => {
            const actives = activePreset.skills.filter((s) => s.type === "active");
            const passives = activePreset.skills.filter((s) => s.type === "passive");
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div>
                  {actives.length > 0 && <div style={{ fontSize: "11px", color: S.textDim, marginBottom: "8px" }}>● 액티브</div>}
                  {actives.map((skill) => {
                    const originalIndex = activePreset.skills.findIndex((s) => s.name === skill.name);
                    return (
                      <SkillCard
                        key={skill.name}
                        skill={skill}
                        autoGearSlots={getAutoGearSlots(skill, activePreset.equippedGear)}
                        autoArcanaLevels={getAutoArcanaLevels(skill, activePreset.equippedArcana)}
                        onToggleGear={(slotId, isOn) => {
                          setPresets((prev) =>
                            prev.map((p) => {
                              if (p.id !== activePresetId) return p;

                              const currentEntries = p.equippedGear?.[slotId] ?? [];
                              const alreadyExists = currentEntries.some((entry) => entry.skillName === skill.name);

                              const nextEntries = isOn
                                ? currentEntries.filter((entry) => entry.skillName !== skill.name)
                                : alreadyExists
                                  ? currentEntries
                                  : [...currentEntries, { skillName: skill.name, level: 1 }];

                              return {
                                ...p,
                                equippedGear: {
                                  ...p.equippedGear,
                                  [slotId]: nextEntries,
                                },
                              };
                            })
                          );
                        }}
                        onSetArcanaLevel={(arcanaId, level) => {
                          setPresets((prev) =>
                            prev.map((p) => {
                              if (p.id !== activePresetId) return p;

                              const currentEntries = p.equippedArcana?.[arcanaId] ?? [];
                              const existingIndex = currentEntries.findIndex((entry) => entry.skillName === skill.name);

                              let nextEntries;

                              if (level <= 0) {
                                nextEntries = currentEntries.filter((entry) => entry.skillName !== skill.name);
                              } else if (existingIndex >= 0) {
                                nextEntries = [...currentEntries];
                                nextEntries[existingIndex] = { ...nextEntries[existingIndex], level };
                              } else {
                                nextEntries = [...currentEntries, { skillName: skill.name, level }];
                              }

                              return {
                                ...p,
                                equippedArcana: {
                                  ...p.equippedArcana,
                                  [arcanaId]: nextEntries,
                                },
                              };
                            })
                          );
                        }}
                        onChange={(updated) => updateSkill(originalIndex, updated)}
                        onRemove={() => removeSkill(originalIndex)}
                      />
                    );
                  })}
                </div>
                <div>
                  {passives.length > 0 && <div style={{ fontSize: "11px", color: S.textDim, marginBottom: "8px" }}>● 패시브</div>}
                  {passives.map((skill) => {
                    const originalIndex = activePreset.skills.findIndex((s) => s.name === skill.name);
                    return (
                      <SkillCard
                        key={skill.name}
                        skill={skill}
                        autoGearSlots={getAutoGearSlots(skill, activePreset.equippedGear)}
                        autoArcanaLevels={getAutoArcanaLevels(skill, activePreset.equippedArcana)}
                        onToggleGear={(slotId, isOn) => {
                          setPresets((prev) =>
                            prev.map((p) => {
                              if (p.id !== activePresetId) return p;

                              const currentEntries = p.equippedGear?.[slotId] ?? [];
                              const alreadyExists = currentEntries.some((entry) => entry.skillName === skill.name);

                              const nextEntries = isOn
                                ? currentEntries.filter((entry) => entry.skillName !== skill.name)
                                : alreadyExists
                                  ? currentEntries
                                  : [...currentEntries, { skillName: skill.name, level: 1 }];

                              return {
                                ...p,
                                equippedGear: {
                                  ...p.equippedGear,
                                  [slotId]: nextEntries,
                                },
                              };
                            })
                          );
                        }}
                        onSetArcanaLevel={(arcanaId, level) => {
                          setPresets((prev) =>
                            prev.map((p) => {
                              if (p.id !== activePresetId) return p;

                              const currentEntries = p.equippedArcana?.[arcanaId] ?? [];
                              const existingIndex = currentEntries.findIndex((entry) => entry.skillName === skill.name);

                              let nextEntries;

                              if (level <= 0) {
                                nextEntries = currentEntries.filter((entry) => entry.skillName !== skill.name);
                              } else if (existingIndex >= 0) {
                                nextEntries = [...currentEntries];
                                nextEntries[existingIndex] = { ...nextEntries[existingIndex], level };
                              } else {
                                nextEntries = [...currentEntries, { skillName: skill.name, level }];
                              }

                              return {
                                ...p,
                                equippedArcana: {
                                  ...p.equippedArcana,
                                  [arcanaId]: nextEntries,
                                },
                              };
                            })
                          );
                        }}
                        onChange={(updated) => updateSkill(originalIndex, updated)}
                        onRemove={() => removeSkill(originalIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
