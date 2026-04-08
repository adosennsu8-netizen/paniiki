import Link from "next/link";

export default function HelpFakeCallPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>📵 偽電話の使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>📵 偽電話とは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            会議中や外出先で発作が来そうになったとき、電話がかかってきたように見せかけてその場を自然に離れるための機能です。
          </div>
        </div>

        {[
          { step:"1", title:"偽電話を開く", desc:"トップページの「📵 偽電話」をタップします。" },
          { step:"2", title:"着信者を選ぶ", desc:"「👩 田中 幸子（女性）」「👨 鈴木 健太（男性）」「🏢 株式会社 山田商事（会社）」の3つから選べます。状況に合わせて選んでください。" },
          { step:"3", title:"偽電話モードを開始する", desc:"「偽電話モードを開始する」ボタンをタップします。画面が真っ黒になります。" },
          { step:"4", title:"着信を鳴らす", desc:"真っ黒画面の中央をタップすると偽の着信が始まります。バイブレーションも振動します。" },
          { step:"5", title:"応答・拒否する", desc:"着信画面で「応答」をタップすると通話中画面になります。「拒否」をタップすると真っ黒画面に戻ります。" },
          { step:"6", title:"偽電話モードを解除する", desc:"真っ黒画面の右上（見えないボタン）をタップすると設定画面に戻ります。" },
        ].map(item => (
          <div key={item.step} style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>{item.step}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38" }}>{item.title}</div>
            </div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>{item.desc}</div>
          </div>
        ))}

        <div style={{ background:"#fef3cd", borderRadius:16, padding:16, border:"1px solid #c9963a" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#c9963a", marginBottom:6 }}>💡 上手な使い方</div>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>
            会議や打ち合わせの前に設定画面で着信者を選んでおきましょう。いざという時にすぐ使えます。真っ黒画面のまま席を立つのも自然に見えます。
          </div>
        </div>
      </div>
    </div>
  );
}