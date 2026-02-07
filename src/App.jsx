import { useEffect, useState } from "react";

const games = ["World of Warcraft", "Lost Ark", "AION 2"];

const formatScoreUpdatedAt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
};

const initialHomeworks = [
  // 와우 - 반복
  { id: "wow-raid", game: "World of Warcraft", name: "레이드", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 4, resetTime: 8, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "wow-mythic+", game: "World of Warcraft", name: "쐐기주차", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 4, resetTime: 8, scope: "character", lastResetDate: "", lastUpdated: {} },

  // 로아 - 반복 - 계정
  { id: "loa-login", game: "Lost Ark", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-manage-domain", game: "Lost Ark", name: "영지관리", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-pa", game: "Lost Ark", name: "보석교환(파푸니카)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-bol", game: "Lost Ark", name: "보석교환(볼다이크)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-ku", game: "Lost Ark", name: "보석교환(쿠르잔)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  { id: "loa-weekly-gem-buy-rim", game: "Lost Ark", name: "보석교환(림레이크)", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "account", lastResetDate: "", lastUpdated: {} },
  // 로아 - 반복 - 캐릭터
  { id: "loa-daily-guild-login", game: "Lost Ark", name: "길드 기부", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-chaos-dungeon", game: "Lost Ark", name: "카오스 던전", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-guardian-raid", game: "Lost Ark", name: "가디언 토벌", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-aufakd", game: "Lost Ark", name: "낙원", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-clear-medal-exchange", game: "Lost Ark", name: "메달교환", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "loa-guild-pint-exchange", game: "Lost Ark", name: "혈석교환", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 6, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 로아 - 업적 - 스토리
  { id: "loa-archievement-story-RL_S", game: "Lost Ark", name: "림레이크 남섬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "스토리", scope: "character", lastUpdated: {} },

  // 아이온2 - 반복 - Daily
  { id: "aion2-login", game: "AION 2", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-daily-donation", game: "AION 2", name: "보급의뢰", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-quest", game: "AION 2", name: "사명퀘", max: 5, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-nightmare", game: "AION 2", name: "악몽", max: 14, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 2, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-energy", game: "AION 2", name: "오드에너지", max: 840, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 15, resetTime: [2, 5, 8, 11, 14, 17, 20, 23], scope: "character", lastResetDate: "", lastResetHour: -1, lastUpdated: {} },
  // 아이온2 - 반복 - Weekly
  { id: "aion2-abyss-order", game: "AION 2", name: "지령서", max: 12, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklydungeon", game: "AION 2", name: "일일던전", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-awaken", game: "AION 2", name: "각성전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklyraid", game: "AION 2", name: "토벌전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-named", game: "AION 2", name: "루드라 1,2넴", max: 4, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-boss", game: "AION 2", name: "루드라", max: 2, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-change", game: "AION 2", name: "오드 변환", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-buy", game: "AION 2", name: "오드 구입", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 업적 - 기본
  { id: "aion2-basic-foundation-quests", game: "AION 2", name: "지역퀘, 봉던, 주둔지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "기본", scope: "character", lastUpdated: {} },
  { id: "aion2-achievement-add-friends", game: "AION 2", name: "친추업적", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "기본", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 필드보스
  { id: "aion2-sentry-knash", game: "AION 2", name: "감시병기 크나쉬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-black-tentacle-lawa", game: "AION 2", name: "검은 촉수 라와", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-berserker-kusan", game: "AION 2", name: "광투사 쿠산", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Commander-Ragta", game: "AION 2", name: "군단장 라그타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-ehdWHrdml-spdlzpf", game: "AION 2", name: "동쪽의 네이켈", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-aksrogks-zhfls", game: "AION 2", name: "만개한 코린", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Invincible-Solo-I", game: "AION 2", name: "무적의 솔로 I", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-apostate-rayla", game: "AION 2", name: "배교자 레일라", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-centurion-Demiros", game: "AION 2", name: "백부장 데미로스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-raged-sarus", game: "AION 2", name: "분노한 사루스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-tjWHrdml-zpfmshs", game: "AION 2", name: "서쪽의 케르논", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-gather-manager-moshav", game: "AION 2", name: "수확관리자 모샤브", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-forest-warrior", game: "AION 2", name: "숲전사 우라무", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-holy-ansas", game: "AION 2", name: "신성한 안사스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Tjrdms-znxkfm", game: "AION 2", name: "썩은 쿠타르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Researcher-Setram", game: "AION 2", name: "연구관 세트람", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Soul-Ruler-Kashapa", game: "AION 2", name: "영혼 지배자 카샤파", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-priest-garsim", game: "AION 2", name: "제사장 가르심", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-chaser-taulo", game: "AION 2", name: "추격자 타울로", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-silent-tartan", game: "AION 2", name: "침묵의 타르탄", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-blood-fang", game: "AION 2", name: "피송곳니 프닌", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-scholar-raula", game: "AION 2", name: "학자 라울라", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-guard-tigant", game: "AION 2", name: "호위병 티간트", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-dream-kassia", game: "AION 2", name: "환몽의 카시아", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Timeless-Isle-Timeless-Gartua", game: "AION 2", name: "[영원의 섬] 영원의 가르투아", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Black-Warrior-Aed", game: "AION 2", name: "[알트가르드] 검은 전사 아에드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Berserker-Balg", game: "AION 2", name: "[알트가르드] 광전사 발그", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-deceiver-trid", game: "AION 2", name: "[알트가르드] 기만자 트리드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Melted-Danar", game: "AION 2", name: "[알트가르드] 녹아내린 다나르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Guruta", game: "AION 2", name: "[알트가르드] 드라칸 부대병기 구루타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Axios", game: "AION 2", name: "[알트가르드] 망혼의 아칸 악시오스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Noblude", game: "AION 2", name: "[알트가르드] 모독자 노블루드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Shuzakan", game: "AION 2", name: "[알트가르드] 백전노장 슈자칸", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Linkes", game: "AION 2", name: "[알트가르드] 별동대장 링크스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Karuka", game: "AION 2", name: "[알트가르드] 비전의 카루카", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Shirak", game: "AION 2", name: "[알트가르드] 예리한 쉬라크", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Hadirun", game: "AION 2", name: "[알트가르드] 중독된 하디룬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Advisor-Lesana", game: "AION 2", name: "[알트가르드] 참모관 르사나", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Barsien", game: "AION 2", name: "[알트가르드] 처형자 바르시엔", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Supervisor-Nuta", game: "AION 2", name: "[알트가르드] 총감독관 누타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Faithful-Lagit", game: "AION 2", name: "[알트가르드] 충실한 라지트", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Predator-Garsan", game: "AION 2", name: "[알트가르드] 포식자 가르산", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Bluewave-Kelpina", game: "AION 2", name: "[알트가르드] 푸른물결 켈피나", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Blood-Warrior-Lannar", game: "AION 2", name: "[알트가르드] 혈전사 란나르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Bishveda", game: "AION 2", name: "[알트가르드] 흑암의 비슈베다", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 날개
  { id: "aion2-fire-temple", game: "AION 2", name: "불의 신전", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  { id: "aion2-horn-cave", game: "AION 2", name: "사나운 뿔 암굴", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  { id: "aion2-dramata-nest", game: "AION 2", name: "죽은 드라마타의 둥지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 명화
  { id: "aion2-duduka-worker", game: "AION 2", name: "두두카 일꾼", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-shugo-alchemist", game: "AION 2", name: "슈고 연금술사", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-kantas-valley", game: "AION 2", name: "칸타스 계곡", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-verteron-ruin", game: "AION 2", name: "베르테론 요새 폐허", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-elun-mid", game: "AION 2", name: "엘룬강 중류", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-pilgrim-pass", game: "AION 2", name: "순례자의 고갯길", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-elun-swamp", game: "AION 2", name: "엘룬강 늪지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-dawn-base", game: "AION 2", name: "새벽의 레기온 기지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-teina-portrait", game: "AION 2", name: "테이나 초상화", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-shurak", game: "AION 2", name: "슈라크", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
];

function App() {
  const [game, setGame] = useState(games[0]);
  const [viewMode, setViewMode] = useState("repeat");
  const [charInfo, setCharInfo] = useState(null);
  
  const [homeworks, setHomeworks] = useState(() => {
    const saved = localStorage.getItem(`all-homeworks`);
    return saved ? JSON.parse(saved) : initialHomeworks;
  });

  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem(`characters-${games[0]}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.length > 0 ? parsed : ["캐릭터1"];
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem(`accounts-${games[0]}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem(`scores-${games[0]}`); // 처음엔 wow 기준
    return saved ? JSON.parse(saved) : {};
  });

  const fetchScore = async (fullName) => {
    try {
      // "카니쵸니[바카]" 같은 형식 지원
      const match = fullName.match(/^(.+?)\[(.+?)\]$/);
      let charName = fullName;
      let server_id = 1016; // 기본값(원하면 바꿔)

      if (match) {
        charName = match[1].trim();
        const serverAbbr = match[2].trim();
        const serverMap = { "아리": 1006, "바카": 1016, "코치": 1018 };
        server_id = serverMap[serverAbbr] || 1016;
      }

      // ✅ 이제 Worker/atool 직접호출 말고, 우리 서버 함수로 호출
      const r = await fetch("/api/aion2-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: charName, server_id }),
      });

      const j = await r.json();

      setScores((prev) => ({
        ...prev,
        [fullName]: {
          combatPower: j.combat_power ?? 0,
          combatScore: j.combat_score ?? 0,
          updatedAt: Date.now(),
        },
      }));
    } catch (e) {
      console.error("전투력 갱신 실패:", e);
    }
  };

  const fetchLoaScore = async (charName) => {
    try {
      // const targetUrl = `/api-lostark/armories/characters/${encodeURIComponent(charName)}/profiles`;
      const targetUrl = `/api/loa-profile?name=${encodeURIComponent(charName)}`;

      const response = await fetch(targetUrl, { method: "GET" }); // ✅ 헤더 제거

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data) {
        setScores(prev => ({
          ...prev,
          [charName]: {
            itemLevel: data.ItemMaxLevel,
            // combatPower: data.Stats?.find(s => s.Type === "전투력")?.Value || 0,
            combatPower: data.CombatPower || 0,
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

  useEffect(() => {
    const savedChar = localStorage.getItem(`characters-${game}`);
    const savedAcc = localStorage.getItem(`accounts-${game}`);
    const savedScores = localStorage.getItem(`scores-${game}`);

    setCharacters(savedChar && JSON.parse(savedChar).length > 0 ? JSON.parse(savedChar) : ["캐릭터1"]);
    setAccounts(savedAcc ? JSON.parse(savedAcc) : []);
    setScores(savedScores ? JSON.parse(savedScores) : {});
  }, [game]);

  useEffect(() => {
    localStorage.setItem(`all-homeworks`, JSON.stringify(homeworks));
    localStorage.setItem(`characters-${game}`, JSON.stringify(characters));
    localStorage.setItem(`accounts-${game}`, JSON.stringify(accounts));
    localStorage.setItem(`scores-${game}`, JSON.stringify(scores));
  }, [homeworks, characters, accounts, game, scores]);

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
            // [수정 포인트] lastUpdated를 명시적으로 추가해서 기존 기록을 보존함
            return { 
              ...latest, 
              counts: existing.counts, 
              excluded: existing.excluded,
              lastUpdated: existing.lastUpdated // 이 부분이 핵심
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

  useEffect(() => {
    const checkReset = () => {
      const now = new Date();
      const currentTime = now.getTime();
      let totalChanged = false;

      setHomeworks(prev => {
        return prev.map(hw => {
          if (hw.resetPeriod === 'once') return hw;

          const targets = hw.scope === "account" ? accounts : characters;
          const newCounts = { ...hw.counts };
          const newLastUpdated = { ...(hw.lastUpdated || {}) };
          let hwChanged = false;

          // 리셋 시각 배열화
          const resetTimes = Array.isArray(hw.resetTime) ? hw.resetTime : [hw.resetTime || 0];

          targets.forEach(name => {
            const lastUpdate = newLastUpdated[name];
            if (!lastUpdate) {
              // 기록이 없으면 현재 시간으로 도장만 찍고 넘어감
              newLastUpdated[name] = currentTime;
              hwChanged = true;
              return;
            }

            // ★ 핵심: lastUpdate 시점부터 현재(now)까지 리셋 포인트가 몇 번 있었는지 계산
            let passCount = 0;
            let checkDate = new Date(lastUpdate);

            // 1분 단위로 시각을 전진시키며 리셋 포인트(Hour/Day)를 지났는지 체크
            // (성능을 위해 1시간 단위나 포인트 단위 점프도 가능하지만, 확실한 계산을 위해 시점 순회)
            while (checkDate < now) {
              const prevHour = checkDate.getHours();
              const prevDay = checkDate.getDay();
              const prevDate = checkDate.getDate();

              checkDate.setMinutes(checkDate.getMinutes() + 1); // 1분 전진

              const currHour = checkDate.getHours();
              const currDay = checkDate.getDay();
              
              // 시간(Hour)이 바뀐 시점에 리셋 포인트가 포함되어 있는지 확인
              if (prevHour !== currHour || prevDate !== checkDate.getDate()) {
                if (resetTimes.includes(currHour)) {
                  // 주간 숙제는 요일까지 체크
                  if (hw.resetPeriod === 'week') {
                    if (currDay === hw.resetDay) passCount++;
                  } else {
                    passCount++;
                  }
                }
              }
              if (passCount > 1000) break; // 무한루프 방지 (최대 100회)
            }

            if (passCount > 0) {
              const currentVal = newCounts[name] !== undefined ? newCounts[name] : hw.max;
              
              if (hw.resetType === 'reset') {
                // 리셋형: 포인트 한 번이라도 지났으면 max로 초기화
                newCounts[name] = hw.max;
              } else if (hw.resetType === 'recovery') {
                // 회복형: 지난 포인트 횟수만큼 recoveryAmount를 더함
                newCounts[name] = Math.min(hw.max, currentVal + (passCount * (hw.recoveryAmount || 0)));
              }
              
              newLastUpdated[name] = currentTime;
              hwChanged = true;
            }
          });

          return hwChanged ? { ...hw, counts: newCounts, lastUpdated: newLastUpdated } : hw;
        });
      });
    };

    const timer = setInterval(checkReset, 60000);
    checkReset();
    return () => clearInterval(timer);
  }, [accounts, characters]);

  const btnStyle = { backgroundColor: "#444", color: "#fff", border: "1px solid #666", padding: "4px 8px", cursor: "pointer" };

  const exportData = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    // 1. 모든 게임의 데이터를 수집 (기존 homeworks를 맵핑하며 lastUpdated 누락 방지)
    const exportObj = {
      homeworks: homeworks.map(hw => ({
        ...hw, // 기존의 모든 속성(id, name, resetTime 등) 유지
        counts: hw.counts || {},
        lastUpdated: hw.lastUpdated || {}, // ★ 이 데이터가 JSON에 포함되도록 확정
        excluded: hw.excluded || {}
      })),
      version: "2.0"
    };

    // 2. 각 게임별 캐릭터와 계정 정보를 객체에 담음 (기존 로직 100% 동일)
    games.forEach(g => {
      const savedChar = localStorage.getItem(`characters-${g}`);
      const savedAcc = localStorage.getItem(`accounts-${g}`);
      exportObj[`characters-${g}`] = savedChar ? JSON.parse(savedChar) : [];
      exportObj[`accounts-${g}`] = savedAcc ? JSON.parse(savedAcc) : [];
    });

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
        const imported = JSON.parse(event.target.result);
        if (window.confirm("데이터를 복구하시겠습니까? 현재 브라우저의 데이터가 덮어씌워집니다.")) {
          
          // 1. 전체 숙제 데이터 복구 (기능 유실 없음)
          // 불러온 데이터에 lastUpdated가 있으면 그대로 들어가고, 없으면 빈 객체로 초기화해서 에러 방지
          const mergedHws = imported.homeworks.map(hw => ({
            ...hw,
            counts: hw.counts || {},
            lastUpdated: hw.lastUpdated || {}, // ★ 저장된 시간을 불러오고, 없으면 빈 객체 부여
            excluded: hw.excluded || {}
          }));
          setHomeworks(mergedHws);
          
          // 2. 게임별 캐릭터/계정 데이터를 localStorage에 직접 강제 주입 (기존 로직 유지)
          games.forEach(g => {
            if (imported[`characters-${g}`]) {
              localStorage.setItem(`characters-${g}`, JSON.stringify(imported[`characters-${g}`]));
            }
            if (imported[`accounts-${g}`]) {
              localStorage.setItem(`accounts-${g}`, JSON.stringify(imported[`accounts-${g}`]));
            }
          });

          // 3. 현재 보고 있는 게임의 데이터만 상태에 반영 (기존 로직 유지)
          const currentChars = imported[`characters-${game}`] || imported.characters || [];
          const currentAccs = imported[`accounts-${game}`] || imported.accounts || [];
          
          setCharacters(currentChars.length > 0 ? currentChars : ["캐릭터1"]);
          setAccounts(currentAccs);

          alert("복구가 완료되었습니다.");
          window.location.reload(); 
        }
      } catch (err) {
        alert("파일 읽기 오류: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const addTargetAuto = (scope, dataList, setData) => {
    const base = scope === "character" ? "캐릭터" : "계정";
    let i = 1; while (dataList.includes(`${base}${i}`)) i++;
    setData(prev => [...prev, `${base}${i}`]);
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
    newList[idx] = newName;
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

  // const updateCount = (id, targetName, delta) => {
  //   setHomeworks(prev => prev.map(hw => {
  //     if (hw.id === id) {
  //       const current = (hw.counts && hw.counts[targetName] !== undefined) ? hw.counts[targetName] : hw.max;
  //       let next = typeof delta === 'number' ? current + delta : parseInt(delta) || 0;
  //       next = Math.max(0, Math.min(hw.max, next));

  //       return { 
  //         ...hw, 
  //         counts: { ...(hw.counts || {}), [targetName]: next },
  //         // ★ 수동 수정 시 현재 시간을 밀리초 단위로 정확히 기록
  //         lastUpdated: { ...(hw.lastUpdated || {}), [targetName]: new Date().getTime() } 
  //       };
  //     }
  //     return hw;
  //   }));
  // };

  const updateCount = (id, targetName, delta, e = null) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        const current = (hw.counts && hw.counts[targetName] !== undefined) 
          ? hw.counts[targetName] 
          : hw.max;

        let multiplier = 1;
        
        // e가 존재하고 이벤트 객체일 때만 체크
        if (e && typeof e === 'object') {
          if (e.shiftKey) multiplier = 10;
          else if (e.ctrlKey) multiplier = 100;
        }

        const calculatedDelta = typeof delta === 'number' ? delta * multiplier : parseInt(delta) || 0;
        let next = current + calculatedDelta;
        
        // 0 ~ max 범위 제한
        next = Math.max(0, Math.min(hw.max, next));

        return { 
          ...hw, 
          counts: { ...(hw.counts || {}), [targetName]: next },
          lastUpdated: { ...(hw.lastUpdated || {}), [targetName]: new Date().getTime() }
        };
      }
      return hw;
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

  const dayMap = ["일", "월", "화", "수", "목", "금", "토"];

  const renderTable = (title, scope, dataList, setData) => {
    const filteredHws = homeworks.filter(hw => hw.game === game && hw.scope === scope && (viewMode === "once" ? hw.resetPeriod === "once" : hw.resetPeriod !== "once"));

    // 1. 반복 모드 분류
    const dailyHws = filteredHws.filter(hw => hw.resetPeriod === "day" && hw.id !== "aion2-odd-energy");
    const etcHws = filteredHws.filter(hw => hw.id === "aion2-odd-energy");
    const weeklyHws = filteredHws.filter(hw => hw.resetPeriod === "week");

    // 2. 업적(once) 모드 분류 (이게 누락되어서 에러가 났던 것)
    const onceBasic = filteredHws.filter(hw => hw.category === "기본");
    const onceStory = filteredHws.filter(hw => hw.category === "스토리");
    const onceBoss = filteredHws.filter(hw => hw.category === "필드보스");
    const onceWing = filteredHws.filter(hw => hw.category === "날개");
    const onceArt = filteredHws.filter(hw => hw.category === "명화");
    const onceEtc = filteredHws.filter(hw => !["기본", "스토리", "필드보스", "날개", "명화"].includes(hw.category));

    // 3. 전체 리스트 (정렬 순서 고정)
    const allFiltered = viewMode === "once" 
      ? [...onceBasic, ...onceStory, ...onceBoss, ...onceWing, ...onceArt, ...onceEtc] 
      : [...dailyHws, ...etcHws, ...weeklyHws];

    // 4. 날짜 양식 (연도 제외 오더 반영)
    const formatDate = (ts) => {
      if (!ts) return "기록 없음";
      const d = new Date(ts);
      const month = d.getMonth() + 1; // 0 붙이지 않음
      const date = d.getDate();       // 0 붙이지 않음
      const hours = String(d.getHours()).padStart(2, '0');   // 항상 두 자리
      const minutes = String(d.getMinutes()).padStart(2, '0'); // 항상 두 자리
      
      return `${month}/${date} ${hours}:${minutes}`;
    };

    return (
      <div style={{ 
        overflowX: "auto", 
        width: "100%", 
        maxWidth: "100vw", // 화면 너비를 넘지 못하게 강제
        position: "relative", // sticky 기준점 명시
        marginTop: "30px" 
      }}>
        <h3 style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
          {title}
          {game === "AION 2" && scope === "character" && (
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "normal" }}>
              ※ 캐릭명[서버명2글자] 형식으로 입력하면 전투력 조회 가능 ex) 카니쵸니[바카] (바카르마 서버는 캐릭명만 써도됨)
            </span>
          )}
        </h3>
        <table border="1" style={{ borderCollapse: "separate", borderSpacing: 0, borderColor: "#444", whiteSpace: "nowrap", minWidth: "fit-content" }}>
          <thead>
            <tr style={{ backgroundColor: "#333" }}>
              {/* <th style={{ width: "140px", padding: "8px" }}>구분</th> 260206 1613 */}
              <th style={{ 
                width: "140px", padding: "8px", 
                position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                borderRight: "2px solid #444" 
              }}>구분</th>
              {viewMode === "once" ? (
                <>
                  {onceBasic.length > 0 && <th colSpan={onceBasic.length} style={{ padding: "8px" }}>기본</th>}
                  {onceStory.length > 0 && <th colSpan={onceStory.length} style={{ padding: "8px" }}>스토리</th>}
                  {onceBoss.length > 0 && <th colSpan={onceBoss.length} style={{ padding: "8px" }}>필드보스</th>}
                  {onceWing.length > 0 && <th colSpan={onceWing.length} style={{ padding: "8px" }}>날개</th>}
                  {onceArt.length > 0 && <th colSpan={onceArt.length} style={{ padding: "8px" }}>명화</th>}
                  {onceEtc.length > 0 && <th colSpan={onceEtc.length} style={{ padding: "8px" }}>기타</th>}
                </>
              ) : (
                <>
                  {/* 요청한 텍스트로 고정 */}
                  {dailyHws.length > 0 && <th colSpan={dailyHws.length} style={{ padding: "8px" }}>Daily</th>}
                  {etcHws.length > 0 && <th colSpan={etcHws.length} style={{ padding: "8px" }}>etc</th>}
                  {weeklyHws.length > 0 && <th colSpan={weeklyHws.length} style={{ padding: "8px" }}>Weekly</th>}
                </>
              )}
            </tr>
            {/* 이후 2행(항목)과 tbody는 네가 올린 코드 그대로 유지하면 됨 */}

            {/* 2행: 숙제 항목명 (1행과 동일한 배경색 적용) */}
            <tr style={{ backgroundColor: "#333" }}>
              {/* <th style={{ padding: "10px" }}>항목</th> 260206 1613 */}
              <th style={{ 
                padding: "10px", 
                position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                borderRight: "2px solid #444" 
              }}>항목</th>
              {allFiltered.map(hw => (
                <th key={hw.id} style={{ padding: "10px" }}>
                  <div style={{ fontWeight: "bold", marginBottom: viewMode === "once" ? "0" : "4px" }}>{hw.name}</div>
                  {viewMode !== "once" && (
                    <div style={{ fontSize: "10px", color: "#bbb" }}>
                      {hw.id === "aion2-odd-energy" ? "05시 기준 3시간마다 +15" :
                      (hw.resetType === 'recovery' ? `매일 05시 +${hw.recoveryAmount}` :
                      `${hw.resetPeriod === 'week' ? dayMap[hw.resetDay] : '매일'} ${String(Array.isArray(hw.resetTime)?hw.resetTime[0]:hw.resetTime).padStart(2,'0')}시`)}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataList.map((targetName, idx) => (
              <tr key={idx}>
                <td style={{ 
                  textAlign: "center", padding: "10px", fontWeight: "bold", 
                  position: "sticky", left: 0, zIndex: 10, backgroundColor: "#1e1e1e",
                  borderRight: "2px solid #444" 
                }}>
                  {/* 1. 위/아래 화살표 (캐릭명 위) */}
                  <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginBottom: "5px" }}>
                    <button onClick={() => moveTarget(idx, "up", dataList, setData)} style={{...btnStyle, padding: "2px 8px"}}>▲</button>
                    <button onClick={() => moveTarget(idx, "down", dataList, setData)} style={{...btnStyle, padding: "2px 8px"}}>▼</button>
                  </div>

                  {/* 2. 캐릭터명 */}
                  {/* <div style={{ fontSize: "16px", marginBottom: "8px", marginTop: "5px" }}>{targetName}</div> */}
                  {/* 2. 캐릭터명 및 아툴 점수(아이온2 전용) */}
                  <div style={{ fontSize: "16px", marginBottom: "8px", marginTop: "5px" }}>
                    {targetName}
                  </div>

                  {/* {game === "AION 2" && scope === "character" && (
                    <div style={{ marginBottom: "10px" }}>
                      {scores[targetName] ? (
                        <>
                          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                            <span style={{ color: "#ffffff" }}>
                              P: {scores[targetName].combatPower.toLocaleString()}
                            </span>
                            <span style={{ color: "#4daafc", marginLeft: "6px" }}>
                              AT: {scores[targetName].combatScore.toLocaleString()}
                            </span>
                          </div>

                          {scores[targetName].updatedAt && (
                            <div style={{ fontSize: "10px", color: "#777", marginBottom: "4px" }}>
                              갱신: {formatScoreUpdatedAt(scores[targetName].updatedAt)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>점수 미갱신</div>
                      )}

                      <button 
                        onClick={() => fetchScore(targetName)} 
                        style={{ ...btnStyle, padding: "2px 5px", fontSize: "10px", backgroundColor: "#335a80" }}
                      >
                        전투력 갱신
                      </button>
                    </div>
                  )} */}

                  {game === "AION 2" && scope === "character" && (
                    <div style={{ marginBottom: "10px" }}>
                      {scores[targetName] ? (
                        <>
                          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                            <span style={{ color: "#ffffff" }}>
                              {/* 💡 팩트: 값이 없을 수도 있으므로 ?.toLocaleString() 사용 */}
                              {/* P: {scores[targetName].combatPower?.toLocaleString() || "0"} */}
                              전투력: {scores[targetName].combatPower?.toLocaleString() ?? "?"}
                            </span>
                            <span style={{ color: "#4daafc", marginLeft: "6px" }}>
                              {/* 💡 팩트: 아이온 데이터가 아닌 경우 combatScore가 없으므로 방어 코드 추가 */}
                              {/* AT: {scores[targetName].combatScore?.toLocaleString() || "0"} */}
                              아툴: {scores[targetName].combatScore?.toLocaleString() ?? "?"}
                            </span>
                          </div>

                          {scores[targetName].updatedAt && (
                            <div style={{ fontSize: "10px", color: "#777", marginBottom: "4px" }}>
                              갱신: {formatScoreUpdatedAt(scores[targetName].updatedAt)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>점수 미갱신</div>
                      )}

                      <button 
                        onClick={() => fetchScore(targetName)} 
                        style={{ ...btnStyle, padding: "2px 5px", fontSize: "10px", backgroundColor: "#335a80" }}
                      >
                        전투력 갱신
                      </button>
                    </div>
                  )}

                  {game === "Lost Ark" && scope === "character" && (
                    <div style={{ marginBottom: "10px" }}>
                      {scores[targetName] ? (
                        <>
                          <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                            <span style={{ color: "#ffffff" }}>
                              템렙: {scores[targetName].itemLevel}
                            </span>
                            <span style={{ color: "#4daafc", marginLeft: "6px" }}>
                              전투력: {scores[targetName].combatPower?.toLocaleString()}
                            </span>
                          </div>

                          {scores[targetName].updatedAt && (
                            <div style={{ fontSize: "10px", color: "#777", marginBottom: "4px" }}>
                              갱신: {formatScoreUpdatedAt(scores[targetName].updatedAt)}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                          전투력 미갱신
                        </div>
                      )}

                      <button
                        onClick={() => fetchLoaScore(targetName)}
                        style={{ ...btnStyle, padding: "2px 5px", fontSize: "10px", backgroundColor: "#335a80" }}
                      >
                        전투력 갱신
                      </button>
                    </div>
                  )}

                  {/* 3. 수정/삭제 버튼 (캐릭명 아래) */}
                  <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                    <button onClick={() => renameTarget(targetName, idx, dataList, setData)} style={{...btnStyle, padding: "2px 5px", fontSize: "12px"}}>이름변경</button>
                    <button onClick={() => {
                      if(window.confirm(`[${targetName}] 항목을 삭제하시겠습니까?`)) {
                        setData(prev => prev.filter((_, i) => i !== idx));
                      }
                    }} style={{...btnStyle, padding: "2px 5px", fontSize: "12px", backgroundColor: "#600"}}>삭제</button>
                  </div>
                </td>
                
                {allFiltered.map(hw => {
                  const val = (hw.counts && hw.counts[targetName] !== undefined) ? hw.counts[targetName] : hw.max;
                  const isExcluded = !!(hw.excluded && hw.excluded[targetName]);
                  const isPending = val > 0 && !isExcluded;

                  return (
                    <td key={`${idx}-${hw.id}`} style={{ 
                      textAlign: "center", padding: "10px", 
                      backgroundColor: isPending ? "#4b4b20" : "transparent",
                      position: "relative"
                    }}>
                      <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                        <input type="checkbox" checked={isExcluded} onChange={() => toggleExclude(hw.id, targetName)} />
                      </div>
                      {!isExcluded ? (
                        <>
                          <div style={{ marginBottom: "5px" }}>
                            <button style={btnStyle} onClick={() => updateCount(hw.id, targetName, -1)}>-</button>
                            <input type="number" value={val} onChange={(e) => updateCount(hw.id, targetName, e.target.value)}
                              style={{ width: "45px", textAlign: "center", margin: "0 5px", backgroundColor: "#222", color: "#fff", border: "1px solid #444" }} />
                            <span style={{ color: isPending ? "#ccc" : "#888" }}>/ {hw.max}</span>
                            <button style={btnStyle} onClick={() => updateCount(hw.id, targetName, 1)}>+</button>
                          </div>
                          {/* ★ 연한 회색으로 마지막 수정 시간 표시 */}
                          <div style={{ fontSize: "10px", color: "#777", marginTop: "4px" }}>
                            {formatDate(hw.lastUpdated?.[targetName])}
                          </div>
                        </>
                      ) : <div style={{ color: "#555", fontSize: "12px" }}>제외됨</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", color: "#fff", backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
      
      {/* 헤더 섹션: 상단 고정 및 배경색 유지 */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: "#1e1e1e", 
        paddingBottom: "15px",
        marginBottom: "20px",
        borderBottom: "1px solid #333"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "30px" }}>
          
          {/* 1. 좌측 로고 영역 (56px) */}
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ margin: 0, fontSize: "56px", lineHeight: "0.9", fontWeight: "bold" }}>GHW</h1>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", whiteSpace: "nowrap" }}>
              최종 업데이트: 2026-02-08 00:06
            </div>
          </div>

          {/* 2. 우측 버튼 영역 (2행) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1행: 게임 버튼 */}
            <div style={{ display: "flex", gap: "5px" }}>
              {games.map(g => (
                <button 
                  key={g} 
                  onClick={() => setGame(g)} 
                  style={{ 
                    ...btnStyle, 
                    padding: "8px 12px", 
                    backgroundColor: game === g ? "#666" : "#444",
                    // 추가: 선택된 게임은 1(100%), 아니면 0.5(50%) 투명도 적용
                    opacity: game === g ? 1 : 0.5,
                    transition: "opacity 0.2s" // 부드럽게 변하게 하고 싶다면 추가
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
            
            {/* 2행: 설정 및 기능 버튼 (색상 복구) */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => setViewMode(viewMode === "repeat" ? "once" : "repeat")} 
                //style={{ ...btnStyle, backgroundColor: "#333", fontWeight: "bold", border: "1px solid #777" }}>
                style={{ ...btnStyle, backgroundColor: "#333", border: "1px solid #777" }}>
                모드: {viewMode === "repeat" ? "반복퀘" : "업적"}
              </button>
              <button onClick={exportData} style={{ ...btnStyle, backgroundColor: "#004080" }}>Save</button>
              <label style={{ ...btnStyle, backgroundColor: "#1a5e20", cursor: "pointer", textAlign: "center", display: "inline-block" }}>
                Load<input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
              </label>
              <button onClick={updateSettings} style={{ ...btnStyle, backgroundColor: "#6a1b9a" }}>설정 업데이트</button>
              <button onClick={resetProgress} style={{ ...btnStyle, backgroundColor: "#5d4037" }}>진행도 초기화</button>
              <button onClick={resetGameData} style={{ ...btnStyle, backgroundColor: "#b71c1c" }}>공장 초기화</button>
              
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 및 추가 버튼 (원본 로직 유지) */}
      {renderTable("계정별", "account", accounts, setAccounts)}
      <button onClick={() => addTargetAuto("account", accounts, setAccounts)} 
        style={{ ...btnStyle, marginTop: "10px", marginBottom: "30px", padding: "10px" }}>
        + 계정 추가
      </button>

      {renderTable("캐릭터별", "character", characters, setCharacters)}
      <button onClick={() => addTargetAuto("character", characters, setCharacters)} 
        style={{ ...btnStyle, marginTop: "10px", padding: "10px" }}>
        + 캐릭터 추가
      </button>
    </div>
  );  
}

export default App;