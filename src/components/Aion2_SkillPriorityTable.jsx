import { useMemo, useState } from "react";

export default function Aion2_SkillTable() {
  const jobs = useMemo(() => ([
    "검성", "수호성", "살성", "궁성", "마도성", "정령성", "치유성", "호법성"
  ]), []);

  const [job, setJob] = useState(jobs[0]);

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
          {jobs.map(j => <option key={j} value={j}>{j}</option>)}
        </select>

        <button
          style={{ marginLeft: "auto", padding: "6px 10px", border: "1px solid #444", borderRadius: 8, background: "#333", color: "#fff" }}
          onClick={() => alert("다음 스텝에서 아툴 API 붙일 예정")}
        >
          갱신
        </button>
      </div>

      <div style={{ color: "#aaa", fontSize: 13 }}>
        현재 선택: <b style={{ color: "#fff" }}>{job}</b>
      </div>

      <div style={{ marginTop: 10, color: "#888", fontSize: 12 }}>
        (여기에 표가 들어갈 자리) — 다음 스텝에서 aion2tool 통계 데이터를 붙여서 렌더링할 거임
      </div>
    </div>
  );
}