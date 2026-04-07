import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:22, fontWeight:800 }}>🌿 ぱにいき</div>
        <Link href="/auth" style={{ background:"rgba(255,255,255,0.25)", color:"#fff", borderRadius:20, padding:"8px 18px", fontSize:13, fontWeight:600, textDecoration:"none" }}>
          ログイン / 登録
        </Link>
      </div>

      {/* ヒーロー */}
      <div style={{ background:"linear-gradient(160deg,#d4edda,#e8f5ec)", padding:"60px 24px 48px", textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🌿</div>
        <h1 style={{ fontSize:32, fontWeight:800, color:"#2d4a38", margin:"0 0 12px", lineHeight:1.3 }}>
          パニック障害と、<br/>生きていく。
        </h1>
        <p style={{ fontSize:16, color:"#5a7a65", lineHeight:1.8, margin:"0 0 32px" }}>
          同じ病気を持つ仲間とつながり、<br/>
          毎日を少しだけ楽にするアプリです。
        </p>
        <Link href="/auth" style={{ display:"inline-block", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", borderRadius:16, padding:"16px 40px", fontSize:18, fontWeight:800, textDecoration:"none", boxShadow:"0 4px 20px rgba(91,168,114,0.4)" }}>
          無料ではじめる
        </Link>
        <div style={{ fontSize:12, color:"#8aaa95", marginTop:12 }}>登録無料 · いつでも解約可能</div>
      </div>

      {/* 特徴 */}
      <div style={{ padding:"48px 24px" }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", textAlign:"center", marginBottom:32 }}>ぱにいきでできること</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:500, margin:"0 auto" }}>
          {[
            { icon:"🗺", title:"近くの仲間", desc:"300m以内の仲間の存在を確認" },
            { icon:"🆘", title:"発作サポート", desc:"呼吸アシスト・そっとしておいてカード" },
            { icon:"📅", title:"記録", desc:"発作・受診・薬をカレンダーで管理" },
            { icon:"💊", title:"薬の管理", desc:"飲み忘れ防止アラーム" },
            { icon:"❓", title:"質問箱", desc:"仲間に悩みを相談（完全匿名）" },
            { icon:"📵", title:"偽電話", desc:"その場を離れたい時に" },
          ].map(item => (
            <div key={item.title} style={{ background:"#fff", borderRadius:16, padding:"20px 16px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>{item.title}</div>
              <div style={{ fontSize:11, color:"#8aaa95", lineHeight:1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 料金 */}
      <div style={{ background:"#fff", padding:"48px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:32 }}>料金プラン</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:500, margin:"0 auto 32px" }}>
          <div style={{ background:"#e8f5ec", borderRadius:16, padding:24, border:"1px solid #c8e6d0" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#4a9060", marginBottom:8 }}>🆓 無料</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>
              ・仲間の確認<br/>
              ・カレンダー記録<br/>
              ・薬一覧<br/>
              ・質問箱を読む
            </div>
          </div>
          <div style={{ background:"#fef3cd", borderRadius:16, padding:24, border:"1.5px solid #c9963a" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#c9963a", marginBottom:4 }}>⭐ プレミアム</div>
            <div style={{ fontSize:13, color:"#c9963a", fontWeight:600, marginBottom:8 }}>月額500円</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>
              ・投稿・回答<br/>
              ・発作サポート音声<br/>
              ・呼吸アシスト<br/>
              ・偽電話機能
            </div>
          </div>
        </div>
        <Link href="/auth" style={{ display:"inline-block", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", borderRadius:16, padding:"14px 36px", fontSize:16, fontWeight:800, textDecoration:"none" }}>
          今すぐ無料登録
        </Link>
      </div>

      {/* フッター */}
      <div style={{ background:"#2d4a38", padding:"32px 24px", textAlign:"center" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:16 }}>🌿 ぱにいき</div>
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:16, flexWrap:"wrap" }}>
          <Link href="/privacy" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>プライバシーポリシー</Link>
          <Link href="/terms" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>利用規約</Link>
          <Link href="/auth" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>ログイン</Link>
        </div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>© 2026 ぱにいき All rights reserved.</div>
      </div>
    </div>
  );
}