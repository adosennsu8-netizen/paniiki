import Link from "next/link";

export default function HelpMapPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🗺 MAPの使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>🗺 MAPとは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            現在地から300m以内に、同じパニック障害・不安障害を持つ仲間がいるかどうかを確認できる機能です。地図上にはドットだけが表示され、個人が特定されることはありません。
          </div>
        </div>

        {[
          { step:"1", title:"MAPを開く", desc:"トップページの「🗺 近くの仲間」をタップします。位置情報の許可を求められた場合は「許可」をタップしてください。" },
          { step:"2", title:"MAPに参加する", desc:"「MAPに参加する」のトグルをONにすると、あなたの位置が他の仲間の地図に表示されます。OFFにするといつでも非表示にできます。" },
          { step:"3", title:"仲間を確認する", desc:"地図上の赤いドットが300m以内にいる仲間です。ドットをタップするとその方のコメントが表示されます。" },
          { step:"4", title:"コメントを残す", desc:"「MAPにコメントを残す」欄に今の気持ちを入力して「MAPに表示する」をタップします。入力したコメントは地図上に匿名で表示されます。" },
        ].map(item => (
          <div key={item.step} style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>{item.step}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38" }}>{item.title}</div>
            </div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>{item.desc}</div>
          </div>
        ))}

        <div style={{ background:"#fde8e8", borderRadius:16, padding:20, border:"1px solid #e07070" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#e07070", marginBottom:8 }}>⚠️ ご注意</div>
          <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.9 }}>
            ・位置情報はアプリ使用中のみ取得します。<br/>
            ・他のユーザーには正確な位置は表示されません。<br/>
            ・MAPへの参加は任意です。いつでもOFFにできます。
          </div>
        </div>
      </div>
    </div>
  );
}