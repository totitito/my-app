import { useEffect, useMemo, useState } from "react";

const LS_KEY = "aion2-raid-party-builder-v1";

const AION2_CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

const defaultState = {
  candidates: [
    // 예시(원하면 지워도 됨)
    { id: crypto.randomUUID(), name: "카니쵸니[바카]", cls: "궁성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "까니쵸니[바카]", cls: "호법성", power: 0, atool: 0, updateAt: 0 },
    // { id: crypto.randomUUID(), name: "탱아저씨", cls: "수호성", power: 0, atool: 0, updateAt: 0 },
    // { id: crypto.randomUUID(), name: "엄마손", cls: "치유성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "김규[아리]", cls: "수호성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "김구[아리]", cls: "검성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "델[아리]", cls: "정령성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "엣피[아리]", cls: "치유성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "아델[아리]", cls: "살성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "갱e[바카]", cls: "궁성", power: 0, atool: 0, updateAt: 0 },
    { id: crypto.randomUUID(), name: "겨울마도[바카]", cls: "마도성", power: 0, atool: 0, updateAt: 0 },
  ],
  slots: Array.from({ length: 8 }, () => null), // slot -> candidateId or null
};

const classToRole = (cls) => {
  switch (cls) {
    case "수호성": return "탱";
    case "검성":
    case "살성": return "근딜";
    case "궁성":
    case "마도성":
    case "정령성": return "원딜";
    case "호법성":
    case "치유성": return "힐";
    default: return "기타";
  }
};

// const roleBackground = (role) => {
//   switch (role) {
//     case "탱": return "#5c7798";      // 연파랑
//     case "근딜": return "#a86a6a";    // 연노랑
//     case "원딜": return "#a79e5c";    // 연빨강
//     case "힐": return "#4e7f5c";      // 연초록
//     default: return "#222";
//   }
// };

const clsBackground = (cls) => {
  switch (cls) {
    case "수호성": return "#5175a3";
    case "검성": return "#8961bc";
    case "살성": return "#a45a5a";
    case "궁성": return "#b2844f";
    case "마도성": return "#ba6cbc";
    case "정령성": return "#50a9ac";
    case "호법성": return "#867700";
    case "치유성": return "#5ea15d";
    default: return "#222";
  }
};

// 성역 룰(임시)
// - 8인 = 2파티(각 4인)
// - 각 파티 힐 자리는 "치유성"이 강제(부활 때문에)
// - 호법성은 있으면 좋지만 치유성 대체 불가(= 경고만)
const partyOfSlot = (slotIndex) => (slotIndex < 4 ? 1 : 2);

const slotLabel = (i) => {
  const p = partyOfSlot(i);
  const pos = (i % 4) + 1;
  return `P${p}-${pos}`;
};

const clsBadgeStyle = (cls) => {
  const base = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 0,
    fontSize: 13,
    fontWeight: "bold",
    border: "1px solid #000000",
    background: "#ffffff",
    color: "#000000",
  };
  if (cls === "수호성") return { ...base, background: "rgb(23, 19, 244)", color: "rgb(255, 255, 255)" };
  if (cls === "검성") return { ...base, background: "rgb(128, 0, 255)", color: "rgb(255, 255, 255)" };
  if (cls === "살성") return { ...base, background: "rgb(255, 0, 0)" };
  if (cls === "궁성") return { ...base, background: "rgb(255, 128, 0)" };
  if (cls === "마도성") return { ...base, background: "rgb(255, 0, 255)" };
  if (cls === "정령성") return { ...base, background: "rgb(0, 255, 255)" };
  if (cls === "호법성") return { ...base, background: "rgb(255, 255, 0)" };
  if (cls === "치유성") return { ...base, background: "rgb(0, 255, 0)" };
  return base;
};

