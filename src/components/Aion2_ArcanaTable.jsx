import React from "react";

const CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

// 각 아르카나당 1행
const ARCANA_DATA = [
  {
    name: "성배",
    note: "전체 스킬",
    recommended: "활력",
    skillsByClass: {
      수호성: ["심판", "연속난타", "맹렬한 일격", "격앙"],
      검성: ["분쇄 파동", "내려찍기", "파멸의 맹타", "절단의 맹타"],
      살성: ["심장 찌르기", "빠른 베기", "기습", "문양 폭발"],
      궁성: ["저격", "속사", "조준 화살", "송곳 화살"],
      마도성: ["불꽃 폭발", "불꽃 화살", "혹한의 바람", "불꽃 작살"],
      정령성: ["화염 전소", "냉기 충격", "원소 융합", "현혹 : 저주"],
      호법성: ["암격쇄", "격파쇄", "백열격", "쾌유의 주문"],
      치유성: ["쾌유의 광휘", "심판의 번개", "치유의 빛", "재생의 빛"],
    },
  },
  {
    name: "양피지",
    note: "액티브 스킬",
    recommended: "활력",
    skillsByClass: {
      수호성: ["심판", "맹렬한 일격", "쇠약의 맹타", "징벌"],
      검성: ["내려찍기", "파멸의 맹타", "도약 찍기", "예리한 일격"],
      궁성: ["저격", "속사", "송곳 화살", "파열 화살"],
      살성: ["심장 찌르기", "빠른 베기", "문양 폭발", "암습"],
      마도성: ["불꽃 폭발", "불꽃 화살", "불꽃 작살", "집중의 기원"],
      정령성: ["냉기 충격", "원소 융합", "현혹 : 저주", "공간 지배"],
      치유성: ["쾌유의 광휘", "단죄", "악화의 낙인", "벽력"],
      호법성: ["암격쇄", "격파쇄", "회전격", "돌진 격파"],
    },
  },
  {
    name: "나침반",
    note: "액티브 스킬",
    recommended: "순수",
    skillsByClass: {
      수호성: ["연속난타", "비호의 일격", "방패 강타", "방패 돌격"],
      검성: ["분쇄 파동", "절단의 맹타", "유린의 검", "돌진 일격"],
      궁성: ["조준 화살", "표적 화살", "제압 화살", "광풍 화살"],
      살성: ["기습", "맹수의 포효", "폭풍 난무", "섬광 베기"],
      마도성: ["혹한의 바람", "얼음 사슬", "겨울의 속박", "빙결"],
      정령성: ["화염 전소", "소환 : 바람", "소환 : 물", "영혼의 절규"],
      치유성: ["치유의 빛", "심판의 번개", "재생의 빛", "신성한 기운"],
      호법성: ["백열격", "쾌유의 주문", "타격쇄", "질풍 난무"],
    },
  },
  {
    name: "종",
    note: "패시브 스킬",
    recommended: "순수",
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
    recommended: "순수",
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
    recommended: "순수",
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

export default function Aion2_ArcanaTable() {

  const totalsByClass = buildSkillTotalsByClass(ARCANA_DATA);

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
              <col style={{ width: 90 }} />
              {CLASSES.map((c) => (
                <col key={c} style={{ width: 140 }} />
              ))}
            </colgroup>

            <thead>
              <tr>
                <th style={styles.th}>아르카나</th>
                <th style={styles.th}>추천</th>
                {CLASSES.map((c) => (
                  <th key={c} style={styles.th}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ARCANA_DATA.map((arc) => (
                <tr key={arc.name}>
                  <td style={{ ...styles.tdArcana }}>
                    <div style={{ fontWeight: 800 }}>{arc.name}</div>
                    <div style={styles.note}>{arc.note}</div>
                  </td>

                  <td style={styles.tdRecommended}>
                    {arc.recommended}
                  </td>

                  {CLASSES.map((cls) => (
                    <td key={`${arc.name}-${cls}`} style={styles.td}>
                      {renderSkillList(arc.skillsByClass?.[cls])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td style={{ ...styles.tdRecommended, color: "#d8c77a" }}>
                  <div style={{ fontWeight: 800 }}>합계</div>
                  {/* <div style={styles.note}>중복 포함</div> */}
                </td>

                <td style={styles.tdRecommended}>-</td>

                {CLASSES.map((cls) => (
                  <td key={`total-${cls}`} style={styles.td}>
                    {renderTotalsList(totalsByClass[cls])}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* <div style={styles.footer}>
          * 추천은 활력 / 마력 / 무관 중 하나만 표기.
        </div> */}
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
            color: "#e4daad",   // ⭐ 옅은 노랑
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
    minWidth: 110 + 90 + 8 * 140,
    background: "#181818",
  },
  th: {
    position: "sticky",
    top: 0,
    background: "#222",
    borderBottom: "1px solid #333",
    padding: "10px 8px",
    textAlign: "center",
    fontWeight: 800,
    fontSize: 13,
    zIndex: 1,
  },
  td: {
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
    verticalAlign: "top",
    background: "#1b1b1b",
  },
  tdRecommended: {
    borderBottom: "1px solid #2f2f2f",
    borderRight: "1px solid #2a2a2a",
    padding: "8px",
    textAlign: "center",
    fontWeight: 800,
    background: "#202020",
  },
  note: { marginTop: 6, fontSize: 11, opacity: 0.65 },
  ul: { 
    margin: 0, 
    //paddingLeft: 16,
    // textAlign: "center",
    padding: 0,
    listStyle: "none"
  },
  li: { margin: "2px 0" },
  footer: { marginTop: 10, fontSize: 12, opacity: 0.7 },
};