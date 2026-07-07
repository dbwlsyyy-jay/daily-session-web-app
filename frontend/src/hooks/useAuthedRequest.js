import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../api.js";

// 인증이 필요한 API 호출을 감싸서, 토큰 만료(401) 시 자동 로그아웃 + 로그인 화면으로 이동시킨다.
export default function useAuthedRequest() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(
    async (fn) => {
      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          navigate("/login", { replace: true });
        }
        throw err;
      }
    },
    [token, logout, navigate]
  );
}
