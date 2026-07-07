const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function todayKST() {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  return kst.toISOString().slice(0, 10);
}

export function isValidDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
