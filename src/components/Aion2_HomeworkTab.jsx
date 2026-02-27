import { useState, useEffect } from "react";
import { getCategory, fmtKST, getNowMs, getDisplayVal } from "../data/homeworkUtils";

export default function Aion2_HomeworkTab({ 
  game, viewMode,
  homeworks, setHomeworks,
  characters, setCharacters,
  accounts, setAccounts,
  scores, setScores,
  hiddenHomeworks, setHiddenHomeworks,
  collapsedChars, setCollapsedChars,
  isAccountCollapsed, setIsAccountCollapsed,
}) {

  const dayMap = ["일", "월", "화", "수", "목", "금", "토"];

  const updateCount = (id, targetName, delta, e = null) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id !== id) return hw;

      const isOddEnergy = id === "aion2-odd-energy";

      const curRaw =
        hw.counts && hw.counts[targetName] !== undefined ? hw.counts[targetName] : hw.max;

      // ✅ 1) 인풋에서 지우는 중("") 허용
      if (delta === "") {
        return {
          ...hw,
          counts: { ...(hw.counts || {}), [targetName]: "" },
        };
      }

      // ✅ 2) 인풋에서 직접 입력한 경우(문자열) -> "그 값으로" 세팅
      if (typeof delta === "string") {
        const n = Number(delta);
        if (!Number.isFinite(n)) {
          return hw;
        }

        const next = Math.max(0, Math.min(hw.max ?? Infinity, n));

        return {
          ...hw,
          counts: { ...(hw.counts || {}), [targetName]: next },

          // ✅ 리셋/회복 계산용 (기존 유지)
          lastUpdated: { ...(hw.lastUpdated || {}), [targetName]: getNowMs() },

          // ✅ "내가 직접 만진 시간" 전용 새 필드
          lastEdited: { ...(hw.lastEdited || {}), [targetName]: getNowMs() },
        };
      }

      // ✅ 3) 버튼(-/0/+) 클릭한 경우(숫자) -> 현재값에서 증감/0세팅
      const curNum = Number(curRaw);
      const safeCur = Number.isFinite(curNum) ? curNum : (hw.max ?? 0);

      let next;
      if (delta === 0) {
        next = 0;
      } else {
        let step = 1;
        if (e && typeof e === "object") {
          if (e.ctrlKey) step = 100;
          else if (e.shiftKey) step = 10;
        }
        next = safeCur + (delta * step);
      }

      next = Math.max(0, Math.min(hw.max ?? Infinity, next));

      const now = getNowMs();

      return {
        ...hw,
        counts: { ...(hw.counts || {}), [targetName]: next },
        lastEdited:  { ...(hw.lastEdited  || {}), [targetName]: now },
        lastUpdated: { ...(hw.lastUpdated || {}), [targetName]: now }, // ✅ 추가
      };

    }));
  };

  const toggleExclude = (id, targetName) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        const newExcluded = { ...(hw.excluded || {}) };
        newExcluded[targetName] = !newExcluded[targetName];
        return { ...hw, excluded: newExcluded };
      }
      return hw;
    }));
  };

  const toggleHomework = (name) => {
    setHiddenHomeworks(prev =>
      prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
    );
  };

  const moveTarget = (idx, direction, dataList, setData) => {
    const newList = [...dataList];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newList.length) return;
    [newList[idx], newList[targetIdx]] = [newList[targetIdx], newList[idx]];
    setData(newList);
  };

  const renameTarget = (oldName, idx, dataList, setData) => {
    const newName = prompt("새 이름을 입력하세요", oldName);
    if (!newName || oldName === newName) return;
    if (dataList.includes(newName)) { alert("중복된 이름입니다."); return; }

    const newList = [...dataList];
    const oldItem = newList[idx];
    const isObj = typeof oldItem === "object" && oldItem !== null;

    newList[idx] = isObj
      ? { ...oldItem, name: newName }   // showPortrait 유지
      : newName;

    setData(newList);

    setHomeworks(prev => prev.map(hw => {
      const newCounts = { ...(hw.counts || {}) };
      const newExcluded = { ...(hw.excluded || {}) };
      const newLastUpdated = { ...(hw.lastUpdated || {}) }; // 수정 시간 객체 복사

      // 진행도 복사
      if (Object.prototype.hasOwnProperty.call(newCounts, oldName)) {
        newCounts[newName] = newCounts[oldName];
        delete newCounts[oldName];
      }
      // 제외 상태 복사
      if (Object.prototype.hasOwnProperty.call(newExcluded, oldName)) {
        newExcluded[newName] = newExcluded[oldName];
        delete newExcluded[oldName];
      }
      // ★ 핵심: 마지막 수정 시각도 새 이름으로 복사해줘야 리셋이 안 됨
      if (Object.prototype.hasOwnProperty.call(newLastUpdated, oldName)) {
        newLastUpdated[newName] = newLastUpdated[oldName];
        delete newLastUpdated[oldName];
      }

      return { ...hw, counts: newCounts, excluded: newExcluded, lastUpdated: newLastUpdated };
    }));
  };

  const commitRenameInline = (oldName, newName, idx, dataList, setData) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || oldName === trimmed) {
      setEditingKey(null);
      setEditingValue("");
      return;
    }
    if (dataList.some((x, i) => {
      const nm = (typeof x === "object" && x) ? x.name : x;
      return i !== idx && nm === trimmed;
    })) {
      alert("중복된 이름입니다.");
      return;
    }

    // ✅ 1) 캐릭/계정 리스트 이름 변경(객체면 showPortrait 유지)
    setData(prev => {
      const next = [...prev];
      const oldItem = next[idx];
      const isObj = typeof oldItem === "object" && oldItem !== null;

      next[idx] = isObj
        ? { ...oldItem, name: trimmed }
        : trimmed;

      return next;
    });

    // ✅ 2) homeworks의 counts/excluded/lastUpdated 키도 같이 이동
    setHomeworks(prev => prev.map(hw => {
      const newCounts = { ...(hw.counts || {}) };
      const newExcluded = { ...(hw.excluded || {}) };
      const newLastUpdated = { ...(hw.lastUpdated || {}) };

      if (Object.prototype.hasOwnProperty.call(newCounts, oldName)) {
        newCounts[trimmed] = newCounts[oldName];
        delete newCounts[oldName];
      }
      if (Object.prototype.hasOwnProperty.call(newExcluded, oldName)) {
        newExcluded[trimmed] = newExcluded[oldName];
        delete newExcluded[oldName];
      }
      if (Object.prototype.hasOwnProperty.call(newLastUpdated, oldName)) {
        newLastUpdated[trimmed] = newLastUpdated[oldName];
        delete newLastUpdated[oldName];
      }

      return { ...hw, counts: newCounts, excluded: newExcluded, lastUpdated: newLastUpdated };
    }));

    setEditingKey(null);
    setEditingValue("");
  };

  const togglePortrait = (idx, setData) => {
    setData(prev => {
      const newData = [...prev];
      const item = newData[idx];
      const isObj = typeof item === "object" && item !== null;
      const currentName = isObj ? item.name : item;
      const currentStatus = isObj ? (item.showPortrait !== false) : true;

      newData[idx] = {
        ...(isObj ? item : {}),
        name: currentName,
        showPortrait: !currentStatus,
      };

      return newData;
    });
  };

  const updateHomeworkMemo = (id, newMemo) => {
    setHomeworks(prev => prev.map(hw => 
      hw.id === id ? { ...hw, memo: newMemo } : hw
    ));
  };

  const toggleCollapse = (charName) => {
    setCollapsedChars(prev => {
      const newState = { ...prev, [charName]: !prev[charName] };
      localStorage.setItem("collapsedChars", JSON.stringify(newState));
      return newState;
    });
  };

  // AION 2 fetchScore
  const fetchScore = async (fullName) => {
    try {
      const rawFull = (fullName || "").trim();  // ✅ 원본 입력값(표시/조회와 동일)
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

      // ✅ 실패면 왜 실패인지 확인 가능하게
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(`AION2 API ${r.status} ${r.statusText} / ${text.slice(0, 200)}`);
      }

      const j = await r.json();

      setScores(prev => ({
        ...prev,
        [rawFull]: { // ✅ 저장 키를 rawFull로 통일 (UI의 scores[targetName]과 동일)
          combatPower: j.combat_power ?? 0,
          combatScore: j.combat_score ?? 0,
          // updatedAt: Date.now(),
          updatedAt: getNowMs(),
          portrait: j?.raw?.avatar_url ?? null,
          job: j?.raw?.job ?? null,
          level: j?.raw?.level ?? null,
        }
      }));
    } catch (e) {
      console.error("캐릭터 정보 갱신 실패:", e);
      alert("캐릭터 정보 갱신 실패: " + e.message); // ✅ 탱아저씨 케이스 원인 바로 뜸
    }
  };

  // Lost Ark fetch
  const fetchLoaScore = async (charName) => {
    try {
      const targetUrl = `/api/loa-profile?name=${encodeURIComponent(charName)}`;
      const response = await fetch(targetUrl, { method: "GET" });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data) {
        setScores(prev => ({
          ...prev,
          [charName]: {
            level: data.CharacterLevel ?? null,
            itemLevel: data.ItemMaxLevel,
            combatPower: data.CombatPower || 0,
            job: data.CharacterClassName || null,
            // portrait: data.CharacterImage || null,
            portrait: data.raw?.CharacterImage ?? null,
            updatedAt: new Date().toISOString()
          }
        }));
      } else {
        alert("존재하지 않는 캐릭터이거나 검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("로아 API 호출 실패:", error);
      alert("데이터를 가져오는데 실패했습니다.");
    }
  };

  const addTargetAuto = (scope, dataList, setData) => {
    const base = scope === "character" ? "캐릭터" : "계정";
    let i = 1; while (dataList.includes(`${base}${i}`)) i++;
    setData(prev => [...prev, `${base}${i}`]);
  };

  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const renderTable = (title, scope, dataList, setData, options = {}) => {
    const { headerRight = null, hideBody = false, hideHiddenButtons = false } = options;
    const filteredHws = homeworks.filter(hw =>
      hw.game === game &&
      hw.scope === scope &&
      hw.resetPeriod !== "once"
    );
    const onceBasic = filteredHws.filter(hw => hw.category === "기본");
    const onceStory = filteredHws.filter(hw => hw.category === "스토리");
    const onceBossElyos = filteredHws.filter(hw => hw.category === "필드보스(천족)");
    const onceBossAsmondians = filteredHws.filter(hw => hw.category === "필드보스(마족)");
    const onceWing = filteredHws.filter(hw => hw.category === "날개");
    const onceArt = filteredHws.filter(hw => hw.category === "명화");
    const onceEtc = filteredHws.filter(hw => !["기본", "스토리", "필드보스(천족)", "필드보스(마족)", "날개", "명화"].includes(hw.category));
    const categoryOrder = ["daily", "etc", "event", "weekly"];
    const groupedByCategory = Object.fromEntries(
      categoryOrder.map(cat => [cat, []])
    );

    if (viewMode === "repeat") {
      const repeatHws = filteredHws.filter(hw => hw.resetPeriod !== "once");
      repeatHws.forEach(hw => {
        const cat = getCategory(hw);
        if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
        groupedByCategory[cat].push(hw);
      });
    }

    const allFiltered =
      viewMode === "once"
        ? [...onceBasic, ...onceStory, ...onceBossElyos, ...onceBossAsmondians, ...onceWing, ...onceArt, ...onceEtc]
        : categoryOrder.flatMap(cat => groupedByCategory[cat]);

    const categoryLabel = {
      daily: "Daily",
      etc: "etc",
      event: "Event",
      weekly: "Weekly",
    };

    const formatDate = (ts) => {
      if (!ts) return "기록 없음";
      return fmtKST(Number(ts));
    };

    const nowMs = getNowMs();

    return (
      <div style={{ 
        overflowX: "auto", 
        width: "100%", 
        maxWidth: "100vw", // 화면 너비를 넘지 못하게 강제
        position: "relative", // sticky 기준점 명시
        marginTop: "0px" 
      }}>
        <h3
          style={{
            fontSize: "18px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {/* (1) 제목 */}
          <span>{title}</span>

          {/* (2) 제목 바로 오른쪽에 붙는 영역(접기 버튼 등) */}
          {headerRight ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {headerRight}
            </span>
          ) : null}

          {/* (3) 숨김 복구 버튼들: 표 전체가 접힌 상태면 아예 안 보이게 */}
          {!hideBody && !hideHiddenButtons && hiddenHomeworks.length > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
              {hiddenHomeworks.map((name) => {
                const hw = homeworks.find((h) => h.name === name && h.game === game);
                if (!hw || hw.scope !== scope) return null;

                return (
                  <button
                    key={name}
                    onClick={() => toggleHomework(name)}
                    style={{
                      padding: "2px 6px",
                      fontSize: "11px",
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    {name} ➕
                  </button>
                );
              })}
            </div>
          )}
        </h3>

        {!hideBody && (
          <table border="1" style={{ borderCollapse: "separate", borderSpacing: 0, borderColor: "#444", whiteSpace: "nowrap", minWidth: "fit-content" }}>
            <thead>
              <tr style={{ backgroundColor: "#333" }}>
                <th style={{ 
                  width: "140px", padding: "8px", 
                  position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                  borderRight: "2px solid #444"
                }}>구분</th>
                
                {viewMode === "once" && (
                  <>
                    {/* 업적 헤더 */}
                    {onceBasic.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceBasic.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>기본</th>}
                    {onceStory.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceStory.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>스토리</th>}
                    {onceBossElyos.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceBossElyos.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>필드보스(천족)</th>}
                    {onceBossAsmondians.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceBossAsmondians.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>필드보스(마족)</th>}
                    {onceWing.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceWing.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>날개</th>}
                    {onceArt.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceArt.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>명화</th>}
                    {onceEtc.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceEtc.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>기타</th>}
                  </>
                )}

                {viewMode === "repeat" && (
                  <>
                    {/* 반복퀘 헤더 (category 기반) */}
                    {categoryOrder.map((cat) => {
                      const visibleCount = (groupedByCategory[cat] || []).filter(
                        (h) => !hiddenHomeworks.includes(h.name)
                      ).length;

                      if (visibleCount <= 0) return null;

                      return (
                        <th key={cat} colSpan={visibleCount} style={{ padding: "8px" }}>
                          {categoryLabel[cat] ?? cat}
                        </th>
                      );
                    })}
                  </>
                )}

                {game === "aion2" && viewMode === "aion2_soul" && (
                  <>
                    <th style={{ padding: "8px" }}>영혼각인</th>
                  </>
                )}

                {game === "aion2" && viewMode === "aion2_arcana" && (
                  <>
                    <th style={{ padding: "8px" }}>아르카나</th>
                  </>
                )}
              </tr>

              {/* 2행: 숙제명 */}
              <tr style={{ backgroundColor: "#333" }}>
                <th style={{ 
                  padding: "10px", 
                  position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                  borderRight: "2px solid #444" 
                }}>숙제명</th>
                
                {allFiltered.map(hw => {
                  if (hiddenHomeworks.includes(hw.name)) return null;

                  // ⭐ 표 너비 고정값 (이 값보다 작아지지 않음)
                  const FIXED_WIDTH = "70px";

                  return (
                    <th
                      key={hw.id}
                      style={{
                        padding: "8px 4px",
                        backgroundColor: "#333",
                        position: "relative",
                        // ⭐ 아래 3줄 추가: 칸 너비를 강제로 고정해
                        width: FIXED_WIDTH,
                        maxWidth: FIXED_WIDTH,
                        overflow: "hidden"
                      }}
                    >
                      {/* 1. 숙제명 */}
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "12px",
                          // ⭐ 아래 4줄 추가: 글자가 길면 ...으로 표시해
                          width: "100%",
                          // whiteSpace: "nowrap",
                          // overflow: "hidden",
                          // textOverflow: "ellipsis"
                          whiteSpace: "normal",
                          overflow: "break-word",
                          textOverflow: "anywhere"
                        }}
                        title={hw.name} // ⭐ 마우스 올리면 전체 이름이 툴팁으로 떠
                      >
                        {hw.name}
                      </div>
                      
                      {/* 2. 메모 영역 (주기보다 윗줄) */}
                      <div style={{ marginTop: "2px" }}>
                        {hw.memo ? (
                          // 메모가 있을 때: 클릭하면 수정 가능
                          <div 
                            onClick={() => {
                              const newMemo = prompt("메모 수정 (내용을 다 지우면 버튼으로 돌아갑니다):", hw.memo);
                              if (newMemo !== null) updateHomeworkMemo(hw.id, newMemo);
                            }}
                            style={{ 
                              fontSize: "11px", cursor: "pointer", color: "#80a3c7",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              maxWidth: "110px", margin: "0 auto"//, borderBottom: "1px dashed #62dafb"
                            }}
                            title={hw.memo}
                          >
                            {hw.memo}
                          </div>
                        ) : (
                          // 메모가 없을 때: 버튼 형식 표시
                          <button 
                            onClick={() => {
                              const newMemo = prompt("메모를 입력하세요:");
                              if (newMemo) updateHomeworkMemo(hw.id, newMemo);
                            }}
                            style={{
                              fontSize: "10px", padding: "1px 5px", cursor: "pointer",
                              backgroundColor: "#444", color: "#fff", border: "1px solid #666", borderRadius: "3px"
                            }}
                          >
                            메모
                          </button>
                        )}
                      </div>

                      {/* 3. 초기화 주기 표기 */}
                      {viewMode !== "once" && (
                        <div style={{ fontSize: "10px", color: "#bbb", marginTop: "2px" }}>
                          {hw.id === "aion2-odd-energy" ? "3n-1시마다 +15" :
                          (hw.resetType === 'recovery' ? `매일 05시 +${hw.recoveryAmount}` :
                          `${hw.resetPeriod === 'week' ? dayMap[hw.resetDay] : '매일'} ${String(Array.isArray(hw.resetTime)?hw.resetTime[0]:hw.resetTime).padStart(2,'0')}시`)}
                        </div>
                      )}

                      {/* 우측 상단 숨기기 버튼 */}
                      <button 
                        onClick={() => toggleHomework(hw.name)}
                        style={{ 
                          position: "absolute", top: "2px", right: "2px",
                          padding: "0px", fontSize: "12px", backgroundColor: "transparent", 
                          color: "#888", border: "none", cursor: "pointer",
                          width: "16px", height: "16px"
                        }}
                        onMouseOver={(e) => e.target.style.color = "#fff"}
                        onMouseOut={(e) => e.target.style.color = "#888"}
                      >
                        ➖
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dataList.map((item, idx) => {
                // 2. 객체면 name을, 아니면 그대로를 targetName에 할당
                const targetName = typeof item === 'object' ? item.name : item;
                const isShowPortrait = item?.showPortrait !== false;
                const isCollapsed = collapsedChars[targetName]; // 접힘 상태 확인
                
                return (
                  <tr key={idx}>
                    <td style={{ 
                      textAlign: "center", padding: "10px", fontWeight: "bold", 
                      position: "sticky", left: 0, zIndex: 10, backgroundColor: "#1e1e1e",
                      borderRight: "2px solid #444", verticalAlign: isCollapsed ? "middle" : "top",
                      overflow: "hidden" // 배경이 셀 밖으로 안 튀게
                    }}>

                      {/* 접기/펴기 버튼 */}
                      <button
                        onClick={() => toggleCollapse(targetName)}
                        style={{
                          position: "absolute", top: "2px", right: "2px",
                          fontSize: "10px", padding: "1px 4px", cursor: "pointer",
                          backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "3px", zIndex: 20
                        }}
                      >
                        {isCollapsed ? "➕" : "➖"}
                      </button>

                      {/* 배경/오버레이/콘텐츠 기준 잡는 래퍼 */}
                      <div
                        style={{
                          position: "relative",
                          minHeight: isCollapsed ? 60 : 160,  // ✅ 유지
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: isCollapsed ? "flex-start" : "center",
                        }}
                      >

                        {/* 초상화 "배경" */}
                        {!isCollapsed &&
                          ["lostark", "aion2"].includes(game) &&
                          scores[targetName]?.portrait && (
                            <>
                              {/* (A) 초상화 이미지: isShowPortrait일 때만 보임 */}
                              {isShowPortrait && (
                                <div
                                  aria-hidden="true"
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundImage: `url("${scores[targetName].portrait}")`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center top",
                                    opacity: 1,
                                    transform: "scale(1.0)",
                                    pointerEvents: "none",
                                    zIndex: 0,
                                  }}
                                />
                              )}

                              {/* ✅ (B) 클릭 오버레이: 초상화 ON/OFF와 무관하게 항상 존재 */}
                              <div
                                onClick={() => togglePortrait(idx, setData)}
                                title="클릭하면 초상화 토글"
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "transparent",
                                  cursor: "pointer",
                                  zIndex: 1, // 내용(zIndex 2)보다 낮게
                                }}
                              />
                            </>
                          )}

                        {/* ✅ 3) 기존 내용은 위로 */}
                        <div style={{ position: "relative", zIndex: 2 }}>

                          {/* 캐릭터 나열 순서 변경하는 위/아래 화살표 */}
                          <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginBottom: "0px" }}>
                            <button onClick={() => moveTarget(idx, "up", dataList, setData)} style={{...btnStyle, padding: "3px 6px", fontSize: "11px" }}>▲</button>
                            <button onClick={() => moveTarget(idx, "down", dataList, setData)} style={{...btnStyle, padding: "3px 6px", fontSize: "11px" }}>▼</button>
                          </div>

                          {/* 캐릭명, Lv, 직업 */}
                          <div>
                            {/* 캐릭명 */}
                            <div style={{ textAlign: "center", marginBottom: "2px" }}>
                              {editingKey === `${scope}:${idx}` ? (
                                <input
                                  value={editingValue}
                                  autoFocus
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={() =>
                                    commitRenameInline(targetName, editingValue, idx, dataList, setData)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      commitRenameInline(targetName, editingValue, idx, dataList, setData);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingKey(null);
                                      setEditingValue("");
                                    }
                                  }}
                                  style={{
                                    width: "120px",
                                    textAlign: "center",
                                    backgroundColor: "#222",
                                    color: "#fff",
                                    border: "1px solid #555",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                  }}
                                />
                              ) : (
                                <span
                                  onClick={() => {
                                    setEditingKey(`${scope}:${idx}`);
                                    setEditingValue(targetName);
                                  }}
                                  title="클릭해서 이름 변경"
                                  style={{
                                    display: "inline-block",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                    textShadow: "1px 1px 2px rgba(0,0,0,1)",
                                    // backgroundColor:
                                    //   !isCollapsed && isShowPortrait
                                    //     ? "rgba(0, 0, 0, 0.2)"
                                    //     : "transparent",
                                    // padding:
                                    //   !isCollapsed && isShowPortrait
                                    //     ? "1px 8px"
                                    //     : "0px",
                                    // borderRadius: "4px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                >
                                  {targetName}
                                </span>
                              )}
                            </div>

                            {/* Lv, 직업 */}
                            {(game === "lostark" || game === "aion2") && scores[targetName]?.job && (
                              <div style={{ fontSize: "12px", textAlign: "center", marginTop: "-4px", textShadow: "1px 1px 3px rgba(0,0,0,1)", }}>
                                {scores[targetName]?.level ? `Lv. ${scores[targetName].level} ` : ""}
                                {scores[targetName].job}
                              </div>
                            )}
                          </div>

                          {/* 전투력 등 캐릭터 추가 정보 */}
                          {!isCollapsed && (
                            <>

                              {scope === "account" && (
                                <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`[${targetName}] 계정을 목록에서 삭제하시겠습니까?`)) {
                                        setData((prev) => prev.filter((_, i) => i !== idx));
                                      }
                                    }}
                                    style={{
                                      ...btnStyle,
                                      padding: "2px 5px",
                                      fontSize: "10px",
                                      backgroundColor: "#600",
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}

                              {["aion2", "lostark"].includes(game) && scope === "character" && (() => {
                                const gameConfig = {
                                  "lostark": {
                                    labels: ["템렙", "전투력"],
                                    keys: ["itemLevel", "combatPower"],
                                    fetchFn: () => fetchLoaScore(targetName)
                                  },
                                  "aion2": {
                                    labels: ["전투력", "아툴"],
                                    keys: ["combatPower", "combatScore"],
                                    fetchFn: () => fetchScore(targetName)
                                  }
                                };

                                const config = gameConfig[game];
                                // config가 없을 경우를 대비한 안전장치
                                if (!config) return null; 

                                const scoreData = scores[targetName];

                                return (
                                  <div>
                                    {/* ✅ 전투력/아툴(또는 템렙/전투력) 표시 다시 추가 */}
                                    {scoreData ? (
                                      <div style={{ marginTop: "-8px", marginBottom: "2px" }}>
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: "#ffffff",
                                            textShadow: "1px 1px 3px rgba(0,0,0,1)",
                                          }}
                                        >
                                          {config.labels[0]}: {scoreData[config.keys[0]]?.toLocaleString?.() ?? "?"}
                                        </span>

                                        <span
                                          style={{
                                            fontSize: "10px",
                                            color: "#69b7ee",
                                            textShadow: "1px 1px 3px rgba(0,0,0,1)",
                                            marginLeft: "6px",
                                          }}
                                        >
                                          {config.labels[1]}: {scoreData[config.keys[1]]?.toLocaleString?.() ?? "?"}
                                        </span>
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          fontSize: "10px",
                                          color: "#888",
                                          marginTop: "-4px",
                                          marginBottom: "2px",
                                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                                        }}
                                      >
                                        점수 미갱신
                                      </div>
                                    )}

                                    {/* ✅ 갱신/삭제 버튼은 아래 한 줄로 유지 */}
                                    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                      <button
                                        onClick={config.fetchFn}
                                        style={{
                                          ...btnStyle,
                                          padding: "2px 5px",
                                          fontSize: "10px",
                                          backgroundColor: "#335a80",
                                          textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                                        }}
                                      >
                                        갱신
                                      </button>

                                      <button
                                        onClick={() => {
                                          if (window.confirm(`[${targetName}] 캐릭터를 목록에서 삭제하시겠습니까?`)) {
                                            setData((prev) => prev.filter((_, i) => i !== idx));
                                          }
                                        }}
                                        style={{
                                          ...btnStyle,
                                          padding: "2px 5px",
                                          fontSize: "10px",
                                          backgroundColor: "#600",
                                        }}
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </>
                          )}

                        </div>
                      </div>
                    </td>
                    
                    {/* 숙제 카운트 칸들 (항상 유지) */}
                    {allFiltered.map(hw => {
                      if (hiddenHomeworks.includes(hw.name)) return null;

                      const stored = hw.counts?.[targetName];
                      const editedMs = hw.lastEdited?.[targetName] ?? hw.lastUpdated?.[targetName];
                      const val = getDisplayVal(stored, editedMs, nowMs, hw);

                      const isExcluded = !!(hw.excluded && hw.excluded[targetName]);
                      const isPending = val > 0 && !isExcluded;

                      return (
                        <td key={`${idx}-${hw.id}`} style={{ 
                          textAlign: "center", 
                          padding: "10px", 
                          backgroundColor: isPending ? "#4b4b20" : "transparent",
                          position: "relative",
                          verticalAlign: "middle" 
                        }}>
                          {/* 제외 체크 박스 */}
                          <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                            <input type="checkbox" checked={isExcluded} onChange={() => toggleExclude(hw.id, targetName)} />
                          </div>

                          {!isExcluded ? (
                            <>
                              {/* 1. 숙제 갱신 일자: 상단으로 이동 */}
                              <div style={{ fontSize: "10px", color: "#777", marginBottom: isCollapsed ? "2px" : "6px", minHeight: "12px" }}>
                                {formatDate(hw.lastEdited?.[targetName] ?? hw.lastUpdated?.[targetName])}
                              </div>

                              {/* 2. Input 창 영역: 버튼을 떼어내고 세로 배치 유도 */}
                              <div style={{ marginBottom: isCollapsed ? "3px" : "5px" }}>
                                <input 
                                  type="number"
                                  className="count-input"
                                  value={val}
                                  onChange={(e) => updateCount(hw.id, targetName, e.target.value)}
                                  onFocus={(e) => e.target.select()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  style={{
                                    width: "45px",
                                    textAlign: "center",
                                    backgroundColor: "#222",
                                    color: "#fff",
                                    border: "1px solid #444",
                                    transition: "background-color 0.2s, color 0.2s"
                                  }}
                                />
                                <span style={{ color: isPending ? "#ccc" : "#888", fontSize: "13px" }}> / {hw.max}</span>
                              </div>
                              
                              {/* 3. 하단 버튼군: -, 0, + 가로 배치 */}
                              <div style={{ display: "flex", justifyContent: "center", gap: "3px" }}>
                                <button 
                                  style={{ ...btnStyle, padding: "2px 0", width: "24px" }} 
                                  onClick={(e) => updateCount(hw.id, targetName, -1, e)}
                                >
                                  -
                                </button>
                                <button 
                                  style={{ ...btnStyle, padding: "2px 0", width: "24px" }} 
                                  onClick={(e) => updateCount(hw.id, targetName, 0, e)}
                                >
                                  0
                                </button>
                                <button 
                                  style={{ ...btnStyle, padding: "2px 0", width: "24px" }} 
                                  onClick={(e) => updateCount(hw.id, targetName, 1, e)}
                                >
                                  +
                                </button>
                              </div>
                            </>
                          ) : <div style={{ color: "#555", fontSize: "12px" }}>제외됨</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const btnStyle = { backgroundColor: "#444", color: "#fff", border: "1px solid #666", padding: "4px 8px", cursor: "pointer" };

  return (
    <div>
      {renderTable("계정별 숙제", "account", accounts, setAccounts, {
        headerRight: (
          <button
            onClick={() => setIsAccountCollapsed(v => !v)}
            style={{ ...btnStyle, padding: "4px 8px", fontSize: "13px" }}
          >
            {isAccountCollapsed ? "▼ 펼치기" : "▲ 접기"}
          </button>
        ),
        hideBody: isAccountCollapsed,
        hideHiddenButtons: isAccountCollapsed,
      })}

      {!isAccountCollapsed && (
        <button
          onClick={() => addTargetAuto("account", accounts, setAccounts)}
          style={{ ...btnStyle, marginTop: "10px", marginBottom: "-10px", padding: "10px" }}
        >
          + 계정 추가
        </button>
      )}

      {renderTable("캐릭터별 숙제", "character", characters, setCharacters)}

      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px" }}>
        <button
          onClick={() => addTargetAuto("character", characters, setCharacters)}
          style={{ ...btnStyle, padding: "10px" }}
        >
          + 캐릭터 추가
        </button>

        {game === "aion2" && (
          <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "normal" }}>
            ※ 캐릭명[서버명2글자] 형식으로 입력하면 전투력 조회 가능 ex) 카니쵸니[바카] (바카르마 서버는 캐릭명만 써도됨)
          </span>
        )}
      </div>
    </div>
  );
}