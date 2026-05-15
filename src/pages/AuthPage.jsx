// src/pages/AuthPage.jsx
// サインアップ・確認コード・サインイン を1つのページで管理

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, confirmSignUp, signIn } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  logo: {
    fontSize: "32px",
    textAlign: "center",
    marginBottom: "8px",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "4px",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "32px",
  },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "6px",
    letterSpacing: "0.04em",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "16px",
    transition: "border-color 0.2s",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #e8a87c, #d4813a)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    letterSpacing: "0.05em",
  },
  error: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    color: "#fca5a5",
    fontSize: "12px",
    padding: "10px 14px",
    marginBottom: "16px",
  },
  toggle: {
    textAlign: "center",
    marginTop: "20px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "13px",
  },
  link: {
    color: "#e8a87c",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontSize: "13px",
    textDecoration: "underline",
  },
};

// ── サインインフォーム ────────────────────────────────
function SignInForm({ onSwitch }) {
  const { setUser } = useAuth();
  const navigate    = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await signIn(email, password);
      setUser(session);
      navigate("/");
    } catch (err) {
      setError(err.message || "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.logo}>☕</div>
      <div style={styles.title}>焙煎記録</div>
      <div style={styles.subtitle}>ログインして記録を始めましょう</div>
      {error && <div style={styles.error}>{error}</div>}
      <label style={styles.label}>メールアドレス</label>
      <input style={styles.input} type="email" value={email}
        onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
      <label style={styles.label}>パスワード</label>
      <input style={styles.input} type="password" value={password}
        onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>
      <div style={styles.toggle}>
        アカウントをお持ちでない方は{" "}
        <button style={styles.link} type="button" onClick={() => onSwitch("signup")}>新規登録</button>
      </div>
    </form>
  );
}

// ── サインアップフォーム ──────────────────────────────
function SignUpForm({ onSwitch, onSignedUp }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password);
      onSignedUp(email);
    } catch (err) {
      setError(err.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.logo}>☕</div>
      <div style={styles.title}>新規登録</div>
      <div style={styles.subtitle}>焙煎記録アプリへようこそ</div>
      {error && <div style={styles.error}>{error}</div>}
      <label style={styles.label}>メールアドレス</label>
      <input style={styles.input} type="email" value={email}
        onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
      <label style={styles.label}>パスワード（8文字以上）</label>
      <input style={styles.input} type="password" value={password}
        onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? "登録中..." : "アカウントを作成"}
      </button>
      <div style={styles.toggle}>
        すでにアカウントをお持ちの方は{" "}
        <button style={styles.link} type="button" onClick={() => onSwitch("signin")}>ログイン</button>
      </div>
    </form>
  );
}

// ── 確認コードフォーム ────────────────────────────────
function ConfirmForm({ email, onConfirmed }) {
  const [code,    setCode]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      onConfirmed();
    } catch (err) {
      setError(err.message || "確認に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.logo}>📧</div>
      <div style={styles.title}>メール確認</div>
      <div style={styles.subtitle}>{email} に確認コードを送信しました</div>
      {error && <div style={styles.error}>{error}</div>}
      <label style={styles.label}>確認コード（6桁）</label>
      <input style={styles.input} type="text" value={code}
        onChange={e => setCode(e.target.value)} required placeholder="123456" maxLength={6} />
      <button style={styles.btn} type="submit" disabled={loading}>
        {loading ? "確認中..." : "確認する"}
      </button>
    </form>
  );
}

// ── メインページ ──────────────────────────────────────
export default function AuthPage() {
  const [mode,  setMode]  = useState("signin"); // signin | signup | confirm
  const [email, setEmail] = useState("");

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {mode === "signin" && (
          <SignInForm onSwitch={setMode} />
        )}
        {mode === "signup" && (
          <SignUpForm
            onSwitch={setMode}
            onSignedUp={(e) => { setEmail(e); setMode("confirm"); }}
          />
        )}
        {mode === "confirm" && (
          <ConfirmForm
            email={email}
            onConfirmed={() => setMode("signin")}
          />
        )}
      </div>
    </div>
  );
}
