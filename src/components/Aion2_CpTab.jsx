import { useMemo, useState } from "react";
import { CP_STATS, CP_WEIGHTS } from "../data/aion2-cpData";

const STAT_PLACEHOLDER = "스탯 선택";

const SORTED_CP_STATS = [...CP_STATS].sort((a, b) => {
  const aEng = /^[A-Za-z]/.test(a);
  const bEng = /^[A-Za-z]/.test(b);
  if (aEng !== bEng) return aEng ? 1 : -1;
  return a.localeCompare(b, "ko");
});

const S = {
  wrap: {
    padding: "16px",
    background: "#111",
    color: "#eee",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "12px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "240px 140px 180px 60px",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },
  head: {
    color: "#aaa",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "10px",
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
    color: "#fff",
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
  stat: "스탯 선택",
  value: "",
});

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
    setRows((prev) => {
      const next = prev.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      );

      const last = next[next.length - 1];
      if (last.stat !== "스탯 선택" || String(last.value || "") !== "") {
        next.push({
          id: `${Date.now()}-${Math.random()}`,
          stat: "스탯 선택",
          value: "",
        });
      }

      return next;
    });
  };

  const removeRow = (id) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length === 0
        ? [{ id: `${Date.now()}-${Math.random()}`, stat: "스탯 선택", value: "" }]
        : next;
    });
  };

  const rowCps = useMemo(() => {
    return rows.map((row) => {
      if (row.stat === "스탯 선택") return 0;   // ← 추가
      const value = Number(row.value || 0);
      const weight = getWeight(row.stat);
      return value * weight;
    });
  }, [rows]);

  const totalCp = useMemo(() => {
    return rowCps.reduce((sum, cp) => sum + cp, 0);
  }, [rowCps]);

  return (
    <div style={S.wrap}>
      <div style={S.title}>
        <span>전투력 계산기  </span>
        <span style={{ color: "#7e7e7e", fontSize: "14px", fontWeight: "700" }}>
          (※ 스탯값이 같아도 캐릭 스펙에 따라 전투력 환산값이 다르므로 참고만 할 것)
        </span>
      </div>

      <div style={{ ...S.row, ...S.head, fontSize: "14px" }}>
        <div>스탯</div>
        <div>값</div>
        <div style={{ whiteSpace: "nowrap" }}>전투력</div>
      </div>

      {rows.map((row, idx) => (
        <div key={row.id} style={S.row}>
          <select
            value={row.stat}
            onChange={(e) => updateRow(row.id, { stat: e.target.value })}
            style={S.input}
          >
            <option value="스탯 선택">스탯 선택</option>
            {SORTED_CP_STATS.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={row.value}
            onChange={(e) => updateRow(row.id, { value: e.target.value })}
            onFocus={(e) => e.target.select()}
            style={S.input}
          />

          <div style={{ position: "relative" }}>
            {idx === 0 && (
              <div style={{
                position: "absolute",
                top: "-36px",
                left: 0,
                right: 0,
                textAlign: "right",
                fontSize: "22px",
                color: "#ffd66b",
                fontWeight: "700",
                paddingRight: "10px",
                fontVariantNumeric: "tabular-nums",
              }}>
                {Math.round(totalCp).toLocaleString()}
              </div>
            )}
            <div style={S.cpBox}>{Math.round(rowCps[idx] || 0).toLocaleString()}</div>
          </div>

          <button type="button" onClick={() => removeRow(row.id)} style={S.btn}>
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}