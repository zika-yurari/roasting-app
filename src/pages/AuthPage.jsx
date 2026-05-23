// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, confirmSignUp, signIn } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f2", fontFamily: "'Noto Sans JP', sans-serif" },
  card: { background: "#fff", border: "1px solid #e8e0d5", borderRadius: "20px", padding: "48px 40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  logo: { fontSize: "36px", textAlign: "center", marginBottom: "8px" },
  title: { color: "#2c2416", fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "4px" },
  subtitle: { color: "#9a8a78", fontSize: "13px", textAlign: "center", marginBottom: "32px" },
  label: { display: "block", color: "#7a6a5a", fontSize: "12px", fontWeight: "500", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 16px", background: "#faf7f4", border: "1px solid #ddd6cc", borderRadius: "10px", color: "#2c2416", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "16px" },
  btn: { width: "100%", padding: "13px", background: "linear-gradient(135deg, #c8956c, #b07848)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "8px", boxShadow: "0 2px 8px rgba(180,110,60,0.2)" },
  error: { background: "#fff0ee", border: "1px solid #f5c5bb", borderRadius: "10px", color: "#c0392b", fontSize: "12px", padding: "10px 14px", marginBottom: "16px" },
  toggle: { textAlign: "center", marginTop: "20px", color: "#9a8a78", fontSize: "13px" },
  link: { color: "#c8956c", cursor: "pointer", background: "none", border: "none", fontSize: "13px", textDecoration: "underline" },
};

function SignInForm({ onSwitch }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { const session = await signIn(email, password); setUser(session); navigate("/"); }
    catch (err) { setError(err.message || "Login failed"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.logo}></div>
      <div style={s.title}>Roasting Log</div>
      <div style={s.subtitle}>Sign in to continue</div>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Email</label>
      <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
      <label style={s.label}>Password</label>
      <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="" />
      <button style={s.btn} type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
      <div style={s.toggle}>
        No account? <button style={s.link} type="button" onClick={() => onSwitch("signup")}>Sign Up</button>
      </div>
    </form>
  );
}

function SignUpForm({ onSwitch, onSignedUp }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await signUp(email, password); onSignedUp(email); }
    catch (err) { setError(err.message || "Sign up failed"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.logo}></div>
      <div style={s.title}>Create Account</div>
      <div style={s.subtitle}>Start recording your roasts</div>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Email</label>
      <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
      <label style={s.label}>Password (8+ characters)</label>
      <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="" />
      <button style={s.btn} type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
      <div style={s.toggle}>
        Already have an account? <button style={s.link} type="button" onClick={() => onSwitch("signin")}>Sign In</button>
      </div>
    </form>
  );
}

function ConfirmForm({ email, onConfirmed }) {
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await confirmSignUp(email, code); onConfirmed(); }
    catch (err) { setError(err.message || "Confirmation failed"); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.logo}></div>
      <div style={s.title}>Check Your Email</div>
      <div style={s.subtitle}>We sent a code to {email}</div>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Confirmation Code</label>
      <input style={s.input} type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="123456" maxLength={6} />
      <button style={s.btn} type="submit" disabled={loading}>{loading ? "Confirming..." : "Confirm"}</button>
    </form>
  );
}

export default function AuthPage() {
  const [mode, setMode]   = useState("signin");
  const [email, setEmail] = useState("");
  return (
    <div style={s.page}>
      <div style={s.card}>
        {mode === "signin"  && <SignInForm onSwitch={setMode} />}
        {mode === "signup"  && <SignUpForm onSwitch={setMode} onSignedUp={e => { setEmail(e); setMode("confirm"); }} />}
        {mode === "confirm" && <ConfirmForm email={email} onConfirmed={() => setMode("signin")} />}
      </div>
    </div>
  );
}
