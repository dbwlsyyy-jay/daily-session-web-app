import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <nav className="navbar">
      <span className="brand">데일리 세션</span>
      <div className="nav-links">
        <NavLink to="/today" className={linkClass}>
          오늘 작성
        </NavLink>
        <NavLink to="/team" className={linkClass}>
          팀 뷰
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          내 기록
        </NavLink>
        <button type="button" className="nav-link nav-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </nav>
  );
}
