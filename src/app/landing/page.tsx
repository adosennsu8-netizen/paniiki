import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:22, fontWeight:800 }}>🌿 ぱにいき</div>
        <Link href="/auth" style={{ background:"rgba(255,255,255,0.25)", color:"#fff", borderRadius:20, padding:"8px 18px", fontSize:13, fontWeight:600, textDecoration:"none" }}>
          ログイン / 登録
        </Link>
      </div>

      {/* ヒーロー */}
      <div style={{ background:"linear-gradient(160deg,#d4edda,#e8f5ec)", padding:"60px 24px 48px", textAlign:"center" }}>
        <div style={{ fontSize:72, marginBottom:16 }}>🌿</div>
        <h1 style={{ fontSize:32, fontWeight:800, color:"#2d4a38", margin:"0 0 12px", lineHeight:1.3 }}>
          パニック障害と、<br/>生きていく。
        </h1>
        <p style={{ fontSize:16, color:"#5a7a65", lineHeight:1.8, margin:"0 0 32px" }}>
          同じ病気を持つ仲間とつながり、<br/>
          毎日を少しだけ楽にするアプリです。
        </p>
        <Link href="/auth" style={{ display:"inline-block", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", borderRadius:16, padding:"16px 40px", fontSize:18, fontWeight:800, textDecoration:"none", boxShadow:"0 4px 20px rgba(91,168,114,0.4)" }}>
          無料ではじめる
        </Link>
        <div style={{ fontSize:12, color:"#8aaa95", marginTop:12 }}>登録無料 · いつでも解約可能</div>
      </div>

      {/* 開発者メッセージ */}
      <div style={{ background:"#fff", padding:"48px 24px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:24, textAlign:"center" }}>なぜこのアプリを作ったか</h2>
          <div style={{ background:"#e8f5ec", borderRadius:16, padding:24, marginBottom:16, borderLeft:"4px solid #5ba872" }}>
            <p style={{ fontSize:15, color:"#2d4a38", lineHeight:2.0, margin:0 }}>
              パニック障害に関する情報を検索すると、ほぼ必ずこういう言葉が並びます。「克服する方法」「治し方」「完治した体験談」。
            </p>
          </div>
          <p style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9, marginBottom:16 }}>
            でも、今この瞬間も発作と戦いながら電車に乗り、仕事をして、日常を送っている人たちにとって、「治す」という言葉はどこか遠くに感じることがある。
          </p>
          <p style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9, marginBottom:16 }}>
            <strong style={{ color:"#2d4a38" }}>パニック障害専用のアプリは、今まで一つも存在しませんでした。</strong>発作が来たときに何をすればいいか教えてくれるアプリ。薬の飲み忘れを防いでくれるアプリ。近くに同じ病気の仲間がいることを教えてくれるアプリ。
          </p>
          <p style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9 }}>
            「治す」じゃなく「生きていく」ための道具を届けたい。そう思ってこのアプリを作りました。
          </p>
        </div>
      </div>

      {/* 特徴 */}
      <div style={{ padding:"48px 24px", background:"#f0f7f2" }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", textAlign:"center", marginBottom:32 }}>ぱにいきでできること</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:500, margin:"0 auto" }}>
          {[
            { icon:"🗺", title:"近くの仲間", desc:"300m以内の仲間の存在を確認" },
            { icon:"🆘", title:"発作サポート", desc:"呼吸アシスト・そっとしておいてカード" },
            { icon:"📅", title:"記録", desc:"発作・受診・薬をカレンダーで管理" },
            { icon:"💊", title:"薬の管理", desc:"飲み忘れ防止アラーム" },
            { icon:"❓", title:"質問箱", desc:"仲間に悩みを相談（完全匿名）" },
            { icon:"📵", title:"偽電話", desc:"その場を離れたい時に" },
          ].map(item => (
            <div key={item.title} style={{ background:"#fff", borderRadius:16, padding:"20px 16px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>{item.title}</div>
              <div style={{ fontSize:11, color:"#8aaa95", lineHeight:1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ユーザーの声 */}
      <div style={{ background:"#fff", padding:"48px 24px" }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", textAlign:"center", marginBottom:32 }}>ユーザーの声</h2>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          {[
            { text:"発作中に言葉が出なくなるので、そっとしておいてカードはとても助かります。周りに説明しなくてもよくなりました。", icon:"🐰", name:"うさぎさん", tag:"30代・女性" },
            { text:"同じ病気の仲間がいると思うだけで、外出が少し楽になりました。近くに仲間がいるという安心感は想像以上です。", icon:"🐻", name:"くまさん", tag:"40代・男性" },
            { text:"薬の飲み忘れが多かったのですが、アラーム機能のおかげで改善されました。カレンダーで確認できるのも便利です。", icon:"🐱", name:"ねこさん", tag:"20代・女性" },
            { text:"会議中に発作が来そうになった時、偽電話機能で自然にその場を離れられました。当事者目線の機能だと感じました。", icon:"🦊", name:"きつねさん", tag:"30代・男性" },
          ].map((v, i) => (
            <div key={i} style={{ background:"#e8f5ec", borderRadius:16, padding:20, marginBottom:16, border:"1px solid #c8e6d0", position:"relative" }}>
              <div style={{ fontSize:32, color:"#5ba872", marginBottom:8, lineHeight:1 }}>"</div>
              <p style={{ fontSize:14, color:"#2d4a38", lineHeight:1.9, margin:"0 0 12px" }}>{v.text}</p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:20 }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#4a9060" }}>{v.name}（匿名）</div>
                  <div style={{ fontSize:11, color:"#8aaa95" }}>{v.tag}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* パニック障害について */}
      <div style={{ background:"#f0f7f2", padding:"48px 24px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:24, textAlign:"center" }}>パニック障害とは</h2>
          <div style={{ background:"#fff", borderRadius:16, padding:24, marginBottom:16, border:"1px solid #c8e6d0" }}>
            <p style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9, margin:0 }}>
              パニック障害は、突然の激しい不安（パニック発作）を繰り返す病気です。動悸・息切れ・めまい・手足のしびれなどの身体症状を伴い、「このまま死んでしまうのでは」という恐怖を感じることがあります。
            </p>
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:24, marginBottom:16, border:"1px solid #c8e6d0" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>主な症状</div>
            {[
              "突然の強い恐怖・不安感",
              "動悸・心拍数の増加",
              "息切れ・息苦しさ",
              "めまい・ふらつき",
              "手足のしびれ・震え",
              "「死ぬのではないか」という恐怖",
            ].map(s => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px solid #e8f5ec" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#5ba872", flexShrink:0 }}/>
                <div style={{ fontSize:13, color:"#5a7a65" }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#d4edda", borderRadius:16, padding:20, border:"1px solid #7bbf8c" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>🌿 大切なこと</div>
            <p style={{ fontSize:13, color:"#5a7a65", lineHeight:1.9, margin:0 }}>
              パニック障害は適切な治療で改善できる病気です。一人で抱え込まず、まずは医師に相談することが大切です。このアプリは医療の代替ではなく、日々の生活を支える補助ツールとしてご活用ください。
            </p>
          </div>
        </div>
      </div>

      {/* よくある質問 */}
      <div style={{ background:"#fff", padding:"48px 24px" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:32, textAlign:"center" }}>よくある質問</h2>
          {[
            { q:"パニック障害でなくても使えますか？", a:"ぱにいきはパニック障害・不安障害の当事者本人専用のアプリです。ご家族・支援者・医療従事者の方はご利用いただけません。" },
            { q:"個人情報は安全ですか？", a:"投稿・コメントはすべて匿名で表示されます。位置情報はアプリ使用中のみ取得し、正確な位置は他のユーザーに表示されません。" },
            { q:"無料で使えますか？", a:"基本機能は無料でご利用いただけます。投稿・コメント・発作サポート機能などはプレミアムプラン（月額500円）が必要です。ベータ期間中（2026年5月末まで）は全機能無料開放中です。" },
            { q:"解約はいつでもできますか？", a:"はい、いつでも解約できます。解約後は次回更新日までプレミアム機能をご利用いただけます。" },
            { q:"発作が起きた時にすぐ使えますか？", a:"はい。発作サポート機能はログイン後すぐに使えます。トップページの「🆘 発作サポート」ボタンからアクセスしてください。" },
            { q:"スマートフォン以外でも使えますか？", a:"パソコンのブラウザでもご利用いただけますが、スマートフォンでのご利用を推奨しています。" },
          ].map((faq, i) => (
            <div key={i} style={{ background:"#e8f5ec", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>Q. {faq.q}</div>
              <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>A. {faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 料金 */}
      <div style={{ background:"#f0f7f2", padding:"48px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:32 }}>料金プラン</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, maxWidth:500, margin:"0 auto 32px" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #c8e6d0" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#4a9060", marginBottom:8 }}>🆓 無料</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, textAlign:"left" }}>
              ・仲間の確認<br/>
              ・カレンダー記録<br/>
              ・薬一覧<br/>
              ・質問箱を読む
            </div>
          </div>
          <div style={{ background:"#fef3cd", borderRadius:16, padding:24, border:"1.5px solid #c9963a" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#c9963a", marginBottom:4 }}>⭐ プレミアム</div>
            <div style={{ fontSize:13, color:"#c9963a", fontWeight:600, marginBottom:8 }}>月額500円</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, textAlign:"left" }}>
              ・投稿・回答<br/>
              ・発作サポート<br/>
              ・呼吸アシスト<br/>
              ・偽電話機能
            </div>
          </div>
        </div>
        <div style={{ background:"#d4edda", borderRadius:12, padding:"12px 20px", display:"inline-block", marginBottom:24, border:"1px solid #7bbf8c" }}>
          <div style={{ fontSize:13, color:"#4a9060", fontWeight:700 }}>🌿 2026年5月末まで全機能無料開放中！</div>
        </div>
        <div style={{ display:"block" }}>
          <Link href="/auth" style={{ display:"inline-block", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", borderRadius:16, padding:"14px 36px", fontSize:16, fontWeight:800, textDecoration:"none" }}>
            今すぐ無料登録
          </Link>
        </div>
      </div>

      {/* フッター */}
      <div style={{ background:"#2d4a38", padding:"32px 24px", textAlign:"center" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800, marginBottom:16 }}>🌿 ぱにいき</div>
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginBottom:16, flexWrap:"wrap" }}>
          <Link href="/privacy" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>プライバシーポリシー</Link>
          <Link href="/terms" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>利用規約</Link>
          <Link href="/help" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>ヘルプ</Link>
          <Link href="/auth" style={{ color:"rgba(255,255,255,0.6)", fontSize:12, textDecoration:"none" }}>ログイン</Link>
        </div>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11 }}>© 2026 ぱにいき All rights reserved.</div>
      </div>
    </div>
  );
}