export default function Aion2_RaidPartyBuilder() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.slots) || !Array.isArray(parsed.candidates)) return defaultState;
      if (parsed.slots.length !== 8) parsed.slots = Array.from({ length: 8 }, (_, i) => parsed.slots[i] ?? null);
      return parsed;
    } catch {
      return defaultState;
    }
  });

  const { candidates, slots } = state;

  // ✅ 슬롯 1칸 비우기 (슬롯->후보군으로 드롭할 때 사용)
  const clearSlot = (slotIndex) => {
    setState((prev) => {
      const next = { ...prev, slots: [...prev.slots] };
      next.slots[slotIndex] = null;
      return next;
    });
  };

  // ✅ 전체 비우기 (슬롯 8칸만 비움. candidates/전투력/아툴 유지)
  const clearAllSlots = () => {
    setState((prev) => ({
      ...prev,
      slots: Array.from({ length: 8 }, () => null),
    }));
  };

  const cycleCandidateCls = (candidateId, dir = 1) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => {
        if (c.id !== candidateId) return c;

        const idx = AION2_CLASSES.indexOf(c.cls);
        const safeIdx = idx === -1 ? 0 : idx;
        const nextIdx = (safeIdx + dir + AION2_CLASSES.length) % AION2_CLASSES.length;

        return { ...c, cls: AION2_CLASSES[nextIdx] };
      }),
    }));
  };

  const fetchScoreAndApply = async (fullName, candidateId) => {
    try {
      const rawFull = (fullName || "").trim();
      const match = rawFull.match(/^(.+?)\[(.+?)\]$/);

      let charName = rawFull;
      let server_id = 1016; // 바카르마 기본값

      if (match) {
        charName = match[1].trim();
        const serverAbbr = match[2].trim();
        const serverMap = { "아리": 1006, "바카": 1016, "코치": 1018 };
        server_id = serverMap[serverAbbr] || 1016;
      }

      const r = await fetch("/api/aion2-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: charName, server_id }),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(`AION2 API ${r.status} ${r.statusText} / ${text.slice(0, 200)}`);
      }

      const j = await r.json();

      // ✅ 너는 통합 state 구조라서 setState로 candidates만 갱신해야 함
      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) => {
          if (c.id !== candidateId) return c;
          return {
            ...c,
            power: j.combat_power ?? 0,
            atool: j.combat_score ?? 0,
            updatedAt: Date.now(),
          };
        }),
      }));
    } catch (e) {
      console.error("전투력 갱신 실패:", e);
      alert("전투력 갱신 실패: " + e.message);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => ({
        ...c,
        power: c.power ?? 0,
        atool: c.atool ?? 0,
      })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 드래그 데이터 포맷: "CAND:<id>" or "SLOT:<index>"
  const onDragStartCandidate = (e, candId) => {
    e.dataTransfer.setData("text/plain", `CAND:${candId}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragStartSlot = (e, slotIndex) => {
    e.dataTransfer.setData("text/plain", `SLOT:${slotIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const assignToSlot = (slotIndex, candId) => {
    setState((prev) => {
      const next = { ...prev, slots: [...prev.slots] };

      // 같은 사람이 다른 슬롯에 이미 있으면 그쪽을 비움(중복 방지)
      const alreadyAt = next.slots.findIndex((x) => x === candId);
      if (alreadyAt !== -1) next.slots[alreadyAt] = null;

      next.slots[slotIndex] = candId;
      return next;
    });
  };

  const swapSlots = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setState((prev) => {
      const next = { ...prev, slots: [...prev.slots] };
      const tmp = next.slots[fromIndex];
      next.slots[fromIndex] = next.slots[toIndex];
      next.slots[toIndex] = tmp;
      return next;
    });
  };

  const onDropToSlot = (e, slotIndex) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain") || "";

    if (data.startsWith("CAND:")) {
      const candId = data.slice("CAND:".length);
      assignToSlot(slotIndex, candId);
      return;
    }

    if (data.startsWith("SLOT:")) {
      const from = Number(data.slice("SLOT:".length));
      if (Number.isFinite(from)) swapSlots(from, slotIndex);
    }
  };

  const onDropToPool = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain") || "";
    if (data.startsWith("SLOT:")) {
      const from = Number(data.slice("SLOT:".length));
      if (Number.isFinite(from)) clearSlot(from);
    }
  };

  // --- 후보 추가/편집
  const [newName, setNewName] = useState("");
  const [newCls, setNewCls] = useState("궁성");
  
  const addCandidate = async () => {
    const name = (newName || "").trim();
    if (!name) return;

    // 1) 먼저 후보를 기본값으로 추가(바로 UI에 보이게)
    const newId = crypto.randomUUID();
    setState((prev) => ({
      ...prev,
      candidates: [
        ...prev.candidates,
        {
          id: newId,
          name,
          cls: newCls,
          power: 0,      // ✅ 여기
          atool: 0,      // ✅ 여기
          updatedAt: 0,
          portrait: null,
          job: null,
          level: null,
        },
      ],
    }));
    setNewName("");

    // 2) 추가된 후보의 전투력/아툴을 아툴에서 가져와서 업데이트
    fetchScoreAndApply(name, newId);
  };

  const moveCandidate = (id, dir) => {
  setState((prev) => {
    const idx = prev.candidates.findIndex((c) => c.id === id);
    if (idx === -1) return prev;

    const next = [...prev.candidates];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return prev;

    const tmp = next[idx];
    next[idx] = next[to];
    next[to] = tmp;

    return { ...prev, candidates: next };
  });
};

const moveCandidateTo = (id, toIndex) => {
  setState((prev) => {
    const idx = prev.candidates.findIndex((c) => c.id === id);
    if (idx === -1) return prev;
    if (toIndex < 0) toIndex = 0;
    if (toIndex >= prev.candidates.length) toIndex = prev.candidates.length - 1;
    if (idx === toIndex) return prev;

    const next = [...prev.candidates];
    const [item] = next.splice(idx, 1);
    next.splice(toIndex, 0, item);

    return { ...prev, candidates: next };
  });
};

  const removeCandidate = (id) => {
    setState((prev) => {
      const nextSlots = prev.slots.map((x) => (x === id ? null : x));
      return {
        ...prev,
        slots: nextSlots,
        candidates: prev.candidates.filter((c) => c.id !== id),
      };
    });
  };

  const updateCandidateCls = (id, cls) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => (c.id === id ? { ...c, cls } : c)),
    }));
  };

  const resetAll = () => {
    setState(defaultState);
  };

  const candMap = useMemo(() => {
    const m = new Map();
    candidates.forEach((c) => m.set(c.id, c));
    return m;
  }, [candidates]);

  const toNum = (v) => {
    if (v == null) return 0;
    const s = String(v).replace(/,/g, "").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const avgAtoolBySlots = (slotIdxs, excludeCleric) => {
    let sum = 0;
    let cnt = 0;

    slotIdxs.forEach((i) => {
      const cid = slots[i];
      if (!cid) return;

      const c = candMap.get(cid);
      if (!c) return;

      if (excludeCleric && c.cls === "치유성") return;

      sum += toNum(c.atool);
      cnt += 1;
    });

    return cnt ? sum / cnt : 0;
  };

  const atoolStats = useMemo(() => {
    const p1 = [0, 1, 2, 3];
    const p2 = [4, 5, 6, 7];
    const all = [0, 1, 2, 3, 4, 5, 6, 7];

    return {
      p1Avg: avgAtoolBySlots(p1, false),
      p1AvgNoCleric: avgAtoolBySlots(p1, true),
      p2Avg: avgAtoolBySlots(p2, false),
      p2AvgNoCleric: avgAtoolBySlots(p2, true),
      allAvg: avgAtoolBySlots(all, false),
      allAvgNoCleric: avgAtoolBySlots(all, true),
    };
  }, [slots, candMap]);

  // --- 성역 규칙 체크(경고만 표시)
  const partyCheck = useMemo(() => {
    const res = {
      p1: { cleric: 0, chanter: 0 },
      p2: { cleric: 0, chanter: 0 },
    };
    slots.forEach((cid, idx) => {
      if (!cid) return;
      const c = candMap.get(cid);
      if (!c) return;
      const p = partyOfSlot(idx) === 1 ? "p1" : "p2";
      if (c.cls === "치유성") res[p].cleric += 1;
      if (c.cls === "호법성") res[p].chanter += 1;
    });
    return res;
  }, [slots, candMap]);

  const warningText = useMemo(() => {
    const w = [];
    if (partyCheck.p1.cleric < 1) w.push("P1: 치유성 없음");
    if (partyCheck.p2.cleric < 1) w.push("P2: 치유성 없음");
    if (partyCheck.p1.cleric > 1) w.push("P1: 치유성 2명 이상");
    if (partyCheck.p2.cleric > 1) w.push("P2: 치유성 2명 이상");
    // if (partyCheck.p1.chanter < 1) w.push("P1: 호법성이 없음(권장)");
    // if (partyCheck.p2.chanter < 1) w.push("P2: 호법성이 없음(권장)");
    return w;
  }, [partyCheck]);

  const panelStyle = {
    border: "1px solid #444",
    borderRadius: 12,
    padding: 12,
    background: "#1a1a1a",
  };

  const slotBoxBase = {
    border: "1px solid #555",
    borderRadius: 12,
    padding: 10,
    minHeight: 56,
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  };

  return (
    <div style={{ marginTop: 12 }}>
      {/* <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}> */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* 좌: 파티(8 슬롯) */}
        {/* 왼쪽 레이드 파티 구성 패널 크기 조정 */}
        <div style={{ ...panelStyle, width: 800, flex: "0 0 800px", minWidth: 800, boxSizing: "border-box" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: "bold", color: "#ddd" }}>
              성역 파티 구성(임시) — 2파티/8인
            </div>

            {/* ✅ 버튼 묶음 */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={clearAllSlots}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #555",
                  background: "#222",
                  color: "#ddd",
                  cursor: "pointer",
                }}
              >
                전체 비우기
              </button>

              <button
                onClick={resetAll}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid #555",
                  background: "#222",
                  color: "#ddd",
                  cursor: "pointer",
                }}
              >
                초기화
              </button>
            </div>
          </div>

          {warningText.length > 0 && (
            <div style={{ marginBottom: 10, padding: 10, borderRadius: 12, border: "1px solid #553", background: "#1a1410", color: "#f3c58b", fontSize: 13 }}>
              {warningText.map((t) => (
                <div key={t}>• {t}</div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[1, 2].map((party) => (
              <div key={party} style={{ ...panelStyle, background: "#141414" }}>
                <div style={{ fontWeight: "bold", marginBottom: 8, color: "#ddd" }}>
                  파티 {party} (4인)
                </div>

                {Array.from({ length: 4 }, (_, k) => {
                  const slotIndex = (party === 1 ? 0 : 4) + k;
                  const cid = slots[slotIndex];
                  const c = cid ? candMap.get(cid) : null;
                  const role = c ? classToRole(c.cls) : null;

                  const missingCleric = party === 1 ? partyCheck.p1.cleric < 1 : partyCheck.p2.cleric < 1;

                  return (
                    <div
                      key={slotIndex}
                      onDragOver={allowDrop}
                      onDrop={(e) => onDropToSlot(e, slotIndex)}
                      style={{
                        ...slotBoxBase,
                        marginBottom: 8,
                        // background: c ? roleBackground(classToRole(c.cls)) : "#111",
                        background: c ? clsBackground(c.cls) : "#111",
                        outline:
                          // 파티에 치유성이 하나도 없으면 슬롯 영역을 약하게 강조
                          missingCleric ? "2px dashed rgba(255, 180, 80, 0.35)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 56, color: "#4b4b4b", fontWeight: "bold" }}>{slotLabel(slotIndex)}</div>

                        {c ? (
                          <div
                            draggable
                            onDragStart={(e) => onDragStartSlot(e, slotIndex)}
                            style={{ cursor: "grab" }}
                            title="드래그해서 다른 슬롯과 교체 / 후보군으로 빼기"
                          >
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ color: "#000000", fontWeight: "bold" }}>{c.name}</span>
                              <span style={clsBadgeStyle(c.cls)}>{c.cls}</span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12 }}>
                              {/* <span style={{ color: "#7fdfff", marginRight: 12 }}> */}
                              <span style={{ color: "#000000", marginRight: 12 }}>
                                전투력 : {(c.power ?? 0).toLocaleString()}
                              </span>
                              {/* <span style={{ color: "#fff6c2" }}> */}
                              <span style={{ color: "#ffffff" }}>
                                아툴 : {(c.atool ?? 0).toLocaleString()}
                              </span>
                            </div>
                            {/* <div style={{ color: "#777", fontSize: 12 }}>드래그: 슬롯 교체 / 후보군으로 빼기</div> */}
                          </div>
                        ) : (
                          <div style={{ color: "#666" }}>여기로 드래그해서 배치</div>
                        )}
                      </div>

                      {c && (
                        <button
                          onClick={() => clearSlot(slotIndex)}
                          style={{
                            padding: "10px 10px",
                            borderRadius: 10,
                            border: "1px solid #555",
                            background: "#1f1f1f",
                            color: "#ddd",
                            cursor: "pointer",
                          }}
                        >
                          비우기
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* <div style={{ marginTop: 10, color: "#888", fontSize: 12 }}>
            • 후보군 → 슬롯: 드래그&드롭<br />
            • 슬롯 → 슬롯: 드래그하면 서로 교체<br />
            • 슬롯 → 후보군 영역: 드롭하면 슬롯 비움
          </div> */}

          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #333",
              background: "#121212",
              color: "#ddd",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <div>1파티 아툴 평균 : {Math.round(atoolStats.p1Avg).toLocaleString()}</div>
            <div>1파티 아툴 평균 (치유성 제외) : {Math.round(atoolStats.p1AvgNoCleric).toLocaleString()}</div>

            <div style={{ marginTop: 8 }}>2파티 아툴 평균 : {Math.round(atoolStats.p2Avg).toLocaleString()}</div>
            <div>2파티 아툴 평균 (치유성 제외) : {Math.round(atoolStats.p2AvgNoCleric).toLocaleString()}</div>

            <div style={{ marginTop: 8 }}>전체 아툴 평균 : {Math.round(atoolStats.allAvg).toLocaleString()}</div>
            <div>전체 아툴 평균 (치유성 제외) : {Math.round(atoolStats.allAvgNoCleric).toLocaleString()}</div>
          </div>
        </div>

        {/* 우: 후보군(풀) */}
        <div
          // style={{ ...panelStyle, flex: "0 0 360px" }}
          // 후보군 카드 크기 조정
          style={{ ...panelStyle, width: 300, flex: "0 0 380px" }}
          onDragOver={allowDrop}
          onDrop={onDropToPool}
        >
          <div style={{ fontWeight: "bold", marginBottom: 10, color: "#ddd" }}>후보군 (드래그해서 배치)</div>

          {/* 후보 추가 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="아이디(닉네임)"
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "#101010",
                color: "#ddd",
              }}
            />
            <select
              value={newCls}
              onChange={(e) => setNewCls(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "#101010",
                color: "#ddd",
              }}
            >
              <option value="수호성">수호성</option>
              <option value="검성">검성</option>
              <option value="살성">살성</option>
              <option value="궁성">궁성</option>
              <option value="마도성">마도성</option>
              <option value="정령성">정령성</option>
              <option value="호법성">호법성</option>
              <option value="치유성">치유성</option>
            </select>
            <button
              onClick={addCandidate}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #555",
                background: "#222",
                color: "#ddd",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              추가
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {candidates.map((c) => {
              const assignedIndex = slots.findIndex((x) => x === c.id);
              const assignedLabel = assignedIndex !== -1 ? slotLabel(assignedIndex) : null;

              // ✅ 파티에 배치된 후보는 후보군에서 숨김
              if (assignedIndex !== -1) return null;
              
              const role = classToRole(c.cls);

              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => onDragStartCandidate(e, c.id)}
                  style={{
                    border: "1px solid #555",
                    borderRadius: 4,
                    padding: 2,
                    // background: roleBackground(role),
                    background: clsBackground(c.cls),
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",   // stretch -> center
                    gap: 8,
                  }}
                  title="드래그해서 슬롯에 넣기"
                >
                  {/* ✅ 1. 가장 왼쪽 : 위/아래 버튼 세로 배치 */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCandidate(c.id, -1);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "2px solid #000000",
                        background: "#414141",
                        color: "#ddd",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        fontSize: 14,
                      }}
                    >
                      ↑
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveCandidate(c.id, +1);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "2px solid #000000",
                        background: "#414141",
                        color: "#ddd",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        fontSize: 14,
                      }}
                    >
                      ↓
                    </button>
                  </div>

                  {/* ✅ 2. 가운데 : 캐릭 정보 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#000000", fontWeight: "bold" }}>
                        {c.name}
                      </span>
                      {/* <span style={clsBadgeStyle(c.cls)}>{c.cls}</span> */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();      // 드래그/드롭에 영향 안 주게
                          cycleCandidateCls(c.id, e.shiftKey ? -1 : 1);
                        }}
                        style={{
                          ...clsBadgeStyle(c.cls),
                          cursor: "pointer",
                          border: "none",
                        }}
                        title="클릭해서 직업 변경"
                      >
                        {c.cls}
                      </button>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      <span style={{ color: "rgb(0, 0, 0)", marginRight: 12 }}>
                        전투력 : {(c.power ?? 0).toLocaleString()}
                      </span>
                      <span style={{ color: "#ffffff" }}>
                        아툴 : {(c.atool ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ✅ 3. 오른쪽 : 삭제 버튼만 */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchScoreAndApply(c.name, c.id);
                      }}
                      style={{
                        padding: "0px 5px",
                        borderRadius: 8,
                        border: "2px solid #000000",
                        background: "#215ba6",
                        color: "#c7d1e7",
                        cursor: "pointer",
                        height: 24,
                        whiteSpace: "nowrap",
                        fontSize: 12,
                      }}
                      title="아툴에서 전투력/아툴 점수 다시 가져오기"
                    >
                      전투력 갱신
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCandidate(c.id);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #553",
                        background: "#201010",
                        color: "#f0b0b0",
                        cursor: "pointer",
                        height: 34,
                        whiteSpace: "nowrap",
                        fontSize: 12,
                      }}
                      title="후보 삭제"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* <div style={{ marginTop: 10, color: "#777", fontSize: 12 }}>
            • 이 영역에 슬롯을 드롭하면 “파티에서 빼기”로 동작함
          </div> */}
        </div>
      </div>
    </div>
  );
}