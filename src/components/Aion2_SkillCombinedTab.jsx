import { useState, useEffect } from "react";
import Aion2_SkillCalculator from "./Aion2_SkillCalculator";
import Aion2_SkillPriorityTable from "./Aion2_SkillPriorityTable";

export default function Aion2_SkillCombinedTab() {
  const [job, setJob] = useState(() => localStorage.getItem("aion2-combined-job") || "수호성");
  
  useEffect(() => {
    localStorage.setItem("aion2-combined-job", job);
  }, [job]);

  return (
    <div style={{ overflowY: "visible" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1600px 900px",
          gap: "16px",
          alignItems: "start",
          minWidth: "2200px",
        }}
      >
        <Aion2_SkillCalculator selectedJob={job} onChangeJob={setJob} />
        <Aion2_SkillPriorityTable selectedJob={job} onChangeJob={setJob} />
      </div>
    </div>
  );
}