export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
export const KST_OFFSET_MS = 9 * HOUR_MS;

export const getNowMs = () => {
  const v = (typeof window !== "undefined") ? sessionStorage.getItem("__NOW_MS") : null;
  if (v && Number.isFinite(Number(v))) return Number(v);
  return Date.now();
};

export const fmtKST = (ms) =>
  new Date(ms).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

export const getCategory = (hw) => {
  if (hw.id === "aion2-odd-energy") return "etc";
  const name = String(hw.name || "");
  const id = String(hw.id || "");
  if (name.includes("[이벤트]") || id.includes("-event-") || id.startsWith("aion2-event-")) return "event";
  if (hw.category) return String(hw.category).toLowerCase();
  if (hw.resetPeriod === "day") return "daily";
  if (hw.resetPeriod === "week") return "weekly";
  return "etc";
};

const dailyBoundaryIndex = (ms, resetHourKST) => {
  const kstMs = ms + KST_OFFSET_MS;
  return Math.floor((kstMs - resetHourKST * HOUR_MS) / DAY_MS);
};

const nextWeeklyResetAfterKST = (lastMs, resetDay, resetHour) => {
  const lastKst = new Date(lastMs + KST_OFFSET_MS);
  const candKst = new Date(lastKst);
  candKst.setUTCHours(resetHour ?? 0, 0, 0, 0);
  const curDow = candKst.getUTCDay();
  const targetDow = resetDay ?? 0;
  let diff = (targetDow - curDow + 7) % 7;
  candKst.setUTCDate(candKst.getUTCDate() + diff);
  const candMs = candKst.getTime() - KST_OFFSET_MS;
  if (candMs <= lastMs) candKst.setUTCDate(candKst.getUTCDate() + 7);
  return candKst.getTime() - KST_OFFSET_MS;
};

const countTicksBetween = (lastMs, nowMs, resetHoursKST) => {
  if (!lastMs || !nowMs) return 0;
  const hours = (Array.isArray(resetHoursKST) ? resetHoursKST : [resetHoursKST])
    .filter(h => Number.isFinite(Number(h))).map(Number);
  if (hours.length === 0) return 0;
  const lastKst = new Date(lastMs + KST_OFFSET_MS);
  const nowKst = new Date(nowMs + KST_OFFSET_MS);
  const start = new Date(lastKst);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(nowKst);
  end.setUTCHours(0, 0, 0, 0);
  let ticks = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
    for (const h of hours) {
      const eventMs = Date.UTC(y, m, day, h - 9, 0, 0, 0);
      if (eventMs > lastMs && eventMs <= nowMs) ticks++;
    }
  }
  return ticks;
};

export const passedCycles = (lastMs, nowMs, hw) => {
  if (!lastMs) return 0;
  if (hw.resetPeriod === "day") {
    if (Array.isArray(hw.resetTime)) return countTicksBetween(lastMs, nowMs, hw.resetTime);
    const resetHour = hw.resetTime ?? 0;
    return dailyBoundaryIndex(nowMs, resetHour) - dailyBoundaryIndex(lastMs, resetHour);
  }
  if (hw.resetPeriod === "week") {
    const resetHour = Array.isArray(hw.resetTime) ? hw.resetTime[0] : (hw.resetTime ?? 0);
    const next = nextWeeklyResetAfterKST(lastMs, hw.resetDay ?? 0, resetHour);
    if (nowMs < next) return 0;
    return 1 + Math.floor((nowMs - next) / WEEK_MS);
  }
  return 0;
};

export const getDisplayVal = (storedVal, lastEditedMs, nowMs, hw) => {
  if (hw.resetPeriod === "once") {
    const v = Number(storedVal);
    return Number.isFinite(v) ? v : hw.max;
  }
  const base = Number.isFinite(Number(storedVal)) ? Number(storedVal) : hw.max;
  if (!lastEditedMs) return base;
  const last = Number(lastEditedMs);
  const passCount = passedCycles(last, nowMs, hw);
  if (passCount <= 0) return base;
  if (hw.resetType === "reset") return hw.max;
  if (hw.resetType === "recovery") return Math.min(hw.max, base + passCount * (hw.recoveryAmount || 0));
  return base;
};