// src/pages/NewSessionPage.jsx
// ジェネカフェ対応 焙煎記録フォーム

import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { beans as beansApi, sessions, tempProfile as tempProfileApi } from "../lib/api";

const s = {
  page: { minHeight: "100vh", background: "#0f0f0f", color: "#fff", fontFamily: "'Noto Sans JP', sans-serif" },
  nav: { display: "flex", alignItems: "center", gap: "16px", padding: "20px 32px", borderBottom: "1px solid #1e1e1e" },
  back: { color: "#666", fontSize: "13px", textDecoration: "none" },
  navTitle: { fontSize: "16px", fontWeight: "600" },
  main: { maxWidth: "680px", margin: "0 auto", padding: "40px 32px" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "12px", fontWeight: "500", color: "#e8a87c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", color: "#888", marginBottom: "6px", fontWeight: "500" },
  input: { width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "16px", fontFamily: "inherit" },
  select: { width: "100%", padding: "12px 16px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "16px", fontFamily: "inherit" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #e8a87c, #d4813a)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "8px" },
  error: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#fca5a5", fontSize: "12px", padding: "10px 14px", marginBottom: "16px" },
  timerBox: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "16px", marginBottom: "16px" },
  timerDisplay: { fontSize: "40px", fontFamily: "monospace", fontWeight: "700", color: "#e8a87c", textAlign: "center", marginBottom: "12px" },
  timerBtns: { display: "flex", gap: "8px", justifyContent: "center" },
  timerBtn: { padding: "8px 20px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  eventList: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" },
  eventRow: { display: "grid", gridTemplateColumns: "80px 1fr 1fr auto", gap: "8px", alignItems: "center", padding: "10px 12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px", fontSize: "12px" },
  eventTime: { color: "#e8a87c", fontFamily: "monospace", fontWeight: "600" },
  eventInput: { padding: "6px 10px", background: "#111", border: "1px solid #333", borderRadius: "6px", color: "#fff", fontSize: "12px", outline: "none", width: "100%", fontFamily: "inherit" },
  deleteBtn: { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", padding: "0 4px" },
  addEventBtn: { background: "none", border: "1px dashed #333", borderRadius: "8px", color: "#666", fontSize: "12px", padding: "8px", cursor: "pointer", width: "100%", marginTop: "4px" },
  logList: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px", maxHeight: "200px", overflowY: "auto" },
  logRow: { display: "grid", gridTemplateColumns: "60px 1fr 1fr auto", gap: "8px", alignItems: "center", padding: "8px 10px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", fontSize: "12px" },
  logTime: { color: "#888", fontFamily: "monospace", fontSize: "11px" },
  addLogBtn: { background: "linear-gradient(135deg,#1a3a2a,#0f2a1a)", border: "1px solid #2a4a3a", borderRadius: "8px", color: "#5dcaa5", fontSize: "12px", padding: "8px 16px", cursor: "pointer", fontWeight: "600" },
};

const ROAST_LEVELS = ["極浅煎り", "浅煎り", "中浅煎り", "中煎り", "中深煎り", "深煎り", "極深煎り"];

function secToDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function toSec(val) {
  if (!val) return null;
  const parts = String(val).split(":");
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  return Number(val);
}

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [beanList, setBeanList] = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    bean_id: "", roasted_at: new Date().toISOString().slice(0,16),
    input_weight_g: "", output_weight_g: "", roast_level: "中煎り",
    total_time_sec: "", first_crack_sec: "", second_crack_sec: "",
    end_temp_c: "", notes: "",
  });
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const [events, setEvents] = useState([
    { id: 1, elapsed_sec: 0, set_temp: "225", note: "スタート" },
  ]);
  const [tempLogs, setTempLogs] = useState([]);
  const [logInput, setLogInput] = useState({ bean_temp: "", env_temp: "" });

  useEffect(() => { beansApi.list().then(setBeanList).catch(console.error); }, []);

  useEffect(() => {
    if (running) { timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function startTimer() { setRunning(true); }
  function stopTimer()  { setRunning(false); }
  function resetTimer() {
    setRunning(false); setElapsed(0); setTempLogs([]);
    setEvents([{ id: 1, elapsed_sec: 0, set_temp: "225", note: "スタート" }]);
  }
  function addEvent() {
    setEvents(ev => [...ev, { id: Date.now(), elapsed_sec: elapsed, set_temp: "", note: "" }]);
  }
  function updateEvent(id, key, val) {
    setEvents(ev => ev.map(e => e.id === id ? { ...e, [key]: val } : e));
  }
  function deleteEvent(id) { setEvents(ev => ev.filter(e => e.id !== id)); }
  function addTempLog() {
    setTempLogs(logs => [...logs, {
      elapsed_sec: elapsed,
      bean_temp_c: logInput.bean_temp ? Number(logInput.bean_temp) : null,
      env_temp_c:  logInput.env_temp  ? Number(logInput.env_temp)  : null,
      ror: null,
    }]);
    setLogInput({ bean_temp: "", env_temp: "" });
  }
  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function buildNotes(notes, evs) {
    const profileText = evs.filter(e => e.set_temp)
      .map(e => `[${secToDisplay(e.elapsed_sec)}] ${e.set_temp}${e.note ? " - " + e.note : ""}`)
      .join("\n");
    if (!profileText) return notes;
    return (notes ? notes + "\n\n" : "") + "【温度プロファイル】\n" + profileText;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.bean_id) { setError("豆を選択してください"); return; }
    setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        input_weight_g:  form.input_weight_g  ? Number(form.input_weight_g)  : null,
        output_weight_g: form.output_weight_g ? Number(form.output_weight_g) : null,
        end_temp_c:      form.end_temp_c      ? Number(form.end_temp_c)      : null,
        total_time_sec:  toSec(form.total_time_sec) || (elapsed || null),
        first_crack_sec: toSec(form.first_crack_sec),
        second_crack_sec: toSec(form.second_crack_sec),
        notes: buildNotes(form.notes, events),
      };
      const created = await sessions.create(payload);
      const sessionId = created.SESSION_ID || created.session_id;
      if (tempLogs.length > 0) await tempProfileApi.bulkInsert(sessionId, tempLogs);
      navigate(`/sessions/${sessionId}`);
    } catch (err) {
      setError(err.message || "保存に失敗しました");
    } finally { setLoading(false); }
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

          {/* 豆 */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🫘 豆の情報</div>
            <label style={s.label}>使用した豆 *</label>
            <select style={s.select} value={form.bean_id} onChange={e => setF("bean_id", e.target.value)} required>
              <option value="">豆を選択してください</option>
              {beanList.map(b => (
                <option key={b.BEAN_ID || b.bean_id} value={b.BEAN_ID || b.bean_id}>
                  {b.NAME || b.name}{(b.ORIGIN_COUNTRY || b.origin_country) ? ` (${b.ORIGIN_COUNTRY || b.origin_country})` : ""}
                </option>
              ))}
            </select>
            <Link to="/beans/new" style={{ fontSize: "12px", color: "#e8a87c" }}>+ 新しい豆を登録する</Link>
          </div>

          {/* タイマー */}
          <div style={s.section}>
            <div style={s.sectionTitle}>⏱️ 焙煎タイマー</div>
            <div style={s.timerBox}>
              <div style={s.timerDisplay}>{secToDisplay(elapsed)}</div>
              <div style={s.timerBtns}>
                {!running
                  ? <button type="button" style={{ ...s.timerBtn, background: "#e8a87c", color: "#000" }} onClick={startTimer}>▶ スタート</button>
                  : <button type="button" style={{ ...s.timerBtn, background: "#333", color: "#fff" }} onClick={stopTimer}>⏸ 一時停止</button>
                }
                <button type="button" style={{ ...s.timerBtn, background: "#222", color: "#888" }} onClick={resetTimer}>↩ リセット</button>
              </div>
            </div>
          </div>

          {/* 温度変更プロファイル */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🌡️ 温度変更プロファイル</div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>温度を変更したタイミングで「+ イベントを記録」を押してください</div>
            <div style={s.eventList}>
              {events.map(ev => (
                <div key={ev.id} style={s.eventRow}>
                  <div style={s.eventTime}>{secToDisplay(ev.elapsed_sec)}</div>
                  <input style={s.eventInput} type="number" placeholder="設定温度(℃)"
                    value={ev.set_temp} onChange={e => updateEvent(ev.id, "set_temp", e.target.value)} />
                  <input style={s.eventInput} type="text" placeholder="メモ（例:水抜き終了）"
                    value={ev.note} onChange={e => updateEvent(ev.id, "note", e.target.value)} />
                  <button type="button" style={s.deleteBtn} onClick={() => deleteEvent(ev.id)}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" style={s.addEventBtn} onClick={addEvent}>
              + イベントを記録（現在: {secToDisplay(elapsed)}）
            </button>
          </div>

          {/* 1分ごと温度ログ */}
          <div style={s.section}>
            <div style={s.sectionTitle}>📊 温度ログ（任意）</div>
            {tempLogs.length > 0 && (
              <div style={s.logList}>
                {tempLogs.map((log, i) => (
                  <div key={i} style={s.logRow}>
                    <div style={s.logTime}>{secToDisplay(log.elapsed_sec)}</div>
                    <div>{log.bean_temp_c ?? "—"} ℃</div>
                    <div>{log.env_temp_c  ?? "—"} ℃</div>
                    <button type="button" style={s.deleteBtn} onClick={() => setTempLogs(l => l.filter((_,j) => j!==i))}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>豆温度 (℃)</label>
                <input style={{ ...s.input, marginBottom: 0 }} type="number" value={logInput.bean_temp}
                  placeholder="例: 185" onChange={e => setLogInput(l => ({ ...l, bean_temp: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>環境温度 (℃)</label>
                <input style={{ ...s.input, marginBottom: 0 }} type="number" value={logInput.env_temp}
                  placeholder="例: 230" onChange={e => setLogInput(l => ({ ...l, env_temp: e.target.value }))} />
              </div>
              <button type="button" style={{ ...s.addLogBtn, marginBottom: 0 }} onClick={addTempLog}>
                記録 ({secToDisplay(elapsed)})
              </button>
            </div>
          </div>

          {/* 焙煎条件 */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🔥 焙煎条件</div>
            <div style={s.row}>
              <div>
                <label style={s.label}>焙煎日時</label>
                <input style={s.input} type="datetime-local" value={form.roasted_at} onChange={e => setF("roasted_at", e.target.value)} />
              </div>
              <div>
                <label style={s.label}>焙煎度</label>
                <select style={s.select} value={form.roast_level} onChange={e => setF("roast_level", e.target.value)}>
                  {ROAST_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>投入量 (g)</label>
                <input style={s.input} type="number" value={form.input_weight_g} onChange={e => setF("input_weight_g", e.target.value)} placeholder="例: 225" />
              </div>
              <div>
                <label style={s.label}>仕上がり量 (g)</label>
                <input style={s.input} type="number" value={form.output_weight_g} onChange={e => setF("output_weight_g", e.target.value)} placeholder="例: 190" />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>1ハゼ（分:秒）</label>
                <input style={s.input} type="text" value={form.first_crack_sec} onChange={e => setF("first_crack_sec", e.target.value)} placeholder="例: 11:00" />
              </div>
              <div>
                <label style={s.label}>冷却開始（分:秒）</label>
                <input style={s.input} type="text" value={form.second_crack_sec} onChange={e => setF("second_crack_sec", e.target.value)} placeholder="例: 13:30" />
              </div>
            </div>
            <div style={s.row}>
              <div>
                <label style={s.label}>排出温度 (℃)</label>
                <input style={s.input} type="number" value={form.end_temp_c} onChange={e => setF("end_temp_c", e.target.value)} placeholder="例: 235" />
              </div>
              <div>
                <label style={s.label}>合計時間（タイマー停止後に自動入力）</label>
                <input style={s.input} type="text" value={form.total_time_sec || secToDisplay(elapsed)}
                  onChange={e => setF("total_time_sec", e.target.value)} placeholder="例: 13:30" />
              </div>
            </div>
          </div>

          {/* メモ */}
          <div style={s.section}>
            <div style={s.sectionTitle}>📝 メモ</div>
            <textarea style={{ ...s.input, height: "80px", resize: "vertical" }}
              value={form.notes} onChange={e => setF("notes", e.target.value)}
              placeholder="室温・湿度・チャフの量・豆の色など" />
          </div>

          <button style={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "保存中..." : "焙煎記録を保存"}
          </button>
        </form>
      </main>
    </div>
  );
}
