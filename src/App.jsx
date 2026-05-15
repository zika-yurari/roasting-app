// src/App.jsx
// ルーティングと認証ガードの設定

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage        from "./pages/AuthPage";
import DashboardPage   from "./pages/DashboardPage";
import NewSessionPage  from "./pages/NewSessionPage";
import SessionDetailPage from "./pages/SessionDetailPage";

// ログイン済みでないとアクセスできないルートのラッパー
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#666", fontFamily: "sans-serif" }}>
      読み込み中...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 認証不要 */}
          <Route path="/login" element={<AuthPage />} />

          {/* 認証必須 */}
          <Route path="/" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/sessions/new" element={
            <PrivateRoute><NewSessionPage /></PrivateRoute>
          } />
          <Route path="/sessions/:id" element={
            <PrivateRoute><SessionDetailPage /></PrivateRoute>
          } />

          {/* 未定義パスはトップへ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
