import { useEffect, useState } from "react";
import "./App.css";

import Aion2_AchievementsTab from "./components/Aion2_AchievementsTab";
// import { AION2_ACHIEVEMENTS } from "./data/aion2-Achievement";
import Aion2_ArcanaTable from "./components/Aion2_ArcanaTable";
import Aion2_HomeworkTab from "./components/Aion2_HomeworkTab";
import { initialHomeworks } from "./data/initialHomeworks";
import { getCategory, fmtKST, getNowMs, getDisplayVal } from "./data/homeworkUtils";
import Aion2_SkillCombinedTab from "./components/Aion2_SkillCombinedTab";
import Aion2_SoulEngravingTable from "./components/Aion2_SoulEngravingTable";
import Aion2_CpTab from "./components/Aion2_CpTab";
// import Aion2_SkillPriorityTable from "./components/Aion2_SkillPriorityTable";
import Aion2_RaidPartyBuilder from "./components/Aion2_RaidPartyBuilder";
import Aion2_MemoTab from "./components/Aion2_MemoTab";

import aion2Icon from "./assets/gameicons/aion2.png";
import lostarkIcon from "./assets/gameicons/lostark.png";
import wowIcon from "./assets/gameicons/wow.png";

const GAMES = [
  {
    id: "wow",
    label: "World of Warcraft",
    icon: wowIcon,
  },
  {
    id: "lostark",
    label: "Lost Ark",
    icon: lostarkIcon,
  },
  {
    id: "aion2",
    label: "AION 2",
    icon: aion2Icon,
  },
];

const GAME_IDS = GAMES.map(g => g.id);

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const KST_OFFSET_MS = 9 * HOUR_MS;

const formatScoreUpdatedAt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts + KST_OFFSET_MS);
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
};

const normalizeRepeatCategory = (hw) => {
  if (hw.resetPeriod === "once") return hw;
  if (hw.id === "aion2-odd-energy") {
    if (hw.category === "etc") return hw;
    return { ...hw, category: "etc" };
  }
  if (typeof hw.name === "string" && hw.name.startsWith("[이벤트]")) {
    if (hw.category === "event") return hw;
    return { ...hw, category: "event" };
  }
  if (hw.category) return hw;
  if (hw.resetPeriod === "day") return { ...hw, category: "daily" };
  if (hw.resetPeriod === "week") return { ...hw, category: "weekly" };
  return { ...hw, category: "etc" };
};

const ACHV_LS_KEY = (game) => `achievements-${game}`;

