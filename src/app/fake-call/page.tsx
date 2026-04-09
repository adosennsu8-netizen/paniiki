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
              <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#c0392b,#8e44ad)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{c.icon}</div>
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
      <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 0" }}>
        <div style={{ color:"#fff", fontSize:15, fontWeight:500 }}>{timeStr}</div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ color:"#fff", fontSize:11, fontWeight:500 }}>4G</div>
          <div style={{ color:"#fff", fontSize:12 }}>🔋</div>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:80 }}>
        <div style={{ color:"#fff", fontSize:36, fontWeight:400, textAlign:"center", padding:"0 24px", marginBottom:12 }}>{caller.name}</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:15, marginBottom:6 }}>{caller.sub}</div>
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:14, animation:"blink 1.5s infinite" }}>着信中…</div>
      </div>
      <div style={{ position:"absolute", bottom:200, left:0, right:0, zIndex:1, display:"flex", justifyContent:"space-around", padding:"0 60px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>💬</div>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>メッセージを送信</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>📻</div>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>留守番電話</div>
        </div>
      </div>
      <div style={{ position:"absolute", bottom:60, left:0, right:0, zIndex:1, display:"flex", justifyContent:"space-around", padding:"0 48px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <button onClick={() => setMode("black")}
            style={{ width:80, height:80, borderRadius:"50%", background:"#e53935", border:"none", cursor:"pointer", fontSize:36 }}>📵</button>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>拒否</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <button onClick={() => setMode("calling")}
            style={{ width:80, height:80, borderRadius:"50%", background:"#43a047", border:"none", cursor:"pointer", fontSize:36 }}>📞</button>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>応答</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );

  if (mode === "calling") return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, fontFamily:"'Roboto','Hiragino Sans',sans-serif" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#c0392b 0%,#922b21 30%,#7d3c98 70%,#6c3483 100%)" }}/>
      <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 0" }}>
        <div style={{ color:"#fff", fontSize:15, fontWeight:500 }}>{timeStr}</div>
        <div style={{ color:"#fff", fontSize:12 }}>🔋</div>
      </div>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:80 }}>
        <div style={{ color:"#fff", fontSize:36, fontWeight:400, marginBottom:12, textAlign:"center", padding:"0 24px" }}>{caller.name}</div>
        <div style={{ color:"#43a047", fontSize:18, fontVariantNumeric:"tabular-nums" }}>{formatTime(elapsed)}</div>
      </div>
      <div style={{ position:"absolute", bottom:160, left:0, right:0, zIndex:1 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, padding:"0 32px", marginBottom:16 }}>
          {[
            { icon:"🔇", label:"ミュート" },
            { icon:"⌨️", label:"キーパッド" },
            { icon:"🔊", label:"スピーカー" },
            { icon:"➕", label:"通話追加" },
            { icon:"📹", label:"非表示" },
            { icon:"👤", label:"連絡先" },
          ].map(b => (
            <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{b.icon}</div>
              <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"absolute", bottom:60, left:0, right:0, zIndex:1, display:"flex", justifyContent:"center" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <button onClick={() => setMode("black")}
            style={{ width:80, height:80, borderRadius:"50%", background:"#e53935", border:"none", cursor:"pointer", fontSize:36 }}>📵</button>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:14 }}>終了</div>
        </div>
      </div>
    </div>
  );

  return null;
}