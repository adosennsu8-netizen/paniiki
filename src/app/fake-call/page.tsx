"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CALLERS = [
  { name:"田中 幸子", sub:"携帯電話", label:"女性の名前" },
  { name:"鈴木 健太", sub:"携帯電話", label:"男性の名前" },
  { name:"株式会社 山田商事", sub:"会社・代表番号", label:"会社名" },
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

  if (mode === "setup") return (
    <div style={{ minHeight:"100vh", background:"#1a1a2e", display:"flex", flexDirection:"column", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>📵 偽電話設定</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"rgba(255,255,255,0.7)", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>
      <div style={{ flex:1, padding:"0 20px 40px" }}>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 16px", marginBottom:24 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>会議や外出先で体調が不安定な時に使用します。スタートを押すと画面が真っ黒になり、タップすると偽の着信が鳴ります。</div>
        </div>
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:12 }}>着信者を選択</div>
          {CALLERS.map((c, i) => (
            <div key={i} onClick={() => setCallerIndex(i)}
              style={{ display:"flex", alignItems:"center", gap:14, background:callerIndex===i?"rgba(91,168,114,0.25)":"rgba(255,255,255,0.06)", border:`1.5px solid ${callerIndex===i?"#5ba872":"transparent"}`, borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#c0392b,#8e44ad)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M4 20C4 16.7 7.6 14 12 14C16.4 14 20 16.7 20 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
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
          <div style={{ color:"#fff", fontSize:20, fontWeight:300, marginBottom:4 }}>{caller.name}</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>{caller.sub}</div>
        </div>
        <button onClick={() => setMode("black")}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer" }}>
          偽電話モードを開始する
        </button>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textAlign:"center", marginTop:10, lineHeight:1.7 }}>
          開始後は画面が真っ黒になります。<br/>画面中央をタップすると偽の着信が始まります。<br/>右上の見えないボタンで解除できます。
        </div>
      </div>
    </div>
  );

  if (mode === "black") return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:9999 }}>
      <FadeOutMessage/>
      <button onClick={() => setMode("ringing")}
        style={{ position:"absolute", inset:0, background:"transparent", border:"none", cursor:"pointer", width:"100%", height:"100%" }}/>
      <button onClick={() => setMode("setup")}
        style={{ position:"absolute", top:0, right:0, width:80, height:80, background:"transparent", border:"none", cursor:"pointer", zIndex:10000 }}/>
    </div>
  );

  if (mode === "ringing") return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:"'Roboto','Hiragino Sans',sans-serif", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#c0392b 0%,#922b21 30%,#7d3c98 70%,#6c3483 100%)" }}/>
      
      <div style={{ position:"relative", zIndex:1, textAlign:"center", paddingTop:70 }}>
        <div style={{ color:"#fff", fontSize:34, fontWeight:300, marginBottom:10, padding:"0 24px" }}>{caller.name}</div>
        <div style={{ color:"rgba(255,255,255,0.65)", fontSize:14, marginBottom:6 }}>{caller.sub}</div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, animation:"blink 1.5s infinite" }}>着信中…</div>
      </div>
      <div style={{ position:"absolute", bottom:190, left:0, right:0, zIndex:1, display:"flex", justifyContent:"space-around", padding:"0 56px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M4 6C4 4.9 4.9 4 6 4H20C21.1 4 22 4.9 22 6V16C22 17.1 21.1 18 20 18H8L4 22V6Z" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>メッセージ</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="7" cy="13" r="2.5" stroke="white" strokeWidth="1.5"/>
              <circle cx="14" cy="13" r="2.5" stroke="white" strokeWidth="1.5"/>
              <path d="M2 22C2 19 4 16.5 7 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 16.5H24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 20H21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>留守番電話</span>
        </div>
      </div>
      <div style={{ position:"absolute", bottom:50, left:0, right:0, zIndex:1, display:"flex", justifyContent:"space-around", padding:"0 44px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <button onClick={() => setMode("black")}
            style={{ width:76, height:76, borderRadius:"50%", background:"#e53935", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M5 23C5 19 9.5 15 17 15C24.5 15 29 19 29 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="7" y1="29" x2="27" y2="7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
          <span style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>拒否</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <button onClick={() => setMode("calling")}
            style={{ width:76, height:76, borderRadius:"50%", background:"#43a047", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M6 13C6 9 9.5 5 17 5C24.5 5 28 9 28 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M5 19C5 23 8 27 12 27L14 22L10 20C10 20 10 18 12 16C14 14 16 14 16 14L14 9C8 9 5 14 5 19Z" fill="white"/>
            </svg>
          </button>
          <span style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>応答</span>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );

  if (mode === "calling") return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:"'Roboto','Hiragino Sans',sans-serif" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#c0392b 0%,#922b21 30%,#7d3c98 70%,#6c3483 100%)" }}/>
     
      <div style={{ position:"relative", zIndex:1, textAlign:"center", paddingTop:70 }}>
        <div style={{ color:"#fff", fontSize:34, fontWeight:300, marginBottom:10, padding:"0 24px" }}>{caller.name}</div>
        <div style={{ color:"#43a047", fontSize:18, fontVariantNumeric:"tabular-nums" }}>{formatTime(elapsed)}</div>
      </div>
      <div style={{ position:"absolute", bottom:160, left:0, right:0, zIndex:1 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, padding:"0 28px" }}>
          {[
            { label:"ミュート", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3C10.8 3 9 4.8 9 7V13C9 15.2 10.8 17 13 17C15.2 17 17 15.2 17 13V7C17 4.8 15.2 3 13 3Z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M5 13C5 17.4 8.6 21 13 21M21 13C21 17.4 17.4 21 13 21M13 21V25" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { label:"キーパッド", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="7" cy="7" r="1.5" fill="white"/><circle cx="13" cy="7" r="1.5" fill="white"/><circle cx="19" cy="7" r="1.5" fill="white"/><circle cx="7" cy="13" r="1.5" fill="white"/><circle cx="13" cy="13" r="1.5" fill="white"/><circle cx="19" cy="13" r="1.5" fill="white"/><circle cx="7" cy="19" r="1.5" fill="white"/><circle cx="13" cy="19" r="1.5" fill="white"/><circle cx="19" cy="19" r="1.5" fill="white"/></svg> },
            { label:"スピーカー", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M3 9H7L13 4V22L7 17H3V9Z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M17 8C19 10 19 16 17 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M20 5C24 9 24 17 20 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { label:"通話追加", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 10C5 14 8 18 12 20L14 16L10 14C10 14 10 12 12 10C14 8 16 8 16 8L14 4C8 4 5 7 5 10Z" fill="white"/><path d="M20 11V19M16 15H24" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { label:"非表示", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="7" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none"/><path d="M17 13L21 9V17L17 13Z" fill="white"/></svg> },
            { label:"連絡先", path:<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="9" r="4" stroke="white" strokeWidth="1.5" fill="none"/><path d="M5 23C5 19.7 8.6 17 13 17C17.4 17 21 19.7 21 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg> },
          ].map(b => (
            <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center" }}>{b.path}</div>
              <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"absolute", bottom:50, left:0, right:0, zIndex:1, display:"flex", justifyContent:"center" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <button onClick={() => setMode("black")}
            style={{ width:76, height:76, borderRadius:"50%", background:"#e53935", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M5 23C5 19 9.5 15 17 15C24.5 15 29 19 29 23" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <line x1="7" y1="29" x2="27" y2="7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
          <span style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>終了</span>
        </div>
      </div>
    </div>
  );

  return null;
}