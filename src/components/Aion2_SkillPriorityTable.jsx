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

  const [sortKey, setSortKey] = useState("priority");

  const job = externalJob ?? internalJob;

  useEffect(() => {
    localStorage.setItem("aion2-skill-job", job);
  }, [job]);

  // ✅ 정적 JSON에서 선택 직업 데이터 읽기
  const payload = AION2_SKILL_DB.jobs?.[job] ?? null;

  const sortRows = (rows) => {
    const arr = [...rows];

    if (sortKey === "priority") {
      arr.sort((a, b) => a.priority - b.priority);
    }

    if (sortKey === "level") {
      arr.sort((a, b) => (b.average_level ?? 0) - (a.average_level ?? 0));
    }

    return arr;
  };

  const rowsByType = (type) => {
    const allowed = new Set(
      Object.entries(CLASS_SKILLS[job] ?? {})
        .filter(([k]) => k !== "stigma")
        .flatMap(([, v]) => v)
    );

    return sortRows(
      (payload?.data?.[type] ?? []).filter((x) =>
        allowed.has(x.skill_name)
      )
    );
  };

  const rowsStigma = () => {
    const allowed = new Set(CLASS_SKILLS[job]?.stigma ?? []);
    return (payload?.data?.stigma ?? []).filter((x) => allowed.has(x.skill_name));
  };

  const getRateNum = (value) => (typeof value === "number" ? value : 0);

  const getTooltipText = (x) => {
    const total = getRateNum(x.total_users);
    const high = total > 0 ? (getRateNum(x.high_tier_count) / total) * 100 : 0;
    const mid = total > 0 ? (getRateNum(x.mid_tier_count) / total) * 100 : 0;
    const low = total > 0 ? (getRateNum(x.low_tier_count) / total) * 100 : 0;
    return `고투자율 ${high.toFixed(1)}%, 중투자율 ${mid.toFixed(1)}%, 저투자율 ${low.toFixed(1)}%`;
  };

  const getGaugeCellData = (x) => {
    const total = getRateNum(x.total_users);
    const high = total > 0 ? (getRateNum(x.high_tier_count) / total) * 100 : 0;
    const mid = total > 0 ? (getRateNum(x.mid_tier_count) / total) * 100 : 0;
    const low = total > 0 ? (getRateNum(x.low_tier_count) / total) * 100 : 0;

    return {
      high,
      mid,
      low,
      tooltip: getTooltipText(x),
    };
  };

  const SimpleTable = ({ title, rows, type }) => (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={th}>우선</th>
              <th style={th}>스킬명</th>
              <th style={th}>{type === "stigma" ? "채택률" : ""}</th>
              <th style={th}>평균레벨</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 30).map((x, idx) => {

              return (
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
                  {type === "stigma" && Array.isArray(x.usage_rates) ? (() => {

                    const lowRate = (x.usage_rates[1] ?? 0) * 100;
                    const midRate = (x.usage_rates[2] ?? 0) * 100;
                    const highRate = (x.usage_rates[3] ?? 0) * 100;

                    const high = highRate;
                    const mid = Math.max(0, midRate - highRate);
                    const low = Math.max(0, lowRate - midRate);

                    return (
                      <div style={{ width: "100%", margin: "0 auto" }}>
                        <div style={{
                          display: "flex",
                          height: "8px",
                          background: "#222",
                          borderRadius: "4px",
                          overflow: "hidden"
                        }}>
                          <div style={{ width: `${high}%`, background: "#ef4444" }} />
                          <div style={{ width: `${mid}%`, background: "#facc15" }} />
                          <div style={{ width: `${low}%`, background: "#3b82f6" }} />
                        </div>

                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "#aaa",
                          marginTop: 2
                        }}>
                          <span>고 {formatPct(high)}</span>
                          <span>중 {formatPct(mid)}</span>
                          <span>저 {formatPct(low)}</span>
                        </div>
                      </div>
                    );

                  })() : ""}
                </td>
                <td style={tdCenter}>
                  {typeof x.average_level === "number" ? x.average_level.toFixed(2) : "-"}
                </td>
              </tr>
            );
            })}
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
    <div style={{ width: "710px", padding: 12, border: "1px solid #444", borderRadius: 12 }}>
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
          마지막 업데이트: {AION2_SKILL_DB.sourceUpdatedAt}
        </div>
      </div>

      {!payload ? (
        <div style={{ marginTop: 10, color: "#ff8080", fontSize: 12, whiteSpace: "pre-wrap" }}>
          데이터가 없습니다. (네가 aion2-skillpriority.json 갱신 후 배포해야 함)
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "0.5fr 1fr", gap: 12, marginTop: 10, minWidth: 800 }}>

          <div style={{ width: "260px" }}>
            <SimpleTable title="액티브" rows={rowsByType("active")} type="active" />
            <SimpleTable title="패시브" rows={rowsByType("passive")} type="passive" />
          </div>

          <div style={{ width: "440px" }}>
            <SimpleTable title="스티그마" rows={rowsStigma()} type="stigma" />
          </div>

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

function formatPct(v) {
  const n = Number(v ?? 0);
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

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