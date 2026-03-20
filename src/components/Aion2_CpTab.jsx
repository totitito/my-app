import { useMemo, useState } from "react";
// import { CP_SOURCES, CP_STATS, CP_WEIGHTS } from "../data/aion2-cpData";
import { CP_STATS, CP_WEIGHTS } from "../data/aion2-cpData";

const S = {
  wrap: {
    padding: "16px",
    background: "#111",
    color: "#eee",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  row: {
    display: "grid",
    // gridTemplateColumns: "220px 180px 120px 120px 72px",
    gridTemplateColumns: "260px 120px 120px 72px",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  head: {
    color: "#aaa",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    height: "32px",
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "0 8px",
    boxSizing: "border-box",
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  cpBox: {
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 10px",
    background: "#181818",
    border: "1px solid #333",
    borderRadius: "6px",
    color: "#ffd66b",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
  },
  btn: {
    height: "32px",
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "6px",
    padding: "0 12px",
    cursor: "pointer",
  },
  total: {
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #2a2a2a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "700",
  },
};

const makeRow = () => ({
  id: `${Date.now()}-${Math.random()}`,
  stat: CP_STATS[0] || "",
  // source: CP_SOURCES[0] || "",
  value: "",
});

// function getWeight(stat, source) {
//   const statWeights = CP_WEIGHTS?.[stat];
//   if (!statWeights) return CP_WEIGHTS?.default ?? 0;
//   if (statWeights[source] != null) return statWeights[source];
//   if (statWeights.default != null) return statWeights.default;
//   return CP_WEIGHTS?.default ?? 0;
// }

function getWeight(stat) {
  const statWeights = CP_WEIGHTS?.[stat];
  if (statWeights == null) return CP_WEIGHTS?.default ?? 0;
  if (typeof statWeights === "number") return statWeights;
  if (statWeights.default != null) return statWeights.default;
  return CP_WEIGHTS?.default ?? 0;
}

export default function Aion2_CpTab() {
  const [rows, setRows] = useState([makeRow()]);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeRow()]);
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const rowCps = useMemo(() => {
    return rows.map((row) => {
      const value = Number(row.value || 0);
      // const weight = getWeight(row.stat, row.source);
      const weight = getWeight(row.stat);
      return value * weight;
    });
  }, [rows]);

  const totalCp = useMemo(() => {
    return rowCps.reduce((sum, cp) => sum + cp, 0);
  }, [rowCps]);

  return (
    <div style={S.wrap}>
      <div style={S.title}>전투력</div>

      <div style={{ ...S.row, ...S.head }}>
        <div>스탯</div>
        {/* <div>출처</div> */}
        <div>값</div>
        <div style={{ textAlign: "right" }}>전투력</div>
        <div></div>
      </div>

      {rows.map((row, idx) => (
        <div key={row.id} style={S.row}>
          <select
            value={row.stat}
            onChange={(e) => updateRow(row.id, { stat: e.target.value })}
            style={S.input}
          >
            {CP_STATS.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>

          {/* <select
            value={row.source}
            onChange={(e) => updateRow(row.id, { source: e.target.value })}
            style={S.input}
          >
            {CP_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select> */}

          <input
            type="number"
            value={row.value}
            onChange={(e) => updateRow(row.id, { value: e.target.value })}
            onFocus={(e) => e.target.select()}
            style={S.input}
          />

          <div style={S.cpBox}>{Math.round(rowCps[idx] || 0).toLocaleString()}</div>

          <button type="button" onClick={() => removeRow(row.id)} style={S.btn}>
            삭제
          </button>
        </div>
      ))}

      <div style={{ marginTop: "10px" }}>
        <button type="button" onClick={addRow} style={S.btn}>
          + 스탯 추가
        </button>
      </div>

      <div style={S.total}>
        <div>총 합계 전투력</div>
        <div style={{ color: "#ffd66b" }}>{Math.round(totalCp).toLocaleString()}</div>
      </div>
    </div>
  );
}