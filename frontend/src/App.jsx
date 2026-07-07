import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import NavBar from "./components/NavBar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TodayPage from "./pages/TodayPage.jsx";
import TeamViewPage from "./pages/TeamViewPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function ProtectedLayout() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <NavBar />
      <main className="page">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
    </>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/today" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/today" element={<TodayPage />} />
        <Route path="/team" element={<TeamViewPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? "/today" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
