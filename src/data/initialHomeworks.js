export const initialHomeworks = [
  // 와우 - 반복
  { id: "wow-raid", game: "wow", name: "레이드", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 4, resetTime: 8, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "wow-mythic+", game: "wow", name: "쐐기주차", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 4, resetTime: 8, scope: "character", lastResetDate: "", lastUpdated: {} },

  // 로아 - 반복 - 계정
  { id: "loa-login", game: "lostark", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-manage-domain", game: "lostark", name: "영지관리", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-pa", game: "lostark", name: "보석교환(파푸니카)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-bol", game: "lostark", name: "보석교환(볼다이크)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-ku", game: "lostark", name: "보석교환(쿠르잔)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-rim", game: "lostark", name: "보석교환(림레이크)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  // 로아 - 반복 - 캐릭터
  { id: "loa-daily-guild-login", game: "lostark", name: "길드 기부", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-chaos-dungeon", game: "lostark", name: "카오스 던전", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-guardian-raid", game: "lostark", name: "가디언 토벌", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-aufakd", game: "lostark", name: "낙원", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-clear-medal-exchange", game: "lostark", name: "메달교환", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-guild-pint-exchange", game: "lostark", name: "혈석교환", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 로아 - 업적 - 스토리
  { id: "loa-archievement-story-RL_S", game: "lostark", name: "림레이크 남섬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "스토리", scope: "character", lastUpdated: {} },

  // 아이온2 - 계정 - Weekly
  { id: "aion2-account-transform-odd", game: "aion2", name: "오드 변환(계정)", max: 8, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-account-buy-odd", game: "aion2", name: "오드 구입(계정)", max: 8, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-account-buy-dungeon-instant-complete", game: "aion2", name: "즉완권 구매", max: 14, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "account", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 반복 - Daily
  { id: "aion2-login", game: "aion2", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 0, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-daily-donation", game: "aion2", name: "보급의뢰", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-quest", game: "aion2", name: "사명퀘", max: 5, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-nightmare", game: "aion2", name: "악몽", max: 14, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 2, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 반복 - 기타
  { id: "aion2-odd-energy", game: "aion2", name: "오드에너지", category: "etc", max: 840, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 15, resetTime: [2, 5, 8, 11, 14, 17, 20, 23], scope: "character", lastResetDate: "", lastResetHour: -1, lastUpdated: {} },
  // 아이온2 - 반복 - Daily (이벤트)
  { id: "aion2-event-260211-bokpocket-exchange-daily", game: "aion2", name: "복주머니 일일 교환", category: "event", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 반복 - Weekly (이벤트)
  { id: "aion2-event-260211-bokpocket-exchange-weekly", game: "aion2", name: "복주머니 주간 교환", category: "event", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-event-260211-bokpocket-key", game: "aion2", name: "복주머니 열쇠", category: "event", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // { id: "aion2-event-260211-sweetdessert", game: "aion2", name: "달콤한 디저트", category: "event", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // { id: "aion2-event-260211-pinktempestscroll", game: "aion2", name: "광풍 주문서", category: "event", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // { id: "aion2-event-260211-pinkspeedscroll", game: "aion2", name: "질주 주문서", category: "event", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 반복 - Weekly
  { id: "aion2-abyss-order", game: "aion2", name: "지령서", max: 12, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklydungeon", game: "aion2", name: "일일던전", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-awaken", game: "aion2", name: "각성전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklyraid", game: "aion2", name: "토벌전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-named", game: "aion2", name: "루드라 1,2넴", max: 4, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-boss", game: "aion2", name: "루드라", max: 2, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-change", game: "aion2", name: "오드 변환", max: 5, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-buy", game: "aion2", name: "오드 구입", max: 5, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },

];