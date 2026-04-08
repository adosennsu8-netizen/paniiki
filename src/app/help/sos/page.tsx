import Link from "next/link";

export default function HelpSOSPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#e8938a,#c96060)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(201,96,96,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🆘 発作サポートの使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #f5c5c5" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>🆘 発作サポートとは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            パニック発作が起きたときに使う機能です。呼吸アシストとそっとしておいてカードの2つの機能があります。
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #a8d5b5" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#2d4a38", marginBottom:16 }}>🌬 呼吸アシストの使い方</div>
          {[
            { step:"1", title:"発作サポートを開く", desc:"トップページの「🆘 発作サポート」をタップします。" },
            { step:"2", title:"呼吸アシストを選ぶ", desc:"「🌬 呼吸アシスト」をタップします。" },
            { step:"3", title:"はじめるをタップ", desc:"「はじめる」ボタンをタップすると呼吸のガイドが始まります。画面の円が膨らんだり縮んだりするのに合わせて呼吸しましょう。" },
            { step:"4", title:"呼吸に合わせる", desc:"「吸って…」→「止めて…」→「吐いて…」の順番で呼吸します。4秒吸って・2秒止めて・6秒吐くリズムです。" },
          ].map(item => (
            <div key={item.step} style={{ display:"flex", gap:12, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#a8d5b5", display:"flex", alignItems:"center", justifyContent:"center", color:"#2d4a38", fontWeight:800, fontSize:12, flexShrink:0 }}>{item.step}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #f5c5c5" }}>
          <div style={{ fontSize:15, fontWeight:800, color:"#2d4a38", marginBottom:16 }}>🪧 そっとしておいてカードの使い方</div>
          {[
            { step:"1", title:"発作サポートを開く", desc:"トップページの「🆘 発作サポート」をタップします。" },
            { step:"2", title:"カードを選ぶ", desc:"「🪧 そっとしておいてカード」をタップします。" },
            { step:"3", title:"画面を見せる", desc:"近くにいる人にスマホの画面を見せてください。「パニック障害の発作が出ていますが、すぐに落ち着きます」というメッセージが表示されます。" },
          ].map(item => (
            <div key={item.step} style={{ display:"flex", gap:12, marginBottom:12 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"#f5c5c5", display:"flex", alignItems:"center", justifyContent:"center", color:"#c96060", fontWeight:800, fontSize:12, flexShrink:0 }}>{item.step}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>{item.title}</div>
                <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#e8f5ec", borderRadius:16, padding:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>
            💡 発作中は焦らなくて大丈夫です。すぐに落ち着きます。このアプリをゆっくり使ってみてください。
          </div>
        </div>
      </div>
    </div>
  );
}