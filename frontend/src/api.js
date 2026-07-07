const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? "요청 처리 중 오류가 발생했습니다.", res.status);
  }

  return data;
}

export const api = {
  signup: (email, password, name) =>
    request("/auth/signup", { method: "POST", body: { email, password, name } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  getMyEntry: (token, date) =>
    request(`/entries/me?date=${encodeURIComponent(date)}`, { token }),
  saveEntry: (token, entry) => request("/entries", { method: "PUT", token, body: entry }),
  getTeamEntries: (token, date) =>
    request(`/entries?date=${encodeURIComponent(date)}`, { token }),
  getMyHistory: (token) => request("/entries/me/history", { token }),
};
