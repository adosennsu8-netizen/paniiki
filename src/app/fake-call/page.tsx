"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CALLERS = [
  { name:"田中 幸子", sub:"携帯電話", icon:"👩", label:"女性の名前" },
  { name:"鈴木 健太", sub:"携帯電話", icon:"👨", label:"男性の名前" },
  { name:"株式会社 山田商事", sub:"会社・代表番号", icon:"🏢", label:"会社名" },
];

function FadeOutMessage() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10001, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", pointerEvents:"none" }}>
      <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"24px 28px", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>👆</div>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:8 }}>右上をタップで解除</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.7 }}>画面中央をタップすると<br/>偽の着信が始まります</div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:12 }}>（このメッセージは自動で消えます）</div>
      </div>
    </div>
  );
}

export default function FakeCallPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"setup"|"black"|"ringing"|"calling">("setup");
  const [callerIndex, setCallerIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vibrateRef = useRef<NodeJS.Timeout | null>(null);
  const caller = CALLERS[callerIndex];

  useEffect(() => {
    if (mode === "calling") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  useEffect(() => {
    if (mode === "ringing") {
      const vibrate = () => { if (navigator.vibrate) navigator.vibrate([500, 500, 500]); };
      vibrate();
      vibrateRef.current = setInterval(vibrate, 1500);
    } else {
      if (vibrateRef.current) clearInterval(vibrateRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    }
    return () => { if (vibrateRef.current) clearInterval(vibrateRef.current); };
  }, [mode]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

  // ── 設定画面 ──
  if (mode === "setup") return (
    <div style={{ minHeight:"100vh", background:"#1a1a2e", display:"flex", flexDirection:"column", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>📵 偽電話設定</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"rgba(255,255,255,0.7)", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>
      <div style={{ flex:1, padding:"0 20px 40px" }}>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 16px", marginBottom:24 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
            会議や外出先で体調が不安定な時に使用します。スタートを押すと画面が真っ黒になり、タップすると偽の着信が鳴ります。
          </div>
        </div>
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:12 }}>着信者を選択</div>
          {CALLERS.map((c, i) => (
            <div key={i} onClick={() => setCallerIndex(i)}
              style={{ display:"flex", alignItems:"center", gap:14, background:callerIndex===i?"rgba(91,168,114,0.25)":"rgba(255,255,255,0.06)", border:`1.5px solid ${callerIndex===i?"#5ba872":"transparent"}`, borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#48484a,#636366)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"#fff", fontSize:15, fontWeight:600 }}>{c.name}</div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginTop:2 }}>{c.label} · {c.sub}</div>
              </div>
              <div style={{ width:22, height:22, borderRadius:"50%", background:callerIndex===i?"#5ba872":"rgba(255,255,255,0.1)", border:`2px solid ${callerIndex===i?"#5ba872":"rgba(255,255,255,0.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {callerIndex===i && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"16px", marginBottom:24, textAlign:"center" }}>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:10 }}>着信プレビュー</div>
          <div style={{ fontSize:36, marginBottom:6 }}>{caller.icon}</div>
          <div style={{ color:"#fff", fontSize:18, fontWeight:300 }}>{caller.name}</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:4 }}>{caller.sub}</div>
        </div>
        <button onClick={() => setMode("black")}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer", letterSpacing:"0.05em" }}>
          偽電話モードを開始する
        </button>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textAlign:"center", marginTop:10, lineHeight:1.7 }}>
          開始後は画面が真っ黒になります。<br/>画面中央をタップすると偽の着信が始まります。<br/>右上の見えないボタンで解除できます。
        </div>
      </div>
    </div>
  );

  // ── 真っ黒画面 ──
  if (mode === "black") return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:9999 }}>
      <FadeOutMessage/>
      <button onClick={() => setMode("ringing")}
        style={{ position:"absolute", inset:0, background:"transparent", border:"none", cursor:"pointer", width:"100%", height:"100%" }}/>
      <button onClick={() => setMode("setup")}
        style={{ position:"absolute", top:0, right:0, width:80, height:80, background:"transparent", border:"none", cursor:"pointer", zIndex:10000 }}/>
    </div>
  );

  // ── 着信画面（iPhone風） ──
  if (mode === "ringing") return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:"-apple-system,'Hiragino Sans',sans-serif", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#1c1c1e 0%,#2c2c2e 40%,#1c1c1e 100%)" }}/>
      <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px 0" }}>
        <div style={{ color:"#fff", fontSize:15, fontWeight:600 }}>{timeStr}</div>
        <div style={{ color:"#fff", fontSize:12 }}>🔋</div>
      </div>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:48 }}>
        <div style={{ width:120, height:120, borderRadius:"50%", background:"linear-gradient(135deg,#48484a,#636366)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, marginBottom:20, boxShadow:"0 0 0 4px rgba(255,255,255,0.15)" }}>
          {caller.icon}
        </div>
        <div style={{ color:"#fff", fontSize:32, fontWeight:300, letterSpacing:"-0.5px", marginBottom:6, textAlign:"center", padding:"0 24px" }}>{caller.name}</div>
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:16, marginBottom:6 }}>{caller.sub}</div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:14, animation:"blink 1.5s infinite" }}>着信中…</div>
      </div>
      <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"center", gap:32, marginTop:40, padding:"0 32px" }}>
        {[{ icon:"🔔", label:"リマインダー" },{ icon:"💬", label:"メッセージ" }].map(b => (
          <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{b.icon}</div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>{b.label}</div>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:60, left:0, right:0, zIndex:1, display:"flex", justifyContent:"space-around", padding:"0 40px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <button onClick={() => setMode("black")}
            style={{ width:76, height:76, borderRadius:"50%", background:"#ff3b30", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 20.5C4 17 8.5 13 16 13C23.5 13 28 17 28 20.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="6" y1="26" x2="26" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:14 }}>拒否</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <button onClick={() => setMode("calling")}
            style={{ width:76, height:76, borderRadius:"50%", background:"#34c759", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 11C6 15 10 20 16 20C22 20 26 15 26 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:14 }}>応答</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );

  // ── 通話中画面（iPhone風） ──
  if (mode === "calling") return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:"-apple-system,'Hiragino Sans',sans-serif" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,#1c1c1e 0%,#2c2c2e 40%,#1c1c1e 100%)" }}/>
      <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 24px 0" }}>
        <div style={{ color:"#fff", fontSize:15, fontWeight:600 }}>{timeStr}</div>
        <div style={{ color:"#fff", fontSize:12 }}>🔋</div>
      </div>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:48 }}>
        <div style={{ width:120, height:120, borderRadius:"50%", background:"linear-gradient(135deg,#48484a,#636366)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, marginBottom:20, boxShadow:"0 0 0 4px rgba(255,255,255,0.15)" }}>
          {caller.icon}
        </div>
        <div style={{ color:"#fff", fontSize:32, fontWeight:300, letterSpacing:"-0.5px", marginBottom:6 }}>{caller.name}</div>
        <div style={{ color:"#34c759", fontSize:16, fontVariantNumeric:"tabular-nums" }}>{formatTime(elapsed)}</div>
      </div>
      <div style={{ position:"absolute", bottom:120, left:0, right:0, zIndex:1 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, padding:"0 40px", marginBottom:24 }}>
          {[{ icon:"🔇", label:"ミュート" },{ icon:"⌨️", label:"キーパッド" },{ icon:"🔊", label:"スピーカー" },{ icon:"＋", label:"通話追加" },{ icon:"📹", label:"FaceTime" },{ icon:"👤", label:"連絡先" }].map(b => (
            <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{b.icon}</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>{b.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <button onClick={() => setMode("black")}
              style={{ width:76, height:76, borderRadius:"50%", background:"#ff3b30", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 20.5C4 17 8.5 13 16 13C23.5 13 28 17 28 20.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <line x1="6" y1="26" x2="26" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:14 }}>終了</div>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}