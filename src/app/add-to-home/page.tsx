"use client";
import { useRouter } from "next/navigation";

export default function AddToHomePage() {
  const router = useRouter();

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:400, boxShadow:"0 8px 40px rgba(91,168,114,0.15)", border:"1px solid #c8e6d0" }}>

        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📱</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", margin:"0 0 8px" }}>ホーム画面に追加しよう</h1>
          <p style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, margin:0 }}>
            ぱにいきをホーム画面に追加すると、アプリのように使えます。発作時にすぐ開けるようになります。
          </p>
        </div>

        {/* iPhone */}
        <div style={{ background:"#e8f5ec", borderRadius:14, padding:16, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:10 }}>🍎 iPhoneの場合</div>
          {[
            "Safariでぱにいきを開く",
            "画面下の共有ボタン（□↑）をタップ",
            "「ホーム画面に追加」をタップ",
            "「追加」をタップして完了",
          ].map((step, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.7, paddingTop:2 }}>{step}</div>
            </div>
          ))}
        </div>

        {/* Android */}
        <div style={{ background:"#e8f5ec", borderRadius:14, padding:16, marginBottom:24, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:10 }}>🤖 Androidの場合</div>
          {[
            "Chromeでぱにいきを開く",
            "右上のメニュー（⋮）をタップ",
            "「ホーム画面に追加」をタップ",
            "「追加」をタップして完了",
          ].map((step, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.7, paddingTop:2 }}>{step}</div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push("/")}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10 }}>
          🌿 アプリをはじめる
        </button>
       
      </div>
    </div>
  );
}