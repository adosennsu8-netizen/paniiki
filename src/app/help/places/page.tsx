import Link from "next/link";

export default function HelpPlacesPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>📍 場所情報の使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき ヘルプ</div>
        </div>
        <Link href="/help" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#2d4a38", marginBottom:12 }}>📍 場所情報とは？</div>
          <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            パニック障害の視点でクリニック・薬局・休める場所などの情報を仲間とシェアできる機能です。「出入口が複数あって安心」「待合室が広い」など、当事者ならではの情報が集まります。
          </div>
        </div>

        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>投稿できるカテゴリ</div>
          {[
            { icon:"🏥", label:"クリニック" },
            { icon:"💊", label:"薬局" },
            { icon:"🪑", label:"休める場所" },
            { icon:"📍", label:"その他" },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:10, background:"#e8f5ec", borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <div style={{ fontSize:13, fontWeight:600, color:"#4a9060" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {[
          { step:"1", title:"場所情報を開く", desc:"トップページの「📍 場所情報」をタップします。またはMAPページ下部の「場所情報・クリニック」からも開けます。" },
          { step:"2", title:"場所を探す", desc:"一覧に表示されている場所情報を確認できます。上部のカテゴリボタンで絞り込みができます。現在地から近い順に表示されます。" },
          { step:"3", title:"場所を投稿する", desc:"「✏️ 場所を投稿する」ボタンをタップします。場所の名前・カテゴリ・パニック障害の視点でのコメントを入力して「投稿する」をタップします。" },
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
            ・出入口の数や位置<br/>
            ・待合室の広さや混み具合<br/>
            ・近くにコンビニや休憩場所があるか<br/>
            ・スタッフの対応について<br/><br/>
            パニック障害の視点で気になる情報をシェアしましょう。
          </div>
        </div>
      </div>
    </div>
  );
}