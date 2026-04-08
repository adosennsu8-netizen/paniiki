import Link from "next/link";

export default function HelpMedicinePage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>💊 薬管理の使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>💊 薬管理とは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            薬の飲み忘れを防ぐアラーム機能です。1日最大4回までアラームを設定でき、飲んだらチェックするだけ。カレンダーで飲めた日を確認できます。
          </div>
        </div>

        {[
          { step:"1", title:"薬管理を開く", desc:"トップページの「💊 薬の管理」をタップします。" },
          { step:"2", title:"アラームを追加する", desc:"「＋ アラーム追加」ボタンをタップします。時間を設定してラベル（例：朝の薬）を入力して「追加する」をタップします。アラームは最大4つまで設定できます。" },
          { step:"3", title:"飲んだらチェックする", desc:"薬を飲んだら「飲んだ」ボタンをタップします。ボタンが緑色に変わり「✓ 飲んだ」と表示されます。" },
          { step:"4", title:"カレンダーで確認する", desc:"すべてのアラーム分を飲んだ日はカレンダーが緑色になります。一部だけ飲んだ日は黄色になります。" },
          { step:"5", title:"アラームをOFF/ONする", desc:"各アラームの右側にあるトグルスイッチでアラームのON/OFFを切り替えられます。" },
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
            薬の服用は必ず医師の指示に従ってください。このアプリのアラームは補助ツールです。自己判断で服用量を変更しないでください。
          </div>
        </div>
      </div>
    </div>
  );
}