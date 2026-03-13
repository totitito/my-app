import { CLASS_SKILLS } from "../data/aion2-SkillList";
import { useMemo, useState, useEffect } from "react";
import AION2_SKILL_DB from "../data/aion2-skillpriority.json";

export default function Aion2_SkillTable({ selectedJob: externalJob, onChangeJob }) {
  const jobs = useMemo(
    () => ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"],
    []
  );

  const [internalJob, setInternalJob] = useState(() => {
    return localStorage.getItem("aion2-skill-job") || jobs[0];
  });

  const job = externalJob ?? internalJob;

  useEffect(() => {
    localStorage.setItem("aion2-skill-job", job);
  }, [job]);

  // ✅ 정적 JSON에서 선택 직업 데이터 읽기
  const payload = AION2_SKILL_DB.jobs?.[job] ?? null;

  const rowsByType = (type) => {
    const allowed = new Set(
      Object.entries(CLASS_SKILLS[job] ?? {})
        .filter(([k]) => k !== "stigma")
        .flatMap(([, v]) => v)
    );

    return (payload?.data?.[type] ?? []).filter((x) =>
      allowed.has(x.skill_name)
    );
  };

  const rowsStigma = () => {
    const allowed = new Set(CLASS_SKILLS[job]?.stigma ?? []);
    return (payload?.data?.stigma ?? []).filter((x) => allowed.has(x.skill_name));
  };

  const SimpleTable = ({ title, rows }) => (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>우선</th>
              <th style={th}>스킬명</th>
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
                <td style={td} colSpan={4}>데이터 없음</td>
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
        <div style={{ fontWeight: "bold" }}>스킬 채택률</div>

        <select
          value={job}
          onChange={(e) => {
            if (onChangeJob) onChangeJob(e.target.value);
            else setInternalJob(e.target.value);
          }}
        >
          {jobs.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", color: "#aaa", fontSize: 12 }}>
          업데이트: {formatKST(AION2_SKILL_DB.updatedAt)}
        </div>
      </div>

      {/* <div style={{ color: "#aaa", fontSize: 13 }}>
        현재 선택: <b style={{ color: "#fff" }}>{job}</b>
      </div> */}

      {!payload ? (
        <div style={{ marginTop: 10, color: "#ff8080", fontSize: 12, whiteSpace: "pre-wrap" }}>
          데이터가 없습니다. (네가 aion2-skillpriority.json 갱신 후 배포해야 함)
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 10 }}>
          <SimpleTable title="액티브" rows={rowsByType("active")} />
          <SimpleTable title="패시브" rows={rowsByType("passive")} />
          <SimpleTable title="스티그마" rows={rowsStigma()} />
        </div>
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

function formatKST(iso) {
  if (!iso) return "없음";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "없음";

  return d.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}