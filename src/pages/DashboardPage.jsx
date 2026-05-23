// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sessions } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const s = {
  page: { minHeight: "100vh", background: "#f7f5f2", color: "#2c2416", fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e8e0d5", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  navLogo: { fontSize: "18px", fontWeight: "700", color: "#c8956c" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  newBtn: { background: "linear-gradient(135deg, #c8956c, #b07848)", border: "none", borderRadius: "10px", color: "#fff", padding: "8px 18px", fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "none", display: "inline-block", boxShadow: "0 2px 8px rgba(180,110,60,0.2)" },
  signOutBtn: { background: "none", border: "1px solid #ddd6cc", borderRadius: "8px", color: "#9a8a78", padding: "6px 14px", fontSize: "12px", cursor: "pointer" },
  main: { padding: "32px" },
  heading: { fontSize: "22px", fontWeight: "700", marginBottom: "6px", color: "#2c2416" },
  sub: { color: "#9a8a78", fontSize: "13px", marginBottom: "28px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  card: { background: "#fff", border: "1px solid #e8e0d5", borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s", textDecoration: "none", color: "inherit", display: "block", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" },
  beanName: { fontSize: "15px", fontWeight: "600", color: "#2c2416" },
  roastLevel: { fontSize: "11px", padding: "3px 8px", borderRadius: "20px", background: "#fdf0e6", color: "#c8956c", fontWeight: "500" },
  date: { color: "#b0a090", fontSize: "12px", marginBottom: "12px" },
  stats: { display: "flex", gap: "16px" },
  stat: { display: "flex", flexDirection: "column", gap: "2px" },
  statVal: { fontSize: "16px", fontWeight: "700", color: "#c8956c" },
  statLabel: { fontSize: "10px", color: "#b0a090", letterSpacing: "0.05em" },
  score: { marginLeft: "auto", textAlign: "right" },
  scoreVal: { fontSize: "22px", fontWeight: "700", color: "#2c2416" },
  scoreLabel: { fontSize: "10px", color: "#b0a090" },
  empty: { textAlign: "center", padding: "80px 0", color: "#c0b0a0" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyText: { fontSize: "16px", marginBottom: "24px" },
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export default function DashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessions.list({ limit: 50 }).then(setList).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}> Roasting Log</div>
        <div style={s.navRight}>
          <Link to="/sessions/new" style={s.newBtn}>+ New Session</Link>
          <button style={s.signOutBtn} onClick={() => { signOut(); navigate("/login"); }}>Sign Out</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.heading}>Roasting Log</div>
        <div style={s.sub}>{loading ? "Loading..." : `${list.length} sessions`}</div>

        {!loading && list.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}></div>
            <div style={s.emptyText}>No roasting sessions yet</div>
            <Link to="/sessions/new" style={s.newBtn}>Record First Session</Link>
          </div>
        )}

        <div style={s.grid}>
          {list.map(session => {
            const get = k => session[k.toUpperCase()] ?? session[k.toLowerCase()];
            return (
              <Link key={get("session_id")} to={`/sessions/${get("session_id")}`} style={s.card}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={s.cardTop}>
                  <div style={s.beanName}>{get("bean_name") || "Unknown Bean"}</div>
                  {get("roast_level") && <div style={s.roastLevel}>{get("roast_level")}</div>}
                </div>
                <div style={s.date}>{formatDate(get("roasted_at"))}</div>
                <div style={s.stats}>
                  <div style={s.stat}>
                    <div style={s.statVal}>{Math.round((get("total_time_sec") || 0) / 60)}<span style={{ fontSize: "11px", color: "#b0a090" }}>min</span></div>
                    <div style={s.statLabel}>Time</div>
                  </div>
                  <div style={s.stat}>
                    <div style={s.statVal}>{get("input_weight_g") || ""}<span style={{ fontSize: "11px", color: "#b0a090" }}>g</span></div>
                    <div style={s.statLabel}>Input</div>
                  </div>
                  {get("score_overall") && (
                    <div style={{ ...s.stat, ...s.score }}>
                      <div style={s.scoreVal}>{get("score_overall")}</div>
                      <div style={s.scoreLabel}>Score</div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
