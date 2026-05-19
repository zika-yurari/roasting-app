// src/pages/NewBeanPage.jsx
// 豆マスタ登録ページ

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beans as beansApi } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#fff",
    fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px",
    padding: "20px 32px", borderBottom: "1px solid #1e1e1e" },
  back: { color: "#666", fontSize: "13px", textDecoration: "none" },
  navTitle: { fontSize: "16px", fontWeight: "600" },
  main: { maxWidth: "560px", margin: "0 auto", padding: "40px 32px" },
  section: { marginBottom: "28px" },
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
  submitBtn: { width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #e8a87c, #d4813a)",
    border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px",
    fontWeight: "700", cursor: "pointer", marginTop: "8px" },
  error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px", color: "#fca5a5", fontSize: "12px",
    padding: "10px 14px", marginBottom: "16px" },
};

const PROCESSES = ["", "ウォッシュド", "ナチュラル", "ハニー", "アナエロビック", "その他"];

export default function NewBeanPage() {
  const navigate = useNavigate();
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:           "",
    origin_country: "",
    region:         "",
    process:        "",
    variety:        "",
    purchase_date:  "",
    notes:          "",
  });

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("豆の名前を入力してください"); return; }
    setError("");
    setLoading(true);
    try {
      await beansApi.create(form);
      navigate("/sessions/new");  // 登録後は焙煎記録フォームに戻る
    } catch (err) {
      setError(err.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/sessions/new" style={s.back}>← 焙煎記録に戻る</Link>
        <div style={s.navTitle}>🫘 新しい豆を登録</div>
      </nav>

      <main style={s.main}>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>

          <div style={s.section}>
            <div style={s.sectionTitle}>基本情報</div>
            <label style={s.label}>豆の名前 *</label>
            <input style={s.input} type="text" value={form.name}
              onChange={e => set("name", e.target.value)} required
              placeholder="例: エチオピア イルガチェフェ G1" />

            <div style={s.row}>
              <div>
                <label style={s.label}>生産国</label>
                <input style={s.input} type="text" value={form.origin_country}
                  onChange={e => set("origin_country", e.target.value)}
                  placeholder="例: Ethiopia" />
              </div>
              <div>
                <label style={s.label}>地域・農園</label>
                <input style={s.input} type="text" value={form.region}
                  onChange={e => set("region", e.target.value)}
                  placeholder="例: Yirgacheffe" />
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label}>精製方法</label>
                <select style={s.select} value={form.process}
                  onChange={e => set("process", e.target.value)}>
                  {PROCESSES.map(p => <option key={p} value={p}>{p || "選択してください"}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>品種</label>
                <input style={s.input} type="text" value={form.variety}
                  onChange={e => set("variety", e.target.value)}
                  placeholder="例: Heirloom" />
              </div>
            </div>

            <label style={s.label}>購入日</label>
            <input style={s.input} type="date" value={form.purchase_date}
              onChange={e => set("purchase_date", e.target.value)} />

            <label style={s.label}>メモ</label>
            <textarea style={{ ...s.input, height: "80px", resize: "vertical" }}
              value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="仕入れ元、標高、フレーバーの特徴など" />
          </div>

          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "登録中..." : "豆を登録して焙煎記録へ"}
          </button>
        </form>
      </main>
    </div>
  );
}
