import { useEffect, useMemo, useState } from "react";

const LS_KEY = "aion2-raid-party-builder-v2";

const AION2_CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

const makePreset = (name) => ({
  id: crypto.randomUUID(),
  name,
  slots: Array.from({ length: 8 }, () => null),
});

const defaultState = {
  candidates: [
    { id: crypto.randomUUID(), name: "카니쵸니[바카]", cls: "궁성", power: 3486, atool: 93213, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "까니쵸니[바카]", cls: "호법성", power: 3261, atool: 43786, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "탱아저씨[바카]", cls: "수호성", power: 3009, atool: 18023, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "엄마손[바카]", cls: "치유성", power: 2860, atool: 10928, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "마법맨[바카]", cls: "마도성", power: 1961, atool: 648, updatedAt: 0 },

    { id: crypto.randomUUID(), name: "김규[아리]", cls: "수호성", power: 3715, atool: 160102, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "김구[아리]", cls: "검성", power: 2812, atool: 16152, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "은도[아리]", cls: "호법성", power: 2406, atool: 6947, updatedAt: 0 },

    { id: crypto.randomUUID(), name: "아델[아리]", cls: "살성", power: 3260, atool: 48434, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "엣피[아리]", cls: "치유성", power: 3286, atool: 42634, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "델이[아리]", cls: "궁성", power: 2618, atool: 7088, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "앳피[아리]", cls: "정령성", power: 2218, atool: 4527, updatedAt: 0 },
    
    { id: crypto.randomUUID(), name: "델[아리]", cls: "정령성", power: 3431, atool: 85563, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "히푸[아리]", cls: "치유성", power: 2737, atool: 6749, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "뱐[아리]", cls: "궁성", power: 2626, atool: 7134, updatedAt: 0 },
        
    { id: crypto.randomUUID(), name: "갱e[바카]", cls: "궁성", power: 3630, atool: 144797, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "겨울마도[바카]", cls: "마도성", power: 3342, atool: 67587, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "겨울살성[바카]", cls: "살성", power: 2785, atool: 10400, updatedAt: 0 },
    { id: crypto.randomUUID(), name: "겨울정령[바카]", cls: "정령성", power: 2218, atool: 4527, updatedAt: 0 },
  ],
  rudraPresets: [makePreset("루드라 1")],
  erosionPresets: [makePreset("침식 1")],
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
      if (!parsed || !Array.isArray(parsed.candidates)) return defaultState;
      if (!Array.isArray(parsed.rudraPresets) || parsed.rudraPresets.length === 0)
        parsed.rudraPresets = [makePreset("루드라 1")];
      if (!Array.isArray(parsed.erosionPresets) || parsed.erosionPresets.length === 0)
        parsed.erosionPresets = [makePreset("침식 1")];
      // 구버전 호환: slots 있으면 첫 루드라 프리셋으로 이관
      if (Array.isArray(parsed.slots)) {
        parsed.rudraPresets[0].slots = parsed.slots;
        delete parsed.slots;
      }
      return parsed;
    } catch {
      return defaultState;
    }
  });

  const { candidates, rudraPresets, erosionPresets } = state;

  const [editingPresetId, setEditingPresetId] = useState(null);
  const [editingPresetName, setEditingPresetName] = useState("");

  // 프리셋 슬롯 조작 헬퍼
  const updatePresetSlots = (type, presetId, updater) => {
    const key = type === "rudra" ? "rudraPresets" : "erosionPresets";
    setState(prev => ({
      ...prev,
      [key]: prev[key].map(p => p.id === presetId ? { ...p, slots: updater([...p.slots]) } : p),
    }));
  };

  const clearSlot = (type, presetId, slotIndex) => {
    updatePresetSlots(type, presetId, s => { s[slotIndex] = null; return s; });
  };

  const clearAllSlots = (type, presetId) => {
    updatePresetSlots(type, presetId, () => Array.from({ length: 8 }, () => null));
  };

  const addPreset = (type) => {
    const key = type === "rudra" ? "rudraPresets" : "erosionPresets";
    const label = type === "rudra" ? "루드라" : "침식";
    setState(prev => {
      const n = prev[key].length + 1;
      return { ...prev, [key]: [...prev[key], makePreset(`${label} ${n}`)] };
    });
  };

  const removePreset = (type, presetId) => {
    const key = type === "rudra" ? "rudraPresets" : "erosionPresets";
    setState(prev => {
      if (prev[key].length <= 1) return prev;
      return { ...prev, [key]: prev[key].filter(p => p.id !== presetId) };
    });
  };

  const renamePreset = (type, presetId, name) => {
    const key = type === "rudra" ? "rudraPresets" : "erosionPresets";
    setState(prev => ({
      ...prev,
      [key]: prev[key].map(p => p.id === presetId ? { ...p, name } : p),
    }));
  };

  const assignToSlot = (type, presetId, slotIndex, candId) => {
    updatePresetSlots(type, presetId, s => {
      const alreadyAt = s.findIndex(x => x === candId);
      if (alreadyAt !== -1) return s; // 같은 프리셋 내 중복 차단
      s[slotIndex] = candId;
      return s;
    });
  };

  const swapSlots = (type, presetId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    updatePresetSlots(type, presetId, s => {
      const tmp = s[fromIndex]; s[fromIndex] = s[toIndex]; s[toIndex] = tmp;
      return s;
    });
  };

  const onDropToSlot = (e, type, presetId, slotIndex) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain") || "";
    if (data.startsWith("CAND:")) { assignToSlot(type, presetId, slotIndex, data.slice(5)); return; }
    if (data.startsWith("SLOT:")) {
      const [, pType, pId, idx] = data.split(":");
      if (pType === type && pId === presetId) swapSlots(type, presetId, Number(idx), slotIndex);
      else {
        // cross-preset: move candidate
        const fromSlots = (pType === "rudra" ? rudraPresets : erosionPresets).find(p => p.id === pId)?.slots;
        const candId = fromSlots?.[Number(idx)];
        if (candId) {
          updatePresetSlots(pType, pId, s => { s[Number(idx)] = null; return s; });
          assignToSlot(type, presetId, slotIndex, candId);
        }
      }
    }
  };

  const onDragStartSlot = (e, type, presetId, slotIndex) => {
    e.dataTransfer.setData("text/plain", `SLOT:${type}:${presetId}:${slotIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropToGroup = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain") || "";
    if (data.startsWith("SLOT:")) {
      const parts = data.split(":");
      const pType = parts[1], pId = parts[2], idx = Number(parts[3]);
      updatePresetSlots(pType, pId, s => { s[idx] = null; return s; });
    }
  };

  const addTempMemberToSlot = (type, presetId, slotIndex) => {
    const presets = type === "rudra" ? rudraPresets : erosionPresets;
    const preset = presets.find(p => p.id === presetId);
    if (!preset || preset.slots[slotIndex]) return;
    const maxN = candidates.reduce((acc, c) => {
      const m = String(c.name || "").match(/^\(임시멤버(\d+)\)$/);
      return m ? Math.max(acc, Number(m[1])) : acc;
    }, 0);
    const newId = crypto.randomUUID();
    setState(prev => {
      const key = type === "rudra" ? "rudraPresets" : "erosionPresets";
      return {
        ...prev,
        candidates: [...prev.candidates, { id: newId, name: `(임시멤버${maxN + 1})`, cls: "수호성", power: 0, atool: 0, updatedAt: Date.now() }],
        [key]: prev[key].map(p => {
          if (p.id !== presetId) return p;
          const s = [...p.slots]; s[slotIndex] = newId; return { ...p, slots: s };
        }),
      };
    });
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

  // --- 드래그 데이터 포맷
  const onDragStartCandidate = (e, candId) => {
    e.dataTransfer.setData("text/plain", `CAND:${candId}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

  // const [candSort, setCandSort] = useState("atool"); // "default" | "atool"
  
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
        },
      ],
    }));
    setNewName("");

    // 2) 추가된 후보의 전투력/아툴을 아툴에서 가져와서 업데이트
    fetchScoreAndApply(name, newId);
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
    setState((prev) => ({
      ...prev,
      rudraPresets: prev.rudraPresets.map(p => ({ ...p, slots: p.slots.map(x => x === id ? null : x) })),
      erosionPresets: prev.erosionPresets.map(p => ({ ...p, slots: p.slots.map(x => x === id ? null : x) })),
      candidates: prev.candidates.filter((c) => c.id !== id),
    }));
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

  const addTempMemberToGroup = (cls) => {
    setState((prev) => {
      const maxN = prev.candidates.reduce((acc, c) => {
        const m = String(c.name || "").match(/^\(임시멤버(\d+)\)$/);
        if (!m) return acc;
        const n = Number(m[1]);
        return Number.isFinite(n) ? Math.max(acc, n) : acc;
      }, 0);
      const newId = crypto.randomUUID();
      return {
        ...prev,
        candidates: [...prev.candidates, { id: newId, name: `(임시멤버${maxN + 1})`, cls: cls || "수호성", power: 0, atool: 0, updatedAt: Date.now() }],
      };
    });
  };

  const renderPresetBlock = (type, preset) => {
    const slots = preset.slots;
    const allSlottedIds = new Set([
      ...rudraPresets.flatMap(p => p.slots),
      ...erosionPresets.flatMap(p => p.slots),
    ].filter(Boolean));

    const toNum = (v) => { const n = Number(String(v ?? 0).replace(/,/g, "")); return Number.isFinite(n) ? n : 0; };
    const avgAtool = (idxs, noCleric) => {
      let sum = 0, cnt = 0;
      idxs.forEach(i => {
        const cid = slots[i]; if (!cid) return;
        const c = candMap.get(cid); if (!c) return;
        if (noCleric && c.cls === "치유성") return;
        sum += toNum(c.atool); cnt++;
      });
      return cnt ? sum / cnt : 0;
    };

    const isEditing = editingPresetId === preset.id;

    return (
      <div key={preset.id} style={{ border: "1px solid #333", borderRadius: 10, padding: 10, marginBottom: 12, background: "#141414" }}>
        {/* 프리셋 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          {isEditing ? (
            <input
              autoFocus
              value={editingPresetName}
              onChange={e => setEditingPresetName(e.target.value)}
              onFocus={e => e.target.select()}
              onBlur={() => { renamePreset(type, preset.id, editingPresetName || preset.name); setEditingPresetId(null); }}
              onKeyDown={e => { if (e.key === "Enter") { renamePreset(type, preset.id, editingPresetName || preset.name); setEditingPresetId(null); } if (e.key === "Escape") setEditingPresetId(null); }}
              style={{ fontWeight: "bold", fontSize: 14, background: "#222", color: "#fff", border: "1px solid #555", borderRadius: 6, padding: "2px 8px" }}
            />
          ) : (
            <span
              onClick={() => { setEditingPresetId(preset.id); setEditingPresetName(preset.name); }}
              style={{ fontWeight: "bold", color: "#ddd", cursor: "text", userSelect: "none" }}
              title="클릭해서 이름 변경"
            >{preset.name}</span>
          )}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => clearAllSlots(type, preset.id)} style={{ padding: "3px 8px", borderRadius: 8, border: "1px solid #555", background: "#222", color: "#ddd", cursor: "pointer", fontSize: 12 }}>전체 비우기</button>
            <button onClick={() => removePreset(type, preset.id)} style={{ padding: "3px 8px", borderRadius: 8, border: "1px solid #553", background: "#201010", color: "#f0b0b0", cursor: "pointer", fontSize: 12 }} title="이 프리셋 삭제">삭제</button>
          </div>
        </div>

        {/* 파티1 / 파티2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[1, 2].map(party => (
            <div key={party} style={{ border: "1px solid #2a2a2a", borderRadius: 8, padding: 8, background: "#111" }}>
              <div style={{ fontWeight: "bold", marginBottom: 6, color: "#aaa", fontSize: 13 }}>파티 {party}</div>
              {Array.from({ length: 4 }, (_, k) => {
                const slotIndex = (party === 1 ? 0 : 4) + k;
                const cid = slots[slotIndex];
                const c = cid ? candMap.get(cid) : null;
                return (
                  <div
                    key={slotIndex}
                    draggable={!!c}
                    onDragStart={e => { if (!c) return; onDragStartSlot(e, type, preset.id, slotIndex); }}
                    onDragOver={allowDrop}
                    onDrop={e => onDropToSlot(e, type, preset.id, slotIndex)}
                    onClick={() => { if (!c) addTempMemberToSlot(type, preset.id, slotIndex); }}
                    style={{
                      border: "1px solid #555", borderRadius: 8, padding: "6px 8px", marginBottom: 6,
                      background: c ? clsBackground(c.cls) : "#111",
                      cursor: c ? "grab" : "default",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                      <div style={{ width: 40, color: "#4b4b4b", fontWeight: "bold", fontSize: 12 }}>{slotLabel(slotIndex)}</div>
                      {c ? (
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {editingNameId === c.id ? (
                              <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                                onMouseDown={stopDrag} onDragStart={stopDrag} onClick={e => e.stopPropagation()}
                                onFocus={e => e.target.select()}
                                onKeyDown={e => { if (e.key === "Enter") commitCandidateName(c.id, editingName); if (e.key === "Escape") cancelEditName(); }}
                                onBlur={() => commitCandidateName(c.id, editingName)}
                                style={{ width: 90, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.35)", background: "rgba(0,0,0,0.25)", color: "#000", fontWeight: "bold", outline: "none" }} />
                            ) : (
                              <span onMouseDown={stopDrag} onDragStart={stopDrag}
                                onClick={e => { e.stopPropagation(); setEditingNameId(c.id); setEditingName(c.name || ""); }}
                                style={{ color: "#000", fontWeight: "bold", cursor: "text", userSelect: "none", fontSize: 13 }}>{c.name}</span>
                            )}
                            <select value={c.cls} onChange={e => { e.stopPropagation(); updateCandidateCls(c.id, e.target.value); }}
                              onMouseDown={stopBubble} onDragStart={stopDrag} onClick={e => e.stopPropagation()}
                              style={{ padding: "2px 4px", borderRadius: 4, border: "1px solid rgba(0,0,0,0.35)", background: "rgba(0,0,0,0.25)", color: "#000", fontWeight: "bold", fontSize: 12 }}>
                              {AION2_CLASSES.map(cls => <option key={cls} value={cls} style={{ backgroundColor: "#2b2b2b", color: "#fff" }}>{cls}</option>)}
                            </select>
                          </div>
                          <div style={{ marginTop: 3, fontSize: 11, color: "#111" }}>
                            전투력 {(c.power ?? 0).toLocaleString()} · 아툴 {(c.atool ?? 0).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: "#555", fontSize: 12 }}>드래그 / 클릭: 신규</div>
                      )}
                    </div>
                    {c && (
                      <button onMouseDown={stopDrag} onDragStart={stopDrag}
                        onClick={e => { e.stopPropagation(); clearSlot(type, preset.id, slotIndex); }}
                        style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #555", background: "#1f1f1f", color: "#ddd", cursor: "pointer", fontSize: 12 }}>
                        비우기
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 아툴 통계 */}
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "#121212", color: "#aaa", fontSize: 11, lineHeight: 1.7 }}>
          <span>P1 아툴 평균: {Math.round(avgAtool([0,1,2,3], false)).toLocaleString()} (치유성 제외: {Math.round(avgAtool([0,1,2,3], true)).toLocaleString()})</span>
          <span style={{ marginLeft: 16 }}>P2 아툴 평균: {Math.round(avgAtool([4,5,6,7], false)).toLocaleString()} (치유성 제외: {Math.round(avgAtool([4,5,6,7], true)).toLocaleString()})</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* 좌: 루드라 + 침식 */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "flex-start" }}>

            {/* 루드라 */}
            <div>
              <div style={{ fontWeight: "bold", color: "#e0a060", fontSize: 15, marginBottom: 10, borderBottom: "1px solid #333", paddingBottom: 6 }}>루드라</div>
              {rudraPresets.map(p => renderPresetBlock("rudra", p))}
              <button onClick={() => addPreset("rudra")} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px dashed #555", background: "#1a1a1a", color: "#aaa", cursor: "pointer", fontSize: 13 }}>+ 프리셋 추가</button>
            </div>

            {/* 침식 */}
            <div>
              <div style={{ fontWeight: "bold", color: "#60a0e0", fontSize: 15, marginBottom: 10, borderBottom: "1px solid #333", paddingBottom: 6 }}>침식</div>
              {erosionPresets.map(p => renderPresetBlock("erosion", p))}
              <button onClick={() => addPreset("erosion")} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "1px dashed #555", background: "#1a1a1a", color: "#aaa", cursor: "pointer", fontSize: 13 }}>+ 프리셋 추가</button>
            </div>

          </div>
        </div>

        {/* 우: 후보 패널 (직업별) */}
        <div style={{ ...panelStyle, width: 980, flex: "0 0 980px" }}
          onDragOver={allowDrop} onDrop={onDropToGroup}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: "bold", color: "#ddd" }}>후보</div>
          </div>

          {/* 직업별 그룹 */}
          {AION2_CLASSES.map(cls => {
            const clsCands = candidates
              .filter(c => c.cls === cls)
              .slice()
              .sort((a, b) => {
                const diff = toNum(b.atool) - toNum(a.atool);
                if (diff !== 0) return diff;
                return toNum(b.power) - toNum(a.power);
              });
            const allSlottedIds = new Set([
              ...rudraPresets.flatMap(p => p.slots),
              ...erosionPresets.flatMap(p => p.slots),
            ].filter(Boolean));
            const visible = clsCands;
            return (
              <div key={cls} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: "#888", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{cls}</span>
                  <span style={{ cursor: "pointer", color: "#4175df", fontSize: 11 }} onClick={() => addTempMemberToGroup(cls)} title="신규 등록">+ 추가</span>
                </div>
                {visible.length === 0 ? (
                  <div style={{ fontSize: 11, color: "#444", paddingLeft: 4 }}>—</div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      gap: 6,
                    }}
                  >
                    {visible.map(c => (
                      <CandidateCard key={c.id} c={c}
                        onDragStartCandidate={onDragStartCandidate}
                        updateCandidateCls={updateCandidateCls}
                        editingNameId={editingNameId} setEditingNameId={setEditingNameId}
                        editingName={editingName} setEditingName={setEditingName}
                        commitCandidateName={commitCandidateName} cancelEditName={cancelEditName}
                        editingFieldId={editingFieldId} setEditingFieldId={setEditingFieldId}
                        editingField={editingField} setEditingField={setEditingField}
                        editingPower={editingPower} setEditingPower={setEditingPower}
                        editingAtool={editingAtool} setEditingAtool={setEditingAtool}
                        commitCandidatePower={commitCandidatePower} commitCandidateAtool={commitCandidateAtool}
                        stopDrag={stopDrag} fetchScoreAndApply={fetchScoreAndApply}
                        removeCandidate={removeCandidate} clsBackground={clsBackground}
                        AION2_CLASSES={AION2_CLASSES}
                      />
                    ))}
                  </div>

                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function CandidateCard(props) {
  const {
    c,
    onDragStartCandidate,
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
        width: 240,
        flexShrink: 0,
        boxSizing: "border-box",
        border: "1px solid #555",
        borderRadius: 6,
        padding: "3px 5px",
        background: clsBackground(c.cls),
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
      title="드래그해서 슬롯에 넣기 / 1군↔2군 이동"
    >
      {/* 가운데: 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
              style={{ color: "#111", fontWeight: "bold", cursor: "text", userSelect: "none", whiteSpace: "nowrap" }}
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

        <div style={{ marginTop: 3, fontSize: 11, display: "flex", gap: 8, flexWrap: "nowrap", whiteSpace: "nowrap" }}>
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

      {/* 오른쪽: 삭제 / Update */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", justifyContent: "flex-start" }}>
        <button
          onClick={(e) => { e.stopPropagation(); fetchScoreAndApply(c.name, c.id); }}
          style={{
            padding: "0px 0px",
            borderRadius: 6,
            border: "2px solid #000000",
            background: "#215ba6",
            color: "#c7d1e7",
            cursor: "pointer",
            width: 40,
            height: 26,
            whiteSpace: "nowrap",
            fontSize: 12,
          }}
          title="아툴에서 전투력/아툴 점수 다시 가져오기"
        >
          갱신
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); removeCandidate(c.id); }}
          style={{
            padding: "0px 0px",
            borderRadius: 6,
            border: "1px solid #553",
            background: "#201010",
            color: "#f0b0b0",
            cursor: "pointer",
            width: 40,
            height: 26,
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