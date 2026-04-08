import Link from "next/link";

export default function HelpTipsPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>💡 豆知識の使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>💡 豆知識とは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            パニック障害・不安障害に関する経験や知識を仲間とシェアできる機能です。投稿はすべて完全匿名です。役に立った投稿には「いいね」ができます。
          </div>
        </div>

        {[
          { step:"1", title:"豆知識を開く", desc:"トップページの「💡 豆知識」をタップします。" },
          { step:"2", title:"豆知識を読む", desc:"一覧に表示されている投稿を読むことができます。役に立った投稿には「🤍」ボタンをタップしていいねができます。" },
          { step:"3", title:"豆知識を投稿する", desc:"「💡 豆知識を投稿する」ボタンをタップします。タイトルと内容を入力して「投稿する」をタップします。投稿は匿名で表示されます。" },
        ].map(item => (
          <div key={item.step} style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#5ba872", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>{item.step}</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38" }}>{item.title}</div>
            </div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>{item.desc}</div>
          </div>
        ))}

        <div style={{ background:"#e8f5ec", borderRadius:16, padding:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#4a9060", marginBottom:6 }}>💡 投稿のヒント</div>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>
            ・発作を乗り越えた体験談<br/>
            ・外出時に役立った工夫<br/>
            ・主治医から教えてもらったこと<br/>
            ・薬の飲み方で気をつけていること<br/><br/>
            など、同じ病気の仲間が「知りたい」と思う情報をシェアしましょう。
          </div>
        </div>
      </div>
    </div>
  );
}