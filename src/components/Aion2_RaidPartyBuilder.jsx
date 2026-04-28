import { useEffect, useMemo, useState } from "react";
import { AION2_SERVERS } from "../data/aion2-serverList";

const LS_KEY = "aion2-raid-party-builder-v2";

const AION2_CLASSES = ["수호성", "검성", "살성", "궁성", "마도성", "정령성", "호법성", "치유성"];

const makePreset = (name) => ({
  id: crypto.randomUUID(),
  name,
  slots: Array.from({ length: 8 }, () => null),
});

const defaultState = {
  candidateSortMode: "operator",
  players: ["강력공격맨", "네오", "수사불패", "재미니맨", "Adele", "Pdoll"],
  candidates: [
    { id: crypto.randomUUID(), operator: "강력공격맨", name: "카니쵸니[바카]", cls: "궁성", itemLevel: 3817, power: 405600, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "강력공격맨", name: "까니쵸니[바카]", cls: "호법성", itemLevel: 3604, power: 323200, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "강력공격맨", name: "탱아저씨[바카]", cls: "수호성", itemLevel: 3330, power: 240700, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "강력공격맨", name: "엄마손[바카]", cls: "치유성", itemLevel: 3204, power: 194600, updatedAt: 0 },
    // { id: crypto.randomUUID(), operator: "강력공격맨", name: "마법맨[바카]", cls: "마도성", itemLevel: 2322, power: 110600, updatedAt: 0 },

    { id: crypto.randomUUID(), operator: "Pdoll", name: "김규[아리]", cls: "수호성", itemLevel: 4148, power: 459000, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "Pdoll", name: "김구[아리]", cls: "검성", itemLevel: 3153, power: 238100, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "Pdoll", name: "은도[아리]", cls: "호법성", itemLevel: 2841, power: 160500, updatedAt: 0 },
    // { id: crypto.randomUUID(), operator: "Pdoll", name: "하만[아리]", cls: "궁성", itemLevel: 1961, power: 96380, updatedAt: 0 },

    { id: crypto.randomUUID(), operator: "Adele", name: "엣피[아리]", cls: "치유성", itemLevel: 3942, power: 427500, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "Adele", name: "아델[아리]", cls: "살성", itemLevel: 3605, power: 310700, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "Adele", name: "델이[아리]", cls: "궁성", itemLevel: 2869, power: 154100, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "Adele", name: "앳피[아리]", cls: "정령성", itemLevel: 2839, power: 139200, updatedAt: 0 },
    
    { id: crypto.randomUUID(), operator: "재미니맨", name: "델[아리]", cls: "정령성", itemLevel: 3939, power: 396700, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "재미니맨", name: "히푸[아리]", cls: "치유성", itemLevel: 3391, power: 204000, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "재미니맨", name: "뱐[아리]", cls: "궁성", itemLevel: 3021, power: 174100, updatedAt: 0 },
        
    { id: crypto.randomUUID(), operator: "네오", name: "갱e[바카]", cls: "궁성", itemLevel: 4115, power: 508300, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "네오", name: "겨울마도[바카]", cls: "마도성", itemLevel: 3675, power: 354200, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "네오", name: "겨울살성[바카]", cls: "살성", itemLevel: 3066, power: 176500, updatedAt: 0 },
    { id: crypto.randomUUID(), operator: "네오", name: "겨울정령[바카]", cls: "정령성", itemLevel: 2767, power: 146000, updatedAt: 0 },

    { id: crypto.randomUUID(), operator: "May", name: "MayCat[코치]", cls: "치유성", itemLevel: 3511, power: 249700, updatedAt: 0 },    
  ],
  rudraPresets: [makePreset("루드라 1")],
  erosionPresets: [makePreset("침식 1")],
};

