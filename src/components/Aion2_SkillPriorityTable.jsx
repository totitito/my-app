import { useMemo, useState } from "react";
import AION2_SKILL_DB from "../data/aion2-skillpriority.json";

export default function Aion2_SkillTable() {
  const jobs = useMemo(
    () => ["검성", "수호성", "살성", "궁성", "마도성", "정령성", "치유성", "호법성"],
    []
  );

  const [job, setJob] = useState(jobs[0]);

  // ✅ 정적 JSON에서 선택 직업 데이터 읽기
  const payload = AION2_SKILL_DB.jobs?.[job] ?? null;

  const rowsByType = (type) => payload?.data?.[type] ?? [];

  const SimpleTable = ({ title, rows }) => (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>우선</th>
              <th style={th}>스킬명</th>
              <th style={th}>타입</th>
              <th style={th}>채택률</th>
              <th style={th}>평균레벨</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 30).map((x, idx) => (
              <tr key={`${x.skill_name}-${idx}`}>
                <td style={tdCenter}>{x.priority}</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {x.skill_icon ? (
                      <img src={x.skill_icon} alt="" style={{ width: 22, height: 22 }} />
                    ) : null}
                    <span>{x.skill_name ?? "-"}</span>
                  </div>
                </td>
                <td style={tdCenter}>{x.skill_type ?? "-"}</td>
                <td style={tdCenter}>
                  {typeof x.adoption_rate === "number" ? `${x.adoption_rate.toFixed(2)}%` : "-"}
                </td>
                <td style={tdCenter}>
                  {typeof x.average_level === "number" ? x.average_level.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={5}>데이터 없음</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 12, border: "1px solid #444", borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontWeight: "bold" }}>AION2 스킬 우선순위(통계)</div>

        <select
          value={job}
          onChange={(e) => setJob(e.target.value)}
          style={{
            background: "#1e1e1e",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: 8,
            padding: "6px 10px",
          }}
        >
          {jobs.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", color: "#aaa", fontSize: 12 }}>
          업데이트: {AION2_SKILL_DB.updatedAt || "없음"}
        </div>
      </div>

      <div style={{ color: "#aaa", fontSize: 13 }}>
        현재 선택: <b style={{ color: "#fff" }}>{job}</b>
      </div>

      {!payload ? (
        <div style={{ marginTop: 10, color: "#ff8080", fontSize: 12, whiteSpace: "pre-wrap" }}>
          데이터가 없습니다. (네가 aion2-skillpriority.json 갱신 후 배포해야 함)
        </div>
      ) : (
        <>
          <SimpleTable title="Active" rows={rowsByType("active")} />
          <SimpleTable title="Passive" rows={rowsByType("passive")} />
          <SimpleTable title="Stigma" rows={rowsByType("stigma")} />
        </>
      )}
    </div>
  );
}

const th = {
  textAlign: "center",
  borderBottom: "1px solid #444",
  padding: "8px 6px",
  position: "sticky",
  top: 0,
  background: "#111",
};

const td = {
  borderBottom: "1px solid #333",
  padding: "8px 6px",
};

const tdCenter = {
  ...td,
  textAlign: "center",
};