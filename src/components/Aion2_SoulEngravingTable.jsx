// src/components/SoulEngravingTable.jsx
export default function SoulEngravingTable() {
  const columns = [
    { key: "src", label: "구분", headBg: "#222" },
    { key: "w", label: "무기/가더", headBg: "rgb(92, 55, 55)" },
    { key: "h", label: "투구", headBg: "#222" },
    { key: "s", label: "견갑", headBg: "#222" },
    { key: "c", label: "상의", headBg: "#222" },
    { key: "p", label: "하의", headBg: "#222" },
    { key: "g", label: "장갑", headBg: "#222" },
    { key: "m", label: "망토", headBg: "#222" },
    { key: "sh", label: "신발", headBg: "#222" },
    { key: "n", label: "목걸이/귀걸이", headBg: "#222" },
    { key: "r", label: "반지", headBg: "#3d2c58" },
  ];

  const rows = [
    {
      tier: "SS",
      cells: {
        w: [{ t: "전투 속도", c: "red" }],
        h: [{ t: "공격력 증가", c: "red" }],
        s: [{ t: "치피증", c: "red" }],
        c: [{ t: "피증", c: "red" }],
        p: [{ t: "공격력 증가", c: "red" }],
        g: [{ t: "전투 속도", c: "red" }],
        m: [{ t: "공격력 증가", c: "red" }],
        sh: [{ t: "이동 속도", c: "red" }],
        r: [{ t: "주요 액티브", c: "red" }],
      },
    },
    {
      tier: "S",
      cells: {
        w: [{ t: "무피증", c: "red" }, { t: "위력" }, { t: "정확" }],
        h: [{ t: "강타" }, { t: "받는 치유량", c: "blue" }, { t: "주요 패시브" }],
        s: [{ t: "주요 패시브" }],
        c: [{ t: "주요 패시브" }],
        p: [{ t: "피해 내성", c: "blue" }, { t: "주요 패시브" }],
        g: [{ t: "주요 패시브" }],
        m: [{ t: "강타" }, { t: "치명타 피해 내성", c: "blue" }, { t: "주요 패시브" }],
        sh: [{ t: "주요 패시브" }],
        n: [{ t: "주요 패시브" }],
      },
    },
    {
      tier: "A",
      cells: {
        w: [{ t: "피증" }, { t: "다단히트" }, { t: "명중" }],
        h: [{ t: "명중" }],
        s: [{ t: "명중" }],
        c: [{ t: "명중" }],
        p: [{ t: "명중" }],
        g: [{ t: "명중" }],
        m: [{ t: "명중" }],
        sh: [{ t: "명중" }],
        n: [{ t: "명중" }],
        r: [{ t: "명중" }],
      },
    },
    {
      tier: "B",
      cells: {
        w: [{ t: "공격력" }, { t: "치명타" }],
        h: [{ t: "공격력" }, { t: "치명타" }],
        s: [{ t: "공격력" }, { t: "치명타" }],
        c: [{ t: "공격력" }, { t: "치명타" }],
        p: [{ t: "공격력" }, { t: "치명타" }],
        g: [{ t: "공격력" }, { t: "치명타" }],
        m: [{ t: "공격력" }, { t: "치명타" }],
        sh: [{ t: "공격력" }, { t: "치명타" }],
        n: [{ t: "공격력" }, { t: "치명타" }],
        r: [{ t: "공격력" }, { t: "치명타" }],
      },
    },
    {
      tier: "C",
      cells: {
        h: [{ t: "철벽", c: "blue" }],
        s: [{ t: "방어력 증가", c: "blue" }],
        c: [{ t: "철벽", c: "blue" }],
        p: [{ t: "철벽", c: "blue" }],
        g: [{ t: "완벽" }, { t: "방어력 증가", c: "blue" }, { t: "철벽", c: "blue" }],
        m: [{ t: "완벽" }],
        sh: [{ t: "완벽" }, { t: "방어력 증가", c: "blue" }],
      },
    },
  ];

  const styles = {
    wrap: {
			overflowX: "auto",
			border: "1px solid #555",          // ✅ 바깥 테두리 회색으로
			borderRadius: 12,
			background: "#0f0f0f",
    },
    table: {
			borderCollapse: "separate",         // ✅ 셀 테두리 보이게
			borderSpacing: 0,
			width: "max-content",
			minWidth: "100%",
    },
    th: {
			borderRight: "1px solid #555",
			borderBottom: "1px solid #555",
			padding: "10px 12px",
			textAlign: "center",
			fontWeight: "bold",
			whiteSpace: "nowrap",
			background: "#2a2a2a",
			color: "#ffffff",
    },
    tier: {
			borderRight: "1px solid #555",
			borderBottom: "1px solid #555",
			padding: "10px 12px",
			textAlign: "center",
			fontWeight: "bold",
			background: "#222",
			color: "#f2f2f2",
			position: "sticky",
			left: 0,
			zIndex: 2,
			whiteSpace: "nowrap",
    },
    td: {
			borderRight: "1px solid #555",
			borderBottom: "1px solid #555",
			padding: "10px 12px",
			textAlign: "center",
			verticalAlign: "middle",
			minWidth: 92,
			background: "#111",
			color: "#ddd",
			whiteSpace: "nowrap",
    },
    red:  { color: "#c96b6b", fontWeight: "bold" },
		blue: { color: "#7aa2e3", fontWeight: "bold" },
    sepTop: { borderTop: "3px solid #111" },
  };

  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  background: col.headBg,
                  position: col.key === "src" ? "sticky" : "static",
                  left: col.key === "src" ? 0 : undefined,
                  zIndex: col.key === "src" ? 3 : 1,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.tier} style={idx > 0 ? styles.sepTop : undefined}>
              <td style={styles.tier}>{row.tier}</td>

              {columns
                .filter((c) => c.key !== "src")
                .map((col) => {
                  const items = row.cells[col.key] ?? [];
                  return (
                    <td key={col.key} style={styles.td}>
                      {items.map((it, i) => (
                        <div
                          key={i}
                          style={it.c === "red" ? styles.red : it.c === "blue" ? styles.blue : undefined}
                        >
                          {it.t}
                        </div>
                      ))}
                    </td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}