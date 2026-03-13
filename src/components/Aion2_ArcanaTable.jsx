import React, { useEffect, useRef, useState } from "react";
import { CLASS_SKILLS } from "../data/aion2-SkillList";
import { getSkillMeta } from "../data/aion2-SkillMetaUtils";

const RECOMMENDED_COLORS = {
  활력: "#f0c040",
  순수: "#ff4444",
  광분: "#aa44ff",
  마력: "#4499ff",
};

const RECOMMENDED_BG = {
  활력: "#76622c",
  순수: "#762e2e",
  광분: "#5d2d7f",
  마력: "#2c4375",
};

const CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

const S = {
  bg: "#1a1a1a",
  surface: "#242424",
  surface2: "#2e2e2e",
  border: "#3a3a3a",
  text: "#e0e0e0",
  textDim: "#888",
  accent: "#5b9bd5",
  ok: "#4caf50",
  warn: "#f5a623",
  tip: "#5b9bd5",
};

const ARCANA_NAMES = ["성배", "양피지", "나침반", "종", "거울", "천칭"];

const ARCANA_OPTIONS = ["활력", "마력", "광분", "순수"];

const GOD_STAT_TO_DETAIL = {
  정의: "방어력, 완벽",
  자유: "명중, 회피",
  환상: "쿨감, 철벽 관통",
  생명: "생명력, 재생 확률",
  시간: "전투 속도, 강타 저항",
  파괴: "공격력, 완벽 저항",
  죽음: "치명타, 재생 관통",
  지혜: "정신력 소모, 강타",
  운명: "정신력, 철벽",
  공간: "이동 속도, 막기",
};

const ARCANA_SIM_RESULT = {
  성배: {
    활력: { godStats: ["시간 20"], detailStats: ["전투 속도, 강타 저항"] },
    광분: { godStats: ["시간 20"], detailStats: ["전투 속도, 강타 저항"] },
    마력: { godStats: ["공간 20"], detailStats: ["이동 속도, 막기"] },
    순수: { godStats: ["공간 20"], detailStats: ["이동 속도, 막기"] },
  },
  양피지: {
    활력: { godStats: ["생명 20"], detailStats: ["생명력, 재생 확률"] },
    광분: { godStats: ["생명 20"], detailStats: ["생명력, 재생 확률"] },
    마력: { godStats: ["운명 20"], detailStats: ["정신력, 철벽"] },
    순수: { godStats: ["운명 20"], detailStats: ["정신력, 철벽"] },
  },
  나침반: {
    활력: { godStats: ["자유 20"], detailStats: ["명중, 회피"] },
    광분: { godStats: ["자유 20"], detailStats: ["명중, 회피"] },
    마력: { godStats: ["죽음 20"], detailStats: ["치명타, 재생 관통"] },
    순수: { godStats: ["죽음 20"], detailStats: ["치명타, 재생 관통"] },
  },
  종: {
    활력: { godStats: ["정의 20"], detailStats: ["방어력, 완벽"] },
    광분: { godStats: ["정의 20"], detailStats: ["방어력, 완벽"] },
    마력: { godStats: ["파괴 20"], detailStats: ["공격력, 완벽 저항"] },
    순수: { godStats: ["파괴 20"], detailStats: ["공격력, 완벽 저항"] },
  },
  거울: {
    활력: { godStats: ["환상 20"], detailStats: ["쿨감, 철벽 관통"] },
    광분: { godStats: ["환상 20"], detailStats: ["쿨감, 철벽 관통"] },
    마력: { godStats: ["지혜 20"], detailStats: ["정신력 소모, 강타"] },
    순수: { godStats: ["지혜 20"], detailStats: ["정신력 소모, 강타"] },
  },
  천칭: {
    활력: { godStats: [], detailStats: [] },
    마력: { godStats: [], detailStats: [] },
    광분: {
      godStats: ["정의 10", "생명 10"],
      detailStats: ["방어력, 완벽", "생명력, 재생 확률"],
    },
    순수: {
      godStats: ["파괴 10", "운명 10"],
      detailStats: ["공격력, 완벽 저항", "정신력, 철벽"],
    },
  },
};

