import { useState, useEffect } from "react";
import Aion2_SkillCalculator from "./Aion2_SkillCalculator";
import Aion2_SkillPriorityTable from "./Aion2_SkillPriorityTable";

export default function Aion2_SkillCombinedTab() {
  const [job, setJob] = useState(() => localStorage.getItem("aion2-combined-job") || "수호성");
  
  useEffect(() => {
    localStorage.setItem("aion2-combined-job", job);
  }, [job]);

  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          gap: "0px",
          alignItems: "start",
          width: "2500px",
        }}
      >
        <Aion2_SkillCalculator selectedJob={job} onChangeJob={setJob} />
        <Aion2_SkillPriorityTable selectedJob={job} onChangeJob={setJob} />
      </div>
    </div>
  );
}