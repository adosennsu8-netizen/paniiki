"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_ALONE_TEXT = "パニック障害の発作が出ていますが、すぐに落ち着きます。救急車は不要です。そっとそばにいてください。";

export default function SOSPage() {
  const router = useRouter();
  const [view, setView] = useState<"menu" | "breathing" | "alone">("menu");
  const [breathPhase, setBreathPhase] = useState<"ready" | "in" | "hold" | "out">("ready");
  const [aloneText, setAloneText] = useState(DEFAULT_ALONE_TEXT);
  const breathTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (breathPhase === "ready") return;
    const timings: Record<string, number> = { in:6000, hold:1000, out:6000 };
    const next: Record<string, "in" | "hold" | "out"> = { in:"hold", hold:"out", out:"in" };
    breathTimer.current = setTimeout(() => {
      setBreathPhase(next[breathPhase]);
    }, timings[breathPhase]);
    return () => { if (breathTimer.current) clearTimeout(breathTimer.current); };
  }, [breathPhase]);

  const stopBreathing = () => {
    if (breathTimer.current) clearTimeout(breathTimer.current);
    setBreathPhase("ready");
    setView("menu");
  };

  const breathConfig: Record<string, { color: string; label: string; scale: string }> = {
    in:    { color:"#a8d5b5", label:"吸って…",  scale:"scale(1.55)" },
    hold:  { color:"#fde8a0", label:"止めて…",  scale:"scale(1.55)" },
    out:   { color:"#b5cff5", label:"吐いて…",  scale:"scale(1.0)"  },
    ready: { color:"#d4edda", label:"",          scale:"scale(1.0)"  },
  };

  // ── メニュー ──
  if (view === "menu") return (
    <div style={{ minHeight:"100vh", background:"#fff5f5", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#e8938a,#c96060)", padding:"20px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🆘 発作サポート</div>
          <div style={{ color:"rgba(255,255,255,0.85)", fontSize:11 }}>落ち着いて。大丈夫です。</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.25)", border:"none", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ padding:16 }}>
        <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:16, border:"1px solid #f5c5c5", textAlign:"center" }}>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>今、発作が起きていますか？<br/>一つずつ試してみましょう。</div>
        </div>

        <button onClick={() => setView("breathing")}
          style={{ width:"100%", background:"#fff", borderRadius:20, padding:"22px 20px", marginBottom:12, border:"1.5px solid #a8d5b5", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16, boxShadow:"0 3px 12px rgba(168,213,181,0.25)" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#d4edda,#a8d5b5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>🌬</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>呼吸アシスト</div>
            <div style={{ fontSize:12, color:"#8aaa95", lineHeight:1.7 }}>吸って・止めて・吐くタイミングを<br/>やさしくご案内します</div>
          </div>
        </button>

        <button onClick={() => setView("alone")}
          style={{ width:"100%", background:"#fff", borderRadius:20, padding:"22px 20px", marginBottom:12, border:"1.5px solid #f5c5c5", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16, boxShadow:"0 3px 12px rgba(232,147,138,0.2)" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#fde8e8,#f5c5c5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>🪧</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>そっとしておいてカード</div>
            <div style={{ fontSize:12, color:"#8aaa95", lineHeight:1.7 }}>近くにいる人にこの画面を<br/>見せてください</div>
          </div>
        </button>
      </div>
    </div>
  );

  // ── 呼吸アシスト ──
  if (view === "breathing") return (
    <div style={{ minHeight:"100vh", background:"#f0f9f4", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", padding:24 }}>
      <button onClick={stopBreathing} style={{ position:"fixed", top:20, left:20, background:"rgba(91,168,114,0.15)", border:"none", color:"#4a9060", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>

      <div style={{ color:"#8aaa95", fontSize:13, marginBottom:48, letterSpacing:"0.1em" }}>🌬 呼吸アシスト</div>

      {breathPhase === "ready" ? (
        <>
          <div style={{ fontSize:72, marginBottom:24 }}>🌿</div>
          <div style={{ color:"#2d4a38", fontSize:18, marginBottom:10, fontWeight:700 }}>準備ができたら始めましょう</div>
          <div style={{ color:"#8aaa95", fontSize:13, marginBottom:48, textAlign:"center", lineHeight:2.0 }}>
            4秒　吸って<br/>2秒　止めて<br/>6秒　吐く
          </div>
          <button onClick={() => setBreathPhase("in")}
            style={{ background:"linear-gradient(135deg,#7bbf8c,#5ba872)", color:"#fff", border:"none", borderRadius:40, padding:"18px 56px", fontSize:18, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(91,168,114,0.35)" }}>
            はじめる
          </button>
        </>
      ) : (
        <>
          <div style={{ position:"relative", width:220, height:220, marginBottom:48 }}>
            {/* 外側の光輪 */}
            <div style={{
              position:"absolute", inset:-20, borderRadius:"50%",
              background:`radial-gradient(circle, ${breathConfig[breathPhase].color}55 0%, transparent 70%)`,
              transform:breathConfig[breathPhase].scale,
              transition:"transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 1s ease",
            }}/>
            {/* メイン円 */}
            <div style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:`radial-gradient(circle, ${breathConfig[breathPhase].color} 0%, ${breathConfig[breathPhase].color}88 60%, transparent 100%)`,
              transform:breathConfig[breathPhase].scale,
              transition:"transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 1s ease",
              boxShadow:`0 0 40px ${breathConfig[breathPhase].color}66`,
            }}/>
            {/* ラベル */}
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:"#2d4a38", textAlign:"center", letterSpacing:"0.05em" }}>
                {breathConfig[breathPhase].label}
              </div>
            </div>
          </div>

          <button onClick={stopBreathing}
            style={{ background:"rgba(91,168,114,0.12)", color:"#4a9060", border:"1px solid #c8e6d0", borderRadius:20, padding:"10px 32px", fontSize:14, cursor:"pointer" }}>
            止める
          </button>
        </>
      )}
    </div>
  );

  // ── そっとしておいてカード ──
  if (view === "alone") return (
    <div style={{ minHeight:"100vh", background:"#f8f0f0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"28px 24px", width:"100%", maxWidth:380, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.1)", border:"1px solid #fdd8d8" }}>

        {/* ヘルプマーク風 十字 */}
        <div style={{ width:56, height:56, borderRadius:12, background:"linear-gradient(135deg,#e8938a,#c96060)", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(201,96,96,0.35)" }}>
          <div style={{ position:"relative", width:28, height:28 }}>
            <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:8, height:28, background:"#fff", borderRadius:4 }}/>
            <div style={{ position:"absolute", top:"50%", left:0, transform:"translateY(-50%)", width:28, height:8, background:"#fff", borderRadius:4 }}/>
          </div>
        </div>

        <div style={{ fontSize:18, fontWeight:800, color:"#2d4a38", marginBottom:16, lineHeight:1.5 }}>この画面を<br/>見てください</div>

        <div style={{ background:"#fff5f5", borderRadius:14, padding:"18px 16px", marginBottom:16, border:"1.5px solid #f5c5c5" }}>
          <div style={{ fontSize:15, color:"#2d4a38", lineHeight:2.0, whiteSpace:"pre-wrap" }}>{aloneText}</div>
        </div>

        <div style={{ fontSize:11, color:"#c8a0a0" }}>ぱにいき — パニック障害と生きていく</div>
      </div>

      <button onClick={() => setView("menu")}
        style={{ marginTop:28, background:"rgba(201,96,96,0.12)", color:"#c96060", border:"1px solid #f5c5c5", borderRadius:20, padding:"10px 32px", fontSize:14, cursor:"pointer" }}>
        ← 戻る
      </button>
    </div>
  );

  return null;
}