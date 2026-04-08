import Link from "next/link";

export default function HelpCalendarPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>📅 カレンダーの使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>📅 カレンダーとは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            発作・予期不安・受診・よかったことなどを日々記録できる機能です。記録を続けることで自分のパターンが見えてきます。主治医への報告にも役立ちます。
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>記録できる種類</div>
          {[
            { icon:"⚡", label:"パニック発作", color:"#e07070", bg:"#fde8e8" },
            { icon:"😰", label:"予期不安", color:"#d4a843", bg:"#fef3cd" },
            { icon:"🏥", label:"クリニック受診", color:"#7bbf8c", bg:"#d4edda" },
            { icon:"🌟", label:"よかったこと", color:"#4a9060", bg:"#d4edda" },
            { icon:"💊", label:"薬変更", color:"#9b7ec8", bg:"#ede7f6" },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:10, background:item.bg, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <div style={{ fontSize:13, fontWeight:600, color:item.color }}>{item.label}</div>
            </div>
          ))}
        </div>

        {[
          { step:"1", title:"カレンダーを開く", desc:"トップページの「📅 カレンダー」をタップします。" },
          { step:"2", title:"日付を選ぶ", desc:"記録したい日付をタップして選択します。今日の日付は緑色でハイライトされています。" },
          { step:"3", title:"記録を追加する", desc:"右上の「＋ 記録」ボタンをタップします。記録の種類を選んでメモを入力（任意）して「保存する」をタップします。" },
          { step:"4", title:"記録を確認する", desc:"カレンダーの日付にドットが表示されます。日付をタップするとその日の記録が表示されます。" },
        ].map(item => (
          <div key={item.step} style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>{item.step}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38" }}>{item.title}</div>
            </div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}