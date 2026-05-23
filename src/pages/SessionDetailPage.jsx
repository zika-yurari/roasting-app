// src/pages/SessionDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { sessions, roastingEvents, reviews as reviewsApi } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#f7f5f2", color: "#2c2416", fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px", padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e8e0d5", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  back: { color: "#9a8a78", fontSize: "13px", textDecoration: "none" },
  main: { maxWidth: "720px", margin: "0 auto", padding: "32px 24px" },
  card: { background: "#fff", border: "1px solid #e8e0d5", borderRadius: "14px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: "11px", fontWeight: "700", color: "#c8956c", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" },

  // Header
  beanName: { fontSize: "26px", fontWeight: "700", color: "#2c2416", marginBottom: "8px" },
  metaRow: { display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "4px" },
  badge: { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "#fdf0e6", color: "#c8956c", fontWeight: "600" },
  metaText: { fontSize: "13px", color: "#9a8a78" },

  // Stats grid
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  statCard: { background: "#faf7f4", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "14px" },
  statVal: { fontSize: "20px", fontWeight: "700", color: "#c8956c", marginBottom: "2px" },
  statUnit: { fontSize: "11px", color: "#b0a090" },
  statLabel: { fontSize: "11px", color: "#9a8a78", marginTop: "2px", letterSpacing: "0.03em" },

  // Event list (below chart)
  eventItem: { display: "flex", gap: "12px", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f0ebe4", fontSize: "13px" },
  eventTime: { fontFamily: "monospace", color: "#c8956c", fontWeight: "600", minWidth: "50px", flexShrink: 0 },
  eventTypeBadge: { fontSize: "10px", padding: "2px 7px", borderRadius: "10px", fontWeight: "500", flexShrink: 0 },
  eventNote: { color: "#7a6a5a", flex: 1 },

  // Review
  label: { display: "block", fontSize: "12px", color: "#7a6a5a", marginBottom: "6px", fontWeight: "500" },
  input: { width: "100%", padding: "10px 14px", background: "#faf7f4", border: "1px solid #ddd6cc", borderRadius: "10px", color: "#2c2416", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "14px", fontFamily: "inherit" },
  scoreGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "14px" },
  scoreCard: { background: "#faf7f4", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "10px 6px", textAlign: "center" },
  scoreVal: { fontSize: "20px", fontWeight: "700", color: "#c8956c" },
  scoreLabel: { fontSize: "10px", color: "#9a8a78", marginTop: "2px" },
  scoreInput: { width: "100%", padding: "6px", background: "#fff", border: "1px solid #ddd6cc", borderRadius: "6px", color: "#2c2416", fontSize: "14px", outline: "none", textAlign: "center", fontFamily: "inherit" },
  submitBtn: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #c8956c, #b07848)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(180,110,60,0.2)" },
  flavorTags: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" },
  flavorTag: { background: "#e8f4fd", border: "1px solid #b5d4f4", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", color: "#185FA5", cursor: "pointer" },
  flavorTagSelected: { background: "#185FA5", border: "1px solid #185FA5", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", color: "#fff", cursor: "pointer" },
  notesBox: { background: "#faf7f4", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "14px", fontSize: "13px", color: "#7a6a5a", lineHeight: "1.7", whiteSpace: "pre-wrap" },
};

const EVENT_COLORS = {
  preheat:      { bg: "#EAF3DE", color: "#3B6D11", label: "Preheat" },
  start:        { bg: "#E1F5EE", color: "#0F6E56", label: "Start" },
  temp_change:  { bg: "#FAEEDA", color: "#854F0B", label: "Temp Change" },
  first_crack:  { bg: "#FAECE7", color: "#993C1D", label: "1st Crack" },
  second_crack: { bg: "#EEEDFE", color: "#3C3489", label: "2nd Crack" },
  cooling:      { bg: "#E6F1FB", color: "#185FA5", label: "Cooling" },
  other:        { bg: "#F1EFE8", color: "#5F5E5A", label: "Other" },
};

const FLAVOR_OPTIONS = [
  "Lemon", "Orange", "Peach", "Apricot", "Jasmine", "Floral",
  "Chocolate", "Caramel", "Nuts", "Brown Sugar", "Berry", "Blackcurrant",
  "Tomato", "Smoke", "Honey", "Apple", "Dark Chocolate", "Dried Fruit",
];

function secToDisplay(sec) {
  if (!sec && sec !== 0) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

function get(obj, key) {
  return obj[key.toUpperCase()] ?? obj[key.toLowerCase()];
}

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e0d5", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }}>
      <div style={{ color: "#9a8a78", marginBottom: "4px" }}>{secToDisplay(label)}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: "600" }}>
          {p.name}: {p.value}C
        </div>
      ))}
    </div>
  );
}

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session,  setSession]  = useState(null);
  const [events,   setEvents]   = useState([]);
  const [review,   setReview]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [savingReview, setSavingReview] = useState(false);

  // Review form state
  const [scores, setScores] = useState({ overall: "", aroma: "", acidity: "", body: "", sweetness: "" });
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [tastingNotes, setTastingNotes] = useState("");

  useEffect(() => {
    Promise.all([
      sessions.get(id),
      roastingEvents.get(id),
      reviewsApi.get(id),
    ]).then(([s, e, r]) => {
      setSession(s);
      setEvents(e || []);
      if (r && get(r, "review_id")) {
        setReview(r);
        setScores({
          overall:   get(r, "score_overall") || "",
          aroma:     get(r, "score_aroma") || "",
          acidity:   get(r, "score_acidity") || "",
          body:      get(r, "score_body") || "",
          sweetness: get(r, "score_sweetness") || "",
        });
        const fn = get(r, "flavor_notes");
        if (Array.isArray(fn)) setSelectedFlavors(fn);
        setTastingNotes(get(r, "tasting_notes") || "");
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Build chart data from events
  const chartData = events
    .filter(e => get(e, "set_temp_c"))
    .map(e => ({
      elapsed: get(e, "elapsed_sec") || 0,
      temp: Number(get(e, "set_temp_c")),
      event_type: get(e, "event_type"),
    }));

  // Reference lines for special events
  const refLines = events
    .filter(e => ["first_crack", "second_crack", "cooling"].includes(get(e, "event_type")))
    .map(e => ({
      elapsed: get(e, "elapsed_sec"),
      type: get(e, "event_type"),
    }));

  function toggleFlavor(flavor) {
    setSelectedFlavors(prev =>
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  }

  async function saveReview() {
    setSavingReview(true);
    try {
      const data = {
        score_overall:   scores.overall   ? Number(scores.overall)   : null,
        score_aroma:     scores.aroma     ? Number(scores.aroma)     : null,
        score_acidity:   scores.acidity   ? Number(scores.acidity)   : null,
        score_body:      scores.body      ? Number(scores.body)      : null,
        score_sweetness: scores.sweetness ? Number(scores.sweetness) : null,
        flavor_notes:    selectedFlavors,
        tasting_notes:   tastingNotes || null,
      };
      const saved = review && get(review, "review_id")
        ? await reviewsApi.update(id, data)
        : await reviewsApi.create(id, data);
      setReview(saved);
      alert("Review saved!");
    } catch (err) {
      alert("Failed to save review: " + err.message);
    } finally { setSavingReview(false); }
  }

  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#9a8a78" }}>Loading...</div>
    </div>
  );
  if (!session) return null;

  const lossRate = get(session, "input_weight_g") && get(session, "output_weight_g")
    ? (((get(session, "input_weight_g") - get(session, "output_weight_g")) / get(session, "input_weight_g")) * 100).toFixed(1)
    : null;

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.back}>Back</Link>
      </nav>

      <main style={s.main}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={s.beanName}>{get(session, "bean_name") || "Unknown Bean"}</div>
          <div style={s.metaRow}>
            {get(session, "roast_level") && <span style={s.badge}>{get(session, "roast_level")}</span>}
            <span style={s.metaText}>{formatDate(get(session, "roasted_at"))}</span>
            {get(session, "origin_country") && <span style={s.metaText}>{get(session, "origin_country")}</span>}
            {get(session, "process") && <span style={s.metaText}>{get(session, "process")}</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Roasting Data</div>
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={s.statVal}>{secToDisplay(get(session, "total_time_sec"))}</div>
              <div style={s.statLabel}>Total Time</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statVal}>
                {get(session, "input_weight_g") || "-"}
                <span style={s.statUnit}>g</span>
              </div>
              <div style={s.statLabel}>Input</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statVal}>
                {get(session, "output_weight_g") || "-"}
                <span style={s.statUnit}>g</span>
              </div>
              <div style={s.statLabel}>Output</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statVal}>
                {lossRate ? `${lossRate}` : "-"}
                {lossRate && <span style={s.statUnit}>%</span>}
              </div>
              <div style={s.statLabel}>Weight Loss</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statVal}>{secToDisplay(get(session, "first_crack_sec"))}</div>
              <div style={s.statLabel}>1st Crack</div>
            </div>
            <div style={s.statCard}>
              <div style={s.statVal}>{secToDisplay(get(session, "second_crack_sec"))}</div>
              <div style={s.statLabel}>Cooling Start</div>
            </div>
          </div>
        </div>

        {/* Temperature Profile Chart */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Temperature Profile</div>
          {chartData.length === 0 ? (
            <div style={{ textAlign: "center", color: "#b0a090", padding: "40px 0", fontSize: "13px" }}>
              No temperature data recorded
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis
                  dataKey="elapsed"
                  tickFormatter={secToDisplay}
                  stroke="#c8b8a8"
                  fontSize={11}
                  label={{ value: "Time", position: "insideBottom", offset: -10, fill: "#b0a090", fontSize: 11 }}
                />
                <YAxis stroke="#c8b8a8" fontSize={11} unit="C" />
                <Tooltip content={<CustomTooltip />} />
                {refLines.map((r, i) => {
                  const ec = EVENT_COLORS[r.type] || EVENT_COLORS.other;
                  return (
                    <ReferenceLine
                      key={i}
                      x={r.elapsed}
                      stroke={ec.color}
                      strokeDasharray="4 4"
                      label={{ value: ec.label, fill: ec.color, fontSize: 10, position: "top" }}
                    />
                  );
                })}
                <Line
                  type="monotone"
                  dataKey="temp"
                  name="Set Temp"
                  stroke="#c8956c"
                  strokeWidth={2.5}
                  dot={{ fill: "#c8956c", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Event list below chart */}
          {events.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              {events.map((e, i) => {
                const ec = EVENT_COLORS[get(e, "event_type")] || EVENT_COLORS.other;
                return (
                  <div key={i} style={{ ...s.eventItem, borderBottom: i === events.length - 1 ? "none" : "1px solid #f0ebe4" }}>
                    <span style={s.eventTime}>{secToDisplay(get(e, "elapsed_sec"))}</span>
                    <span style={{ ...s.eventTypeBadge, background: ec.bg, color: ec.color }}>{ec.label}</span>
                    <span style={s.eventNote}>
                      {get(e, "set_temp_c") ? `${get(e, "set_temp_c")}C` : ""}
                      {get(e, "set_temp_c") && get(e, "note") ? "  " : ""}
                      {get(e, "note") || ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cupping Review */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Cupping Review</div>

          {/* Scores */}
          <div style={s.scoreGrid}>
            {[
              { key: "overall",   label: "Overall" },
              { key: "aroma",     label: "Aroma" },
              { key: "acidity",   label: "Acidity" },
              { key: "body",      label: "Body" },
              { key: "sweetness", label: "Sweetness" },
            ].map(({ key, label }) => (
              <div key={key} style={s.scoreCard}>
                <div style={s.scoreVal}>{scores[key] || "-"}</div>
                <div style={s.scoreLabel}>{label}</div>
                <input
                  style={{ ...s.scoreInput, marginTop: "8px" }}
                  type="number"
                  min="1" max="10" step="0.5"
                  placeholder="-"
                  value={scores[key]}
                  onChange={e => setScores(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {/* Flavor Notes */}
          <label style={s.label}>Flavor Notes</label>
          <div style={s.flavorTags}>
            {FLAVOR_OPTIONS.map(f => (
              <span
                key={f}
                style={selectedFlavors.includes(f) ? s.flavorTagSelected : s.flavorTag}
                onClick={() => toggleFlavor(f)}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Tasting Notes */}
          <label style={s.label}>Tasting Notes</label>
          <textarea
            style={{ ...s.input, height: "80px", resize: "vertical" }}
            value={tastingNotes}
            onChange={e => setTastingNotes(e.target.value)}
            placeholder="Describe the flavor, aroma, aftertaste..."
          />

          <button style={s.submitBtn} onClick={saveReview} disabled={savingReview}>
            {savingReview ? "Saving..." : review && get(review, "review_id") ? "Update Review" : "Save Review"}
          </button>
        </div>

        {/* Notes */}
        {get(session, "notes") && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Notes</div>
            <div style={s.notesBox}>{get(session, "notes")}</div>
          </div>
        )}

      </main>
    </div>
  );
}
