import { useEffect, useState } from "react";
import "./App.css";

import Aion2_SoulEngravingTable from "./components/Aion2_SoulEngravingTable";
import Aion2_SkillPriorityTable from "./components/Aion2_SkillPriorityTable";

import aion2Icon from "./assets/gameicons/aion2.png";
import lostarkIcon from "./assets/gameicons/lostark.png";
import wowIcon from "./assets/gameicons/wow.png";

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

  // 아이온2 - 반복 - Daily
  { id: "aion2-login", game: "aion2", name: "출석", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 0, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-daily-donation", game: "aion2", name: "보급의뢰", max: 1, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-quest", game: "aion2", name: "사명퀘", max: 5, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "day", resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-nightmare", game: "aion2", name: "악몽", max: 14, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 2, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-energy", game: "aion2", name: "오드에너지", max: 840, counts: {}, excluded: {}, resetType: "recovery", resetPeriod: "day", recoveryAmount: 15, resetTime: [2, 5, 8, 11, 14, 17, 20, 23], scope: "character", lastResetDate: "", lastResetHour: -1, lastUpdated: {} },
  // 아이온2 - 반복 - Weekly
  { id: "aion2-abyss-order", game: "aion2", name: "지령서", max: 12, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklydungeon", game: "aion2", name: "일일던전", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-awaken", game: "aion2", name: "각성전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-weeklyraid", game: "aion2", name: "토벌전", max: 3, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-named", game: "aion2", name: "루드라 1,2넴", max: 4, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-rudra-boss", game: "aion2", name: "루드라", max: 2, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-change", game: "aion2", name: "오드 변환", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  { id: "aion2-odd-buy", game: "aion2", name: "오드 구입", max: 7, counts: {}, excluded: {}, resetType: "reset", resetPeriod: "week", resetDay: 3, resetTime: 5, scope: "character", lastResetDate: "", lastUpdated: {} },
  // 아이온2 - 업적 - 기본
  { id: "aion2-basic-foundation-quests", game: "aion2", name: "지역퀘, 봉던, 주둔지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "기본", scope: "character", lastUpdated: {} },
  { id: "aion2-achievement-add-friends", game: "aion2", name: "친추업적", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "기본", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 필드보스
  { id: "aion2-sentry-knash", game: "aion2", name: "감시병기 크나쉬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-black-tentacle-lawa", game: "aion2", name: "검은 촉수 라와", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-berserker-kusan", game: "aion2", name: "광투사 쿠산", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Commander-Ragta", game: "aion2", name: "군단장 라그타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-ehdWHrdml-spdlzpf", game: "aion2", name: "동쪽의 네이켈", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-aksrogks-zhfls", game: "aion2", name: "만개한 코린", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Invincible-Solo-I", game: "aion2", name: "무적의 솔로 I", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-apostate-rayla", game: "aion2", name: "배교자 레일라", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-centurion-Demiros", game: "aion2", name: "백부장 데미로스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-raged-sarus", game: "aion2", name: "분노한 사루스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-tjWHrdml-zpfmshs", game: "aion2", name: "서쪽의 케르논", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-gather-manager-moshav", game: "aion2", name: "수확관리자 모샤브", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-forest-warrior", game: "aion2", name: "숲전사 우라무", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-holy-ansas", game: "aion2", name: "신성한 안사스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Tjrdms-znxkfm", game: "aion2", name: "썩은 쿠타르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Researcher-Setram", game: "aion2", name: "연구관 세트람", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Soul-Ruler-Kashapa", game: "aion2", name: "영혼 지배자 카샤파", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-priest-garsim", game: "aion2", name: "제사장 가르심", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-chaser-taulo", game: "aion2", name: "추격자 타울로", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-silent-tartan", game: "aion2", name: "침묵의 타르탄", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-blood-fang", game: "aion2", name: "피송곳니 프닌", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-scholar-raula", game: "aion2", name: "학자 라울라", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-guard-tigant", game: "aion2", name: "호위병 티간트", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-dream-kassia", game: "aion2", name: "환몽의 카시아", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Timeless-Isle-Timeless-Gartua", game: "aion2", name: "[영원의 섬] 영원의 가르투아", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Black-Warrior-Aed", game: "aion2", name: "[알트가르드] 검은 전사 아에드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Berserker-Balg", game: "aion2", name: "[알트가르드] 광전사 발그", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-deceiver-trid", game: "aion2", name: "[알트가르드] 기만자 트리드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Melted-Danar", game: "aion2", name: "[알트가르드] 녹아내린 다나르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Guruta", game: "aion2", name: "[알트가르드] 드라칸 부대병기 구루타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Axios", game: "aion2", name: "[알트가르드] 망혼의 아칸 악시오스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Noblude", game: "aion2", name: "[알트가르드] 모독자 노블루드", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Shuzakan", game: "aion2", name: "[알트가르드] 백전노장 슈자칸", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Linkes", game: "aion2", name: "[알트가르드] 별동대장 링크스", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Karuka", game: "aion2", name: "[알트가르드] 비전의 카루카", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Shirak", game: "aion2", name: "[알트가르드] 예리한 쉬라크", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Hadirun", game: "aion2", name: "[알트가르드] 중독된 하디룬", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Advisor-Lesana", game: "aion2", name: "[알트가르드] 참모관 르사나", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Barsien", game: "aion2", name: "[알트가르드] 처형자 바르시엔", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Supervisor-Nuta", game: "aion2", name: "[알트가르드] 총감독관 누타", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Faithful-Lagit", game: "aion2", name: "[알트가르드] 충실한 라지트", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Predator-Garsan", game: "aion2", name: "[알트가르드] 포식자 가르산", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Bluewave-Kelpina", game: "aion2", name: "[알트가르드] 푸른물결 켈피나", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Blood-Warrior-Lannar", game: "aion2", name: "[알트가르드] 혈전사 란나르", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  { id: "aion2-Altgarde-Bishveda", game: "aion2", name: "[알트가르드] 흑암의 비슈베다", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "필드보스", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 날개
  { id: "aion2-fire-temple", game: "aion2", name: "불의 신전", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  { id: "aion2-horn-cave", game: "aion2", name: "사나운 뿔 암굴", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  { id: "aion2-dramata-nest", game: "aion2", name: "죽은 드라마타의 둥지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "날개", scope: "character", lastUpdated: {} },
  // 아이온2 - 업적 - 명화
  { id: "aion2-duduka-worker", game: "aion2", name: "두두카 일꾼", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-shugo-alchemist", game: "aion2", name: "슈고 연금술사", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-kantas-valley", game: "aion2", name: "칸타스 계곡", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-verteron-ruin", game: "aion2", name: "베르테론 요새 폐허", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "elun-mid", game: "aion2", name: "엘룬강 중류", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-pilgrim-pass", game: "aion2", name: "순례자의 고갯길", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-elun-swamp", game: "aion2", name: "엘룬강 늪지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-dawn-base", game: "aion2", name: "새벽의 레기온 기지", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-teina-portrait", game: "aion2", name: "테이나 초상화", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
  { id: "aion2-shurak", game: "aion2", name: "슈라크", max: 1, counts: {}, excluded: {}, resetType: "once", resetPeriod: "once", category: "명화", scope: "character", lastUpdated: {} },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const KST_OFFSET_MS = 9 * HOUR_MS;

// 매일 resetHourKST 시각을 기준으로 하루 경계 index
const dailyBoundaryIndex = (ms, resetHourKST) => {
  const kstMs = ms + KST_OFFSET_MS;
  return Math.floor((kstMs - resetHourKST * HOUR_MS) / DAY_MS);
};

const nextWeeklyResetAfterKST = (lastMs, resetDay, resetHour) => {
  const lastKst = new Date(lastMs + KST_OFFSET_MS);

  // KST 기준 "오늘 resetHour:00"
  const candKst = new Date(lastKst);
  candKst.setHours(resetHour ?? 0, 0, 0, 0);

  // 오늘 요일(0=일~6=토) in KST
  const curDow = candKst.getDay();
  const targetDow = resetDay ?? 0;

  // 이번 주의 resetDay로 이동
  let diff = (targetDow - curDow + 7) % 7;
  candKst.setDate(candKst.getDate() + diff);

  // lastMs 이후여야 "다음 리셋"이므로, 같거나 이전이면 7일 뒤
  const candMs = candKst.getTime() - KST_OFFSET_MS;
  if (candMs <= lastMs) {
    candKst.setDate(candKst.getDate() + 7);
  }

  return candKst.getTime() - KST_OFFSET_MS;
};

const passedCycles = (lastMs, nowMs, hw) => {
  if (!lastMs) return 0;
  if (hw.id === "aion2-odd-energy") return 0;

  const resetHour = Array.isArray(hw.resetTime) ? hw.resetTime[0] : (hw.resetTime ?? 0);

  if (hw.resetPeriod === "day") {
    return dailyBoundaryIndex(nowMs, resetHour) - dailyBoundaryIndex(lastMs, resetHour);
  }

  if (hw.resetPeriod === "week") {
    const next = nextWeeklyResetAfterKST(lastMs, hw.resetDay ?? 0, resetHour);
    if (nowMs < next) return 0;
    return 1 + Math.floor((nowMs - next) / WEEK_MS);
  }

  return 0;
};

function App() {
  const LEGACY_GAME_KEY_MAP = {
    "World of Warcraft": "wow",
    "Lost Ark": "lostark",
    "AION 2": "aion2",
  };

  const normalizeGameId = (g) => LEGACY_GAME_KEY_MAP[g] ?? g;

  // ✅ game state 초기화 부분을 교체
  const [game, setGame] = useState(() => {
    const saved = localStorage.getItem("lastSelectedGame");
    const normalized = normalizeGameId(saved || "wow");
    // 혹시 saved가 옛 값이면, 여기서 바로 저장값도 정리
    if (saved && saved !== normalized) localStorage.setItem("lastSelectedGame", normalized);
    return normalized;
  });

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(`viewMode-${game}`) || "repeat");

  const [isLoaded, setIsLoaded] = useState(false);
  const [hiddenHomeworks, setHiddenHomeworks] = useState([]);
  
  const [homeworks, setHomeworks] = useState(() => {
    const perGame = localStorage.getItem(`homeworks-${game}`);
    if (perGame) return JSON.parse(perGame);

    // 예전에 쓰던 all-homeworks가 있으면 1회 가져오기
    const legacy = localStorage.getItem(`all-homeworks`);
    if (legacy) return JSON.parse(legacy);

    return initialHomeworks;
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
          updatedAt: Date.now(),
          portrait: j?.raw?.avatar_url ?? null,
          job: j?.raw?.job ?? null,
          level: j?.raw?.level ?? null,
        }
      }));
    } catch (e) {
      console.error("전투력 갱신 실패:", e);
      alert("전투력 갱신 실패: " + e.message); // ✅ 탱아저씨 케이스 원인 바로 뜸
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

  const updateHomeworkMemo = (id, newMemo) => {
    setHomeworks(prev => prev.map(hw => 
      hw.id === id ? { ...hw, memo: newMemo } : hw
    ));
  };

  // ✅ Aion2Tool: 스킬 우선순위 불러오기(테스트)
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

    // ✅ parse는 터질 수 있으니 안전하게
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

    // ✅ 숙제 화면에서만 저장 (영혼각인/아르카나에서는 덮어쓰기 방지)
    const isHomeworkView = viewMode === "repeat" || viewMode === "once";
    if (!isHomeworkView) return;

    localStorage.setItem(`homeworks-${game}`, JSON.stringify(homeworks));
    localStorage.setItem(`characters-${game}`, JSON.stringify(characters));
    localStorage.setItem(`accounts-${game}`, JSON.stringify(accounts));
    localStorage.setItem(`scores-${game}`, JSON.stringify(scores));
    localStorage.setItem(`hidden-homeworks-${game}`, JSON.stringify(hiddenHomeworks));
  }, [homeworks, characters, accounts, game, scores, isLoaded, hiddenHomeworks, viewMode]);

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

          targets.forEach(t => {
            const targetName = (typeof t === "object" && t !== null) ? t.name : t;

            const lastUpdate = newLastUpdated[targetName];
            if (!lastUpdate) {
              // 기록이 없으면 리셋 계산 기준이 없음 → 도장 찍지 말고 패스
              return;
            }

            const passCount = passedCycles(lastUpdate, currentTime, hw);

            if (passCount > 0) {
              const currentVal = newCounts[targetName] !== undefined ? newCounts[targetName] : hw.max;

              if (hw.resetType === "reset") {
                newCounts[targetName] = hw.max;
              } else if (hw.resetType === "recovery") {
                newCounts[targetName] = Math.min(
                  hw.max,
                  currentVal + (passCount * (hw.recoveryAmount || 0))
                );
              }

              newLastUpdated[targetName] = currentTime;
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
    GAME_IDS.forEach(g => {
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

  const togglePortrait = (idx, setData) => {
    setData(prev => {
      const newData = [...prev];
      const item = newData[idx];

      const isObj = typeof item === "object" && item !== null;
      const currentName = isObj ? item.name : item;

      // 지금 상태: true(기본) / false(숨김)
      const currentStatus = isObj ? (item.showPortrait !== false) : true;

      newData[idx] = {
        ...(isObj ? item : {}),          // ⭐ 혹시 나중에 다른 속성 붙여도 보존
        name: currentName,
        showPortrait: !currentStatus,
      };

      return newData;
    });
  };

  const updateCount = (id, targetName, delta, e = null) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id !== id) return hw;

      // ✅ STEP 1 핵심: 입력 중 빈칸 허용
      if (delta === "") {
        return {
          ...hw,
          counts: { ...(hw.counts || {}), [targetName]: "" }
        };
      }

      const current =
        hw.counts && hw.counts[targetName] !== undefined && hw.counts[targetName] !== ""
          ? hw.counts[targetName]
          : hw.max;

      let next;

      if (delta === 0) {
        next = 0;
      } else {
        let multiplier = 1;
        if (e && typeof e === "object") {
          if (e.shiftKey) multiplier = 10;
          else if (e.ctrlKey) multiplier = 100;
        }

        const num = Number(delta);
        if (Number.isNaN(num)) return hw;

        next = num;
      }

      next = Math.max(0, Math.min(hw.max, next));

      return {
        ...hw,
        counts: { ...(hw.counts || {}), [targetName]: next },
        lastUpdated: {
          ...(hw.lastUpdated || {}),
          [targetName]: new Date().getTime()
        }
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

  const isHomeworkView = viewMode === "repeat" || viewMode === "once";

  const dayMap = ["일", "월", "화", "수", "목", "금", "토"];

  const renderTable = (title, scope, dataList, setData, options = {}) => {
    const { headerRight = null, hideBody = false, hideHiddenButtons = false } = options;
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
                    {onceBoss.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={onceBoss.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>필드보스</th>}
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
                    {/* 반복퀘 헤더 */}
                    {dailyHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={dailyHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>Daily</th>}
                    {etcHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={etcHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>etc</th>}
                    {weeklyHws.filter(h => !hiddenHomeworks.includes(h.name)).length > 0 && 
                      <th colSpan={weeklyHws.filter(h => !hiddenHomeworks.includes(h.name)).length} style={{ padding: "8px" }}>Weekly</th>}
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
              {dataList.map((item, idx) => { // 1. 우선 item으로 받고
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
                      overflow: "hidden" // ✅ 추가(배경이 셀 밖으로 안 튀게)
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

                      {/* ✅ 배경/오버레이/콘텐츠 기준 잡는 래퍼 */}
                      <div style={{ position: "relative" }}>

                        {/* ✅ 1) 로스트아크 또는 아이온2 배경 표시 */}
                        {!isCollapsed && isShowPortrait &&
                          // (typeof dataList[idx] === 'object' ? dataList[idx].showPortrait : true) !== false && 
                          ["lostark", "aion2"].includes(game) &&
                          scores[targetName]?.portrait && (
                            <div
                              aria-hidden="true"
                              style={{ 
                                position: "absolute", 
                                inset: 0,
                                backgroundImage: `url("${scores[targetName].portrait}")`, // 이미 위에서 targetName을 처리함
                                backgroundSize: "cover", 
                                backgroundPosition: "center top", 
                                opacity: 1,
                                transform: "scale(1.0)", 
                                pointerEvents: "none", 
                                zIndex: 0,
                              }}
                            />
                        )}

                        {/* ✅ 2) 글자 가독성용 오버레이 */}
                        {/* <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)", // ✅ 덜 진하게
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        /> */}

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
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                    textShadow: "1px 1px 2px rgba(0,0,0,1)",
                                    backgroundColor:
                                      !isCollapsed && isShowPortrait
                                        ? "rgba(0, 0, 0, 0.2)"
                                        : "transparent",
                                    padding:
                                      !isCollapsed && isShowPortrait
                                        ? "1px 8px"
                                        : "0px",
                                    borderRadius: "4px",
                                  }}
                                >
                                  {targetName}
                                </span>
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
                                    {scoreData ? (
                                      <div style={{ marginTop: "-8px" }}>
                                        <span style={{ fontSize: "10px", color: "#ffffff", textShadow: "1px 1px 3px rgba(0,0,0,1)" }}>
                                          {config.labels[0]}: {scoreData[config.keys[0]]?.toLocaleString() ?? "?"}
                                        </span>
                                        <span style={{ fontSize: "10px", color: "#69b7ee", textShadow: "1px 1px 3px rgba(0,0,0,1)", marginLeft: "6px" }}>
                                          {config.labels[1]}: {scoreData[config.keys[1]]?.toLocaleString() ?? "?"}
                                        </span>
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: "10px", color: "#888", marginTop: "-4px", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
                                        점수 미갱신
                                      </div>
                                    )}
                                    
                                    <button 
                                      onClick={config.fetchFn} 
                                      style={{ ...btnStyle, padding: "2px 5px", marginBottom: "2px", marginTop: "-2px", fontSize: "10px", backgroundColor: "#335a80", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
                                    >
                                      전투력 갱신
                                    </button>
                                  </div>
                                );
                              })()}

                              <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                                <button
                                  onClick={() => togglePortrait(idx, setData)}
                                  style={{
                                    ...btnStyle,
                                    padding: "2px 5px",
                                    fontSize: "10px",
                                    backgroundColor: isShowPortrait ? "#444" : "#2a4d69"
                                  }}
                                >
                                  초상화
                                </button>
                                <button onClick={() => renameTarget(targetName, idx, dataList, setData)} style={{...btnStyle, padding: "2px 5px", fontSize: "10px"}}>이름변경</button>
                                <button onClick={() => {
                                  if(window.confirm(`[${targetName}] 캐릭터를 목록에서 삭제하시겠습니까?`)) {
                                    setData(prev => prev.filter((_, i) => i !== idx));
                                  }
                                }} style={{...btnStyle, padding: "2px 5px", fontSize: "10px", backgroundColor: "#600"}}>삭제</button>
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
                          {/* 제외 체크 박스 */}
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
                                <button style={{ ...btnStyle, padding: "2px 6px" }} onClick={(e) => updateCount(hw.id, targetName, -1, e)}>-</button>
                                {/* <button style={{ ...btnStyle, padding: "2px 6px", backgroundColor: "#444" }} onClick={(e) => updateCount(hw.id, targetName, 0, e)}>0</button> */}
                                <button style={{ ...btnStyle, padding: "2px 6px"}} onClick={(e) => updateCount(hw.id, targetName, 0, e)}>0</button>
                                <button style={{ ...btnStyle, padding: "2px 6px" }} onClick={(e) => updateCount(hw.id, targetName, 1, e)}>+</button>
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
              업데이트 : 2026-02-11 18:24
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
                  title={g.label} // 마우스 올리면 이름 나오게 툴팁 추가
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
                      width: "40px",  // 아이콘 크기 확대
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
                반복퀘
              </button>
              <button
                onClick={() => setViewMode("once")}
                style={{
                  ...btnStyle,
                  backgroundColor: viewMode === "once" ? "#333" : "#1e1e1e",
                  border: viewMode === "once" ? "1px solid #777" : "1px solid #444",
                  fontWeight: viewMode === "once" ? "bold" : "normal",// marginRight: "10px",
                }}
              >
                업적
              </button>
              {/* ✅ AION 2 전용 버튼들 */}
              {game === "aion2" && (
                <>
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
                    onClick={() => setViewMode("aion2_skill")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_skill" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_skill" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_skill" ? "bold" : "normal",
                    }}
                  >
                    스킬
                  </button>

                  {/* <button
                    onClick={() => setViewMode("aion2_arcana")}
                    style={{
                      ...btnStyle,
                      backgroundColor: viewMode === "aion2_arcana" ? "#333" : "#1e1e1e",
                      border: viewMode === "aion2_arcana" ? "1px solid #777" : "1px solid #444",
                      fontWeight: viewMode === "aion2_arcana" ? "bold" : "normal",
                    }}
                  >
                    아르카나
                  </button> */}
                </>
              )}

              <button onClick={exportData} style={{ ...btnStyle, backgroundColor: "#004080", marginLeft: "10px" }}>Save</button>
              <label style={{ ...btnStyle, backgroundColor: "#1a5e20", cursor: "pointer", textAlign: "center", display: "inline-block" }}>
                Load<input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
              </label>
              <button onClick={updateSettings} style={{ ...btnStyle, backgroundColor: "#6a1b9a" }}>업데이트 반영</button>
              <button onClick={resetProgress} style={{ ...btnStyle, backgroundColor: "#5d4037" }}>진행도 초기화</button>
              <button onClick={resetGameData} style={{ ...btnStyle, backgroundColor: "#b71c1c" }}>공장 초기화</button>
              
            </div>
          </div>
        </div>
      </div>

      {isHomeworkView && (
        <>
          {/* ✅ renderTable은 항상 렌더링 (헤더+버튼은 항상 보이게) */}
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
            hideHiddenButtons: isAccountCollapsed, // ✅ (선택) 의미 명확
          })}

          {/* ✅ 표가 펼쳐져 있을 때만 + 계정 추가 버튼 */}
          {!isAccountCollapsed && (
            <button
              onClick={() => addTargetAuto("account", accounts, setAccounts)}
              style={{ ...btnStyle, marginTop: "10px", marginBottom: "-10px", padding: "10px" }}
            >
              + 계정 추가
            </button>
          )}

          {/* 캐릭터별 숙제 테이블 */}
          {renderTable("캐릭터별 숙제", "character", characters, setCharacters)}

          {/* 버튼과 안내 문구를 가로 배치 */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px" }}>
            <button
              onClick={() => addTargetAuto("character", characters, setCharacters)}
              style={{ ...btnStyle, padding: "10px" }}
            >
              + 캐릭터 추가
            </button>

            {/* 안내 문구 */}
            {game === "aion2" && (
              <span style={{ fontSize: "12px", color: "#aaa", fontWeight: "normal" }}>
                ※ 캐릭명[서버명2글자] 형식으로 입력하면 전투력 조회 가능 ex) 카니쵸니[바카] (바카르마 서버는 캐릭명만 써도됨)
              </span>
            )}
          </div>
        </>
      )}

      {game === "aion2" && viewMode === "aion2_soul" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_SoulEngravingTable />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_skill" && (
        <div style={{ marginTop: 20, paddingTop: 12 }}>
          <Aion2_SkillPriorityTable />
        </div>
      )}

      {game === "aion2" && viewMode === "aion2_arcana" && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #444", borderRadius: 12, color: "#aaa" }}>
          아르카나 화면(임시)
        </div>
      )}

    </div>
  );  
}

export default App;