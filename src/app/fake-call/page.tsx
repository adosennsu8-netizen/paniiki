"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CALLERS = [
  { name:"田中 幸子", sub:"携帯電話", icon:"👩", label:"女性の名前" },
  { name:"鈴木 健太", sub:"携帯電話", icon:"👨", label:"男性の名前" },
  { name:"株式会社 山田商事", sub:"会社・代表番号", icon:"🏢", label:"会社名" },
];

export default function FakeCallPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"setup" | "black" | "ringing" | "calling">("setup");
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
        {/* 説明 */}
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 16px", marginBottom:24 }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
            🎭 会議や外出先で体調が不安定な時に使用します。<br/>
            スタートを押すと画面が真っ黒になり、タップすると偽の着信が鳴ります。
          </div>
        </div>

        {/* 発信者選択 */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, marginBottom:12, letterSpacing:"0.05em" }}>
            📞 着信者を選択
          </div>
          {CALLERS.map((c, i) => (
            <div key={i} onClick={() => setCallerIndex(i)}
              style={{ display:"flex", alignItems:"center", gap:14, background:callerIndex===i?"rgba(91,168,114,0.25)":"rgba(255,255,255,0.06)", border:`1.5px solid ${callerIndex===i?"#5ba872":"transparent"}`, borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                {c.icon}
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

        {/* プレビュー */}
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"16px", marginBottom:24, textAlign:"center" }}>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginBottom:10 }}>着信プレビュー</div>
          <div style={{ fontSize:36, marginBottom:6 }}>{caller.icon}</div>
          <div style={{ color:"#fff", fontSize:18, fontWeight:700 }}>{caller.name}</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:4 }}>{caller.sub}</div>
        </div>

        {/* スタートボタン */}
        <button onClick={() => setMode("black")}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(91,168,114,0.4)", letterSpacing:"0.05em" }}>
          🎭 偽電話モードを開始する
        </button>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, textAlign:"center", marginTop:10, lineHeight:1.7 }}>
          開始後は画面が真っ黒になります。<br/>画面をタップすると偽の着信が始まります。<br/>右上の見えないボタンで解除できます。
        </div>
      </div>
    </div>
  );

  // ── 真っ黒画面 ──
  if (mode === "black") return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:9999 }}>
      {/* 中央タップで着信 */}
      <button onClick={() => setMode("ringing")}
        style={{ position:"absolute", inset:0, background:"transparent", border:"none", cursor:"pointer", width:"100%", height:"100%" }}/>
      {/* 右上：解除ボタン（見えない） */}
      <button onClick={() => setMode("setup")}
        style={{ position:"absolute", top:0, right:0, width:80, height:80, background:"transparent", border:"none", cursor:"pointer", zIndex:10000 }}/>
    </div>
  );

  // ── 着信画面 ──
  if (mode === "ringing") return (
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ marginTop:60, color:"rgba(255,255,255,0.7)", fontSize:16 }}>{timeStr}</div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:100, height:100, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, boxShadow:"0 0 40px rgba(102,126,234,0.4)" }}>
          {caller.icon}
        </div>
        <div style={{ color:"#fff", fontSize:28, fontWeight:700, letterSpacing:"0.05em" }}>{caller.name}</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:16 }}>{caller.sub}</div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:14, animation:"blink 1.5s infinite" }}>着信中…</div>
      </div>
      <div style={{ width:"100%", padding:"0 48px 80px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <button onClick={() => setMode("black")}
            style={{ width:72, height:72, borderRadius:"50%", background:"#e07070", border:"none", cursor:"pointer", fontSize:32, boxShadow:"0 4px 20px rgba(224,112,112,0.5)" }}>📵</button>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>拒否</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <button onClick={() => setMode("calling")}
            style={{ width:72, height:72, borderRadius:"50%", background:"#5ba872", border:"none", cursor:"pointer", fontSize:32, boxShadow:"0 4px 20px rgba(91,168,114,0.5)" }}>📞</button>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>応答</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );

  // ── 通話中画面 ──
  if (mode === "calling") return (
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", zIndex:9999, display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ marginTop:60, color:"rgba(255,255,255,0.7)", fontSize:16 }}>{timeStr}</div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ width:100, height:100, borderRadius:"50%", background:"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, boxShadow:"0 0 40px rgba(102,126,234,0.4)" }}>
          {caller.icon}
        </div>
        <div style={{ color:"#fff", fontSize:28, fontWeight:700 }}>{caller.name}</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:16 }}>{caller.sub}</div>
        <div style={{ color:"#7bbf8c", fontSize:22, fontWeight:700, fontVariantNumeric:"tabular-nums" }}>{formatTime(elapsed)}</div>
      </div>
      <div style={{ width:"100%", padding:"0 48px 40px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
        {[{ icon:"🔇", label:"ミュート" },{ icon:"⌨️", label:"キーパッド" },{ icon:"🔊", label:"スピーカー" }].map(b => (
          <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <button style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", fontSize:24 }}>{b.icon}</button>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>{b.label}</div>
          </div>
        ))}
      </div>
      <div style={{ paddingBottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        <button onClick={() => setMode("black")}
          style={{ width:72, height:72, borderRadius:"50%", background:"#e07070", border:"none", cursor:"pointer", fontSize:32, boxShadow:"0 4px 20px rgba(224,112,112,0.5)" }}>📵</button>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>通話終了</div>
      </div>
    </div>
  );

  return null;
}