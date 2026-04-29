// src/components/Aion2_AchievementsTab.jsx
import React from "react";
import { useEffect, useState } from "react";
import { AION2_ACHIEVEMENTS } from "../data/aion2-Achievement";

const ACHV_LS_KEY = (game) => `achievements-${game}-v2`;

const CATS = ["데바 패스", "시즌", "기본", "칭호", "필드보스(천족)", "필드보스(마족)", "날개", "조각상", "명화(던전)", "명화(슈고)", "명화(기타)"];

export default function Aion2_AchievementsTab({ characters = [], accounts = [] }) {
  const [achievementsState, setAchievementsState] = useState(() => {
    const saved = localStorage.getItem(ACHV_LS_KEY("aion2"));
    return saved
      ? { collapsed: {}, ...JSON.parse(saved) }
      : {
          byCharacter: {},
          byAccount: {},
          ui: { search: "", onlyIncomplete: false, sort: "default" },
          collapsed: {},
        };
  });

  useEffect(() => {
    localStorage.setItem(
      ACHV_LS_KEY("aion2"),
      JSON.stringify({
        byCharacter: achievementsState.byCharacter,
        byAccount: achievementsState.byAccount,
        collapsed: achievementsState.collapsed,
        ui: achievementsState.ui,
      })
    );
  }, [achievementsState.byCharacter, achievementsState.byAccount, achievementsState.collapsed, achievementsState.ui]);

  const toggleCat = (cat) => {
    setAchievementsState((prev) => ({
      ...prev,
      collapsed: { ...(prev.collapsed || {}), [cat]: !prev?.collapsed?.[cat] },
    }));
  };

  // ✅ 캐릭터명/계정명 추출 함수 (객체일 경우 name을, 문자열일 경우 그대로 반환)
  const getName = (item) => {
    if (!item) return "";
    if (typeof item === "object") return (item.name || item.id || "").trim();
    return String(item).trim();
  };

  // 테이블 렌더링 공통 함수
  const renderTable = (type, list = [], achvs = []) => {
    const isChar = type === "character";
    
    if (!list || list.length === 0) {
      return <div style={{ padding: 10, color: "#888", fontSize: 13 }}>등록된 {isChar ? "캐릭터" : "계정"}이 없습니다.</div>;
    }

    return (
      <table style={{ width: "850px", borderCollapse: "collapse", tableLayout: "fixed", marginBottom: 20 }}>
        <thead>
          <tr style={{ background: "#363636" }}>
            <th style={{ textAlign: "left", padding: "6px", border: "1px solid #333" }}>
                {isChar ? "캐릭터 업적명" : "계정 업적명"}
            </th>
            {list.map((item, idx) => {
              const label = getName(item); // 수정된 이름 추출 로직
              return (
                <th key={`${type}-head-${idx}`}
                  style={{
                    width: 64, padding: "6px 2px", border: "1px solid #333",
                    wordBreak: "break-all", whiteSpace: "normal", lineHeight: 1.1,
                    fontSize: 14
                  }}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {achvs.filter(a => a.scope === type).map((a) => (
            <tr key={a.id}>
              <td style={{ padding: "6px", border: "1px solid #333" }}>
                <span style={{ color: a.color || "inherit" }}>{a.name}</span>
              </td>
              {list.map((item, idx) => {
                const targetKey = getName(item); // 저장 키값도 동일하게 추출
                const stateGroup = isChar ? achievementsState.byCharacter : achievementsState.byAccount;
                const savedCount = stateGroup?.[targetKey]?.[a.id];
                const max = a.max || 1;
                const count = a.id === "aion2-season-coin-of-oath"
                  ? (savedCount ?? max)
                  : (savedCount || 0);

                return (
                  <td
                    key={`${type}-cell-${idx}-${a.id}`}
                    onClick={() => {
                      if (!targetKey) return; // 이름이 없는 경우 무시
                      setAchievementsState(prev => {
                        const newGroup = { ...(isChar ? prev.byCharacter : prev.byAccount) };
                        const targetData = { ...(newGroup[targetKey] || {}) };
                        if (a.id === "aion2-season-coin-of-oath") {
                          targetData[a.id] = count <= 0 ? max : count - 1;
                        } else {
                          targetData[a.id] = (count + 1) % (max + 1);
                        }
                        newGroup[targetKey] = targetData;
                        return isChar ? { ...prev, byCharacter: newGroup } : { ...prev, byAccount: newGroup };
                      });
                    }}
                    style={{
                      border: "1px solid #333",
                      cursor: "pointer",
                      background: a.id === "aion2-season-coin-of-oath"
                        // ? (count === 0 ? "#222" : (count === max ? "#5a4f2a" : "#1d271d"))
                        ? (count === 0 ? "#222" : "#5a4f2a")
                        : (count > 0 ? (count === max ? "#222" : "#3d3d3d") : "#5a4f2a"),
                      textAlign: "center",
                      fontSize: 11,
                      color: a.id === "aion2-season-coin-of-oath"
                        ? (count === 0 ? "#666" : "#fff")
                        : (count > 0 ? "#666" : "#fff"),
                      userSelect: "none",
                      fontWeight: a.id === "aion2-season-coin-of-oath"
                        ? (count === 0 ? "normal" : "bold")
                        : (count > 0 ? "normal" : "bold"),
                    }}
                  >
                    {max > 1
                      ? (a.id === "aion2-season-coin-of-oath" ? `${count}/${max}` : `${count}/${max}`)
                      : (count > 0 ? "완료" : "미완료")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ padding: 12 }}>
      {/* 닫혀있는 카테고리 필터 */}
      {CATS.some(cat => achievementsState.collapsed?.[cat]) && (
        <>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              position: "fixed",
              top: 88,
              left: 15,
              right: 15,
              zIndex: 999,
              background: "#1e1e1e",
              padding: "8px 0",
              borderBottom: "1px solid #333",
            }}
          >
            {CATS.filter(cat => achievementsState.collapsed?.[cat]).map(cat => (
              <button key={cat} onClick={() => toggleCat(cat)} style={{ background: "#2a2a2a", border: "1px solid #666", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{cat}</span><span>➕</span>
              </button>
            ))}
          </div>

          <div style={{ height: 10 }} />
        </>
      )}

      {/* 업적 리스트 */}
      {CATS.map(cat => {
        const isCollapsed = achievementsState.collapsed?.[cat];
        const achvsInCat = AION2_ACHIEVEMENTS.filter(a => a.category === cat);
        const hasCharScope = achvsInCat.some(a => a.scope === "character");
        const hasAcctScope = achvsInCat.some(a => a.scope === "account");

        return (
          <div key={cat} style={{ marginBottom: 32, borderBottom: "1px solid #333", paddingBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontWeight: "bold", fontSize: 18, color: "#ffd400" }}>{cat}</span>
              <button onClick={() => toggleCat(cat)} style={{ background: "#1e1e1e", border: "1px solid #444", color: "#ccc", padding: "2px 10px", borderRadius: 6, cursor: "pointer" }}>
                {isCollapsed ? "➕ 열기" : "➖ 접기"}
              </button>
            </div>

            {!isCollapsed && (
              <>
                {/* 계정별 업적 (위쪽) */}
                {hasAcctScope && (
                  <div style={{ marginBottom: hasCharScope ? 20 : 0 }}>
                    <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ background: "#444", padding: "2px 6px", borderRadius: 4 }}>계정 공통</span>
                    </div>
                    {renderTable("account", accounts, achvsInCat)}
                  </div>
                )}

                {/* 캐릭터별 업적 (아래쪽) */}
                {hasCharScope && (
                  <div>
                    <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ background: "#444", padding: "2px 6px", borderRadius: 4 }}>캐릭터 개별</span>
                    </div>
                    {renderTable("character", characters, achvsInCat)}
                  </div>
                )}
              </>
            )}

          </div>
        );
      })}
    </div>
  );
}