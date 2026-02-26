// src/components/Aion2_AchievementsTab.jsx
import React from "react";
import { useEffect, useState } from "react";
import { AION2_ACHIEVEMENTS } from "../data/aion2-Achievement";

const ACHV_LS_KEY = (game) => `achievements-${game}-v2`;

// 1) 카테고리 목록(기존 하드코딩 대체)
const CATS = ["기본","필드보스(천족)","필드보스(마족)","날개","명화"];

export default function Aion2_AchievementsTab({ characters = [] }) {

  const toggleCat = (cat) => {
    setAchievementsState((prev) => ({
      ...prev,
      collapsed: { ...(prev.collapsed || {}), [cat]: !prev?.collapsed?.[cat] },
    }));
  };

  // console.log("characters:", characters);

  const [achievementsState, setAchievementsState] = useState(() => {
    const saved = localStorage.getItem(ACHV_LS_KEY("aion2"));
    return saved
      ? { collapsed: {}, ...JSON.parse(saved) }
      : {
          byCharacter: {},
          ui: { search: "", onlyIncomplete: false, sort: "default" },
          collapsed: {},
        };
  });

  // useEffect(() => console.log("ACHV loaded:", achievementsState), []);

  useEffect(() => {
    localStorage.setItem(
      ACHV_LS_KEY("aion2"),
      JSON.stringify({
        byCharacter: achievementsState.byCharacter,
        collapsed: achievementsState.collapsed,
        ui: achievementsState.ui,
      })
    );
  }, [achievementsState.byCharacter, achievementsState.collapsed]);

  const [currentChar, setCurrentChar] = useState(
    characters?.[0]?.name || characters?.[0] || ""
  );

  useEffect(() => {
    if (!characters || characters.length === 0) return;

    const first =
      typeof characters[0] === "object"
        ? characters[0].name
        : characters[0];

    setCurrentChar(prev => prev || first);
  }, [characters]);

  const charLabel = (c) => String(typeof c === "object" ? (c?.name ?? "") : (c ?? "")).trim();

  return (
    <div style={{ padding: 12 }}>

      {/* <pre style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>
        {JSON.stringify(achievementsState.byCharacter, null, 2)}
      </pre> */}

      {CATS.filter(cat => achievementsState.collapsed?.[cat]).length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {CATS
            .filter(cat => achievementsState.collapsed?.[cat])
            .map(cat => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                style={{
                  background: "#2a2a2a",
                  border: "1px solid #666",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{cat}</span>
                <span>➕</span>
              </button>
            ))}
        </div>
      )}

      {/* ✅ 여기부터가 업적 탭 UI 자리 (다음 단계에서 App.jsx에서 복사해 옮길 거임) */}
      {CATS.filter(cat => !achievementsState.collapsed?.[cat]).map(cat => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: "bold" }}>{cat}</span>

            <button
              onClick={() => toggleCat(cat)}
              style={{
                background: "#1e1e1e",
                border: "1px solid #444",
                color: "#ccc",
                padding: "2px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {achievementsState.collapsed?.[cat] ? "➕" : "➖"}
            </button>
          </div>

          {!achievementsState.collapsed?.[cat] && (
            <table style={{ width: "850px", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <thead>
                <tr style={{ background: "#363636" }}>
                  <th style={{ textAlign:"left", padding:"6px", border:"1px solid #333" }}>업적명</th>
                  {characters.map((c) => (
                    <th key={charLabel(c)}
                        style={{ width:64, padding:"6px 2px", border:"1px solid #333",
                                wordBreak:"break-all", whiteSpace:"normal", lineHeight:1.1,
                                fontSize: 14 }}>
                      {charLabel(c)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {AION2_ACHIEVEMENTS
                  .filter(a => a.category === cat)
                  .map((a) => (
                    <tr key={a.id}>
                      <td style={{ padding:"6px", border:"1px solid #333" }}>
                        {a.name}
                      </td>

                      {characters.map((c) => {
                        const ch = charLabel(c);
                        const checked =
                          achievementsState.byCharacter &&
                          achievementsState.byCharacter[ch] &&
                          achievementsState.byCharacter[ch][a.id] === true;
                        return (
                          <td
                            key={ch}
                            onClick={() => {
                              setAchievementsState(prev => {
                                const byChar = { ...(prev.byCharacter || {}) };
                                const charData = { ...(byChar[ch] || {}) };
                                charData[a.id] = !charData[a.id];
                                byChar[ch] = charData;
                                return { ...prev, byCharacter: byChar };
                              });
                            }}
                            style={{
                              border: "1px solid #333",
                              cursor: "pointer",
                              background: checked ? "#222" : "#5a4f2a",
                              textAlign: "center",
                              fontSize: 11,
                              color: checked ? "#555" : "#22221b",
                              userSelect: "none",
                            }}
                          >
                            {checked ? "(완료)" : "(미완료)"}
                          </td>
                        );
                      })}
                    </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

    </div>
  );

}