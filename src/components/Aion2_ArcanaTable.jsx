import React, { useEffect, useState } from "react";

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

// 각 아르카나당 1행
const ARCANA_DATA = [
  {
    name: "성배",
    note: "전체 스킬",
    recommended: [
      { main: "활력", sub: "시간 (전투 속도, 강타 저항)" },
      { main: "광분", sub: "시간 (전투 속도, 강타 저항)" },
      { main: "광분", sub: "시간 (전투 속도, 강타 저항)" },
    ],
    skillsByClass: {
      수호성: ["심판", "연속난타", "맹렬한 일격", "격앙"],
      검성: ["분쇄 파동", "내려찍기", "파멸의 맹타", "절단의 맹타"],
      살성: ["심장 찌르기", "빠른 베기", "기습", "문양 폭발"],
      궁성: ["저격", "속사", "조준 화살", "송곳 화살"],
      마도성: ["불꽃 폭발", "불꽃 화살", "혹한의 바람", "불꽃 작살"],
      정령성: ["화염 전소", "냉기 충격", "원소 융합", "현혹: 저주"],
      호법성: ["암격쇄", "격파쇄", "백열격", "쾌유의 주문"],
      치유성: ["쾌유의 광휘", "심판의 번개", "치유의 빛", "재생의 빛"],
    },
  },
  {
    name: "양피지",
    note: "액티브 스킬",
    recommended: [
      { main: "활력", sub: "생명 (생명력, 재생 확률)" },
      { main: "광분", sub: "생명 (생명력, 재생 확률)" },
      { main: "광분", sub: "생명 (생명력, 재생 확률)" },
    ],
    skillsByClass: {
      수호성: ["심판", "맹렬한 일격", "쇠약의 맹타", "징벌"],
      검성: ["내려찍기", "파멸의 맹타", "도약 찍기", "예리한 일격"],
      궁성: ["저격", "속사", "송곳 화살", "파열 화살"],
      살성: ["심장 찌르기", "빠른 베기", "문양 폭발", "암습"],
      마도성: ["불꽃 폭발", "불꽃 화살", "불꽃 작살", "집중의 기원"],
      정령성: ["냉기 충격", "원소 융합", "현혹: 저주", "공간 지배"],
      치유성: ["쾌유의 광휘", "단죄", "악화의 낙인", "벽력"],
      호법성: ["암격쇄", "격파쇄", "회전격", "돌진 격파"],
    },
  },
  {
    name: "나침반",
    note: "액티브 스킬",
    recommended: [
      { main: "순수", sub: "죽음 (치명타, 재생 관통)" },
      { main: "광분", sub: "자유 (명중, 회피)" },
      { main: "광분", sub: "자유 (명중, 회피)" },
    ],

    skillsByClass: {
      수호성: ["연속난타", "비호의 일격", "방패 강타", "방패 돌격"],
      검성: ["분쇄 파동", "절단의 맹타", "유린의 검", "돌진 일격"],
      궁성: ["조준 화살", "표적 화살", "제압 화살", "광풍 화살"],
      살성: ["기습", "맹수의 포효", "폭풍 난무", "섬광 베기"],
      마도성: ["혹한의 바람", "얼음 사슬", "겨울의 속박", "빙결"],
      정령성: ["화염 전소", "소환: 바람", "소환: 물", "영혼의 절규"],
      치유성: ["치유의 빛", "심판의 번개", "재생의 빛", "신성한 기운"],
      호법성: ["백열격", "쾌유의 주문", "타격쇄", "질풍 난무"],
    },
  },
  {
    name: "종",
    note: "패시브 스킬",
    recommended: [
      { main: "순수", sub: "파괴 (공격력, 완벽 저항)" },
      { main: "순수", sub: "파괴 (공격력, 완벽 저항)" },
      { main: "마력", sub: "파괴 (공격력, 완벽 저항)" },
    ],
    skillsByClass: {
      수호성: ["격앙", "체력 강화", "단죄의 가호", "수호의 인장"],
      검성: ["공격 준비", "생존 자세", "피의 흡수", "생존 의지"],
      궁성: ["사냥꾼의 결의", "속박의 눈", "경계의 눈", "회생의 계약"],
      살성: ["강습 자세", "육감 극대화", "회생의 계약", "기습 자세"],
      마도성: ["불의 표식", "냉기 소환", "회생의 계약", "저항의 은혜"],
      정령성: ["정령 타격", "정령 강림", "원소 결집", "정령 교감"],
      치유성: ["불사의 장막", "주신의 은총", "따뜻한 가호", "생존 의지"],
      호법성: ["공격 준비", "생명의 축복", "보호진", "생존 의지"],
    },
  },
  {
    name: "거울",
    note: "패시브 스킬",
    recommended: [
      { main: "순수", sub: "지혜 (강타, 정신력 소모)" },
      { main: "광분", sub: "환상 (재사용 시간, 철벽 관통)" },
      { main: "마력", sub: "지혜 (강타, 정신력 소모)" },
    ],
    skillsByClass: {
      수호성: ["충격 적중", "철벽 방어", "고통 차단", "생존 의지"],
      검성: ["충격 적중", "약점 파악", "노련한 반격", "살기 파멸"],
      궁성: ["집중의 눈", "사냥꾼의 혼", "집중 포화", "근접 사격"],
      살성: ["배후 강타", "빈틈 노리기", "충격 적중", "방어 균열"],
      마도성: ["불꽃의 로브", "생기 증발", "정기 흡수", "강화의 은혜"],
      정령성: ["정신 집중", "침식", "연속 역류", "정령 보호"],
      치유성: ["대지의 은총", "치유력 강화", "찬란한 가호", "주신의 가호"],
      호법성: ["충격 적중", "고취의 주문", "대지의 약속", "바람의 약속"],
    },
  },
  {
    name: "천칭",
    note: "전체 스킬",
    recommended: [
      { main: "순수", sub: "파괴 (공격력, 완벽 저항) /\n운명 (정신력, 철벽 확률)" },
      { main: "순수", sub: "파괴 (공격력, 완벽 저항) /\n운명 (정신력, 철벽 확률)" },
      { main: "광분", sub: "정의 (방어력, 완벽 확률) /\n생명 (생명력, 재생 확률)" },
    ],
    skillsByClass: {
      수호성: [""],
      검성: [""],
      궁성: [""],
      살성: [""],
      마도성: [""],
      정령성: [""],
      치유성: [""],
      호법성: [""],
    },
  },
];