const ARCANA_DATA = [
  {
    name: "성배",
    note: "전체 스킬",
    recommended: [
      { main: "활력", sub: "시간 (전투 속도, 강타 저항)" },
      { main: "광분", sub: "시간 (전투 속도, 강타 저항)" },
      { main: "광분", sub: "시간 (전투 속도, 강타 저항)" },
    ],
    skillsByClass: {},
  },
  {
    name: "양피지",
    note: "액티브 스킬",
    recommended: [
      { main: "활력", sub: "생명 (생명력, 재생 확률)" },
      { main: "광분", sub: "생명 (생명력, 재생 확률)" },
      { main: "광분", sub: "생명 (생명력, 재생 확률)" },
    ],
    skillsByClass: {},
  },
  {
    name: "나침반",
    note: "액티브 스킬",
    recommended: [
      { main: "순수", sub: "죽음 (치명타, 재생 관통)" },
      { main: "광분", sub: "자유 (명중, 회피)" },
      { main: "광분", sub: "자유 (명중, 회피)" },
    ],
    skillsByClass: {},
  },
  {
    name: "종",
    note: "패시브 스킬",
    recommended: [
      { main: "순수", sub: "파괴 (공격력, 완벽 저항)" },
      { main: "순수", sub: "파괴 (공격력, 완벽 저항)" },
      { main: "마력", sub: "파괴 (공격력, 완벽 저항)" },
    ],
    skillsByClass: {},
  },
  {
    name: "거울",
    note: "패시브 스킬",
    recommended: [
      { main: "순수", sub: "지혜 (강타, 정신력 소모)" },
      { main: "광분", sub: "환상 (재사용 시간, 철벽 관통)" },
      { main: "마력", sub: "지혜 (강타, 정신력 소모)" },
    ],
    skillsByClass: {},
  },
  {
    name: "천칭",
    note: "전체 스킬",
    recommended: [
      { main: "순수", sub: "파괴 (공격력, 완벽 저항) /\n운명 (정신력, 철벽 확률)" },
      { main: "순수", sub: "파괴 (공격력, 완벽 저항) /\n운명 (정신력, 철벽 확률)" },
      { main: "광분", sub: "정의 (방어력, 완벽 확률) /\n생명 (생명력, 재생 확률)" },
    ],
    skillsByClass: {},
  },
];

const STAT_COLORS = {
  "전투 속도": "#ff4d4d",
  강타: "#ff4d4d",
  공격력: "#ff9a3c",
  치명타: "#ff9a3c",
  쿨감: "#ff9a3c",
  명중: "#fff53c",
  완벽: "#bbbbbb",
  "이동 속도": "#bbbbbb",
  "철벽 관통": "#bbbbbb",
  "재생 관통": "#bbbbbb",
  "정신력 소모": "#3bd16f",
  정신력: "#3bd16f",
  방어력: "#4da6ff",
  회피: "#4da6ff",
  생명력: "#4da6ff",
  "재생 확률": "#4da6ff",
  막기: "#4da6ff",
  철벽: "#00ffff",
  "강타 저항": "#b06cff",
  "완벽 저항": "#b06cff",
};

const SET_EFFECTS = {
  활력: {
    2: { type: "활력", count: 2, desc: "PVE 공격력 60" },
    4: { type: "활력", count: 4, desc: "PVE 공격력 150" },
  },
  마력: {
    2: { type: "마력", count: 2, desc: "정신력 1500 회복" },
    4: { type: "마력", count: 4, desc: "PVE 방어력 1000" },
  },
  광분: {
    2: { type: "광분", count: 2, desc: "PVE 공격력 50" },
    4: { type: "광분", count: 4, desc: "보피증 5%, 보피내 10%" },
  },
  순수: {
    2: { type: "순수", count: 2, desc: "PVE 방어력 500" },
    4: { type: "순수", count: 4, desc: "치피증 5%, 방어력 1000" },
  },
};

const LS_KEY = "aion2-arcana-sim-v2";

function createPreset(name = "새 프리셋") {
  return {
    id: crypto.randomUUID(),
    name,
    selections: {
      성배: "활력",
      양피지: "활력",
      나침반: "활력",
      종: "활력",
      거울: "활력",
      천칭: "광분",
    },
  };
}

function renderColoredDetailStats(detailStats) {
  const items = detailStats
    .flatMap((text) => text.split(","))
    .map((s) => s.trim())
    .filter(Boolean);

  return items.map((stat, idx) => (
    <React.Fragment key={`${stat}-${idx}`}>
      <span style={{ color: STAT_COLORS[stat] || "#9ecbff" }}>{stat}</span>
      {idx < items.length - 1 ? <span style={{ color: "#888" }}>, </span> : null}
    </React.Fragment>
  ));
}

