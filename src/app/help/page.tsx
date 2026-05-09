import Link from "next/link";

const HELP_ITEMS = [
  { icon:"🗺", title:"MAPの使い方", desc:"近くの仲間を確認する方法", path:"/help/map" },
  { icon:"📅", title:"カレンダーの使い方", desc:"発作・受診・体調を記録する方法", path:"/help/calendar" },
  { icon:"💊", title:"薬管理の使い方", desc:"飲み忘れ防止アラームの設定方法", path:"/help/medicine" },
  { icon:"❓", title:"質問箱の使い方", desc:"仲間に相談・回答する方法", path:"/help/qa" },
  { icon:"💡", title:"豆知識の使い方", desc:"経験や知識を投稿する方法", path:"/help/tips" },
  { icon:"🆘", title:"発作サポートの使い方", desc:"呼吸アシスト・そっとしておいてカード", path:"/help/sos" },
  { icon:"📵", title:"偽電話の使い方", desc:"その場を自然に離れる方法", path:"/help/fake-call" },
  { icon:"📍", title:"場所情報の使い方", desc:"クリニック・休める場所を探す方法", path:"/help/places" },
  { icon:"⭐", title:"プレミアムプランについて", desc:"有料機能と料金について", path:"/help/premium" },
];

export default function HelpPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>❓ ヘルプ・使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <Link href="/" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:"14px 16px", marginBottom:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>
            各機能の使い方を説明します。知りたい機能をタップしてください。
          </div>
        </div>
      <div style={{ background:"#fff8e1", borderRadius:16, padding:"14px 16px", marginBottom:16, border:"1px solid #ffe082" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#b07800", marginBottom:4 }}>⚠️ アプリが開かない場合</div>
          <div style={{ fontSize:12, color:"#7a5800", lineHeight:1.8 }}>
            ブラウザの「サイトの設定」→「データを削除」を行ってから再度アクセスしてください。それでも解決しない場合は、シークレットモード（プライベートブラウジング）でお試しください。
          </div>
        </div>
        {HELP_ITEMS.map(item => (
          <Link key={item.path} href={item.path} style={{ textDecoration:"none" }}>
            <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #c8e6d0", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                {item.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:3 }}>{item.title}</div>
                <div style={{ fontSize:12, color:"#8aaa95" }}>{item.desc}</div>
              </div>
              <div style={{ color:"#c8e6d0", fontSize:20 }}>›</div>
            </div>
          </Link>
        ))}

       <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginTop:8, border:"1px solid #c8e6d0" }}>
  <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>📩 解決しない場合</div>
  <div style={{ fontSize:12, color:"#5a7a65", lineHeight:1.8 }}>
    お問い合わせは下記メールアドレスよりご連絡ください。<br/>
    <a href="https://www.joynovation.com" target="_blank" style={{ color:"#5ba872" }}>www.joynovation.com</a>
  </div>
</div>

<div style={{ background:"#e8f5ec", borderRadius:16, padding:"16px", marginTop:10, border:"1px solid #c8e6d0" }}>
  <div style={{ fontSize:11, color:"#8aaa95", lineHeight:2.0 }}>
    運営会社：Joynovation（ジョイノベーション）<br/>
    所在地：福岡県福岡市<br/>
    Webサイト：<a href="https://www.joynovation.com" target="_blank" style={{ color:"#5ba872" }}>www.joynovation.com</a>
  </div>
</div>
      </div>
    </div>
  );
}