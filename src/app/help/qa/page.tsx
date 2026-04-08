import Link from "next/link";

export default function HelpQAPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>❓ 質問箱の使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>❓ 質問箱とは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            同じパニック障害・不安障害を持つ仲間に悩みを相談できる機能です。投稿・回答はすべて完全匿名で表示されます。アンケート機能もあります。
          </div>
        </div>

        <div style={{ background:"#e8f5ec", borderRadius:16, padding:16, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#4a9060", marginBottom:6 }}>🔒 プライバシーについて</div>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9 }}>
            投稿者・回答者は動物の名前（例：ことりさん）でランダム表示されます。ニックネームや個人情報は一切表示されません。
          </div>
        </div>

        {[
          { step:"1", title:"質問箱を開く", desc:"トップページの「❓ 質問箱」をタップします。" },
          { step:"2", title:"質問を読む", desc:"一覧に表示されている質問をタップすると回答が表示されます。「💬 ○件」ボタンをタップして回答を確認できます。" },
          { step:"3", title:"質問を投稿する", desc:"「✏️ 質問を投稿する」ボタンをタップします。質問文を入力してタグ（例：電車、薬）を入力して「投稿する」をタップします。" },
          { step:"4", title:"回答する", desc:"質問を開いて下部の入力欄に回答を入力して「回答を送る」をタップします。" },
          { step:"5", title:"アンケートに参加する", desc:"「📊 アンケート」タブをタップするとアンケート一覧が表示されます。選択肢をタップして投票できます。結果はグラフで確認できます。" },
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