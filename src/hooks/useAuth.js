// src/hooks/useAuth.js
// 認証状態をアプリ全体で共有するContext + Hook

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, getToken, signOut as cognitoSignOut } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);   // ログイン済みユーザー
  const [loading, setLoading] = useState(true);   // 初期チェック中

  useEffect(() => {
    // ページ読み込み時にログイン済みかチェック
    const current = getCurrentUser();
    if (!current) {
      setLoading(false);
      return;
    }
    // トークンが有効かも確認
    getToken()
      .then(() => setUser(current))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function signOut() {
    cognitoSignOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
