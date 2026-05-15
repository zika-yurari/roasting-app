// src/pages/DashboardPage.jsx
// 焙煎記録一覧ページ

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sessions } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const s = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#fff",
    fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px", borderBottom: "1px solid #1e1e1e" },
  navLogo: { fontSize: "20px", fontWeight: "700", color: "#e8a87c" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  signOutBtn: { background: "none", border: "1px solid #333", borderRadius: "8px",
    color: "#888", padding: "6px 14px", fontSize: "12px", cursor: "pointer" },
  newBtn: { background: "linear-gradient(135deg, #e8a87c, #d4813a)", border: "none",
    borderRadius: "10px", color: "#fff", padding: "8px 18px",
    fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "none",
    display: "inline-block" },
  main: { padding: "32px" },
  heading: { fontSize: "24px", fontWeight: "700", marginBottom: "8px" },
  sub: { color: "#666", fontSize: "13px", marginBottom: "32px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px" },
  card: { background: "#1a1a1a", border: "1px solid #222", borderRadius: "16px",
    padding: "20px", cursor: "pointer", transition: "border-color 0.2s, transform 0.15s",
    textDecoration: "none", color: "inherit", display: "block" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "12px" },
  beanName: { fontSize: "15px", fontWeight: "600", color: "#fff" },
  roastLevel: { fontSize: "11px", padding: "3px 8px", borderRadius: "20px",
    background: "#2a1f0f", color: "#e8a87c", fontWeight: "500" },
  date: { color: "#555", fontSize: "12px", marginBottom: "12px" },
  stats: { display: "flex", gap: "16px" },
  stat: { display: "flex", flexDirection: "column", gap: "2px" },
  statVal: { fontSize: "16px", fontWeight: "700", color: "#e8a87c" },
  statLabel: { fontSize: "10px", color: "#555", letterSpacing: "0.05em" },
  score: { marginLeft: "auto", textAlign: "right" },
  scoreVal: { fontSize: "22px", fontWeight: "700", color: "#fff" },
  scoreLabel: { fontSize: "10px", color: "#555" },
  empty: { textAlign: "center", padding: "80px 0", color: "#444" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyText: { fontSize: "16px", marginBottom: "24px" },
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric"
  });
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessions.list({ limit: 50 })
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLogo}>☕ 焙煎記録</div>
        <div style={s.navRight}>
          <Link to="/sessions/new" style={s.newBtn}>+ 新しい焙煎を記録</Link>
          <button style={s.signOutBtn} onClick={() => { signOut(); navigate("/login"); }}>
            ログアウト
          </button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.heading}>焙煎ログ</div>
        <div style={s.sub}>
          {loading ? "読み込み中..." : `${list.length} 件の焙煎記録`}
        </div>

        {!loading && list.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🫘</div>
            <div style={s.emptyText}>まだ焙煎記録がありません</div>
            <Link to="/sessions/new" style={s.newBtn}>最初の焙煎を記録する</Link>
          </div>
        )}

        <div style={s.grid}>
          {list.map(session => (
            <Link
              key={session.SESSION_ID || session.session_id}
              to={`/sessions/${session.SESSION_ID || session.session_id}`}
              style={s.card}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#e8a87c";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={s.cardTop}>
                <div style={s.beanName}>
                  {session.BEAN_NAME || session.bean_name || "不明な豆"}
                </div>
                {(session.ROAST_LEVEL || session.roast_level) && (
                  <div style={s.roastLevel}>
                    {session.ROAST_LEVEL || session.roast_level}
                  </div>
                )}
              </div>
              <div style={s.date}>
                {formatDate(session.ROASTED_AT || session.roasted_at)}
              </div>
              <div style={s.stats}>
                <div style={s.stat}>
                  <div style={s.statVal}>
                    {Math.round((session.TOTAL_TIME_SEC || session.total_time_sec || 0) / 60)}
                    <span style={{ fontSize: "11px", color: "#888" }}>分</span>
                  </div>
                  <div style={s.statLabel}>焙煎時間</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statVal}>
                    {session.INPUT_WEIGHT_G || session.input_weight_g || "—"}
                    <span style={{ fontSize: "11px", color: "#888" }}>g</span>
                  </div>
                  <div style={s.statLabel}>投入量</div>
                </div>
                {(session.SCORE_OVERALL || session.score_overall) && (
                  <div style={{ ...s.stat, ...s.score }}>
                    <div style={s.scoreVal}>
                      {session.SCORE_OVERALL || session.score_overall}
                    </div>
                    <div style={s.scoreLabel}>スコア</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
