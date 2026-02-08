import { useEffect, useState } from "react";

// 브라우저에서 숙제 카운트 인풋창 click/mouseover 시 우측에 위아래 화살표 생기는 것 방지
const style = document.createElement('style');
style.textContent = `
  /* 1. 화살표 제거 (강제) */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
  input[type=number] {
    -moz-appearance: textfield !important;
  }

  /* 2. 클릭(포커스) 시 배경 흰색, 글자 검은색 반전 */
  .count-input:focus {
    background-color: #ffffff !important;
    color: #000000 !important;
    outline: 2px solid #62dafb !important;
  }

  /* 3. 드래그(선택) 영역 가독성 보정 */
  .count-input::selection {
    background-color: #0078d7 !important;
    color: #ffffff !important;
  }
`;
document.head.appendChild(style);

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
  { id: "aion2-login", game: "AION 2", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 0, scope: "character", lastResetDate: "", lastUpdated: {} },
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
  const [game, setGame] = useState(() => {
    return localStorage.getItem("lastSelectedGame") || "World of Warcraft";
  });
  const [viewMode, setViewMode] = useState("repeat");
  // const [charInfo, setCharInfo] = useState(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hiddenHomeworks, setHiddenHomeworks] = useState([]);
  
  const [homeworks, setHomeworks] = useState(() => {
    const saved = localStorage.getItem(`all-homeworks`);
    return saved ? JSON.parse(saved) : initialHomeworks;
  });

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

  const toggleCollapse = (charName) => {
    setCollapsedChars(prev => {
      const newState = { ...prev, [charName]: !prev[charName] };
      localStorage.setItem("collapsedChars", JSON.stringify(newState));
      return newState;
    });
  };

  const fetchScore = async (fullName) => {
    try {
      // "카니쵸니[바카]" 같은 형식 지원
      const match = fullName.match(/^(.+?)\[(.+?)\]$/);
      let charName = fullName;
      let server_id = 1016; // 기본값(바카르마)

      if (match) {
        charName = match[1].trim();
        const serverAbbr = match[2].trim();
        const serverMap = { "아리": 1006, "바카": 1016, "코치": 1018 };
        server_id = serverMap[serverAbbr] || 1016;
      }

      // ✅ 기존과 동일: 우리 서버 함수로 호출
      const r = await fetch("/api/aion2-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: charName, server_id }),
      });

      const j = await r.json();

      setScores((prev) => ({
        ...prev,
        [fullName]: {
          // ✅ 기존 유지
          combatPower: j.combat_power ?? 0,
          combatScore: j.combat_score ?? 0,
          updatedAt: Date.now(),

          // ✅ 추가(요구한 3개만)
          avatarUrl: j?.raw?.avatar_url ?? null,       // 초상화
          job: j?.raw?.job ?? null,                    // 직업정보
          jobIconUrl: j?.raw?.job_image_url ?? null,   // 직업사진(아이콘)
        },
      }));
    } catch (e) {
      console.error("전투력 갱신 실패:", e);
    }
  };

  const fetchLoaScore = async (charName) => {
    try {
      const targetUrl = `/api/loa-profile?name=${encodeURIComponent(charName)}`;

      const response = await fetch(targetUrl, { method: "GET" }); // ✅ 헤더 제거

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data) {
        setScores(prev => ({
          ...prev,
          [charName]: {
            itemLevel: data.ItemMaxLevel,
            combatPower: data.CombatPower || 0,
            job: data.CharacterClassName || null, // ✅ null 방어
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

  const updateHomeworkMemo = (id, newMemo) => {
    setHomeworks(prev => prev.map(hw => 
      hw.id === id ? { ...hw, memo: newMemo } : hw
    ));
  };

  useEffect(() => {
    setIsLoaded(false); // 1. 불러오기 시작했으니 저장 기능을 잠금

    const savedChar = localStorage.getItem(`characters-${game}`);
    const savedAcc = localStorage.getItem(`accounts-${game}`);
    const savedScores = localStorage.getItem(`scores-${game}`);
    const savedHidden = localStorage.getItem(`hidden-homeworks-${game}`);

    setCharacters(savedChar ? JSON.parse(savedChar) : []);
    setAccounts(savedAcc ? JSON.parse(savedAcc) : []);
    setScores(savedScores ? JSON.parse(savedScores) : {});
    setHiddenHomeworks(savedHidden ? JSON.parse(savedHidden) : []);

    // 2. 데이터 세팅이 브라우저에 반영될 시간을 주고 잠금을 해제 (0.1초)
    setTimeout(() => setIsLoaded(true), 100); 
  }, [game]);

  useEffect(() => {
    // 1. 아직 불러오기(Load)가 완료되지 않았으면 저장하지 말고 그냥 리턴해라.
    if (!isLoaded) return; 

    // 2. 이제 로드가 완료된 상태이므로 안전하게 저장한다.
    localStorage.setItem(`all-homeworks`, JSON.stringify(homeworks));
    localStorage.setItem(`characters-${game}`, JSON.stringify(characters));
    localStorage.setItem(`accounts-${game}`, JSON.stringify(accounts));
    localStorage.setItem(`scores-${game}`, JSON.stringify(scores));
    localStorage.setItem(`hidden-homeworks-${game}`, JSON.stringify(hiddenHomeworks));
    
    // 3. 의존성 배열에 isLoaded를 추가해서 상태 변화를 감시하게 한다.
  }, [homeworks, characters, accounts, game, scores, isLoaded, hiddenHomeworks]);

  const toggleHomework = (name) => {
    setHiddenHomeworks(prev =>
      prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]
    );
  };

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
  }, [accounts, characters, game]);

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
        excluded: hw.excluded || {}
      })),
      collapsedChars: collapsedChars || {},
      version: "2.0",
      // ★ 추가: 모든 게임의 숨김 목록을 담을 객체 생성
      hiddenHomeworksByGame: {} 
    };

    // 2. 각 게임별 캐릭터, 계정, "숨김 목록" 정보를 담음
    games.forEach(g => {
      const savedChar = localStorage.getItem(`characters-${g}`);
      const savedAcc = localStorage.getItem(`accounts-${g}`);
      const savedHidden = localStorage.getItem(`hidden-homeworks-${g}`); // ★ 추가

      exportObj[`characters-${g}`] = savedChar ? JSON.parse(savedChar) : [];
      exportObj[`accounts-${g}`] = savedAcc ? JSON.parse(savedAcc) : [];
      exportObj.hiddenHomeworksByGame[g] = savedHidden ? JSON.parse(savedHidden) : []; // ★ 추가
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
        games.forEach(g => {
          const charKey = `characters-${g}`;
          const accKey = `accounts-${g}`;

          if (data[charKey]) localStorage.setItem(charKey, JSON.stringify(data[charKey]));
          if (data[accKey]) localStorage.setItem(accKey, JSON.stringify(data[accKey]));

          if (g === game) {
            if (data[charKey]) setCharacters(data[charKey]);
            if (data[accKey]) setAccounts(data[accKey]);
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

        alert("데이터를 성공적으로 불러왔습니다.");
        
      } catch (err) {
        alert("파일 읽기 실패: " + err.message);
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

  const updateCount = (id, targetName, delta, e = null) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        const current = (hw.counts && hw.counts[targetName] !== undefined) 
          ? hw.counts[targetName] 
          : hw.max;

        let next;

        // ★ delta가 정확히 0으로 들어오면 0으로 초기화, 아니면 기존 증감 로직 수행
        if (delta === 0) {
          next = 0;
        } else {
          let multiplier = 1;
          if (e && typeof e === 'object') {
            if (e.shiftKey) multiplier = 10;
            else if (e.ctrlKey) multiplier = 100;
          }
          const calculatedDelta = typeof delta === 'number' ? delta * multiplier : (parseInt(delta) - current) || 0;
          next = current + calculatedDelta;
        }
        
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
        <h3 style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {title}

          {/* ★ 위치 이동 및 범위(scope) 필터링 추가 */}
          {hiddenHomeworks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
              {hiddenHomeworks.map(name => {
                // 현재 게임과 현재 표의 범위(계정/캐릭)에 맞는 숙제 정보 찾기
                const hw = homeworks.find(h => h.name === name && h.game === game);
                
                // 중요: 숙제의 scope가 현재 표의 scope와 다르면 버튼을 렌더링하지 않음
                if (!hw || hw.scope !== scope) return null;

                return (
                  <button 
                    key={name}
                    onClick={() => toggleHomework(name)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '11px',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {name} ➕
                  </button>
                );
              })}
            </div>
          )}
        </h3>

        {/* 기존의 아래쪽 <div style={{ textAlign: 'left'... }}> 영역은 통째로 삭제해줘 */}

        <table border="1" style={{ borderCollapse: "separate", borderSpacing: 0, borderColor: "#444", whiteSpace: "nowrap", minWidth: "fit-content" }}>
          <thead>
            <tr style={{ backgroundColor: "#333" }}>
              <th style={{ 
                width: "140px", padding: "8px", 
                position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                borderRight: "2px solid #444" 
              }}>구분</th>
              
              {viewMode === "once" ? (
                <>
                  {/* .length 대신 filter를 써서 숨겨진 숙제를 뺀 개수만큼 colSpan을 잡는다 */}
                  {onceBasic.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceBasic.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>기본</th>}
                  
                  {onceStory.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceStory.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>스토리</th>}
                  
                  {onceBoss.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceBoss.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>필드보스</th>}
                  
                  {onceWing.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceWing.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>날개</th>}
                  
                  {onceArt.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceArt.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>명화</th>}
                  
                  {onceEtc.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={onceEtc.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>기타</th>}
                </>
              ) : (
                <>
                  {/* Daily, etc, Weekly도 동일한 원리 */}
                  {dailyHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={dailyHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>Daily</th>}
                  
                  {etcHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={etcHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>etc</th>}
                  
                  {weeklyHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                    <th colSpan={weeklyHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>Weekly</th>}
                </>
              )}
            </tr>

            {/* 2행: 숙제 항목명 */}
            <tr style={{ backgroundColor: "#333" }}>
              <th style={{ 
                padding: "10px", 
                position: "sticky", left: 0, zIndex: 20, backgroundColor: "#333",
                borderRight: "2px solid #444" 
              }}>항목</th>
              
              {allFiltered.map(hw => {
                if (hiddenHomeworks.includes(hw.name)) return null;

                return (
                  <th key={hw.id} style={{ 
                    padding: "10px", 
                    verticalAlign: "middle", 
                    position: "relative",
                    minWidth: "120px"
                  }}>
                    {/* 1. 숙제명 */}
                    <div style={{ fontWeight: "bold" }}>{hw.name}</div>
                    
                    {/* 2. 메모 영역 (주기보다 윗줄) */}
                    <div style={{ marginTop: "4px" }}>
                      {hw.memo ? (
                        // 메모가 있을 때: 클릭하면 수정 가능
                        <div 
                          onClick={() => {
                            const newMemo = prompt("메모 수정 (내용을 다 지우면 버튼으로 돌아갑니다):", hw.memo);
                            if (newMemo !== null) updateHomeworkMemo(hw.id, newMemo);
                          }}
                          style={{ 
                            fontSize: "11px", color: "#62dafb", cursor: "pointer",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            maxWidth: "110px", margin: "0 auto", borderBottom: "1px dashed #62dafb"
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

                    {/* 3. 복구된 초기화 주기 로직 (메모 아래로 이동) */}
                    {viewMode !== "once" && (
                      <div style={{ fontSize: "10px", color: "#bbb", marginTop: "6px" }}>
                        {hw.id === "aion2-odd-energy" ? "05시 기준 3시간마다 +15" :
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
            {dataList.map((targetName, idx) => {
              const isCollapsed = collapsedChars[targetName]; // 접힘 상태 확인
              
              return (
                <tr key={idx}>
                  <td style={{ 
                    textAlign: "center", padding: "10px", fontWeight: "bold", 
                    position: "sticky", left: 0, zIndex: 10, backgroundColor: "#1e1e1e",
                    borderRight: "2px solid #444", verticalAlign: "top",
                    overflow: "hidden" // ✅ 추가(배경이 셀 밖으로 안 튀게)
                  }}>
                    {/* ✅ 배경/오버레이/콘텐츠 기준 잡는 래퍼 */}
                    <div style={{ position: "relative" }}>

                      {/* ✅ 1) 배경 아바타 (AION2만) */}
                      {game === "AION 2" && !isCollapsed && scores[targetName]?.avatarUrl && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url("${scores[targetName].avatarUrl}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center top",
                            opacity: 1,           // ✅ 0.18 → 1
                            filter: "none",          // ✅ blur 제거(가독성은 오버레이로 해결)
                            transform: "scale(1.05)",
                            pointerEvents: "none",
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* ✅ 2) 글자 가독성용 오버레이 */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)", // ✅ 덜 진하게
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />

                      {/* ✅ 3) 기존 내용은 위로 */}
                      <div style={{ position: "relative", zIndex: 2 }}>

                        {/* 접기/펴기 버튼 (기존 그대로) */}
                        <button 
                          onClick={() => toggleCollapse(targetName)}
                          style={{
                            position: "absolute", top: "2px", right: "2px",
                            fontSize: "10px", padding: "1px 4px", cursor: "pointer",
                            backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "3px"
                          }}
                        >
                          {isCollapsed ? "➕" : "➖"}
                        </button>

                        {/* 위/아래 화살표 (기존 그대로) */}
                        <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginBottom: "5px" }}>
                          <button onClick={() => moveTarget(idx, "up", dataList, setData)} style={{...btnStyle, padding: "2px 8px"}}>▲</button>
                          <button onClick={() => moveTarget(idx, "down", dataList, setData)} style={{...btnStyle, padding: "2px 8px"}}>▼</button>
                        </div>

                        {/* 캐릭터명 + 직업명 텍스트 */}
                          <div style={{ marginBottom: isCollapsed ? "0" : "8px" }}>
                            <div
                              style={{
                                fontSize: "16px",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {targetName}
                            </div>

                            {/* 로스트아크 또는 아이온2: 캐릭명 아래 직업명 표시 */}
                            {(game === "Lost Ark" || game === "AION 2") && scores[targetName]?.job && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  // color: "#bbb",      // 직업명은 살짝 흐리게 해서 이름과 구분
                                  // marginTop: "2px",
                                  textAlign: "center",
                                }}
                              >
                                ({scores[targetName].job})
                              </div>
                            )}
                          </div>

                        {/* 💡 캐릭터 정보 영역 (기존 그대로) */}
                        {!isCollapsed && (
                          <>
                            {(game === "AION 2" || game === "Lost Ark") && scope === "character" && (
                              <div style={{ marginBottom: "2px" }}>
                                {scores[targetName] ? (
                                  <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                                    <span style={{ color: "#ffffff" }}>
                                      {game === "AION 2" ? `전투력: ${scores[targetName].combatPower?.toLocaleString() ?? "?"}` : `템렙: ${scores[targetName].itemLevel}`}
                                    </span>
                                    <span style={{ color: "#4daafc", marginLeft: "6px" }}>
                                      {game === "AION 2" ? `아툴: ${scores[targetName].combatScore?.toLocaleString() ?? "?"}` : `전투력: ${scores[targetName].combatPower?.toLocaleString()}`}
                                    </span>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>점수 미갱신</div>
                                )}
                                <button 
                                  onClick={() => game === "AION 2" ? fetchScore(targetName) : fetchLoaScore(targetName)} 
                                  style={{ ...btnStyle, padding: "2px 5px", fontSize: "10px", backgroundColor: "#335a80", marginTop: "4px" }}
                                >
                                  전투력 갱신
                                </button>
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "2px", justifyContent: "center", marginTop: "5px" }}>
                              <button onClick={() => renameTarget(targetName, idx, dataList, setData)} style={{...btnStyle, padding: "2px 5px", fontSize: "12px"}}>이름변경</button>
                              <button onClick={() => {
                                if(window.confirm(`[${targetName}] 캐릭 목록에서 지운다?`)) {
                                  setData(prev => prev.filter((_, i) => i !== idx));
                                }
                              }} style={{...btnStyle, padding: "2px 5px", fontSize: "12px", backgroundColor: "#600"}}>삭제</button>
                            </div>
                          </>
                        )}

                      </div>
                    </div>
                  </td>
                  
                  {/* 숙제 카운트 칸들 (항상 유지) */}
                  {allFiltered.map(hw => {
                    if (hiddenHomeworks.includes(hw.name)) return null;

                    const val = (hw.counts && hw.counts[targetName] !== undefined) ? hw.counts[targetName] : hw.max;
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
                        <div style={{ position: "absolute", top: "2px", right: "2px" }}>
                          <input type="checkbox" checked={isExcluded} onChange={() => toggleExclude(hw.id, targetName)} />
                        </div>

                        {!isExcluded ? (
                          <>
                            {/* 1. 숙제 갱신 일자: 상단으로 이동 */}
                            <div style={{ fontSize: "10px", color: "#777", marginBottom: isCollapsed ? "2px" : "6px", minHeight: "12px" }}>
                              {formatDate(hw.lastUpdated?.[targetName])}
                            </div>

                            {/* 2. Input 창 영역: 버튼을 떼어내고 세로 배치 유도 */}
                            <div style={{ marginBottom: isCollapsed ? "0" : "5px" }}>
                              <input 
                                type="number" 
                                value={val} 
                                onChange={(e) => updateCount(hw.id, targetName, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.target.blur();
                                  }
                                }}
                                // ★ className 추가
                                className="count-input"
                                style={{ 
                                  width: "45px", 
                                  textAlign: "center", 
                                  backgroundColor: "#222", 
                                  color: "#fff", 
                                  border: "1px solid #444",
                                  appearance: "textfield",
                                  WebkitAppearance: "none",
                                  MozAppearance: "textfield",
                                  // ★ 부드러운 전환을 위한 애니메이션만 추가
                                  transition: "background-color 0.2s, color 0.2s"
                                }} 
                              />
                              <span style={{ color: isPending ? "#ccc" : "#888", fontSize: "13px" }}> / {hw.max}</span>
                            </div>
                            
                            {/* 3. 하단 버튼군: -, 0, + 가로 배치 */}
                            {!isCollapsed && (
                              <div style={{ display: "flex", justifyContent: "center", gap: "3px" }}>
                                <button style={{ ...btnStyle, padding: "2px 6px" }} onClick={(e) => updateCount(hw.id, targetName, -1, e)}>-</button>
                                <button 
                                  style={{ ...btnStyle, padding: "2px 6px", backgroundColor: "#444" }} 
                                  onClick={(e) => updateCount(hw.id, targetName, 0, e)}
                                >
                                  0
                                </button>
                                <button style={{ ...btnStyle, padding: "2px 6px" }} onClick={(e) => updateCount(hw.id, targetName, 1, e)}>+</button>
                              </div>
                            )}
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
            <div style={{ fontSize: "11px", color: "#888", marginTop: "8px", whiteSpace: "nowrap" }}>
              최종 업데이트: 2026-02-08 15:18
            </div>
          </div>

          {/* 2. 우측 버튼 영역 (2행) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1행: 게임 버튼 */}
            <div style={{ display: "flex", gap: "5px" }}>
              {games.map(g => (
                <button 
                  key={g} 
                  onClick={() => {
                    setGame(g);
                    localStorage.setItem("lastSelectedGame", g);
                  }} 
                  style={{ 
                    ...btnStyle, 
                    padding: "8px 12px", 
                    backgroundColor: game === g ? "#666" : "#444",
                    opacity: game === g ? 1 : 0.5,
                    transition: "opacity 0.2s"
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
      {renderTable("계정별 숙제", "account", accounts, setAccounts)}
      <button onClick={() => addTargetAuto("account", accounts, setAccounts)} 
        style={{ ...btnStyle, marginTop: "10px", marginBottom: "30px", padding: "10px" }}>
        + 계정 추가
      </button>

      {/* 캐릭터별 숙제 테이블 */}
      {renderTable("캐릭터별 숙제", "character", characters, setCharacters)}
      
      {/* 버튼과 안내 문구를 가로 배치 */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px" }}>
        <button onClick={() => addTargetAuto("character", characters, setCharacters)} 
          style={{ ...btnStyle, padding: "10px" }}>
          + 캐릭터 추가
        </button>

        {/* 안내 문구를 이쪽으로 이동 */}
        {game === "AION 2" && (
          <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "normal" }}>
            ※ 캐릭명[서버명2글자] 형식으로 입력하면 전투력 조회 가능 ex) 카니쵸니[바카] (바카르마 서버는 캐릭명만 써도됨)
          </span>
        )}
      </div>
    </div>
  );  
}

export default App;