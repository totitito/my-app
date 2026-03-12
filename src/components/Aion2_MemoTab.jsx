// src/components/Aion2_MemoTab.jsx
import { useState, useEffect, useRef } from "react";

const LS_KEY = "ghw-aion2-memo-v1";

export default function Aion2_MemoTab() {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(LS_KEY) ?? ""; }
    catch { return ""; }
  });

  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, text); }
      catch {}
      setSaved(true);
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [text]);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, color: saved ? "#4caf50" : "#888" }}>
        {saved ? "● 저장됨" : "● 저장 중..."}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메모를 입력하세요..."
        style={{
          width: "100%",
          minHeight: 400,
          background: "#1a1a1a",
          color: "#e0e0e0",
          border: "1px solid #3a3a3a",
          borderRadius: 6,
          padding: 12,
          fontSize: 14,
          fontFamily: "inherit",
          resize: "vertical",
          boxSizing: "border-box",
          lineHeight: 1.6,
          outline: "none",
        }}
      />
    </div>
  );
}