const RECOMMENDED_TOTALS = [
  ["전투 속도", "강타", "-", "-", "공격력", "공격력", "치명타", "정신력 소모"],
  ["전투 속도", "-", "명중", "재사용 시간", "공격력", "공격력", "-", "-"],
  ["전투 속도", "강타", "명중", "-", "공격력", "-", "-", "정신력 소모"],
];

const STAT_COLORS = {
  // 1티어 공격
  "전투 속도": "#ff4d4d",
  강타: "#ff4d4d",
  공격력: "#ff4d4d",
  치명타: "#ff4d4d",
  쿨감: "#ff4d4d",

  // 2티어 공격
  명중: "#ff9a3c",

  // 3티어 공격
  // 완벽: "#ffff00",
  완벽: "#bbbbbb",

  // 4티어 공격
  "이동 속도": "#bbbbbb",  
  "철벽 관통": "#bbbbbb",
  "재생 관통": "#bbbbbb",

  // 정신력 계열
  "정신력 소모": "#3bd16f",
  정신력: "#3bd16f",

  // 일반 방어
  방어력: "#4da6ff",
  회피: "#4da6ff",
  생명력: "#4da6ff",
  "재생 확률": "#4da6ff",
  막기: "#4da6ff",

  // PVP 방어
  철벽: "#00ffff",
  "강타 저항": "#b06cff",
  "완벽 저항": "#b06cff",
};

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

function buildSkillTotalsByClass(arcanaData) {
  const totals = {};

  CLASSES.forEach((cls) => {
    const map = new Map();

    arcanaData.forEach((arc) => {
      const skills = arc.skillsByClass?.[cls] || [];
      skills.slice(0, 4).forEach((s) => {
        if (!s) return;
        map.set(s, (map.get(s) || 0) + 1); // ✅ 등장 횟수 누적
      });
    });

    // 보기 좋게: 많이 등장한 순 → 이름순
    totals[cls] = Array.from(map.entries())
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0], "ko"))
      .map(([name, cnt]) => ({ name, cnt }));
  });

  return totals;
}

