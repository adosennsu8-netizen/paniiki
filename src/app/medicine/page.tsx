"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { requestNotificationPermission } from "@/lib/messaging";

interface Alarm { id: string; time: string; label: string; enabled: boolean; }

const today = () => new Date().toISOString().slice(0, 10);
const getDaysInMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};
const getFirstDay = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();

export default function MedicinePage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [taken, setTaken] = useState<{date: string; alarmId: string}[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("08:00");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      await loadAlarms(user.uid);
      await loadTaken(user.uid);
      setNotifEnabled(Notification.permission === "granted");
    });
    return () => unsub();
  }, []);

  // アラームチェック（1分ごと）
  useEffect(() => {
    if (!notifEnabled || alarms.length === 0) return;
    const check = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
      const todayStr = today();
      alarms.forEach(alarm => {
        if (!alarm.enabled) return;
        if (alarm.time !== currentTime) return;
        const alreadyTaken = taken.some(t => t.date === todayStr && t.alarmId === alarm.id);
        if (alreadyTaken) return;
        new Notification("💊 薬の時間です", {
          body: alarm.label || "薬を飲みましょう",
          icon: "/icons/icon-192.svg",
        });
      });
    };
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [notifEnabled, alarms, taken]);

  const handleEnableNotification = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotifEnabled(true);
      alert("通知を有効にしました！アラーム時刻に通知が届きます。");
    } else {
      alert("通知の許可が必要です。ブラウザの設定から許可してください。");
    }
  };

  const loadAlarms = async (userId: string) => {
    const snap = await getDocs(collection(db, "users", userId, "alarms"));
    const list: Alarm[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Alarm));
    list.sort((a, b) => a.time.localeCompare(b.time));
    setAlarms(list);
  };

  const loadTaken = async (userId: string) => {
    const snap = await getDocs(collection(db, "users", userId, "takenRecords"));
    const list: {date: string; alarmId: string}[] = [];
    snap.forEach(d => list.push(d.data() as {date: string; alarmId: string}));
    setTaken(list);
  };

  const handleAddAlarm = async () => {
    if (alarms.length >= 4) { alert("アラームは最大4つまでです"); return; }
    if (!newTime) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "users", uid, "alarms"), {
        time: newTime,
        label: newLabel || "薬の時間",
        enabled: true,
        createdAt: serverTimestamp(),
      });
      await loadAlarms(uid);
      setShowAdd(false);
      setNewTime("08:00");
      setNewLabel("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlarm = async (alarmId: string) => {
    await deleteDoc(doc(db, "users", uid, "alarms", alarmId));
    await loadAlarms(uid);
  };

  const handleToggleAlarm = async (alarm: Alarm) => {
    await setDoc(doc(db, "users", uid, "alarms", alarm.id), {
      ...alarm, enabled: !alarm.enabled,
    });
    await loadAlarms(uid);
  };

  const handleTake = async (alarmId: string) => {
    const dateStr = today();
    const already = taken.some(t => t.date === dateStr && t.alarmId === alarmId);
    if (already) return;
    await addDoc(collection(db, "users", uid, "takenRecords"), {
      date: dateStr, alarmId, createdAt: serverTimestamp(),
    });
    await loadTaken(uid);
  };

  const isTakenToday = (alarmId: string) => taken.some(t => t.date === today() && t.alarmId === alarmId);
  const isTakenDate = (dateStr: string) => {
    if (alarms.length === 0) return false;
    return alarms.every(a => taken.some(t => t.date === dateStr && t.alarmId === a.id));
  };
  const isPartialDate = (dateStr: string) => {
    if (alarms.length === 0) return false;
    return alarms.some(a => taken.some(t => t.date === dateStr && t.alarmId === a.id)) && !isTakenDate(dateStr);
  };

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dayNames = ["日","月","火","水","木","金","土"];
  const daysInMonth = getDaysInMonth();
  const firstDay = getFirstDay();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const dk = (d: number) => `${monthStr}-${String(d).padStart(2, "0")}`;

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", paddingBottom:80 }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>💊 薬の管理</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      {/* 通知設定 */}
      <div style={{ margin:"12px 16px 0" }}>
        {notifEnabled ? (
          <div style={{ background:"#d4edda", borderRadius:12, padding:"10px 14px", border:"1px solid #7bbf8c" }}>
            <div style={{ fontSize:12, color:"#4a9060" }}>🔔 通知が有効です。アプリを開いている間、アラーム時刻に通知が届きます。</div>
          </div>
        ) : (
          <div style={{ background:"#fde8e8", borderRadius:12, padding:"12px 14px", border:"1px solid #e07070", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ fontSize:12, color:"#e07070", lineHeight:1.7 }}>🔔 通知が無効です。</div>
            <button onClick={handleEnableNotification}
              style={{ background:"#5ba872", color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer", flexShrink:0 }}>
              有効にする
            </button>
          </div>
        )}
        <div style={{ background:"#fef3cd", borderRadius:12, padding:"10px 14px", marginTop:8, border:"1px solid #c9963a" }}>
          <div style={{ fontSize:12, color:"#c9963a", lineHeight:1.8 }}>
            ⚠️ 通知はアプリを開いている間のみ届きます。確実な飲み忘れ防止のために、スマホの標準アラームとの併用をおすすめします。
          </div>
        </div>
      </div>

      {/* 今日の薬 */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#4a9060" }}>💊 今日の薬</div>
          {alarms.length < 4 && (
            <button onClick={() => setShowAdd(true)}
              style={{ background:"#5ba872", color:"#fff", border:"none", borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer" }}>
              ＋ アラーム追加
            </button>
          )}
        </div>

        {alarms.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:"#8aaa95", fontSize:13 }}>
            アラームを追加してください（最大4つ）
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} style={{ display:"flex", alignItems:"center", gap:12, background:isTakenToday(alarm.id)?"#d4edda":"#e8f5ec", borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1.5px solid ${isTakenToday(alarm.id)?"#7bbf8c":"#c8e6d0"}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:18, fontWeight:800, color:"#2d4a38" }}>{alarm.time}</div>
                <div style={{ fontSize:12, color:"#5a7a65" }}>{alarm.label}</div>
              </div>
              <div onClick={() => handleToggleAlarm(alarm)} style={{ width:40, height:22, borderRadius:11, background:alarm.enabled?"#5ba872":"#c8e6d0", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:alarm.enabled?20:2, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
              </div>
              <button onClick={() => handleTake(alarm.id)}
                style={{ background:isTakenToday(alarm.id)?"#5ba872":"#fff", color:isTakenToday(alarm.id)?"#fff":"#5a7a65", border:`1.5px solid ${isTakenToday(alarm.id)?"#5ba872":"#c8e6d0"}`, borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                {isTakenToday(alarm.id) ? "✓ 飲んだ" : "飲んだ"}
              </button>
              <button onClick={() => handleDeleteAlarm(alarm.id)}
                style={{ background:"none", color:"#c8e6d0", border:"none", fontSize:18, cursor:"pointer", padding:"0 4px" }}>×</button>
            </div>
          ))
        )}
        {alarms.length >= 4 && (
          <div style={{ fontSize:11, color:"#8aaa95", textAlign:"center", marginTop:4 }}>アラームは最大4つまでです</div>
        )}
      </div>

      {/* カレンダー */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#4a9060", marginBottom:12 }}>
          📅 {year}年 {monthNames[month]} — 服薬記録
        </div>
        <div style={{ display:"flex", gap:12, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#5a7a65" }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:"#5ba872" }}/> すべて飲んだ
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#5a7a65" }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:"#fde8a0" }}/> 一部飲んだ
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
            const isToday = key === today();
            const takenAll = isTakenDate(key);
            const partial = isPartialDate(key);
            return (
              <div key={d}
                style={{ textAlign:"center", padding:"6px 2px", borderRadius:8, background:takenAll?"#5ba872":partial?"#fde8a0":isToday?"#e8f5ec":"transparent", border:isToday?"1.5px solid #7bbf8c":"none" }}>
                <div style={{ fontSize:13, fontWeight:isToday?700:400, color:takenAll?"#fff":partial?"#c9963a":isToday?"#4a9060":"#2d4a38" }}>{d}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* アラーム追加モーダル */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:16 }}>⏰ アラームを追加</div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>時間</div>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:18, background:"#e8f5ec", outline:"none", boxSizing:"border-box", fontWeight:700 }}/>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>ラベル（任意）</div>
              <input placeholder="例：朝の薬、就寝前" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}/>
            </div>
            <button onClick={handleAddAlarm} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "追加中…" : "追加する"}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}