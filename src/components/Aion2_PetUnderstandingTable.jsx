// src/components/Aion2_PetUnderstandingTable.jsx

export default function Aion2_PetUnderstandingTable() {
  const columns = [
    { key: "type", label: "종류", headBg: "#222" },
    { key: "slot1", label: "1슬롯", headBg: "#222" },
    { key: "slot2", label: "2슬롯", headBg: "#222" },
    { key: "slot3", label: "3슬롯", headBg: "#8d3131" },
    { key: "slot4", label: "4슬롯", headBg: "#222" },
    { key: "slot5", label: "5슬롯", headBg: "#222" },
    { key: "slot6", label: "6슬롯", headBg: "#1d337b" },
    { key: "slot7", label: "7슬롯", headBg: "#222" },
    { key: "slot8", label: "8슬롯", headBg: "#222" },
    { key: "slot9", label: "9슬롯", headBg: "#8d3131" },
  ];

  const optionA = [
    { t: "보스 공격력 10~20" },
    { t: "치명타 15~30" },
    { t: "추가 명중 20~40" },
  ];

  const optionB = [
    { t: "최대 공격력 10~20", c: "orange" },
    { t: "추가 공격력 8~16", c: "orange" },
  ];

  const optionC = [
    { t: "강타 1.2%~2.4%", c: "red" },
    { t: "피해 증폭 1.2%~2.4%" },
  ];

  const optionD = [
    { t: "PVE 피해 내성 1.5%~3.0%", c: "blue" },
    { t: "피해 내성 1.2%~2.4%", c: "blue" },    
    { t: "보스 공격력 10~20" },
    { t: "치명타 15~30" },
    { t: "추가 명중 20~40" },
  ];

  const rows = [
    {
      type: "지성 / 야성 / 자연 / 변형",
      cells: {
        slot1: optionA,
        slot2: optionB,
        slot3: optionC,
        slot4: optionA,
        slot5: optionB,
        slot6: optionD,
        slot7: optionA,
        slot8: optionB,
        slot9: optionC,
      },
    },
    {
      type: "특수",
      cells: {
        slot1: optionB,
        slot2: optionB,
        slot3: optionC,
        slot4: optionB,
        slot5: optionB,
        slot6: optionD,
        slot7: optionB,
        slot8: optionB,
        slot9: optionC,
      },
    },
  ];

  const styles = {
    wrap: {
      overflowX: "auto",
      border: "1px solid #555",
      borderRadius: 12,
      background: "#0f0f0f",
    },
    table: {
      borderCollapse: "separate",
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
    type: {
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
      minWidth: 150,
    },
    td: {
      borderRight: "1px solid #555",
      borderBottom: "1px solid #555",
      padding: "10px 12px",
      textAlign: "center",
      verticalAlign: "middle",
      minWidth: 135,
      background: "#111",
      color: "#ddd",
      whiteSpace: "nowrap",
      fontSize: 13,
      lineHeight: 1.55,
    },
    red: { color: "#c96b6b", fontWeight: "bold" },
    orange: { color: "#d99a3a", fontWeight: "bold" },
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
                  position: col.key === "type" ? "sticky" : "static",
                  left: col.key === "type" ? 0 : undefined,
                  zIndex: col.key === "type" ? 3 : 1,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.type} style={idx > 0 ? styles.sepTop : undefined}>
              <td style={styles.type}>{row.type}</td>

              {columns
                .filter((c) => c.key !== "type")
                .map((col) => {
                  const items = row.cells[col.key] ?? [];
                  return (
                    <td key={col.key} style={styles.td}>
                      {items.map((it, i) => (
                        <div
                          key={i}
                          style={
                            it.c === "red"
                              ? styles.red
                              : it.c === "blue"
                              ? styles.blue
                              : it.c === "orange"
                              ? styles.orange
                              : undefined
                          }
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