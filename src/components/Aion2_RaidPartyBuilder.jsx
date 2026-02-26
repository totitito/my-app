import { useEffect, useMemo, useState } from "react";

const LS_KEY = "aion2-raid-party-builder-v1";

const AION2_CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

const defaultState = {
  candidates: [
    // 1군
    { id: crypto.randomUUID(), name: "카니쵸니[바카]", cls: "궁성", power: 3219, atool: 55159, updatedAt: 0, group: 1 },
    { id: crypto.randomUUID(), name: "김규[아리]", cls: "수호성", power: 3583, atool: 115392, updatedAt: 0, group: 1 },
    { id: crypto.randomUUID(), name: "델[아리]", cls: "정령성", power: 3370, atool: 75788, updatedAt: 0, group: 1 },
    { id: crypto.randomUUID(), name: "엣피[아리]", cls: "치유성", power: 3149, atool: 35057, updatedAt: 0, group: 1 },
    { id: crypto.randomUUID(), name: "갱e[바카]", cls: "궁성", power: 3312, atool: 88001, updatedAt: 0, group: 1 },
    // 2군
    { id: crypto.randomUUID(), name: "까니쵸니[바카]", cls: "호법성", power: 3127, atool: 33705, updatedAt: 0, group: 2 },
    { id: crypto.randomUUID(), name: "아델[아리]", cls: "살성", power: 3134, atool: 45643, updatedAt: 0, group: 2 },
    { id: crypto.randomUUID(), name: "겨울마도[바카]", cls: "마도성", power: 3186, atool: 53815, updatedAt: 0, group: 2 },
    // 3군
    { id: crypto.randomUUID(), name: "탱아저씨[바카]", cls: "수호성", power: 2861, atool: 10869, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "엄마손[바카]", cls: "치유성", power: 2296, atool: 5996, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "마법맨[바카]", cls: "마도성", power: 1584, atool: 648, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "칼의노래[바카]", cls: "검성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "쌀별[바카]", cls: "살성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "Nymph[바카]", cls: "정령성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "김구[아리]", cls: "검성", power: 2624, atool: 12132, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "은도[아리]", cls: "호법성", power: 2102, atool: 6229, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "하만[아리]", cls: "궁성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "은두[아리]", cls: "수호성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "히푸[아리]", cls: "치유성", power: 2384, atool: 7107, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "뱐[아리]", cls: "궁성", power: 2350, atool: 7212, updatedAt: 0, group: 3 },
    // { id: crypto.randomUUID(), name: "Glo[아리]", cls: "호법성", power: 0, atool: 0, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "델이[아리]", cls: "궁성", power: 2396, atool: 6165, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "앳피[아리]", cls: "정령성", power: 2285, atool: 5572, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "겨울살성[바카]", cls: "살성", power: 2725, atool: 9996, updatedAt: 0, group: 3 },
    { id: crypto.randomUUID(), name: "겨울정령[바카]", cls: "정령성", power: 1435, atool: 4527, updatedAt: 0, group: 3 },
  ],
  slots: Array.from({ length: 8 }, () => null),
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
  if (cls === "살성") return { ...base, background: "rgb(255, 0, 0)", color: "rgb(255, 255, 255)" };
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

  const setCandidateGroup = (candId, group) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candId ? { ...c, group } : c
      ),
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

  const commitCandidateName = (candidateId, nextName) => {
    const trimmed = (nextName || "").trim();
    if (!trimmed) return; // 빈값 저장 방지

    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candidateId ? { ...c, name: trimmed } : c
      ),
    }));

    setEditingNameId(null);
    setEditingName("");
  };

  const cancelEditName = () => {
    setEditingNameId(null);
    setEditingName("");
  };

  const commitCandidatePower = (candidateId, nextValue) => {
    const n = Number(String(nextValue ?? "").replace(/,/g, "").trim());
    if (!Number.isFinite(n) || n < 0) return; // 이상값 방지

    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candidateId ? { ...c, power: n } : c
      ),
    }));
  };

  const commitCandidateAtool = (candidateId, nextValue) => {
    const n = Number(String(nextValue ?? "").replace(/,/g, "").trim());
    if (!Number.isFinite(n) || n < 0) return;

    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candidateId ? { ...c, atool: n } : c
      ),
    }));
  };

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

  const onDropToGroup = (e, group) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain") || "";

    // 후보를 여기로 드롭 → group 변경
    if (data.startsWith("CAND:")) {
      const candId = data.slice("CAND:".length);
      setCandidateGroup(candId, group);
      return;
    }

    // 슬롯을 여기로 드롭 → 슬롯 비우기(기존 동작 유지)
    if (data.startsWith("SLOT:")) {
      const from = Number(data.slice("SLOT:".length));
      if (Number.isFinite(from)) clearSlot(from);
    }
  };

  // --- 후보 추가/편집
  const [newName, setNewName] = useState("");
  const [newCls, setNewCls] = useState("수호성");

  const [editingNameId, setEditingNameId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [editingField, setEditingField] = useState(null); // "power" | "atool" | null
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editingPower, setEditingPower] = useState("");
  const [editingAtool, setEditingAtool] = useState("");

  const [candSort, setCandSort] = useState("atool"); // "default" | "atool"
  
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
          power: null,
          atool: null,
          updatedAt: 0,
          group: 1,
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
    // if (partyCheck.p1.cleric < 1) w.push("P1: 치유성 없음");
    // if (partyCheck.p2.cleric < 1) w.push("P2: 치유성 없음");
    // if (partyCheck.p1.cleric > 1) w.push("P1: 치유성 2명 이상");
    // if (partyCheck.p2.cleric > 1) w.push("P2: 치유성 2명 이상");
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

  // ✅ 공통: 버블링만 막기(기본동작은 살림)  ← select용
  const stopBubble = (e) => {
    e.stopPropagation();
  };

  // ✅ 드래그만 막기(드래그 시작 이벤트에서만 사용) ← 필요할 때만
  const stopDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const isInteractiveEl = (el) => {
    if (!el) return false;
    // 버튼/인풋/셀렉트 등에서 시작한 드래그는 막기
    return !!el.closest("button, input, select, textarea, a, label, [data-nodrag]");
  };

  const guardDragStart = (e) => {
    if (isInteractiveEl(e.target)) {
      e.preventDefault(); // ✅ 드래그 시작 자체를 취소
      e.stopPropagation();
      return;
    }
  };

  // ✅ 빈 슬롯 클릭 → 임시 멤버 생성 후 해당 슬롯에 배치
  const addTempMemberToSlot = (slotIndex) => {
    setState((prev) => {
      // 이미 누가 있으면 아무것도 안 함
      if (prev.slots[slotIndex]) return prev;

      // "임시멤버N" 중 가장 큰 N 찾기 → +1
      const maxN = prev.candidates.reduce((acc, c) => {
        const m = String(c.name || "").match(/^\(임시멤버(\d+)\)$/);
        if (!m) return acc;
        const n = Number(m[1]);
        return Number.isFinite(n) ? Math.max(acc, n) : acc;
      }, 0);

      const nextN = maxN + 1;
      const newId = crypto.randomUUID();

      const newCandidate = {
        id: newId,
        name: `(임시멤버${nextN})`,
        cls: "수호성",      // 기본 직업(원하면 "궁성" 등으로 바꿔도 됨)
        power: 0,
        atool: 0,
        updatedAt: Date.now(),
        group: 3,          // 부캐 그룹으로 넣음(원하면 1로 바꿔도 됨)
      };

      const nextSlots = [...prev.slots];
      nextSlots[slotIndex] = newId;

      return {
        ...prev,
        candidates: [...prev.candidates, newCandidate],
        slots: nextSlots,
      };
    });
  };

  // ✅ 후보군(1/2/3군) 컬럼 하단 "클릭하여 신규등록" → 임시멤버 생성(슬롯 배치 X)
  const addTempMemberToGroup = (groupId) => {
    setState((prev) => {
      // "(임시멤버N)" 중 최대 N 찾기 → +1
      const maxN = prev.candidates.reduce((acc, c) => {
        const m = String(c.name || "").match(/^\(임시멤버(\d+)\)$/);
        if (!m) return acc;
        const n = Number(m[1]);
        return Number.isFinite(n) ? Math.max(acc, n) : acc;
      }, 0);

      const nextN = maxN + 1;
      const newId = crypto.randomUUID();

      const newCandidate = {
        id: newId,
        name: `(임시멤버${nextN})`,
        cls: "수호성",
        power: 0,
        atool: 0,
        updatedAt: Date.now(),
        group: groupId, // ✅ 여기만 다름 (1/2/3군에 그대로 들어감)
      };

      return {
        ...prev,
        candidates: [...prev.candidates, newCandidate],
      };
    });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* 좌: 파티(8 슬롯) */}
        {/* 왼쪽 레이드 파티 구성 패널 크기 조정 */}
        <div style={{ ...panelStyle, width: 800, flex: "0 0 800px", minWidth: 900, boxSizing: "border-box" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: "bold", color: "#ddd" }}>
              파티/레이드 구성
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
          {/* 좌측 파티 구성 프레임 분할 */}
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
                      // ✅ 카드 배경(슬롯 박스) 자체를 드래그 가능하게
                      draggable={!!c}
                      onDragStart={(e) => {
                        if (!c) return;
                        onDragStartSlot(e, slotIndex);
                      }}
                      onDragOver={allowDrop}
                      onDrop={(e) => onDropToSlot(e, slotIndex)}
                      onClick={() => {
                        if (!c) addTempMemberToSlot(slotIndex);
                      }}
                      style={{
                        ...slotBoxBase,
                        marginBottom: 8,
                        background: c ? clsBackground(c.cls) : "#111",
                        cursor: c ? "grab" : "default",
                        outline: missingCleric ? "2px dashed rgba(255, 180, 80, 0.35)" : "none",
                      }}
                      title={c ? "카드 배경을 잡고 드래그(슬롯 교체/후보군으로 빼기)" : ""}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
                        <div style={{ width: 56, color: "#4b4b4b", fontWeight: "bold" }}>
                          {slotLabel(slotIndex)}
                        </div>

                        {c ? (
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                            {/* ✅ 이름 + 직업 + 수치 */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                {/* ✅ 이름 클릭 → 수정 */}
                                {editingNameId === c.id ? (
                                  <input
                                    autoFocus
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onMouseDown={stopDrag}
                                    onDragStart={stopDrag}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") commitCandidateName(c.id, editingName);
                                      if (e.key === "Escape") cancelEditName();
                                    }}
                                    onBlur={() => commitCandidateName(c.id, editingName)}
                                    style={{
                                      width: 100,
                                      padding: "4px 8px",
                                      borderRadius: 8,
                                      border: "1px solid rgba(0,0,0,0.35)",
                                      background: "rgba(0,0,0,0.25)",
                                      color: "#000",
                                      fontWeight: "bold",
                                      outline: "none",
                                    }}
                                    title="Enter: 저장 / Esc: 취소"
                                  />
                                ) : (
                                  <span
                                    onMouseDown={stopDrag}      // ✅ 드래그 대신 클릭이 우선
                                    onDragStart={stopDrag}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNameId(c.id);
                                      setEditingName(c.name || "");
                                    }}
                                    style={{
                                      color: "#000000",
                                      fontWeight: "bold",
                                      cursor: "text",
                                      userSelect: "none",
                                    }}
                                    title="클릭해서 닉네임 수정"
                                  >
                                    {c.name}
                                  </span>
                                )}

                                {/* ✅ 직업 select */}
                                <select
                                  value={c.cls}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateCandidateCls(c.id, e.target.value);
                                  }}
                                  onMouseDown={stopBubble}
                                  onDragStart={stopDrag}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    padding: "4px 6px",
                                    borderRadius: 6,
                                    border: "1px solid rgba(0,0,0,0.35)",
                                    background: "rgba(0,0,0,0.25)",
                                    color: "#000",
                                    fontWeight: "bold",
                                  }}
                                  title="직업 선택"
                                >
                                  {AION2_CLASSES.map((cls) => (
                                    <option key={cls} value={cls} style={{ backgroundColor: "#2b2b2b", color: "#ffffff" }}>
                                      {cls}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ marginTop: 6, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                                {/* 전투력 */}
                                <span style={{ color: "#000000" }}>
                                  전투력 :{" "}
                                  {editingFieldId === c.id && editingField === "power" ? (
                                    <input
                                      autoFocus
                                      value={editingPower}
                                      onChange={(e) => setEditingPower(e.target.value)}
                                      onMouseDown={stopDrag}
                                      onDragStart={stopDrag}
                                      onClick={(e) => e.stopPropagation()}
                                      onFocus={(e) => e.target.select()}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          commitCandidatePower(c.id, editingPower);
                                          setEditingField(null);
                                          setEditingFieldId(null);
                                        }
                                        if (e.key === "Escape") {
                                          setEditingField(null);
                                          setEditingFieldId(null);
                                        }
                                      }}
                                      onBlur={() => {
                                        commitCandidatePower(c.id, editingPower);
                                        setEditingField(null);
                                        setEditingFieldId(null);
                                      }}
                                      style={{
                                        width: 36,
                                        padding: "2px 6px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(0,0,0,0.35)",
                                        background: "rgba(0,0,0,0.25)",
                                        color: "#000",
                                        fontWeight: "bold",
                                        outline: "none",
                                      }}
                                      title="Enter: 저장 / Esc: 취소"
                                    />
                                  ) : (
                                    <span
                                      onMouseDown={stopDrag}
                                      onDragStart={stopDrag}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingFieldId(c.id);
                                        setEditingField("power");
                                        setEditingPower(String(c.power ?? 0));
                                      }}
                                      style={{ cursor: "text", userSelect: "none", fontWeight: "bold" }}
                                      title="클릭해서 전투력 수정"
                                    >
                                      {(c.power ?? 0).toLocaleString()}
                                    </span>
                                  )}
                                </span>

                                {/* 아툴 */}
                                <span style={{ color: "#ffffff" }}>
                                  아툴 :{" "}
                                  {editingFieldId === c.id && editingField === "atool" ? (
                                    <input
                                      autoFocus
                                      value={editingAtool}
                                      onChange={(e) => setEditingAtool(e.target.value)}
                                      onMouseDown={stopDrag}
                                      onDragStart={stopDrag}
                                      onClick={(e) => e.stopPropagation()}
                                      onFocus={(e) => e.target.select()}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          commitCandidateAtool(c.id, editingAtool);
                                          setEditingField(null);
                                          setEditingFieldId(null);
                                        }
                                        if (e.key === "Escape") {
                                          setEditingField(null);
                                          setEditingFieldId(null);
                                        }
                                      }}
                                      onBlur={() => {
                                        commitCandidateAtool(c.id, editingAtool);
                                        setEditingField(null);
                                        setEditingFieldId(null);
                                      }}
                                      style={{
                                        width: 50,
                                        padding: "2px 6px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(0,0,0,0.35)",
                                        background: "rgba(0,0,0,0.25)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        outline: "none",
                                      }}
                                      title="Enter: 저장 / Esc: 취소"
                                    />
                                  ) : (
                                    <span
                                      onMouseDown={stopDrag}
                                      onDragStart={stopDrag}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingFieldId(c.id);
                                        setEditingField("atool");
                                        setEditingAtool(String(c.atool ?? 0));
                                      }}
                                      style={{ cursor: "text", userSelect: "none", fontWeight: "bold" }}
                                      title="클릭해서 아툴 수정"
                                    >
                                      {(c.atool ?? 0).toLocaleString()}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: "#666" }}>드래그: 이동 / 클릭: 신규 등록</div>
                        )}
                      </div>

                      {c && (
                        <button
                          onMouseDown={stopDrag}   // ✅ 버튼 클릭 시 드래그 시작 방지
                          onDragStart={stopDrag}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSlot(slotIndex);
                          }}
                          style={{
                            padding: "10px 10px",
                            borderRadius: 10,
                            border: "1px solid #555",
                            background: "#1f1f1f",
                            color: "#ddd",
                            cursor: "pointer",
                            flex: "0 0 auto",
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

        {/* 우: 후보군/부캐 통합 패널 */}
        <div style={{ ...panelStyle, width: 680, flex: "0 0 1200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: "bold", color: "#ddd" }}>
              후보(부캐)
            </div>

            <button
              onClick={() => setCandSort((s) => (s === "default" ? "atool" : "default"))}
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #555",
                background: "#222",
                color: "#ddd",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontSize: 12,
              }}
              title="정렬 방식 변경"
            >
              정렬: {candSort === "default" ? "기본" : "아툴"}
            </button>
          </div>

          {/* ✅ 1/2/3군 컬럼 */}
          {(() => {
            const GROUPS = [
              { id: 1, title: "1군" },
              { id: 2, title: "2군" },
              { id: 3, title: "응애" },
            ];

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {GROUPS.map((g) => (
                  <div
                    key={g.id}
                    onDragOver={allowDrop}
                    onDrop={(e) => onDropToGroup(e, g.id)}
                    style={{
                      border: "1px solid #333",
                      borderRadius: 12,
                      padding: 10,
                      background: "#141414",
                      minHeight: 300,
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: 10, color: "#ddd" }}>
                      {g.title}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {candidates
                        .filter((c) => (c.group ?? 1) === g.id)
                        .slice() // ✅ 원본 배열 보존
                        .sort((a, b) => {
                          if (candSort === "default") return 0;
                          // "atool": 높은 점수 먼저
                          return toNum(b.atool) - toNum(a.atool);
                        })
                        .map((c) => {
                          const assignedIndex = slots.findIndex((x) => x === c.id);
                          if (assignedIndex !== -1) return null;

                          return (
                            <CandidateCard
                              key={c.id}
                              c={c}
                              onDragStartCandidate={onDragStartCandidate}
                              moveCandidate={moveCandidate}
                              updateCandidateCls={updateCandidateCls}
                              editingNameId={editingNameId}
                              setEditingNameId={setEditingNameId}
                              editingName={editingName}
                              setEditingName={setEditingName}
                              commitCandidateName={commitCandidateName}
                              cancelEditName={cancelEditName}
                              editingFieldId={editingFieldId}
                              setEditingFieldId={setEditingFieldId}
                              editingField={editingField}
                              setEditingField={setEditingField}
                              editingPower={editingPower}
                              setEditingPower={setEditingPower}
                              editingAtool={editingAtool}
                              setEditingAtool={setEditingAtool}
                              commitCandidatePower={commitCandidatePower}
                              commitCandidateAtool={commitCandidateAtool}
                              stopDrag={stopDrag}
                              fetchScoreAndApply={fetchScoreAndApply}
                              removeCandidate={removeCandidate}
                              clsBackground={clsBackground}
                              AION2_CLASSES={AION2_CLASSES}
                            />
                          );
                        })}
                        {/* ✅ 컬럼 하단 신규등록 카드 */}
                        <div
                          onClick={() => addTempMemberToGroup(g.id)}
                          style={{
                            marginTop: 6,
                            border: "1px dashed #666",
                            borderRadius: 10,
                            padding: "10px 12px",
                            background: "#111",
                            color: "#aaa",
                            cursor: "pointer",
                            textAlign: "center",
                            userSelect: "none",
                          }}
                          title="클릭해서 (임시멤버N) 신규 등록"
                        >
                          클릭: 신규 등록
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div style={{ marginTop: 10, color: "#777", fontSize: 12, lineHeight: 1.5 }}>
            • 카드 드래그: 1군↔2군↔3군 이동<br />
            • 슬롯에서 이 영역으로 드롭: 슬롯 비우기(원래 기능 유지)
          </div>
        </div>

      </div>
    </div>
  );
}

function CandidateCard(props) {
  const {
    c,
    onDragStartCandidate,
    moveCandidate,
    updateCandidateCls,
    editingNameId,
    setEditingNameId,
    editingName,
    setEditingName,
    commitCandidateName,
    cancelEditName,
    editingFieldId,
    setEditingFieldId,
    editingField,
    setEditingField,
    editingPower,
    setEditingPower,
    editingAtool,
    setEditingAtool,
    commitCandidatePower,
    commitCandidateAtool,
    stopDrag,
    fetchScoreAndApply,
    removeCandidate,
    clsBackground,
    AION2_CLASSES,
  } = props;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStartCandidate(e, c.id)}
      style={{
        border: "1px solid #555",
        borderRadius: 4,
        padding: 2,
        background: clsBackground(c.cls),
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
      title="드래그해서 슬롯에 넣기 / 1군↔2군 이동"
    >
      {/* 왼쪽: 위/아래 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center" }}>
        <button
          onClick={(e) => { e.stopPropagation(); moveCandidate(c.id, -1); }}
          style={{
            width: 28, height: 28, borderRadius: 8, border: "2px solid #000000",
            background: "#414141", color: "#ddd", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 14,
          }}
        >
          ↑
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); moveCandidate(c.id, +1); }}
          style={{
            width: 28, height: 28, borderRadius: 8, border: "2px solid #000000",
            background: "#414141", color: "#ddd", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 14,
          }}
        >
          ↓
        </button>
      </div>

      {/* 가운데: 정보 */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {editingNameId === c.id ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCandidateName(c.id, editingName);
                if (e.key === "Escape") cancelEditName();
              }}
              onBlur={() => commitCandidateName(c.id, editingName)}
              style={{
                width: 100,
                padding: "4px 8px",
                borderRadius: 8,
                border: "1px solid #333",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                fontWeight: "bold",
                outline: "none",
              }}
              title="Enter: 저장 / Esc: 취소"
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setEditingNameId(c.id);
                setEditingName(c.name || "");
              }}
              style={{
                color: "#111",
                fontWeight: "bold",
                cursor: "text",
                userSelect: "none",
              }}
              title="클릭해서 닉네임 수정"
            >
              {c.name}
            </span>
          )}

          <select
            value={c.cls}
            onChange={(e) => { e.stopPropagation(); updateCandidateCls(c.id, e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: "4px 6px",
              borderRadius: 6,
              border: "1px solid #333",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontWeight: "bold",
            }}
            title="직업 선택"
          >
            {AION2_CLASSES.map((cls) => (
              <option key={cls} value={cls} style={{ backgroundColor: "#2b2b2b", color: "#ffffff" }}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 6, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* 전투력 */}
          <span style={{ color: "rgb(0, 0, 0)" }}>
            전투력 :{" "}
            {editingFieldId === c.id && editingField === "power" ? (
              <input
                autoFocus
                value={editingPower}
                onChange={(e) => setEditingPower(e.target.value)}
                onMouseDown={stopDrag}
                onDragStart={stopDrag}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitCandidatePower(c.id, editingPower);
                    setEditingField(null);
                    setEditingFieldId(null);
                  }
                  if (e.key === "Escape") {
                    setEditingField(null);
                    setEditingFieldId(null);
                  }
                }}
                onBlur={() => {
                  commitCandidatePower(c.id, editingPower);
                  setEditingField(null);
                  setEditingFieldId(null);
                }}
                style={{
                  width: 36,
                  padding: "2px 6px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.35)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontWeight: "bold",
                  outline: "none",
                }}
                title="Enter: 저장 / Esc: 취소"
              />
            ) : (
              <span
                onMouseDown={stopDrag}
                onDragStart={stopDrag}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFieldId(c.id);
                  setEditingField("power");
                  setEditingPower(String(c.power ?? 0));
                }}
                style={{ cursor: "text", userSelect: "none", fontWeight: "bold" }}
                title="클릭해서 전투력 수정"
              >
                {(c.power ?? 0).toLocaleString()}
              </span>
            )}
          </span>

          {/* 아툴 */}
          <span style={{ color: "#ffffff" }}>
            아툴 :{" "}
            {editingFieldId === c.id && editingField === "atool" ? (
              <input
                autoFocus
                value={editingAtool}
                onChange={(e) => setEditingAtool(e.target.value)}
                onMouseDown={stopDrag}
                onDragStart={stopDrag}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitCandidateAtool(c.id, editingAtool);
                    setEditingField(null);
                    setEditingFieldId(null);
                  }
                  if (e.key === "Escape") {
                    setEditingField(null);
                    setEditingFieldId(null);
                  }
                }}
                onBlur={() => {
                  commitCandidateAtool(c.id, editingAtool);
                  setEditingField(null);
                  setEditingFieldId(null);
                }}
                style={{
                  width: 50,
                  padding: "2px 6px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.35)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                  fontWeight: "bold",
                  outline: "none",
                }}
                title="Enter: 저장 / Esc: 취소"
              />
            ) : (
              <span
                onMouseDown={stopDrag}
                onDragStart={stopDrag}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFieldId(c.id);
                  setEditingField("atool");
                  setEditingAtool(String(c.atool ?? 0));
                }}
                style={{ cursor: "text", userSelect: "none", fontWeight: "bold" }}
                title="클릭해서 아툴 수정"
              >
                {(c.atool ?? 0).toLocaleString()}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* 오른쪽: Update/삭제 */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          onClick={(e) => { e.stopPropagation(); fetchScoreAndApply(c.name, c.id); }}
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
          Update
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); removeCandidate(c.id); }}
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
}