function ArcanaStatCell({ arcName, selectedType, locked = false, onChange }) {
  const result = ARCANA_SIM_RESULT[arcName]?.[selectedType] ?? { godStats: [], detailStats: [] };

  return (
    <td style={{ ...styles.td, background: "#181818", verticalAlign: "middle", textAlign: "center", padding: "4px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["활력", "마력", "광분", "순수"].map((opt) => {
            const disabled = locked || (arcName === "천칭" && (opt === "활력" || opt === "마력"));
            const isActive = selectedType === opt;
            return (
              <button
                key={opt}
                disabled={disabled}
                onClick={() => !disabled && onChange?.(opt)}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  borderRadius: 6,
                  border: "1px solid #555",
                  background: isActive ? (RECOMMENDED_BG[opt] || "#222") : "#222",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  opacity: disabled && !isActive ? 0.35 : 1,
                  cursor: disabled ? "default" : "pointer",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
          {result.godStats.map((godStat, idx) => (
            <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#fff", minWidth: 60, whiteSpace: "pre-line", fontWeight: 400 }}>
                {godStat}
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, whiteSpace: "normal", lineHeight: 1.2 }}>
                {renderColoredDetailStats([result.detailStats[idx] || ""])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </td>
  );
}

export default function Aion2_ArcanaTable() {
  const [editingPresetId, setEditingPresetId] = useState(null);

  const [presets, setPresets] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.presets) && parsed.presets.length > 0) {
          return parsed.presets;
        }
      }
    } catch {}
    return [
      createPreset("프리셋1"),
      createPreset("프리셋2"),
    ];
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem("aion2-selected-class") || "수호성";
  });

  const [selectedSkillsByArcana, setSelectedSkillsByArcana] = useState(() => {
    const initial = {};
    ARCANA_DATA.forEach((arc) => {
      initial[arc.name] = getTopArcanaSkills("수호성", arc.name);
    });
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ presets }));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem("aion2-selected-class", selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    setSelectedSkillsByArcana(() => {
      const next = {};
      ARCANA_DATA.forEach((arc) => {
        next[arc.name] = getTopArcanaSkills(selectedClass, arc.name);
      });
      return next;
    });
  }, [selectedClass]);

  function addPreset() {
    setPresets((prev) => [...prev, createPreset(`프리셋${prev.length + 1}`)]);
  }

  function removePreset(id) {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }

  function renamePreset(id, name) {
    setPresets((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  }

  function handleSimChange(presetId, arcanaName, value) {
    if (arcanaName === "천칭" && (value === "활력" || value === "마력")) return;
    setPresets((prev) =>
      prev.map((p) =>
        p.id === presetId
          ? { ...p, selections: { ...p.selections, [arcanaName]: value } }
          : p
      )
    );
  }

  function handleSkillChange(arcanaName, index, value) {
    setSelectedSkillsByArcana((prev) => ({
      ...prev,
      [arcanaName]: (prev[arcanaName] ?? []).map((skill, i) =>
        i === index ? value : skill
      ),
    }));
  }

  const STAT_ORDER = [
    "강타", "전투 속도", "공격력", "치명타", "쿨감",
    "명중",
    "이동 속도", "완벽", "철벽 관통", "재생 관통",
    "정신력 소모", "정신력",
    "생명력", "방어력", "회피", "막기", "재생 확률",
    "철벽", "강타 저항", "완벽 저항",
  ];

  function buildDetailStatsMap(selections) {
    const map = {};
    ARCANA_DATA.forEach((arc) => {
      const type = selections?.[arc.name];
      if (!type) return;
      const result = ARCANA_SIM_RESULT[arc.name]?.[type] ?? { detailStats: [] };
      const weight = arc.name === "천칭" ? 0.5 : 1;
      result.detailStats.forEach((s) => {
        s.split(",").map((x) => x.trim()).forEach((stat) => {
          map[stat] = (map[stat] || 0) + weight;
        });
      });
    });
    return map;
  }

  function buildTypeCounts(selections) {
    const counts = {};
    ARCANA_DATA.forEach((arc) => {
      const type = selections?.[arc.name];
      if (type) counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }

  function getSetEffects(typeCounts) {
    const result = [];
    ["활력", "마력", "광분", "순수"].forEach((type) => {
      const count = typeCounts[type] || 0;
      if (count >= 2) result.push(SET_EFFECTS[type][2]);
      if (count >= 4) result.push(SET_EFFECTS[type][4]);
    });
    return result;
  }

  const REC_COLS = [
    { key: "rec1", label: "추천1\n2활력+4순수\n(활력 성배 잘 뜬 경우)", selections: Object.fromEntries(ARCANA_DATA.map((a) => [a.name, a.recommended[0]?.main])) },
    { key: "rec2", label: "추천2\n4광분+2순수", selections: Object.fromEntries(ARCANA_DATA.map((a) => [a.name, a.recommended[1]?.main])) },
    { key: "rec3", label: "추천3\n4광분+2마력", selections: Object.fromEntries(ARCANA_DATA.map((a) => [a.name, a.recommended[2]?.main])) },
  ];

  return (
    <div style={{ marginTop: 12 }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.title}>아르카나</div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            {/* 표 열 크기 조정 */}
            <colgroup>
              <col style={{ width: 110 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              {presets.map((p) => <col key={p.id} style={{ width: 200 }} />)}
              <col style={{ width: 220 }} />
              <col style={{ width: 110 }} />
            </colgroup>

            <thead>
              <tr>
                <th style={styles.th}>아르카나</th>
                <th style={styles.th}>{"추천1\n2활력+4순수".split("\n").map((l, i) => <div key={i}>{l}</div>)}</th>
                <th style={styles.th}>{"추천2\n4광분+2순수".split("\n").map((l, i) => <div key={i}>{l}</div>)}</th>
                <th style={styles.th}>{"추천3\n4광분+2마력".split("\n").map((l, i) => <div key={i}>{l}</div>)}</th>
                {presets.map((p, idx) => (
                  <th key={p.id} style={styles.th}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      {editingPresetId === p.id ? (
                        <input
                          autoFocus
                          value={p.name}
                          onChange={(e) => renamePreset(p.id, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onBlur={() => setEditingPresetId(null)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setEditingPresetId(null); } }}
                          style={{
                            background: "#1a2a3a", border: "1px solid #5b9bd5", borderRadius: 4,
                            color: "#e0e0e0", fontSize: 13, textAlign: "center",
                            padding: "2px 6px", width: `${Math.max(p.name.length, 6)}ch`,
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingPresetId(p.id)}
                          style={{ cursor: "pointer", borderBottom: "1px dashed #5b9bd5", paddingBottom: 1 }}
                        >
                          {p.name}
                        </span>
                      )}
                      {idx === 0 ? (
                        <button
                          onClick={addPreset}
                          style={{
                            backgroundColor: "#1e3a52", color: "#7ec8f0",
                            border: "1px solid #2e6a9e", borderRadius: 4,
                            padding: "2px 8px", fontSize: 11, cursor: "pointer",
                          }}
                        >
                          + 프리셋
                        </button>
                      ) : (
                        <button
                          onClick={() => removePreset(p.id)}
                          style={{
                            backgroundColor: "#3a1e1e", color: "#e07070",
                            border: "1px solid #7a3a3a", borderRadius: 4,
                            padding: "2px 8px", fontSize: 11, cursor: "pointer",
                          }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={styles.th}>주신 스탯 우선순위<br/>(딜러 기준)</th>
                <th style={styles.th}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                    <div>추천 스킬</div>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      style={{ background: "#1f1f1f", color: "#fff", border: "1px solid #555", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}
                    >
                      {CLASSES.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {ARCANA_DATA.map((arc) => (
                <tr key={arc.name}>
                  <td style={styles.tdArcana}>
                    <div style={{ fontWeight: 800 }}>{arc.name}</div>
                    <div style={styles.note}>{arc.note}</div>
                  </td>

                  {arc.recommended.map((rec, i) => (
                    <ArcanaStatCell key={i} arcName={arc.name} selectedType={rec.main} locked={true} />
                  ))}

                  {presets.map((p) => (
                    <ArcanaStatCell
                      key={p.id}
                      arcName={arc.name}
                      selectedType={p.selections?.[arc.name] ?? "활력"}
                      locked={false}
                      onChange={(opt) => handleSimChange(p.id, arc.name, opt)}
                    />
                  ))}

                  {arc.name === ARCANA_DATA[0].name && (
                    <td
                      style={{
                        ...styles.td,
                        verticalAlign: "top",
                        borderBottom: "none"
                      }}
                      rowSpan={ARCANA_DATA.length + 2}
                    >
                      <div style={{ fontSize: 12, lineHeight: 1.5, height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ color: "#ff4d4d", fontWeight: 700 }}>&lt;1티어&gt;</div>
                        <div style={{ color: "#ff4d4d" }}>파괴 : 공격력, 완벽 저항</div>
                        <div style={{ color: "#ff4d4d" }}>시간 : 전투 속도, 강타 저항</div>
                        <div style={{ color: "#ff4d4d" }}>지혜 : 강타, 정신력 소모</div>
                        <div style={{ marginTop: 6, color: "#ff9a3c", fontWeight: 700 }}>&lt;2티어&gt;</div>
                        <div style={{ color: "#ff9a3c" }}>죽음 : 치명타, 재생 관통</div>
                        <div style={{ color: "#ff9a3c" }}>환상 : 쿨감, 철벽 관통</div>
                        <div style={{ marginTop: 6, color: "#ffd84d", fontWeight: 700 }}>&lt;3티어&gt;</div>
                        <div style={{ color: "#ffd84d" }}>자유 : 명중, 회피</div>
                        <div style={{ marginTop: 6, color: "#bbbbbb", fontWeight: 700 }}>&lt;4티어&gt;</div>
                        <div style={{ color: "#bbbbbb" }}>생명 : 생명력, 재생</div>
                        <div style={{ color: "#bbbbbb" }}>공간 : 이동속도, 막기</div>
                        <div style={{ color: "#bbbbbb" }}>정의 : 완벽, 방어력</div>
                        <div style={{ color: "#bbbbbb" }}>운명 : 철벽, 정신력</div>

                        <div style={{ marginTop: "12px", borderTop: "1px solid #333", paddingTop: "8px" }}>

                          {Object.values(SET_EFFECTS).flatMap((set) =>
                            Object.values(set).map((s) => (
                              <div
                                key={`${s.type}-${s.count}`}
                                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}
                              >
                                <span
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: 11,
                                    borderRadius: 6,
                                    border: "1px solid #555",
                                    background: RECOMMENDED_BG[s.type] || "#222",
                                    color: "#fff",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1.1,
                                    fontWeight: 400,
                                  }}
                                >
                                  {s.type} ({s.count})
                                </span>

                                <span style={{ fontSize: "12px", color: "#aaa" }}>
                                  {s.desc}
                                </span>
                              </div>
                            ))
                          )}

                        </div>

                      </div>
                    </td>
                  )}

                  <td style={{ ...styles.td, verticalAlign: "middle" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, padding: "3px 0" }}>
                      {(selectedSkillsByArcana[arc.name] ?? []).map((skill, idx) => (
                        <InlineSkillDropdown
                          key={`${arc.name}-${idx}`}
                          job={selectedClass}
                          value={skill ?? ""}
                          allowedSkills={CLASS_SKILLS[selectedClass]?.[arc.name] ?? []}
                          onSelect={(value) => handleSkillChange(arc.name, idx, value)}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td style={{ ...styles.tdArcana, textAlign: "center" }}>합계</td>
                {REC_COLS.map(({ key, selections }) => {
                  const map = buildDetailStatsMap(selections);
                  const list = Object.keys(map).sort((a, b) => STAT_ORDER.indexOf(a) - STAT_ORDER.indexOf(b));
                  return (
                    <td key={key} style={styles.td}>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {list.map((stat, idx) => (
                          <li key={`${key}-${stat}-${idx}`} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                            color: STAT_COLORS[stat] || "#fff",
                            borderBottom: idx < list.length - 1 ? "1px solid #2a2a2a" : "none",
                            padding: "2px 0",
                          }}>
                            <span>{stat}</span>
                            <div style={{ display: "flex", gap: 3 }}>
                              {Array.from({ length: Math.round(map[stat] * 2) }).map((_, i) => (
                                <div key={i} style={{ width: 30, height: 6, borderRadius: 1, background: STAT_COLORS[stat] || "#fff" }} />
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
                {presets.map((p) => {
                  const map = buildDetailStatsMap(p.selections);
                  const list = Object.keys(map).sort((a, b) => STAT_ORDER.indexOf(a) - STAT_ORDER.indexOf(b));
                  return (
                    <td key={p.id} style={styles.td}>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {list.map((stat, idx) => (
                          <li key={`${p.id}-${stat}-${idx}`} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                            color: STAT_COLORS[stat] || "#fff",
                            borderBottom: idx < list.length - 1 ? "1px solid #2a2a2a" : "none",
                            padding: "2px 0",
                          }}>
                            <span>{stat}</span>
                            <div style={{ display: "flex", gap: 3 }}>
                              {Array.from({ length: Math.round(map[stat] * 2) }).map((_, i) => (
                                <div key={i} style={{ width: 30, height: 6, borderRadius: 1, background: STAT_COLORS[stat] || "#fff" }} />
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td style={{ ...styles.tdArcana, textAlign: "center" }}>세트효과</td>
                {REC_COLS.map(({ key, selections }) => (
                  <td key={key} style={styles.td}>
                    {renderSetEffectsList(getSetEffects(buildTypeCounts(selections)))}
                  </td>
                ))}
                {presets.map((p) => (
                  <td key={p.id} style={styles.td}>
                    {renderSetEffectsList(getSetEffects(buildTypeCounts(p.selections)))}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
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
    Object.values(CLASS_SKILLS[job] ?? {}).flat()
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
          minWidth: "120px",
          backgroundColor: S.surface2,
          color: value ? selectedColor : S.textDim,
          border: `1px solid ${S.border}`,
          borderRadius: "3px",
          fontSize: "11px",
          textAlign: "center",
          padding: "0 6px",
          height: "18px",
          boxSizing: "border-box",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{value || placeholder}</span>
          <span style={{ fontSize: "10px", color: "#fff" }}>▼</span>
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
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
                    width: twoCols ? "300px" : "150px",
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

function getTopArcanaSkills(job, arcanaName) {
  const skills = (CLASS_SKILLS[job]?.[arcanaName] ?? [])
    .map((s) => (typeof s === "string" ? s : s.name));

  const sorted = [...skills].sort((a, b) => {
    const aMeta = getSkillMeta(job, a);
    const bMeta = getSkillMeta(job, b);
    const aPriority = aMeta?.priority ?? 999;
    const bPriority = bMeta?.priority ?? 999;
    return aPriority - bPriority;
  });

  if (arcanaName === "성배" || arcanaName === "천칭") {
    return sorted
      .filter((skill) => getSkillMeta(job, skill)?.type === "active")
      .slice(0, 4);
  }

  return sorted.slice(0, 4);
}

function renderSkillList(arr) {
  if (!arr || arr.length === 0) return <span style={{ opacity: 0.45 }}>-</span>;
  return (
    <ul style={styles.ul}>
      {arr.slice(0, 4).map((s, i) => (
        <li key={`${s}-${i}`} style={styles.li}>{s}</li>
      ))}
    </ul>
  );
}

function renderSetEffectsList(items) {
  if (!items || items.length === 0) return <span style={{ opacity: 0.45 }}>-</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => (
        <div key={`${item.type}-${item.count}-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid #555",
              background: RECOMMENDED_BG[item.type] || "#222", color: "#fff",
              whiteSpace: "nowrap", lineHeight: 1.1, fontWeight: 400,
            }}>
              {item.type} ({item.count})
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#d6d6d6", lineHeight: 1.4, wordBreak: "keep-all" }}>
            {item.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#1e1e1e", border: "1px solid #3b3b3b", borderRadius: 12, padding: 12,
  },
  header: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 800 },
  sub: { fontSize: 12, opacity: 0.7 },
  tableWrap: { overflowX: "auto", border: "1px solid #333", borderRadius: 10 },
  table: {
    width: "100%", borderCollapse: "separate", borderSpacing: 0,
    minWidth: 110 + 5 * 200 + 180, background: "#181818",
  },
  th: {
    position: "sticky", top: 0, background: "#2a2a2a",
    borderBottom: "1px solid #333", padding: "10px 8px",
    textAlign: "center", fontWeight: 800, fontSize: 13, zIndex: 1,
  },
  td: {
    background: "#181818",
    borderBottom: "1px solid #2f2f2f",
    borderRight: "1px solid #2a2a2a",
    padding: "2px 6px",
    verticalAlign: "top",
    fontSize: 11,
    lineHeight: 1.1,
    // height: "1px",
  },
  tdArcana: {
    borderBottom: "1px solid #4b4b4b",
    borderRight: "1px solid #4b4b4b",
    padding: "3px 6px",
    verticalAlign: "middle",
    textAlign: "center",
    background: "#2a2a2a",
  },
  note: { marginTop: 6, fontSize: 11, opacity: 0.65 },
  ul: { margin: 0, padding: 0, listStyle: "none" },
  li: { margin: "2px 0" },
  footer: { marginTop: 10, fontSize: 12, opacity: 0.7 },
};
