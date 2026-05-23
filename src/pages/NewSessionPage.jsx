// src/pages/NewSessionPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beans as beansApi, sessions } from "../lib/api";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f7f5f2",
    color: "#2c2416",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  nav: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "20px 32px",
    background: "#fff",
    borderBottom: "1px solid #e8e0d5",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  back: { color: "#9a8a78", fontSize: "13px", textDecoration: "none" },
  navTitle: { fontSize: "16px", fontWeight: "600", color: "#2c2416" },
  main: { maxWidth: "660px", margin: "0 auto", padding: "32px 24px" },
  section: { marginBottom: "28px" },
  sectionTitle: {
    fontSize: "11px", fontWeight: "700", color: "#c8956c",
    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px",
  },
  label: {
    display: "block", fontSize: "12px", color: "#7a6a5a",
    marginBottom: "6px", fontWeight: "500",
  },
  input: {
    width: "100%", padding: "11px 14px",
    background: "#fff",
    border: "1px solid #ddd6cc",
    borderRadius: "10px", color: "#2c2416",
    fontSize: "14px", outline: "none",
    boxSizing: "border-box", marginBottom: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  select: {
    width: "100%", padding: "11px 14px",
    background: "#fff",
    border: "1px solid #ddd6cc",
    borderRadius: "10px", color: "#2c2416",
    fontSize: "14px", outline: "none",
    boxSizing: "border-box", marginBottom: "14px",
    fontFamily: "inherit",
  },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  card: {
    background: "#fff",
    border: "1px solid #e8e0d5",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  submitBtn: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #c8956c, #b07848)",
    border: "none", borderRadius: "12px",
    color: "#fff", fontSize: "15px",
    fontWeight: "700", cursor: "pointer", marginTop: "8px",
    boxShadow: "0 2px 8px rgba(180,110,60,0.25)",
  },
  error: {
    background: "#fff0ee", border: "1px solid #f5c5bb",
    borderRadius: "10px", color: "#c0392b",
    fontSize: "12px", padding: "10px 14px", marginBottom: "16px",
  },
  timerBox: {
    background: "#fff", border: "1px solid #e8e0d5",
    borderRadius: "14px", padding: "20px", marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  timerDisplay: {
    fontSize: "44px", fontFamily: "monospace", fontWeight: "700",
    color: "#c8956c", textAlign: "center", marginBottom: "14px",
    letterSpacing: "0.05em",
  },
  timerBtns: { display: "flex", gap: "8px", justifyContent: "center" },
  timerBtn: {
    padding: "8px 22px", borderRadius: "8px",
    border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  eventList: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" },
  eventRow: {
    display: "grid", gridTemplateColumns: "100px 1fr 1fr auto",
    gap: "8px", alignItems: "center",
    padding: "10px 12px",
    background: "#faf7f4",
    border: "1px solid #e8e0d5",
    borderRadius: "10px", fontSize: "12px",
  },
  eventInput: {
    padding: "6px 10px",
    background: "#fff", border: "1px solid #ddd6cc",
    borderRadius: "6px", color: "#2c2416",
    fontSize: "12px", outline: "none",
    width: "100%", fontFamily: "inherit",
  },
  deleteBtn: {
    background: "none", border: "none",
    color: "#bbb", cursor: "pointer", fontSize: "16px", padding: "0 4px",
  },
  addEventBtn: {
    background: "none",
    border: "1px dashed #c8956c",
    borderRadius: "8px", color: "#c8956c",
    fontSize: "12px", padding: "8px",
    cursor: "pointer", width: "100%", marginTop: "4px",
  },
};

const ROAST_LEVELS = [
  "Light Roast",
  "Cinnamon Roast",
  "Medium Roast",
  "High Roast",
  "City Roast",
  "Full City Roast",
  "French Roast",
  "Italian Roast",
];

function secToDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toSec(val) {
  if (!val) return null;
  const parts = String(val).split(":");
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  return Number(val) || null;
}

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [beanList, setBeanList] = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const [form, setForm] = useState({
    bean_id:          "",
    roasted_at:       new Date().toISOString().slice(0, 16),
    input_weight_g:   "",
    output_weight_g:  "",
    roast_level:      "City Roast",
    total_time_sec:   "",
    first_crack_sec:  "",
    second_crack_sec: "",
    notes:            "",
  });

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const [events, setEvents] = useState([
    { id: 1, time_input: "00:00", set_temp: "225", note: "Start" },
  ]);

  useEffect(() => {
    beansApi.list().then(setBeanList).catch(console.error);
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function addEvent() {
    setEvents(ev => [...ev, {
      id: Date.now(),
      time_input: secToDisplay(elapsed),
      set_temp: "",
      note: "",
    }]);
  }

  function updateEvent(id, key, val) {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, [key]: val } : e));
  }

  function deleteEvent(id) {
    setEvents(ev => ev.filter(e => e.id !== id));
  }

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function buildNotes(notes, evs) {
    const lines = evs
      .filter(e => e.set_temp)
      .map(e => `[${e.time_input}] ${e.set_temp}C${e.note ? " - " + e.note : ""}`)
      .join("\n");
    if (!lines) return notes;
    return (notes ? notes + "\n\n" : "") + "[Temperature Profile]\n" + lines;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.bean_id) { setError("Please select a bean"); return; }
    setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        input_weight_g:   form.input_weight_g  ? Number(form.input_weight_g)  : null,
        output_weight_g:  form.output_weight_g ? Number(form.output_weight_g) : null,
        total_time_sec:   toSec(form.total_time_sec) || (elapsed || null),
        first_crack_sec:  toSec(form.first_crack_sec),
        second_crack_sec: toSec(form.second_crack_sec),
        end_temp_c:       null,
        notes: buildNotes(form.notes, events),
      };
      const created = await sessions.create(payload);
      const sessionId = created.SESSION_ID || created.session_id;
      navigate(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={s.back}> Back</Link>
        <div style={s.navTitle}>New Roasting Session</div>
      </nav>

      <main style={s.main}>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* Bean */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Bean</div>
            <label style={s.label}>Bean *</label>
            <select style={s.select} value={form.bean_id}
              onChange={e => setF("bean_id", e.target.value)} required>
              <option value="">Select a bean</option>
              {beanList.map(b => (
                <option key={b.BEAN_ID || b.bean_id} value={b.BEAN_ID || b.bean_id}>
                  {b.NAME || b.name}
                  {(b.ORIGIN_COUNTRY || b.origin_country)
                    ? ` (${b.ORIGIN_COUNTRY || b.origin_country})` : ""}
                </option>
              ))}
            </select>
            <Link to="/beans/new" style={{ fontSize: "12px", color: "#c8956c" }}>
              + Register new bean
            </Link>
          </div>

          {/* Timer */}
          <div style={s.timerBox}>
            <div style={s.sectionTitle}>Timer</div>
            <div style={s.timerDisplay}>{secToDisplay(elapsed)}</div>
            <div style={s.timerBtns}>
              {!running
                ? <button type="button"
                    style={{ ...s.timerBtn, background: "#c8956c", color: "#fff" }}
                    onClick={() => setRunning(true)}>
                    Start
                  </button>
                : <button type="button"
                    style={{ ...s.timerBtn, background: "#e8e0d5", color: "#2c2416" }}
                    onClick={() => setRunning(false)}>
                    Pause
                  </button>
              }
              <button type="button"
                style={{ ...s.timerBtn, background: "#f0ebe4", color: "#9a8a78" }}
                onClick={() => { setRunning(false); setElapsed(0); }}>
                Reset
              </button>
            </div>
          </div>

          {/* Temperature Profile */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Temperature Profile (GeneCafe)</div>
            <div style={{ fontSize: "12px", color: "#9a8a78", marginBottom: "12px" }}>
              Enter the time manually or press "+ Add Event" to record the current timer time.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr auto",
              gap: "8px", padding: "4px 12px", fontSize: "10px", color: "#bbb",
              letterSpacing: "0.05em", textTransform: "uppercase" }}>
              <span>Time</span><span>Set Temp (C)</span><span>Note</span><span></span>
            </div>
            <div style={s.eventList}>
              {events.map(ev => (
                <div key={ev.id} style={s.eventRow}>
                  <input
                    style={s.eventInput}
                    type="text"
                    placeholder="MM:SS"
                    value={ev.time_input}
                    onChange={e => updateEvent(ev.id, "time_input", e.target.value)}
                  />
                  <input
                    style={s.eventInput}
                    type="number"
                    placeholder="e.g. 225"
                    value={ev.set_temp}
                    onChange={e => updateEvent(ev.id, "set_temp", e.target.value)}
                  />
                  <input
                    style={s.eventInput}
                    type="text"
                    placeholder="e.g. Water removed"
                    value={ev.note}
                    onChange={e => updateEvent(ev.id, "note", e.target.value)}
                  />
                  <button type="button" style={s.deleteBtn}
                    onClick={() => deleteEvent(ev.id)}></button>
                </div>
              ))}
            </div>
            <button type="button" style={s.addEventBtn} onClick={addEvent}>
              + Add Event (Current: {secToDisplay(elapsed)})
            </button>
          </div>

          {/* Roasting Conditions */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Roasting Conditions</div>
            <div style={s.row}>
              <div>
                <label style={s.label}>Date & Time</label>
                <input style={s.input} type="datetime-local" value={form.roasted_at}
                  onChange={e => setF("roasted_at", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>Roast Level</label>
                <select style={s.select} value={form.roast_level}
                  onChange={e => setF("roast_level", e.target.value)}>
                  {ROAST_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>Input Weight (g)</label>
                <input style={s.input} type="number" value={form.input_weight_g}
                  onChange={e => setF("input_weight_g", e.target.value)}
                  placeholder="e.g. 225" />
              </div>
              <div>
                <label style={s.label}>Output Weight (g)</label>
                <input style={s.input} type="number" value={form.output_weight_g}
                  onChange={e => setF("output_weight_g", e.target.value)}
                  placeholder="e.g. 190" />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>1st Crack (MM:SS)</label>
                <input style={s.input} type="text" value={form.first_crack_sec}
                  onChange={e => setF("first_crack_sec", e.target.value)}
                  placeholder="e.g. 11:00" />
              </div>
              <div>
                <label style={s.label}>Cooling Start (MM:SS)</label>
                <input style={s.input} type="text" value={form.second_crack_sec}
                  onChange={e => setF("second_crack_sec", e.target.value)}
                  placeholder="e.g. 13:30" />
              </div>
            </div>
            <div>
              <label style={s.label}>Total Time (auto from timer, or enter manually)</label>
              <input style={s.input} type="text"
                value={form.total_time_sec || secToDisplay(elapsed)}
                onChange={e => setF("total_time_sec", e.target.value)}
                placeholder="e.g. 13:30" />
            </div>
          </div>

          {/* Notes */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Notes</div>
            <textarea
              style={{ ...s.input, height: "90px", resize: "vertical", marginBottom: 0 }}
              value={form.notes}
              onChange={e => setF("notes", e.target.value)}
              placeholder="Room temp, humidity, observations..." />
          </div>

          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Roasting Session"}
          </button>
        </form>
      </main>
    </div>
  );
}
