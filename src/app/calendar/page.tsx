"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const TYPE_CONFIG = {
  attack:  { label:"パニック発作", color:"#e07070", bg:"#fde8e8", icon:"⚡" },
  anxiety: { label:"予期不安",     color:"#d4a843", bg:"#fef3cd", icon:"😰" },
  hospital:{ label:"クリニック受診",color:"#7bbf8c", bg:"#d4edda", icon:"🏥" },
  good:    { label:"よかったこと",  color:"#4a9060", bg:"#d4edda", icon:"🌟" },
  med:     { label:"薬変更",       color:"#9b7ec8", bg:"#ede7f6", icon:"💊" },
  other:   { label:"その他",       color:"#7a9ab5", bg:"#e8f0f7", icon:"📌" },
};

type EventType = keyof typeof TYPE_CONFIG;
interface CalEvent { id: string; type: EventType; label: string; date: string; }

export default function CalendarPage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [events, setEvents] = useState<Record<string, CalEvent[]>>({});
  const [selected, setSelected] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<EventType>("attack");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [editType, setEditType] = useState<EventType>("attack");
  const [editLabel, setEditLabel] = useState("");

  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dayNames = ["日","月","火","水","木","金","土"];

  const prevMonth = () => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); };
  const nextMonth = () => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      setSelected(todayStr);
      await loadEvents(user.uid, monthStr);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (uid) loadEvents(uid, monthStr);
  }, [viewDate]);

  const loadEvents = async (userId: string, ms: string) => {
    const q = query(
      collection(db, "calEvents"),
      where("uid", "==", userId),
      where("date", ">=", `${ms}-01`),
      where("date", "<=", `${ms}-31`)
    );
    const snap = await getDocs(q);
    const map: Record<string, CalEvent[]> = {};
    snap.forEach(d => {
      const ev = { ...d.data(), id: d.id } as CalEvent;
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    setEvents(map);
  };

  const handleAdd = async () => {
    if (!uid || !selected) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "calEvents"), {
        uid, type: newType,
        label: newLabel || TYPE_CONFIG[newType].label,
        date: selected, createdAt: serverTimestamp(),
      });
      await loadEvents(uid, monthStr);
      setShowAdd(false);
      setNewLabel("");
    } finally { setLoading(false); }
  };

  const handleDelete = async (ev: CalEvent) => {
    if (!confirm("この記録を削除しますか？")) return;
    await deleteDoc(doc(db, "calEvents", ev.id));
    await loadEvents(uid, monthStr);
  };

  const openEdit = (ev: CalEvent) => {
    setEditEvent(ev);
    setEditType(ev.type);
    setEditLabel(ev.label);
  };

  const handleEdit = async () => {
    if (!editEvent) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "calEvents", editEvent.id), {
        type: editType,
        label: editLabel || TYPE_CONFIG[editType].label,
      });
      await loadEvents(uid, monthStr);
      setEditEvent(null);
    } finally { setLoading(false); }
  };

  const dk = (d: number) => `${monthStr}-${String(d).padStart(2, "0")}`;

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>📅 カレンダー</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ margin:"12px 16px", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <button onClick={prevMonth} style={{ background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:8, padding:"4px 10px", fontSize:16, cursor:"pointer" }}>‹</button>
          <span style={{ fontSize:14, fontWeight:700, color:"#4a9060" }}>{year}年 {monthNames[month]}</span>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={nextMonth} style={{ background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:8, padding:"4px 10px", fontSize:16, cursor:"pointer" }}>›</button>
            <button onClick={() => setShowAdd(true)} style={{ background:"#5ba872", color:"#fff", border:"none", borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer" }}>＋ 記録</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {dayNames.map((d, i) => (
            <div key={d} style={{ textAlign:"center", fontSize:11, color:i===0?"#e07070":i===6?"#5b8fcc":"#5a7a65", padding:"4px 0", fontWeight:600 }}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => <div key={"e"+i}/>)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const d = i + 1;
            const key = dk(d);
            const evts = events[key] || [];
            const isSel = selected === key;
            const isToday = key === todayStr;
            return (
              <div key={d} onClick={() => setSelected(key)}
                style={{ textAlign:"center", padding:"4px 2px", borderRadius:8, cursor:"pointer", background:isSel?"#5ba872":isToday?"#d4edda":"transparent", border:isToday&&!isSel?"1.5px solid #7bbf8c":"none" }}>
                <div style={{ fontSize:13, fontWeight:isToday?700:400, color:isSel?"#fff":isToday?"#4a9060":"#2d4a38" }}>{d}</div>
                <div style={{ display:"flex", justifyContent:"center", gap:1, marginTop:2 }}>
                  {evts.map((ev, j) => (
                    <div key={j} style={{ width:6, height:6, borderRadius:"50%", background:TYPE_CONFIG[ev.type]?.color || "#7bbf8c" }}/>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div style={{ margin:"12px 16px", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#4a9060", marginBottom:12 }}>
            📝 {selected.slice(5).replace("-", "/")} の記録
          </div>
          {(events[selected] || []).length === 0 ? (
            <p style={{ color:"#8aaa95", fontSize:13, textAlign:"center", margin:0 }}>記録なし</p>
          ) : (
            (events[selected] || []).map((ev) => {
              const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.other;
              return (
                <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:10, background:cfg.bg, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>{cfg.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:cfg.color }}>{cfg.label}</div>
                    <div style={{ fontSize:12, color:"#5a7a65" }}>{ev.label}</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => openEdit(ev)}
                      style={{ background:"rgba(255,255,255,0.7)", border:"none", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer", color:"#5a7a65" }}>
                      編集
                    </button>
                    <button onClick={() => handleDelete(ev)}
                      style={{ background:"rgba(255,255,255,0.7)", border:"none", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer", color:"#e07070" }}>
                      削除
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 追加モーダル */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:16 }}>📝 記録を追加</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {(Object.entries(TYPE_CONFIG) as [EventType, typeof TYPE_CONFIG[EventType]][]).map(([k, v]) => (
                <button key={k} onClick={() => setNewType(k)}
                  style={{ background:newType===k?v.bg:"#e8f5ec", border:newType===k?`2px solid ${v.color}`:"2px solid transparent", borderRadius:10, padding:"8px 12px", cursor:"pointer", fontSize:13, color:"#2d4a38", textAlign:"left" }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <input placeholder="メモ（任意）" value={newLabel} onChange={e => setNewLabel(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:12 }}/>
            <button onClick={handleAdd} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "保存中…" : "保存する"}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:16 }}>✏️ 記録を編集</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {(Object.entries(TYPE_CONFIG) as [EventType, typeof TYPE_CONFIG[EventType]][]).map(([k, v]) => (
                <button key={k} onClick={() => setEditType(k)}
                  style={{ background:editType===k?v.bg:"#e8f5ec", border:editType===k?`2px solid ${v.color}`:"2px solid transparent", borderRadius:10, padding:"8px 12px", cursor:"pointer", fontSize:13, color:"#2d4a38", textAlign:"left" }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <input placeholder="メモ（任意）" value={editLabel} onChange={e => setEditLabel(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:12 }}/>
            <button onClick={handleEdit} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "保存中…" : "保存する"}
            </button>
            <button onClick={() => setEditEvent(null)}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
