// src/pages/SessionDetailPage.jsx
// 焙煎記録詳細 + 温度カーブグラフ + カッピング評価

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { sessions, reviews as reviewsApi } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#fff",
    fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px",
    padding: "20px 32px", borderBottom: "1px solid #1e1e1e" },
  back: { color: "#666", fontSize: "13px", textDecoration: "none" },
  main: { maxWidth: "800px", margin: "0 auto", padding: "40px 32px" },
  header: { marginBottom: "32px" },
  beanName: { fontSize: "28px", fontWeight: "700", marginBottom: "8px" },
  meta: { display: "flex", gap: "16px", flexWrap: "wrap", color: "#666", fontSize: "13px" },
  badge: { background: "#2a1f0f", color: "#e8a87c", padding: "3px 10px",
    borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px", marginBottom: "32px" },
  statCard: { background: "#1a1a1a", border: "1px solid #222",
    borderRadius: "12px", padding: "16px" },
  statVal: { fontSize: "22px", fontWeight: "700", color: "#e8a87c" },
  statLabel: { fontSize: "11px", color: "#555", marginTop: "4px", letterSpacing: "0.05em" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "12px", fontWeight: "500", color: "#e8a87c",
    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" },
  chartBox: { background: "#1a1a1a", border: "1px solid #222",
    borderRadius: "16px", padding: "24px" },
  noChart: { textAlign: "center", color: "#444", padding: "40px 0", fontSize: "13px" },
  reviewGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" },
  reviewCard: { background: "#1a1a1a", border: "1px solid #222",
    borderRadius: "10px", padding: "12px", textAlign: "center" },
  reviewScore: { fontSize: "20px", fontWeight: "700", color: "#e8a87c" },
  reviewLabel: { fontSize: "10px", color: "#555", marginTop: "4px" },
  notesBox: { background: "#1a1a1a", border: "1px solid #222",
    borderRadius: "12px", padding: "16px", fontSize: "14px",
    color: "#aaa", lineHeight: "1.7", whiteSpace: "pre-wrap" },
  flavorTags: { display: "flex", gap: "8px", flexWrap: "wrap" },
  flavorTag: { background: "#1a1f2e", border: "1px solid #2a3555",
    borderRadius: "20px", padding: "4px 12px", fontSize: "12px", color: "#85b7eb" },
};

function secToMin(sec) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessions.get(id)
      .then(setSession)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#666" }}>読み込み中...</div>
    </div>
  );
  if (!session) return null;

  // キー名の大文字/小文字両対応
  const get = (key) => session[key.toUpperCase()] ?? session[key.toLowerCase()];

  const chartData = (get("temp_profile") || []).map(p => ({
    time: Math.round((p.ELAPSED_SEC || p.elapsed_sec) / 60 * 10) / 10,
    豆温度: p.BEAN_TEMP_C || p.bean_temp_c,
    環境温度: p.ENV_TEMP_C || p.env_temp_c,
  }));

  const firstCrackMin = get("first_crack_sec")
    ? Math.round(get("first_crack_sec") / 60 * 10) / 10 : null;

  const flavorNotes = get("flavor_notes") || [];

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.back}>← 一覧に戻る</Link>
      </nav>

      <main style={s.main}>
        {/* ヘッダー */}
        <div style={s.header}>
          <div style={s.beanName}>{get("bean_name") || "不明な豆"}</div>
          <div style={s.meta}>
            <span>{new Date(get("roasted_at")).toLocaleDateString("ja-JP", {
              year: "numeric", month: "long", day: "numeric"
            })}</span>
            {get("roast_level") && <span style={s.badge}>{get("roast_level")}</span>}
            {get("origin_country") && <span>{get("origin_country")}</span>}
            {get("process") && <span>{get("process")}</span>}
          </div>
        </div>

        {/* 数値サマリー */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statVal}>{secToMin(get("total_time_sec"))}</div>
            <div style={s.statLabel}>焙煎時間</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{get("input_weight_g") || "—"}<span style={{ fontSize: "12px", color: "#888" }}>g</span></div>
            <div style={s.statLabel}>投入量</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{get("end_temp_c") || "—"}<span style={{ fontSize: "12px", color: "#888" }}>℃</span></div>
            <div style={s.statLabel}>排出温度</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{secToMin(get("first_crack_sec"))}</div>
            <div style={s.statLabel}>1ハゼ</div>
          </div>
        </div>

        {/* 温度カーブ */}
        <div style={s.section}>
          <div style={s.sectionTitle}>🌡️ 温度カーブ</div>
          <div style={s.chartBox}>
            {chartData.length === 0 ? (
              <div style={s.noChart}>温度データがありません</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="time" stroke="#444" fontSize={11}
                    label={{ value: "経過時間（分）", position: "insideBottom", offset: -2, fill: "#555", fontSize: 11 }} />
                  <YAxis stroke="#444" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333",
                    borderRadius: "8px", fontSize: "12px" }} />
                  {firstCrackMin && (
                    <ReferenceLine x={firstCrackMin} stroke="#e8a87c" strokeDasharray="4 4"
                      label={{ value: "1ハゼ", fill: "#e8a87c", fontSize: 11 }} />
                  )}
                  <Line type="monotone" dataKey="豆温度" stroke="#e8a87c" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="環境温度" stroke="#5dcaa5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* カッピング評価 */}
        {get("score_overall") && (
          <div style={s.section}>
            <div style={s.sectionTitle}>⭐ カッピング評価</div>
            <div style={s.reviewGrid}>
              {[
                { key: "score_overall",   label: "総合" },
                { key: "score_aroma",     label: "香り" },
                { key: "score_acidity",   label: "酸味" },
                { key: "score_body",      label: "コク" },
                { key: "score_sweetness", label: "甘味" },
              ].map(({ key, label }) => (
                <div key={key} style={s.reviewCard}>
                  <div style={s.reviewScore}>{get(key) ?? "—"}</div>
                  <div style={s.reviewLabel}>{label}</div>
                </div>
              ))}
            </div>
            {flavorNotes.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div style={s.flavorTags}>
                  {flavorNotes.map((n, i) => (
                    <span key={i} style={s.flavorTag}>{n}</span>
                  ))}
                </div>
              </div>
            )}
            {get("tasting_notes") && (
              <div style={{ ...s.notesBox, marginTop: "16px" }}>
                {get("tasting_notes")}
              </div>
            )}
          </div>
        )}

        {/* メモ */}
        {get("notes") && (
          <div style={s.section}>
            <div style={s.sectionTitle}>📝 メモ</div>
            <div style={s.notesBox}>{get("notes")}</div>
          </div>
        )}
      </main>
    </div>
  );
}
