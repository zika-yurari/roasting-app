// src/pages/NewSessionPage.jsx
// 新しい焙煎記録の入力フォーム

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beans as beansApi, sessions } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#fff",
    fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px",
    padding: "20px 32px", borderBottom: "1px solid #1e1e1e" },
  back: { color: "#666", fontSize: "13px", textDecoration: "none" },
  navTitle: { fontSize: "16px", fontWeight: "600" },
  main: { maxWidth: "640px", margin: "0 auto", padding: "40px 32px" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "12px", fontWeight: "500", color: "#e8a87c",
    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", color: "#888",
    marginBottom: "6px", fontWeight: "500" },
  input: { width: "100%", padding: "12px 16px", background: "#1a1a1a",
    border: "1px solid #2a2a2a", borderRadius: "10px", color: "#fff",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
    marginBottom: "16px", fontFamily: "inherit" },
  select: { width: "100%", padding: "12px 16px", background: "#1a1a1a",
    border: "1px solid #2a2a2a", borderRadius: "10px", color: "#fff",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
    marginBottom: "16px", fontFamily: "inherit" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #e8a87c, #d4813a)",
    border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px",
    fontWeight: "700", cursor: "pointer", marginTop: "8px" },
  error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px", color: "#fca5a5", fontSize: "12px",
    padding: "10px 14px", marginBottom: "16px" },
};

const ROAST_LEVELS = ["極浅煎り", "浅煎り", "中浅煎り", "中煎り", "中深煎り", "深煎り", "極深煎り"];

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [beanList, setBeanList] = useState([]);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const [form, setForm] = useState({
    bean_id:          "",
    roasted_at:       new Date().toISOString().slice(0, 16),
    input_weight_g:   "",
    output_weight_g:  "",
    roast_level:      "中煎り",
    total_time_sec:   "",
    first_crack_sec:  "",
    second_crack_sec: "",
    end_temp_c:       "",
    notes:            "",
  });

  useEffect(() => {
    beansApi.list().then(setBeanList).catch(console.error);
  }, []);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // 分:秒 → 秒に変換するヘルパー
  function toSec(val) {
    if (!val) return null;
    const [m, s] = String(val).split(":").map(Number);
    return s !== undefined ? m * 60 + s : Number(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.bean_id) { setError("豆を選択してください"); return; }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        input_weight_g:   form.input_weight_g   ? Number(form.input_weight_g)   : null,
        output_weight_g:  form.output_weight_g  ? Number(form.output_weight_g)  : null,
        end_temp_c:       form.end_temp_c       ? Number(form.end_temp_c)       : null,
        total_time_sec:   toSec(form.total_time_sec),
        first_crack_sec:  toSec(form.first_crack_sec),
        second_crack_sec: toSec(form.second_crack_sec),
      };
      const created = await sessions.create(payload);
      navigate(`/sessions/${created.SESSION_ID || created.session_id}`);
    } catch (err) {
      setError(err.message || "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.back}>← 一覧に戻る</Link>
        <div style={s.navTitle}>新しい焙煎を記録</div>
      </nav>

      <main style={s.main}>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* 豆の選択 */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🫘 豆の情報</div>
            <label style={s.label}>使用した豆 *</label>
            <select style={s.select} value={form.bean_id}
              onChange={e => set("bean_id", e.target.value)} required>
              <option value="">豆を選択してください</option>
              {beanList.map(b => (
                <option key={b.BEAN_ID || b.bean_id} value={b.BEAN_ID || b.bean_id}>
                  {b.NAME || b.name}
                  {(b.ORIGIN_COUNTRY || b.origin_country)
                    ? ` (${b.ORIGIN_COUNTRY || b.origin_country})` : ""}
                </option>
              ))}
            </select>
            <Link to="/beans/new" style={{ fontSize: "12px", color: "#e8a87c" }}>
              + 新しい豆を登録する
            </Link>
          </div>

          {/* 焙煎条件 */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🔥 焙煎条件</div>
            <div style={s.row}>
              <div>
                <label style={s.label}>焙煎日時</label>
                <input style={s.input} type="datetime-local" value={form.roasted_at}
                  onChange={e => set("roasted_at", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>焙煎度</label>
                <select style={s.select} value={form.roast_level}
                  onChange={e => set("roast_level", e.target.value)}>
                  {ROAST_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>投入量 (g)</label>
                <input style={s.input} type="number" value={form.input_weight_g}
                  onChange={e => set("input_weight_g", e.target.value)} placeholder="例: 250" />
              </div>
              <div>
                <label style={s.label}>仕上がり量 (g)</label>
                <input style={s.input} type="number" value={form.output_weight_g}
                  onChange={e => set("output_weight_g", e.target.value)} placeholder="例: 210" />
              </div>
            </div>
          </div>

          {/* タイミング */}
          <div style={s.section}>
            <div style={s.sectionTitle}>⏱️ タイミング</div>
            <div style={s.row}>
              <div>
                <label style={s.label}>合計時間（分:秒 または 秒）</label>
                <input style={s.input} type="text" value={form.total_time_sec}
                  onChange={e => set("total_time_sec", e.target.value)} placeholder="例: 12:30 または 750" />
              </div>
              <div>
                <label style={s.label}>排出温度 (℃)</label>
                <input style={s.input} type="number" value={form.end_temp_c}
                  onChange={e => set("end_temp_c", e.target.value)} placeholder="例: 210" />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>1ハゼ（分:秒）</label>
                <input style={s.input} type="text" value={form.first_crack_sec}
                  onChange={e => set("first_crack_sec", e.target.value)} placeholder="例: 8:00" />
              </div>
              <div>
                <label style={s.label}>2ハゼ（分:秒）</label>
                <input style={s.input} type="text" value={form.second_crack_sec}
                  onChange={e => set("second_crack_sec", e.target.value)} placeholder="例: 11:00" />
              </div>
            </div>
          </div>

          {/* メモ */}
          <div style={s.section}>
            <div style={s.sectionTitle}>📝 メモ</div>
            <textarea style={{ ...s.input, height: "100px", resize: "vertical" }}
              value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="天気、湿度、気づいたことなど" />
          </div>

          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "保存中..." : "焙煎記録を保存"}
          </button>
        </form>
      </main>
    </div>
  );
}
