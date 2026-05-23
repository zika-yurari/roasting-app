// src/pages/NewBeanPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beans as beansApi } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#f7f5f2", color: "#2c2416", fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px", padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e8e0d5", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  back: { color: "#9a8a78", fontSize: "13px", textDecoration: "none" },
  navTitle: { fontSize: "16px", fontWeight: "600", color: "#2c2416" },
  main: { maxWidth: "560px", margin: "0 auto", padding: "32px 24px" },
  card: { background: "#fff", border: "1px solid #e8e0d5", borderRadius: "14px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: "11px", fontWeight: "700", color: "#c8956c", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", color: "#7a6a5a", marginBottom: "6px", fontWeight: "500" },
  input: { width: "100%", padding: "11px 14px", background: "#faf7f4", border: "1px solid #ddd6cc", borderRadius: "10px", color: "#2c2416", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px", fontFamily: "inherit" },
  select: { width: "100%", padding: "11px 14px", background: "#faf7f4", border: "1px solid #ddd6cc", borderRadius: "10px", color: "#2c2416", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px", fontFamily: "inherit" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  submitBtn: { width: "100%", padding: "13px", background: "linear-gradient(135deg, #c8956c, #b07848)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(180,110,60,0.2)" },
  error: { background: "#fff0ee", border: "1px solid #f5c5bb", borderRadius: "10px", color: "#c0392b", fontSize: "12px", padding: "10px 14px", marginBottom: "16px" },
};

const PROCESSES = ["", "Washed", "Natural", "Honey", "Anaerobic", "Other"];

export default function NewBeanPage() {
  const navigate = useNavigate();
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", origin_country: "", region: "", process: "", variety: "", purchase_date: "", notes: "" });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Bean name is required"); return; }
    setError(""); setLoading(true);
    try { await beansApi.create(form); navigate("/sessions/new"); }
    catch (err) { setError(err.message || "Failed to register"); }
    finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/sessions/new" style={s.back}> Back to Session</Link>
        <div style={s.navTitle}>Register New Bean</div>
      </nav>

      <main style={s.main}>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.card}>
            <div style={s.sectionTitle}>Bean Information</div>
            <label style={s.label}>Bean Name *</label>
            <input style={s.input} type="text" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. Ethiopia Yirgacheffe G1" />
            <div style={s.row}>
              <div>
                <label style={s.label}>Origin Country</label>
                <input style={s.input} type="text" value={form.origin_country} onChange={e => set("origin_country", e.target.value)} placeholder="e.g. Ethiopia" />
              </div>
              <div>
                <label style={s.label}>Region / Farm</label>
                <input style={s.input} type="text" value={form.region} onChange={e => set("region", e.target.value)} placeholder="e.g. Yirgacheffe" />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>Process</label>
                <select style={s.select} value={form.process} onChange={e => set("process", e.target.value)}>
                  {PROCESSES.map(p => <option key={p} value={p}>{p || "Select"}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Variety</label>
                <input style={s.input} type="text" value={form.variety} onChange={e => set("variety", e.target.value)} placeholder="e.g. Heirloom" />
              </div>
            </div>
            <label style={s.label}>Purchase Date</label>
            <input style={s.input} type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} />
            <label style={s.label}>Notes</label>
            <textarea style={{ ...s.input, height: "80px", resize: "vertical" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Altitude, flavor characteristics, supplier..." />
          </div>
          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register Bean & Go to Session"}
          </button>
        </form>
      </main>
    </div>
  );
}
