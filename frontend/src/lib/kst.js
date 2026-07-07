const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const PLAIN_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function todayKST() {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// 백엔드가 DATE 컬럼을 UTC ISO 문자열(예: ...T15:00:00.000Z)로 내려줄 수 있어
// 그대로 슬라이스하면 하루 밀려 보인다. KST 기준으로 다시 계산해 캘린더 날짜를 복원한다.
// 이미 YYYY-MM-DD 형식(예: <input type="date"> 값)이면 시간대 보정 없이 그대로 사용한다.
export function toKSTDateString(value) {
  if (!value) return "";
  if (PLAIN_DATE_RE.test(value)) return value;

  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "";
  return new Date(instant.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function formatDateForDisplay(dateStr) {
  const kstDate = toKSTDateString(dateStr);
  if (!PLAIN_DATE_RE.test(kstDate)) return dateStr;

  const [y, m, d] = kstDate.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")} (${weekday})`;
}