const clsBackground = (cls) => {
  switch (cls) {
    case "수호성": return "#4369c0";
    case "검성": return "#51c3c7";
    case "살성": return "#c24c4c";
    case "궁성": return "#ec9634";
    case "마도성": return "#7d4abf";
    case "정령성": return "#d075d2";
    case "호법성": return "#f5ed05";
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

const SERVER_SHORT_SET = new Set(AION2_SERVERS.map(s => s.short));

const compareOperator = (a, b) => {
  const aStr = String(a || "").trim();
  const bStr = String(b || "").trim();

  const aIsKo = /[가-힣]/.test(aStr);
  const bIsKo = /[가-힣]/.test(bStr);

  // 한글 먼저
  if (aIsKo && !bIsKo) return -1;
  if (!aIsKo && bIsKo) return 1;

  // 같은 그룹 안에서는 가나다 / ABC
  return aStr.localeCompare(bStr, "ko", { sensitivity: "base" });
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
      if (!Array.isArray(parsed.players) || parsed.players.length === 0)
        parsed.players = defaultState.players;
      if (!parsed.candidateSortMode)
        parsed.candidateSortMode = "operator";
      if (Array.isArray(parsed.slots)) {
        parsed.rudraPresets[0].slots = parsed.slots;
        delete parsed.slots;
      }
      return parsed;
    } catch {
      return defaultState;
    }
  });

  const { candidates, rudraPresets, erosionPresets, players, candidateSortMode } = state;

  const setCandidateSortMode = (mode) => setState(prev => ({ ...prev, candidateSortMode: mode }));

  const [editingPresetId, setEditingPresetId] = useState(null);
  const [editingPresetName, setEditingPresetName] = useState("");
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

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
      if (alreadyAt !== -1) return s;
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
        candidates: [...prev.candidates, { id: newId, operator: "", name: `(임시멤버${maxN + 1})`, cls: "수호성", itemLevel: 0, power: 0, updatedAt: Date.now() }],
        [key]: prev[key].map(p => {
          if (p.id !== presetId) return p;
          const s = [...p.slots]; s[slotIndex] = newId; return { ...p, slots: s };
        }),
      };
    });
  };

  const fetchScoreAndApply = async (fullName, candidateId, showError = true) => {
    try {
      const rawFull = (fullName || "").trim();
      const match = rawFull.match(/^(.+?)\[(.+?)\]$/);

      let charName = rawFull;
      let server_id = 1016;

      if (match) {
        charName = match[1].trim();
        const serverAbbr = match[2].trim();

        const server = AION2_SERVERS.find((s) => s.short === serverAbbr);
        server_id = server ? server.id : 1016;
      }

      const officialRes = await fetch(
        `/api/aion2-char?serverid=${server_id}&name=${encodeURIComponent(charName)}`
      );

      if (!officialRes.ok) {
        const text = await officialRes.text().catch(() => "");
        throw new Error(`공홈 API ${officialRes.status} ${officialRes.statusText} / ${text.slice(0, 200)}`);
      }

      const officialJson = await officialRes.json();

      setState((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) => {
          if (c.id !== candidateId) return c;
          return {
            ...c,
            itemLevel: officialJson.item_level ?? c.itemLevel ?? 0,
            power: officialJson.combat_power ?? c.power ?? 0,
            updatedAt: Date.now(),
          };
        }),
      }));
    } catch (e) {
      console.error("후보 정보 갱신 실패:", e);
      if (showError) alert("후보 정보 갱신 실패: " + e.message);
    }
  };

  const refreshAllCandidates = async () => {
    if (isRefreshingAll) return;

    setIsRefreshingAll(true);
    try {
      const list = [...state.candidates];
      const batchSize = 5;

      for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (c) => {
            try {
              await fetchScoreAndApply(c.name, c.id, false);
            } catch (e) {
              console.error("전체 갱신 실패:", c.name, e);
            }
          })
        );
      }
    } finally {
      setIsRefreshingAll(false);
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
      })),
    }));
  }, []);

  const commitCandidateName = (candidateId, nextName) => {
    const trimmed = (nextName || "").trim();
    if (!trimmed) return;

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
    if (!Number.isFinite(n) || n < 0) return;

    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === candidateId ? { ...c, power: n } : c
      ),
    }));
  };

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

  const [editingField, setEditingField] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editingPower, setEditingPower] = useState("");

  const sortedCandidates = [...state.candidates].sort((a, b) => {
    if (candidateSortMode === "itemLevel") return (b.itemLevel ?? 0) - (a.itemLevel ?? 0);
    if (candidateSortMode === "power") return (b.power ?? 0) - (a.power ?? 0);
    if (candidateSortMode === "operator")
      return compareOperator(a.operator, b.operator);
    return 0;
  });

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

  const updateCandidateOperator = (id, operator) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === id ? { ...c, operator } : c
      ),
    }));
  };

  const addPlayer = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setState(prev => {
      if (prev.players.includes(trimmed)) return prev;
      const next = [...prev.players, trimmed];
      next.sort((a, b) => a.localeCompare(b, ["ko", "en"], { sensitivity: "base" }));
      return { ...prev, players: next };
    });
  };

  const removePlayer = (name) => {
    setState(prev => ({
      ...prev,
      players: prev.players.filter(p => p !== name),
    }));
  };

  const renamePlayer = (oldName, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || trimmed === oldName) return;
    setState(prev => {
      const next = prev.players.map(p => p === oldName ? trimmed : p);
      next.sort((a, b) => a.localeCompare(b, ["ko", "en"], { sensitivity: "base" }));
      return {
        ...prev,
        players: next,
        candidates: prev.candidates.map(c =>
          c.operator === oldName ? { ...c, operator: trimmed } : c
        ),
      };
    });
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
        candidates: [...prev.candidates, { id: newId, operator: "", name: `(임시멤버${maxN + 1})`, cls: cls || "수호성", itemLevel: 0, power: 0, updatedAt: Date.now() }],
      };
    });
  };

  const addTempMemberToGroup_operator = (operator) => {
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
        candidates: [...prev.candidates, { id: newId, operator: operator === "(미지정)" ? "" : operator, name: `(임시멤버${maxN + 1})`, cls: "수호성", itemLevel: 0, power: 0, updatedAt: Date.now() }],
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
    const avgPower = (idxs, noCleric) => {
      let sum = 0, cnt = 0;
      idxs.forEach(i => {
        const cid = slots[i]; if (!cid) return;
        const c = candMap.get(cid); if (!c) return;
        if (noCleric && c.cls === "치유성") return;
        sum += toNum(c.power); cnt++;
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
                const sameTypeSlots = (type === "rudra" ? rudraPresets : erosionPresets).flatMap(p => p.slots).filter(Boolean);
                const isDupChar = !!cid && sameTypeSlots.filter(x => x === cid).length >= 2;
                const isDupOperatorInPreset = !!c && slots
                  .map(id => (id ? candMap.get(id) : null))
                  .filter(Boolean)
                  .filter(x => ((x.operator || "").trim() || "") === ((c.operator || "").trim() || ""))
                  .length >= 2;
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
                      background: c
                        ? (
                            isDupChar
                              ? `repeating-linear-gradient(135deg, ${clsBackground(c.cls)}, ${clsBackground(c.cls)} 8px, rgba(255,255,255,0.22) 8px, rgba(255,255,255,0.22) 16px)`
                              : isDupOperatorInPreset
                                ? `repeating-linear-gradient(135deg, ${clsBackground(c.cls)}, ${clsBackground(c.cls)} 8px, rgba(255,230,120,0.22) 8px, rgba(255,230,120,0.22) 16px)`
                                : clsBackground(c.cls)
                          )
                        : "#111",
                      cursor: c ? "grab" : "default",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44,
                      boxShadow: isDupChar
                        ? "0 0 0 2px #ff5a5a inset, 0 0 12px rgba(255,90,90,0.55)"
                        : isDupOperatorInPreset
                          ? "0 0 0 2px #ffd24d inset, 0 0 12px rgba(255,210,77,0.45)"
                          : "none",
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
                            iLvl {c.itemLevel?.toLocaleString()} · CP {formatK(c.power)}
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

        {/* CP / AT 통계 */}
        <div style={{ marginBottom: -4, padding: "0px 0px", background: "#121212", color: "#aaa", fontSize: 11, textAlign: "center" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
              // gridTemplateColumns: "140px 120px 120px 120px",
              // gap: "0px 0px",
              // alignItems: "center",
            }}
          >
            <div></div>
            <div style={{ fontWeight: "bold", color: "#888" }}>P1</div>
            <div style={{ fontWeight: "bold", color: "#888" }}>P2</div>
            <div style={{ fontWeight: "bold", color: "#888" }}>P1 + P2</div>

            <div style={{ color: "#888" }}>
              <span style={{ fontWeight: "bold" }}>CP</span> 평균 (전체 / <span style={{ color: "#4caf50" }}>치유 제외</span>)
            </div>
            <div>{Math.round(avgPower([0,1,2,3], false)).toLocaleString()}
              {" / "}
              <span style={{ color: "#4caf50" }}>
                {Math.round(avgPower([0,1,2,3], true)).toLocaleString()}
              </span>
            </div>
            <div>{Math.round(avgPower([4,5,6,7], false)).toLocaleString()}
              {" / "}
              <span style={{ color: "#4caf50" }}>
                {Math.round(avgPower([4,5,6,7], true)).toLocaleString()}
              </span>
            </div>
            <div>{Math.round(avgPower([0,1,2,3,4,5,6,7], false)).toLocaleString()}
              {" / "}
              <span style={{ color: "#4caf50" }}>
                {Math.round(avgPower([0,1,2,3,4,5,6,7], true)).toLocaleString()}
              </span>
            </div>

            {/* <div style={{ color: "#888" }}>
              <span style={{ fontWeight: "bold" }}>AT</span> 평균 (전체 / <span style={{ color: "#4caf50" }}>치유 제외</span>)
            </div> */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* 좌: 루드라 + 침식 */}
        <div style={{ flex: "1 1 0", minWidth: "1300px" }}>
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
        <div style={{ ...panelStyle }}
          onDragOver={allowDrop} onDrop={onDropToGroup}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <div style={{ fontWeight: "bold", color: "#ddd" }}>후보</div>

              <div style={{ align: "left" }}>
                <button
                  onClick={resetAll}
                  style={{
                    padding: "6px 10px",
                    background: "#5a1a1a",
                    color: "#fff",
                    border: "1px solid #aa4444",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  초기화
                </button>
              </div>

                <select
                  value={candidateSortMode}
                  onChange={(e) => setCandidateSortMode(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #555",
                    background: "#2a2a2a",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="class">정렬: 직업</option>
                  <option value="operator">정렬: Player</option>
                  <option value="itemLevel">정렬: 아이템레벨</option>
                  <option value="power">정렬: 전투력</option>
                </select>
            </div>

            <button
              onClick={refreshAllCandidates}
              disabled={isRefreshingAll}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #555",
                background: "#1f1f1f",
                color: "#ddd",
                cursor: isRefreshingAll ? "default" : "pointer",
                fontSize: 12,
                opacity: isRefreshingAll ? 0.6 : 1,
              }}
              title="아이템레벨, 전투력 갱신"
            >
              {isRefreshingAll ? "갱신중..." : "전체 갱신"}
            </button>
          </div>

          {/* 직업별 그룹 */}
          {(candidateSortMode === "class" || candidateSortMode === "operator") && (() => {
            const groups = candidateSortMode === "class"
              ? AION2_CLASSES
              : [
                  ...[...new Set([
                    ...players,
                    ...candidates.map(c => (c.operator || "").trim()).filter(Boolean),
                  ])].sort(compareOperator),
                  ...(candidates.some(c => !(c.operator || "").trim()) ? ["(미지정)"] : []),
                ];
            return groups.map(grp => {
              const isPlayerMode = candidateSortMode === "operator";
              const grpCands = candidates
                .filter(c => isPlayerMode
                  ? (grp === "(미지정)" ? !(c.operator || "").trim() : (c.operator || "").trim() === grp)
                  : c.cls === grp
                )
                .slice()
                .sort((a, b) => toNum(b.power) - toNum(a.power));
              return (
                <div key={grp} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#888", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <PlayerGroupHeader
                      grp={grp}
                      isPlayerMode={isPlayerMode}
                      players={players}
                      onAddChar={() => isPlayerMode
                        ? addTempMemberToGroup_operator(grp)
                        : addTempMemberToGroup(grp)
                      }
                      onAddPlayer={addPlayer}
                      onRemovePlayer={removePlayer}
                      onRenamePlayer={renamePlayer}
                    />
                  </div>
                  {grpCands.length === 0 ? (
                    <div style={{ fontSize: 11, color: "#444", paddingLeft: 4 }}>—</div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "nowrap", gap: 6 }}>
                      {grpCands.map(c => (
                        <CandidateCard key={c.id} c={c}
                          onDragStartCandidate={onDragStartCandidate}
                          updateCandidateCls={updateCandidateCls}
                          updateCandidateOperator={updateCandidateOperator}
                          players={players}
                          editingNameId={editingNameId} setEditingNameId={setEditingNameId}
                          editingName={editingName} setEditingName={setEditingName}
                          commitCandidateName={commitCandidateName} cancelEditName={cancelEditName}
                          editingFieldId={editingFieldId} setEditingFieldId={setEditingFieldId}
                          editingField={editingField} setEditingField={setEditingField}
                          editingPower={editingPower} setEditingPower={setEditingPower}
                          commitCandidatePower={commitCandidatePower}
                          stopDrag={stopDrag} fetchScoreAndApply={fetchScoreAndApply}
                          removeCandidate={removeCandidate} clsBackground={clsBackground}
                          AION2_CLASSES={AION2_CLASSES}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}

          {/* Player 그룹 추가 버튼 — operator 모드일 때 목록 하단 고정 */}
          {candidateSortMode === "operator" && (
            <AddPlayerButton onAddPlayer={addPlayer} />
          )}

          {candidateSortMode !== "class" && candidateSortMode !== "operator" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.ceil(sortedCandidates.length / 10)}, max-content)`,
                justifyContent: "start",
                gap: 6,
                alignItems: "start",
              }}
            >
              {Array.from({ length: Math.ceil(sortedCandidates.length / 10) }, (_, col) => {
                const sliced = sortedCandidates.slice(col * 10, col * 10 + 10);

                return (
                  <div key={col} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sliced.map((c, idx) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 32,
                            fontSize: 12,
                            color: "#888",
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          {col * 10 + idx + 1}등
                        </div>

                        <CandidateCard
                          c={c}
                          onDragStartCandidate={onDragStartCandidate}
                          updateCandidateCls={updateCandidateCls}
                          updateCandidateOperator={updateCandidateOperator}
                          players={players}
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
                          commitCandidatePower={commitCandidatePower}
                          stopDrag={stopDrag}
                          fetchScoreAndApply={fetchScoreAndApply}
                          removeCandidate={removeCandidate}
                          clsBackground={clsBackground}
                          AION2_CLASSES={AION2_CLASSES}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          
        </div>

      </div>
    </div>
  );
}

function formatK(value) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";

  if (num < 1000) return num.toString();

  if (num < 1000000) {
    const k = Math.floor(num / 100) / 10; // 소수점 1자리 내림
    return `${k}k`;
  }

  const m = Math.floor(num / 100000) / 10; // 소수점 1자리 내림
  return `${m}m`;
}

function CandidateCard(props) {
  const {
    c,
    onDragStartCandidate,
    updateCandidateCls,
    updateCandidateOperator,
    players,
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
    commitCandidatePower,
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
        width: 240, // 후보 카드 가로 길이
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
      title="드래그해서 슬롯에 넣기"
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
          <span style={{ color: "#111" }}>
            iLvl : <span style={{ fontWeight: "bold" }}>{c.itemLevel?.toLocaleString()}</span>
          </span>
          {/* 전투력 */}
          <span style={{ color: "#000000" }}>
            CP :{" "}
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
                  setEditingField("power");
                  setEditingPower(String(c.power ?? 0));
                }}
                style={{ cursor: "text", userSelect: "none", fontWeight: "bold" }}
                title="클릭해서 전투력 수정"
              >
                {formatK(c.power)}
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
          title="아이템레벨, 전투력 갱신"
        >
          갱신
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = prompt(`Player 입력\n(기존: ${(players||[]).join(", ")})`, c.operator || "");
              if (next === null) return;
              updateCandidateOperator(c.id, next.trim());
            }}
            style={{
              padding: "0px 0px",
              borderRadius: 6,
              border: "1px solid #333",
              background: "#1f1f1f",
              color: "#ddd",
              cursor: "pointer",
              width: 26,
              height: 26,
              fontSize: 12,
              fontWeight: "bold",
            }}
            title="클릭하여 다른 플레이어로 변경 가능"
          >
            P
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
    </div>
  );
}

function AddPlayerButton({ onAddPlayer }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState("");

  if (!adding) {
    return (
      <div style={{ marginTop: 8 }}>
        <span
          style={{ cursor: "pointer", color: "#3a8a3a", fontSize: 12 }}
          onClick={() => setAdding(true)}
          title="Player 그룹 추가"
        >＋ Player 추가</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Player 이름 입력"
        onKeyDown={e => {
          if (e.key === "Enter") { onAddPlayer(val); setVal(""); setAdding(false); }
          if (e.key === "Escape") { setVal(""); setAdding(false); }
        }}
        onBlur={() => { if (val.trim()) onAddPlayer(val); setVal(""); setAdding(false); }}
        style={{ width: 120, padding: "3px 7px", borderRadius: 5, border: "1px solid #555", background: "#2a2a2a", color: "#fff", fontSize: 12 }}
      />
      <span style={{ fontSize: 11, color: "#666" }}>Enter 저장 / Esc 취소</span>
    </div>
  );
}

function PlayerGroupHeader({ grp, isPlayerMode, players, onAddChar, onRemovePlayer, onRenamePlayer }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(grp);

  const isManagedPlayer = isPlayerMode && players.includes(grp);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      {editingName && isManagedPlayer ? (
        <input
          autoFocus
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={() => { onRenamePlayer(grp, nameVal); setEditingName(false); }}
          onKeyDown={e => {
            if (e.key === "Enter") { onRenamePlayer(grp, nameVal); setEditingName(false); }
            if (e.key === "Escape") { setNameVal(grp); setEditingName(false); }
          }}
          style={{ width: 90, padding: "1px 5px", borderRadius: 5, border: "1px solid #555", background: "#2a2a2a", color: "#fff", fontSize: 11, fontWeight: "bold" }}
        />
      ) : (
        <span
          onClick={() => { if (isManagedPlayer) { setNameVal(grp); setEditingName(true); } }}
          style={{ cursor: isManagedPlayer ? "text" : "default", color: isManagedPlayer ? "#ccc" : "#666" }}
          title={isManagedPlayer ? "클릭해서 Player 이름 변경" : undefined}
        >
          {grp}
        </span>
      )}

      <span
        style={{ cursor: "pointer", color: "#4175df", fontSize: 11 }}
        onClick={onAddChar}
        title="캐릭터 추가"
      >+ 캐릭터 추가</span>

      {isManagedPlayer && (
        <span
          style={{ cursor: "pointer", color: "#c04040", fontSize: 11 }}
          onClick={() => {
            if (window.confirm(`"${grp}" 그룹을 삭제할까요?\n소속 캐릭터의 Player는 비워집니다.`)) {
              onRemovePlayer(grp);
            }
          }}
          title="Player 그룹 삭제"
        >- Player 삭제</span>
      )}
    </div>
  );
}