function emptySkills() {
  return Object.fromEntries(CLASSES.map((c) => [c, []]));
}

function ArcanaStatCell({
  arcName,
  selectedType,
  locked = false,
  onChange,
}) {
  const result = ARCANA_SIM_RESULT[arcName]?.[selectedType] ?? { godStats: [], detailStats: [] };

  return (
    <td
      style={{
        ...styles.td,
        background: "#181818",
        verticalAlign: "middle",
        textAlign: "center",
      }}
    >
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

  const [simSelections, setSimSelections] = useState(() => {
    const saved = localStorage.getItem("aion2-arcana-sim-selections");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    return {
      preset1: {
        성배: "활력",
        양피지: "활력",
        나침반: "활력",
        종: "활력",
        거울: "활력",
        천칭: "광분",
      },
      preset2: {
        성배: "활력",
        양피지: "활력",
        나침반: "활력",
        종: "활력",
        거울: "활력",
        천칭: "광분",
      },
    };
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    return localStorage.getItem("aion2-selected-class") || "수호성";
  });

  const handleSimChange = (preset, arcanaName, value) => {
    if (arcanaName === "천칭" && (value === "활력" || value === "마력")) {
      return;
    }

    setSimSelections((prev) => ({
      ...prev,
      [preset]: {
        ...prev[preset],
        [arcanaName]: value,
      },
    }));
  };

  const getSimResult = (arcanaName, forcedType, preset = "preset1") => {
    const selectedType = forcedType ?? simSelections[preset]?.[arcanaName] ?? simSelections[arcanaName];
    return ARCANA_SIM_RESULT[arcanaName]?.[selectedType] ?? { godStats: [], detailStats: [] };
  };

  useEffect(() => {
    localStorage.setItem(
      "aion2-arcana-sim-selections",
      JSON.stringify(simSelections)
    );
  }, [simSelections]);

  useEffect(() => {
    localStorage.setItem("aion2-selected-class", selectedClass);
  }, [selectedClass]);

  const STAT_ORDER = [
    "강타",
    "전투 속도",
    "공격력",
    "치명타",
    "쿨감",

    "명중",    

    "이동 속도",
    "완벽",
    "철벽 관통",
    "재생 관통",

    "정신력 소모",
    "정신력",

    "생명력",
    "방어력",
    "회피",
    "막기",
    "재생 확률",

    "철벽",
    "강타 저항",
    "완벽 저항",
  ];

  const SET_EFFECTS = {
    활력: {
      // 2: { type: "활력", count: 2, desc: "생명력 70% 이상일 때 PVE 공격력 60 증가" },
      2: { type: "활력", count: 2, desc: "PVE 공격력 60" },
      // 4: { type: "활력", count: 4, desc: "생명력 70% 이상일 때 PVE 공격력 150 증가" },
      4: { type: "활력", count: 4, desc: "PVE 공격력 150" },
    },
    마력: {
      // 2: { type: "마력", count: 2, desc: "정신력이 20% 이하일 때 정신력 1500 회복 (재시전 시간 30초)" },
      // 4: { type: "마력", count: 4, desc: "정신력이 50% 이상일 때 PVE 방어력 1000 증가" },
      2: { type: "마력", count: 2, desc: "정신력 1500 회복" },
      4: { type: "마력", count: 4, desc: "PVE 방어력 1000" },
    },
    광분: {
      // 2: { type: "광분", count: 2, desc: "PVE 공격력 50 증가" },
      // 4: { type: "광분", count: 4, desc: "보스 피해 증폭 5%, 생명력이 70% 이하일 때 보스 피해 내성 10% 증가" },
      2: { type: "광분", count: 2, desc: "PVE 공격력 50" },
      4: { type: "광분", count: 4, desc: "보피증 5%, 보피내 10%" },
    },
    순수: {
      // 2: { type: "순수", count: 2, desc: "PVE 방어력 500 증가" },
      // 4: { type: "순수", count: 4, desc: "치명타 피해 증폭 5%, 생명력이 70% 이하일 때 방어력 1000 증가" },
      2: { type: "순수", count: 2, desc: "PVE 방어력 500" },
      4: { type: "순수", count: 4, desc: "치피증 5%, 방어력 1000" },
    },
  };

  function getSetEffects(typeCounts) {
    const result = [];

    ["활력", "마력", "광분", "순수"].forEach((type) => {
      const count = typeCounts[type] || 0;
      if (count >= 2) result.push(SET_EFFECTS[type][2]);
      if (count >= 4) result.push(SET_EFFECTS[type][4]);
    });

    return result;
  }

  const COLUMN_KEYS = ["rec1", "rec2", "rec3", "preset1", "preset2"];

  function getSelectedTypeByKey(key, arc, simSelections) {
    if (key === "rec1") return arc.recommended?.[0]?.main;
    if (key === "rec2") return arc.recommended?.[1]?.main;
    if (key === "rec3") return arc.recommended?.[2]?.main;
    if (key === "preset1") return simSelections.preset1?.[arc.name] ?? simSelections[arc.name];
    if (key === "preset2") return simSelections.preset2?.[arc.name];
    return null;
  }

  function buildTypeCounts(key, arcanaData, simSelections) {
    const counts = {};

    arcanaData.forEach((arc) => {
      const type = getSelectedTypeByKey(key, arc, simSelections);
      if (type) counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
  }

  function buildDetailStatsMap(key, arcanaData, simSelections) {
    const map = {};

    arcanaData.forEach((arc) => {
      const type = getSelectedTypeByKey(key, arc, simSelections);
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

  const detailStatsMaps = Object.fromEntries(
    COLUMN_KEYS.map((key) => [key, buildDetailStatsMap(key, ARCANA_DATA, simSelections)])
  );

  const detailStatsLists = Object.fromEntries(
    COLUMN_KEYS.map((key) => [
      key,
      Object.keys(detailStatsMaps[key]).sort(
        (a, b) => STAT_ORDER.indexOf(a) - STAT_ORDER.indexOf(b)
      ),
    ])
  );

  const typeCountsMap = Object.fromEntries(
    COLUMN_KEYS.map((key) => [key, buildTypeCounts(key, ARCANA_DATA, simSelections)])
  );

  return (
    <div style={{ marginTop: 12 }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.title}>아르카나</div>
          {/* <div style={styles.sub}>천칭(예정)은 제외한 5종 기준</div> */}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <colgroup>
              <col style={{ width: 110 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 120 }} />
            </colgroup>

            <thead>
              <tr>
                <th style={styles.th}>아르카나</th>
                <th style={styles.th}>추천1<br/>2활력+4순수<br/>(활력 성배 잘 뜬 경우)</th>
                <th style={styles.th}>추천2<br/>4광분+2순수</th>
                <th style={styles.th}>추천3<br/>4광분+2마력</th>
                <th style={styles.th}>프리셋1</th>
                <th style={styles.th}>프리셋2</th>

                <th style={styles.th}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                    <div>추천 스킬</div>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      style={{
                        background: "#1f1f1f",
                        color: "#fff",
                        border: "1px solid #555",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: 12,
                      }}
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>

              </tr>
            </thead>

            <tbody>
              {ARCANA_DATA.map((arc) => (
                <tr key={arc.name}>
                  <td style={{ ...styles.tdArcana }}>
                    <div style={{ fontWeight: 800 }}>{arc.name}</div>
                    <div style={styles.note}>{arc.note}</div>
                  </td>

                  {arc.recommended.map((rec, i) => (
                    <ArcanaStatCell
                      key={i}
                      arcName={arc.name}
                      selectedType={rec.main}
                      locked={true}
                    />
                  ))}

                  <ArcanaStatCell
                    arcName={arc.name}
                    selectedType={simSelections.preset1?.[arc.name] || simSelections[arc.name] || "활력"}
                    locked={false}
                    onChange={(opt) => handleSimChange("preset1", arc.name, opt)}
                  />

                  <ArcanaStatCell
                    arcName={arc.name}
                    selectedType={simSelections.preset2?.[arc.name] || "활력"}
                    locked={false}
                    onChange={(opt) => handleSimChange("preset2", arc.name, opt)}
                  />

                  <td style={styles.td}>
                    {renderSkillList(arc.skillsByClass?.[selectedClass])}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td style={{ ...styles.tdArcana, textAlign: "center" }}>
                  합계
                </td>

                {COLUMN_KEYS.map((key) => (
                  <td key={`sum-${key}`} style={styles.td}>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {detailStatsLists[key].map((stat, idx) => (
                        <li key={`${key}-${stat}-${idx}`} style={{ color: STAT_COLORS[stat] || "#fff" }}>
                          <li
                            key={`${key}-${stat}-${idx}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              color: STAT_COLORS[stat] || "#fff",
                              borderBottom: idx < detailStatsLists[key].length - 1 ? "1px solid #2a2a2a" : "none",
                              padding: "2px 0",
                            }}
                          >
                            <span>
                              {/* {stat}{detailStatsMaps[key][stat] === 1 ? "" : ` x${detailStatsMaps[key][stat]}`} */}
                              {stat}
                            </span>

                            <div style={{ display: "flex", gap: 3 }}>
                              {Array.from({ length: Math.round(detailStatsMaps[key][stat] * 2) }).map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: 30,
                                    height: 6,
                                    borderRadius: 1,
                                    background: STAT_COLORS[stat] || "#fff",
                                  }}
                                />
                              ))}
                            </div>
                          </li>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}

                <td style={styles.td}></td>
              </tr>
              
              <tr>
                <td style={{ ...styles.tdArcana, textAlign: "center" }}>
                  세트효과
                </td>

                {COLUMN_KEYS.map((key) => (
                  <td key={`set-${key}`} style={styles.td}>
                    {renderSetEffectsList(getSetEffects(typeCountsMap[key]))}
                  </td>
                ))}

                <td style={styles.td}></td>
              </tr>

            </tfoot>

          </table>
        </div>
      </div>
    </div>
  );
}

function renderSkillList(arr) {
  if (!arr || arr.length === 0) return <span style={{ opacity: 0.45 }}>-</span>;
  return (
    <ul style={styles.ul}>
      {arr.slice(0, 4).map((s, i) => (
        <li key={`${s}-${i}`} style={styles.li}>
          {s}
        </li>
      ))}
    </ul>
  );
}

function renderSetEffectsList(items) {
  if (!items || items.length === 0) {
    return <span style={{ opacity: 0.45 }}>-</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, idx) => (
        <div key={`${item.type}-${item.count}-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 8px",
                fontSize: 11,
                borderRadius: 6,
                border: "1px solid #555",
                background: RECOMMENDED_BG[item.type] || "#222",
                color: "#fff",
                whiteSpace: "nowrap",
                lineHeight: 1.1,
                fontWeight: 400,
              }}
            >
              {item.type} ({item.count})
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#d6d6d6",
              lineHeight: 1.4,
              wordBreak: "keep-all",
            }}
          >
            {item.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderTotalsList(items) {
  if (!items || items.length === 0)
    return <span style={{ opacity: 0.45 }}>-</span>;

  return (
    <ul style={styles.ul}>
      {items.map(({ name, cnt }) => (
        <li
          key={name}
          style={{
            ...styles.li,
            color: "#e4daad",
            fontWeight: 500
          }}
        >
          {name} +{cnt}
        </li>
      ))}
    </ul>
  );
}

const styles = {
  card: {
    background: "#1e1e1e",
    border: "1px solid #3b3b3b",
    borderRadius: 12,
    padding: 12,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: 800 },
  sub: { fontSize: 12, opacity: 0.7 },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #333",
    borderRadius: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: 110 + 5 * 200 + 180,
    background: "#181818",
  },
  th: {
    position: "sticky",
    top: 0,
    background: "#2a2a2a",
    borderBottom: "1px solid #333",
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 800,
    fontSize: 13,
    zIndex: 1,
  },
  td: {
    background: "#181818",
    borderBottom: "1px solid #2f2f2f",
    borderRight: "1px solid #2a2a2a",
    padding: "8px 10px",
    verticalAlign: "top",
    fontSize: 13,
    lineHeight: 1.35,
  },
  tdArcana: {
    borderBottom: "1px solid #2f2f2f",
    borderRight: "1px solid #2a2a2a",
    padding: "8px 10px",
    verticalAlign: "middle",
    textAlign: "center",
    background: "#2a2a2a",
  },
  note: { marginTop: 6, fontSize: 11, opacity: 0.65 },
  ul: { 
    margin: 0, 
    padding: 0,
    listStyle: "none"
  },
  li: { margin: "2px 0" },
  footer: { marginTop: 10, fontSize: 12, opacity: 0.7 },
};