function App() {
  useEffect(() => {
    const STYLE_ID = "ghw-count-input-style";
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
      input[type=number] {
        -moz-appearance: textfield !important;
      }

      .count-input:focus {
        background-color: #ffffff !important;
        color: #000000 !important;
        outline: 2px solid #62dafb !important;
      }

      .count-input::selection {
        background-color: #0078d7 !important;
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const LEGACY_GAME_KEY_MAP = {
    "World of Warcraft": "wow",
    "Lost Ark": "lostark",
    "AION 2": "aion2",
  };

  const normalizeGameId = (g) => LEGACY_GAME_KEY_MAP[g] ?? g;

  const [game, setGame] = useState(() => {
    const saved = localStorage.getItem("lastSelectedGame");
    const normalized = normalizeGameId(saved || "wow");
    if (saved && saved !== normalized) localStorage.setItem("lastSelectedGame", normalized);
    return normalized;
  });

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(`viewMode-${game}`) || "repeat"
  );

  const [achvResetKey, setAchvResetKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`viewMode-${game}`);
    setViewMode(saved || "repeat");
  }, [game]);

  useEffect(() => {
    localStorage.setItem(`viewMode-${game}`, viewMode);
  }, [game, viewMode]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hiddenHomeworks, setHiddenHomeworks] = useState([]);
  
  const [homeworks, setHomeworks] = useState(() => {
    const perGame = localStorage.getItem(`homeworks-${game}`);
    if (perGame) return JSON.parse(perGame);

    const legacy = localStorage.getItem(`all-homeworks`);
    if (legacy) return JSON.parse(legacy);

    return initialHomeworks;
  });

  useEffect(() => {
    setHomeworks(prev => {
      const next = prev.map(hw => {
        if (hw.resetPeriod === "once") return hw;

        const cat = getCategory(hw);
        if (String(hw.category || "").toLowerCase() !== cat) {
          return { ...hw, category: cat };
        }
        return hw;
      });

      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        localStorage.setItem(`homeworks-${game}`, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setHomeworks(prev => {
      const next = prev.map(normalizeRepeatCategory);

      const changed = JSON.stringify(prev) !== JSON.stringify(next);
      if (changed) {
        localStorage.setItem(`homeworks-${game}`, JSON.stringify(next));
      }
      return next;
    });
  }, []);
  
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem(`characters-${game}`); // 수정
    return saved ? JSON.parse(saved) : []; 
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem(`accounts-${game}`); // 수정
    return saved ? JSON.parse(saved) : [];
  });

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem(`scores-${game}`); // 수정
    return saved ? JSON.parse(saved) : {};
  });

  const [collapsedChars, setCollapsedChars] = useState(() => {
    const saved = localStorage.getItem("collapsedChars");
    return saved ? JSON.parse(saved) : {};
  });  

  // ✅ 인라인 이름 수정용
  const [editingKey, setEditingKey] = useState(null); // `${scope}:${idx}` 같은 고유키
  const [editingValue, setEditingValue] = useState("");

  const fetchSkillPriorities = async (jobKorean) => {
    const url = `https://www.aion2tool.com/api/skill-priorities?job=${encodeURIComponent(jobKorean)}`;
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`Aion2Tool API error: ${r.status}`);
    return r.json();
  };

  useEffect(() => {
    fetchSkillPriorities("궁성")
      .then(data => console.log("궁성 스킬 데이터:", data))
      .catch(err => console.error("API 실패:", err));
  }, []);

  // 1️⃣ 초기값: 현재 game 기준으로 localStorage에서 읽기
  const [isAccountCollapsed, setIsAccountCollapsed] = useState(() => {
    return localStorage.getItem(`collapse-account-${game}`) === "1";
  });

  // 2️⃣ game이 바뀔 때: 해당 게임의 저장값을 다시 로드
  useEffect(() => {
    const saved = localStorage.getItem(`collapse-account-${game}`);
    setIsAccountCollapsed(saved === "1");
  }, [game]);

  // 3️⃣ 접힘 상태가 바뀔 때: 현재 game 키로 저장
  useEffect(() => {
    localStorage.setItem(
      `collapse-account-${game}`,
      isAccountCollapsed ? "1" : "0"
    );
  }, [game, isAccountCollapsed]);

  useEffect(() => {
    setIsLoaded(false);

    setCharacters([]);
    setAccounts([]);
    setScores({});
    setHiddenHomeworks([]);

    const LEGACY_LABEL = {
      wow: "World of Warcraft",
      lostark: "Lost Ark",
      aion2: "AION 2",
    };

    const legacy = LEGACY_LABEL[game];
    const bases = ["characters", "accounts", "scores", "hidden-homeworks"];

    const isEmpty = (v) => v == null || v === "[]" || v === "{}";

    if (legacy) {
      bases.forEach((base) => {
        const newKey = `${base}-${game}`;
        const oldKey = `${base}-${legacy}`;

        if (isEmpty(localStorage.getItem(newKey))) {
          const oldData = localStorage.getItem(oldKey);
          if (oldData && !isEmpty(oldData)) localStorage.setItem(newKey, oldData);
        }
      });
    }

    const safeParse = (v, fallback) => {
      if (!v) return fallback;
      try {
        return JSON.parse(v);
      } catch {
        return fallback;
      }
    };

    setCharacters(safeParse(localStorage.getItem(`characters-${game}`), []));
    setAccounts(safeParse(localStorage.getItem(`accounts-${game}`), []));
    setScores(safeParse(localStorage.getItem(`scores-${game}`), {}));
    setHiddenHomeworks(safeParse(localStorage.getItem(`hidden-homeworks-${game}`), []));

    setTimeout(() => setIsLoaded(true), 100);
  }, [game]);

  useEffect(() => {
    if (!isLoaded) return;

    const isHomeworkView = viewMode === "repeat" || viewMode === "once";
    if (!isHomeworkView) return;

    localStorage.setItem(`homeworks-${game}`, JSON.stringify(homeworks));
    localStorage.setItem(`characters-${game}`, JSON.stringify(characters));
    localStorage.setItem(`accounts-${game}`, JSON.stringify(accounts));
    localStorage.setItem(`scores-${game}`, JSON.stringify(scores));
    localStorage.setItem(`hidden-homeworks-${game}`, JSON.stringify(hiddenHomeworks));
  }, [homeworks, characters, accounts, game, scores, isLoaded, hiddenHomeworks, viewMode]);

  const resetProgress = () => {
    if (window.confirm(`[${game}] 모든 숙제 진행도를 남은 상태(max)로 변경하시겠습니까?`)) {
      setHomeworks(prev => prev.map(hw => hw.game === game ? { ...hw, counts: {} } : hw));
    }
  };

  const resetGameData = () => {
    if (window.confirm(`[${game}] 캐릭터 명단 및 모든 진행도를 초기화하시겠습니까?`)) {
      setCharacters(["캐릭터1"]);
      setAccounts([]);
      setHomeworks(prev => [
        ...prev.filter(hw => hw.game !== game),
        ...initialHomeworks.filter(hw => hw.game === game)
      ]);
    }
  };

  const updateSettings = () => {
    if (window.confirm("코드의 최신 설정을 반영하시겠습니까? (삭제된 숙제는 제거되며, 진행도는 유지됩니다)")) {
      setHomeworks(prev => {
        const latestInitial = initialHomeworks.filter(h => h.game === game);
        const otherGameHomeworks = prev.filter(h => h.game !== game);
        
        const updatedCurrentGame = latestInitial.map(latest => {
          const existing = prev.find(h => h.id === latest.id);
          if (existing) {
            return { 
              ...latest, 
              counts: existing.counts, 
              excluded: existing.excluded,
              lastUpdated: existing.lastUpdated,
              lastEdited: existing.lastEdited
            };
          }
          return latest;
        });

        const customHomeworks = prev.filter(h => h.game === game && h.id.startsWith("custom-"));

        return [...otherGameHomeworks, ...updatedCurrentGame, ...customHomeworks];
      });
      alert("동기화가 완료되었습니다.");
    }
  };

  const btnStyle = { backgroundColor: "#444", color: "#fff", border: "1px solid #666", padding: "4px 8px", cursor: "pointer" };

  const exportData = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    // 1. 모든 게임의 데이터를 수집
    const exportObj = {
      homeworks: homeworks.map(hw => ({
        ...hw,
        counts: hw.counts || {},
        lastUpdated: hw.lastUpdated || {},
        lastEdited: hw.lastEdited || {},
        excluded: hw.excluded || {}
      })),
      collapsedChars: collapsedChars || {},
      version: "2.0",
      // ★ 추가: 모든 게임의 숨김 목록을 담을 객체 생성
      hiddenHomeworksByGame: {} 
    };

    // 2. 각 게임별 캐릭터, 계정, "숨김 목록" 정보를 담음
    GAME_IDS.forEach(g => {
      const savedChar = localStorage.getItem(`characters-${g}`);
      const savedAcc = localStorage.getItem(`accounts-${g}`);
      const savedHidden = localStorage.getItem(`hidden-homeworks-${g}`);
      const savedScores = localStorage.getItem(`scores-${g}`);
      const savedAchv = localStorage.getItem(`achievements-${g}-v2`);

      exportObj[`characters-${g}`] = savedChar ? JSON.parse(savedChar) : [];
      exportObj[`accounts-${g}`] = savedAcc ? JSON.parse(savedAcc) : [];
      exportObj.hiddenHomeworksByGame[g] = savedHidden ? JSON.parse(savedHidden) : [];
      exportObj[`scores-${g}`] = savedScores ? JSON.parse(savedScores) : {};
      exportObj[`achievements-${g}-v2`] = savedAchv ? JSON.parse(savedAchv) : {};
    });

    const savedExtraOdd = localStorage.getItem("ghw-extra-odd");
    const savedExtraDungeon = localStorage.getItem("ghw-extra-dungeon");
    exportObj["extra-odd"] = savedExtraOdd ? JSON.parse(savedExtraOdd) : {};
    exportObj["extra-dungeon"] = savedExtraDungeon ? JSON.parse(savedExtraDungeon) : {};
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GHW_${ts}.json`;
    link.click();
    URL.revokeObjectURL(url); 
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // 1. 공통 데이터 처리 (숙제 설정, 점수, 접기 상태)
        if (data.homeworks) {
          localStorage.setItem("homeworks", JSON.stringify(data.homeworks));
          setHomeworks(data.homeworks);
        }
        if (data.scores) {
          localStorage.setItem("scores", JSON.stringify(data.scores));
          setScores(data.scores);
        }
        if (data.collapsedChars) {
          localStorage.setItem("collapsedChars", JSON.stringify(data.collapsedChars));
          setCollapsedChars(data.collapsedChars);
        }

        // 2. 게임별 캐릭터/계정 정보 분리 저장
        GAME_IDS.forEach(g => {
          const charKey = `characters-${g}`;
          const accKey = `accounts-${g}`;

          if (data[charKey]) localStorage.setItem(charKey, JSON.stringify(data[charKey]));
          if (data[accKey]) localStorage.setItem(accKey, JSON.stringify(data[accKey]));

          if (g === game) {
            if (data[charKey]) setCharacters(data[charKey]);
            if (data[accKey]) setAccounts(data[accKey]);
          }
        });

        // ✅ scores 복구
        GAME_IDS.forEach(g => {
          const scoreKey = `scores-${g}`;
          if (data[scoreKey]) {
            localStorage.setItem(scoreKey, JSON.stringify(data[scoreKey]));
            if (g === game) setScores(data[scoreKey]);
          }
        });

        // ★ 3. 숙제 숨김 목록 복구 (이 부분만 추가됨)
        if (data.hiddenHomeworksByGame) {
          Object.keys(data.hiddenHomeworksByGame).forEach(g => {
            const hiddenKey = `hidden-homeworks-${g}`;
            localStorage.setItem(hiddenKey, JSON.stringify(data.hiddenHomeworksByGame[g]));
          });

          // 현재 보고 있는 게임의 숨김 목록 즉시 반영
          if (data.hiddenHomeworksByGame[game]) {
            setHiddenHomeworks(data.hiddenHomeworksByGame[game]);
          }
        }

        // ✅ 업적 복구 (모든 게임)
        GAME_IDS.forEach(g => {
          const achvKey = `achievements-${g}-v2`;
          if (data[achvKey]) {
            localStorage.setItem(achvKey, JSON.stringify(data[achvKey]));
          }
        });

        // 현재 아이온2 업적 탭 새로고침
        if (game === "aion2") {
          setAchvResetKey(prev => prev + 1);
        }

        // ✅ 추가 오드에너지 / 추가 던전티켓 복구
        if (data["extra-odd"]) {
          localStorage.setItem("ghw-extra-odd", JSON.stringify(data["extra-odd"]));
        }
        if (data["extra-dungeon"]) {
          localStorage.setItem("ghw-extra-dungeon", JSON.stringify(data["extra-dungeon"]));
        }

        // ✅ Aion2_HomeworkTab에 "방금 load 끝났음" 신호 보내기
        window.dispatchEvent(new Event("ghw-extra-data-loaded"));

        alert("데이터를 성공적으로 불러왔습니다.");
        
      } catch (err) {
        alert("파일 읽기 실패: " + err.message);
      }
    };
    reader.readAsText(file);
  };  
  
  const isHomeworkView = viewMode === "repeat" || viewMode === "once";

  const dayMap = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    function onMsg(e) {
      // ✅ aion2tool에서 온 것만 허용
      if (e.origin !== "https://www.aion2tool.com") return;

      if (e.data?.type === "AION2_SKILLPRIORITY_IMPORT") {
        const { job, payload } = e.data || {};
        if (!job || !payload) return;

        localStorage.setItem(`aion2-skillpriority-${job}`, JSON.stringify(payload));
        console.log("[IMPORT OK]", job);
        alert(`AION2 스킬 우선순위 가져오기 완료: ${job}`);
      }
    }

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div style={{ padding: "2px", color: "#fff", backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
      
      {/* 헤더 섹션: 상단 고정 및 배경색 유지 */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: "#1e1e1e", 
        paddingBottom: "2px",
        marginBottom: "0px",
        borderBottom: "1px solid #333"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "30px" }}>
          
          {/* 1. 좌측 로고 영역 (56px) */}
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ margin: "3px", marginLeft: "10px", fontSize: "56px", lineHeight: "0.9", fontWeight: "bold" }}>GHW</h1>
            <div style={{ fontSize: "11px", color: "#888", marginLeft: "10px", marginTop: "8px", whiteSpace: "nowrap" }}>
              업데이트 : 2026-04-19 11:09
            </div>
          </div>

          {/* 2. 우측 버튼 영역 (2행) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1행: 게임 버튼 */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "-4px" }}>
              {GAMES.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGame(g.id);
                    localStorage.setItem("lastSelectedGame", g.id);
                  }}
                  title={g.label}
                  style={{
                    ...btnStyle,
                    width: "44px",
                    height: "44px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: game === g.id ? "#867d6e" : "#333",
                    border: game === g.id ? "3px solid #fff" : "1px solid #555",
                    opacity: game === g.id ? 1 : 0.6,
                    filter: game === g.id ? "none" : "grayscale(100%)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={g.icon}
                    alt={g.label}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      filter: game === g.id ? "drop-shadow(0px 0px 4px rgba(0,0,0,0.5))" : "none"
                    }}
                  />
                </button>
              ))}
            </div>
            
            {/* 2행: 설정 및 기능 버튼 (색상 복구) */}
            <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
              <button
                onClick={() => setViewMode("repeat")}
                style={{
                  ...btnStyle,
                  backgroundColor: viewMode === "repeat" ? "#333" : "#1e1e1e",
                  border: viewMode === "repeat" ? "1px solid #777" : "1px solid #444",
                  fontWeight: viewMode === "repeat" ? "bold" : "normal",
                }}
              >
                숙제
              </button>

              {/* ✅ AION 2 전용 버튼들 */}
              {game === "aion2" && (
                <>
                  <button
                    onClick={() => setViewMode("aion2_achievements")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_achievements" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_achievements" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_achievements" ? "bold" : "normal",
                    }}
                  >
                    업적
                  </button>

                  {/* <button
                    onClick={() => setViewMode("aion2_cp")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_cp" ? "#444" : btnStyle.backgroundColor,
                    }}
                  >
                    전투력
                  </button> */}

                  <button
                    onClick={() => setViewMode("aion2_soul")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_soul" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_soul" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_soul" ? "bold" : "normal",
                    }}
                  >
                    영혼각인
                  </button>

                  <button
                    onClick={() => setViewMode("aion2_arcana")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_arcana" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_arcana" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_arcana" ? "bold" : "normal",
                    }}
                  >
                    아르카나
                  </button>

                  <button
                    onClick={() => setViewMode("aion2_skillcalc")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_skillcalc" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_skillcalc" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_skillcalc" ? "bold" : "normal",
                    }}
                  >
                    스킬
                  </button>

                  <button
                    onClick={() => setViewMode("aion2_party")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_party" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_party" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_party" ? "bold" : "normal",
                    }}
                  >
                    파티
                  </button>

                  <button
                    onClick={() => setViewMode("aion2_memo")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_memo" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_memo" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_memo" ? "bold" : "normal",
                    }}
                  >
                    메모
                  </button>
                </>
              )}

              {/* 공통 저장/불러오기 버튼 */}
              <button onClick={exportData} style={{ ...btnStyle, backgroundColor: "#004080", marginLeft: "10px" }}>Save</button>
              <label style={{ ...btnStyle, backgroundColor: "#1a5e20", cursor: "pointer", textAlign: "center", display: "inline-block" }}>
                Load<input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
              </label>

              {/* ✅ 숙제 탭일 때만 노출되는 관리 버튼들 */}
              {game === "aion2" && viewMode === "repeat" && (
                <>
                  <button onClick={updateSettings} style={{ ...btnStyle, backgroundColor: "#6a1b9a", marginLeft: "10px" }}>숙제 최신화</button>
                  {/* <button onClick={resetProgress} style={{ ...btnStyle, backgroundColor: "#5d4037" }}>진행도 초기화</button> */}
                  <button onClick={resetGameData} style={{ ...btnStyle, backgroundColor: "#b71c1c" }}>공장 초기화</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>      

      {isHomeworkView && (
        <Aion2_HomeworkTab
          game={game}
          viewMode={viewMode}
          homeworks={homeworks}
          setHomeworks={setHomeworks}
          characters={characters}
          setCharacters={setCharacters}
          accounts={accounts}
          setAccounts={setAccounts}
          scores={scores}
          setScores={setScores}
          hiddenHomeworks={hiddenHomeworks}
          setHiddenHomeworks={setHiddenHomeworks}
          collapsedChars={collapsedChars}
          setCollapsedChars={setCollapsedChars}
          isAccountCollapsed={isAccountCollapsed}
          setIsAccountCollapsed={setIsAccountCollapsed}
        />
      )}

      {isLoaded && game === "aion2" && viewMode === "aion2_achievements" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_AchievementsTab 
            key={achvResetKey} 
            characters={characters} 
            accounts={accounts} // ✅ 이 줄을 추가하세요!
          />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_arcana" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_ArcanaTable />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_cp" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_CpTab />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_soul" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_SoulEngravingTable />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_skillcalc" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_SkillCombinedTab />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_party" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_RaidPartyBuilder />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_memo" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_MemoTab />
        </div>
      )}

    </div>
  );  
}

export default App;