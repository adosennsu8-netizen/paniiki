import Link from "next/link";

export default function HelpPremiumPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#c9963a,#e8b84b)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(201,150,58,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>⭐ プレミアムプランについて</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>

        <div style={{ background:"#fef3cd", borderRadius:16, padding:20, marginBottom:12, border:"1.5px solid #c9963a", textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#c9963a", marginBottom:4 }}>プレミアムプラン</div>
          <div style={{ fontSize:28, fontWeight:800, color:"#2d4a38", marginBottom:4 }}>月額500円</div>
          <div style={{ fontSize:12, color:"#8aaa95" }}>いつでも解約可能</div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>🆓 無料でできること</div>
          {[
            "近くの仲間の確認（MAP）",
            "カレンダーで記録する",
            "薬管理アラームの設定",
            "薬一覧を見る",
            "質問箱・豆知識を読む",
            "場所情報を見る",
          ].map(item => (
            <div key={item} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"1px solid #e8f5ec" }}>
              <div style={{ color:"#5ba872", fontWeight:700, fontSize:14 }}>✓</div>
              <div style={{ fontSize:13, color:"#5a7a65" }}>{item}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fef3cd", borderRadius:16, padding:20, marginBottom:12, border:"1.5px solid #c9963a" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#c9963a", marginBottom:12 }}>⭐ プレミアムでできること</div>
          {[
            "質問箱に投稿・回答する",
            "アンケートを作成する",
            "豆知識を投稿する",
            "MAPにコメントを残す",
            "場所情報を投稿する",
            "呼吸アシスト",
            "そっとしておいてカード",
            "偽電話機能",
          ].map(item => (
            <div key={item} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"1px solid #fde8a0" }}>
              <div style={{ color:"#c9963a", fontWeight:700, fontSize:14 }}>⭐</div>
              <div style={{ fontSize:13, color:"#2d4a38" }}>{item}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>💳 登録・解約方法</div>
          {[
            { title:"登録方法", desc:"トップページの「⭐ プレミアムになる（月額500円）」ボタンをタップして、クレジットカード情報を入力してください。" },
            { title:"解約方法", desc:"Stripeのカスタマーポータルからいつでも解約できます。解約後は次回更新日までプレミアム機能をご利用いただけます。" },
            { title:"領収書", desc:"登録時に入力したメールアドレスに自動で領収書が送付されます。" },
          ].map(item => (
            <div key={item.title} style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>{item.title}</div>
              <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#e8f5ec", borderRadius:16, padding:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#4a9060", marginBottom:6 }}>🌿 ベータ期間について</div>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>
            2026年5月末までのベータ期間中は全機能を無料でご利用いただけます。6月以降はプレミアムプランへの登録が必要になります。
          </div>
        </div>
      </div>
    </div>
  );
}