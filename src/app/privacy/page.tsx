import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🌿 ぱにいき</div>
        <Link href="/landing" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px 80px" }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#2d4a38", marginBottom:8 }}>プライバシーポリシー</h1>
        <p style={{ fontSize:13, color:"#8aaa95", marginBottom:32 }}>最終更新日：2026年4月</p>

        {[
          {
            title:"1. 収集する情報",
            content:"当サービスは、以下の情報を収集することがあります。\n\n・メールアドレス（登録時）\n・ニックネーム・アイコン画像（プロフィール設定時）\n・カレンダー記録・薬の記録（ユーザーが入力した情報）\n・投稿内容（質問・豆知識・場所情報など）\n・位置情報（MAPに参加する場合のみ・任意）"
          },
          {
            title:"2. 情報の利用目的",
            content:"収集した情報は以下の目的で利用します。\n\n・サービスの提供・運営\n・ユーザーサポート\n・サービスの改善・新機能の開発\n・不正利用の防止"
          },
          {
            title:"3. 情報の管理",
            content:"当サービスは、収集した個人情報を適切に管理します。\n\n・メールアドレスはハッシュ化して保存します\n・位置情報はアプリ使用中のみ取得し、サーバーには正確な位置を保存しません\n・投稿内容はすべて匿名で表示されます\n・退会時はすべてのデータを即時削除します"
          },
          {
            title:"4. 第三者への提供",
            content:"当サービスは、以下の場合を除き、収集した情報を第三者に提供しません。\n\n・ユーザーの同意がある場合\n・法令に基づく場合\n・生命・身体・財産の保護のために必要な場合\n\n広告目的での第三者への情報提供は行いません。"
          },
          {
            title:"5. 利用するサービス",
            content:"当サービスは以下の外部サービスを利用しています。\n\n・Firebase（Google LLC）：認証・データベース\n・Stripe Inc.：決済処理\n・Vercel Inc.：ホスティング\n\nこれらのサービスのプライバシーポリシーについては、各社のウェブサイトをご確認ください。"
          },
          {
            title:"6. 位置情報について",
            content:"MAPへの参加は任意です。位置情報を提供する場合、以下の点をご了承ください。\n\n・位置情報はアプリ使用中のみ取得します\n・他のユーザーには正確な位置は表示されません\n・位置情報はいつでも設定からOFFにできます"
          },
          {
            title:"7. Cookie・ローカルストレージ",
            content:"当サービスは、サービスの提供のためにCookieおよびローカルストレージを使用することがあります。"
          },
          {
            title:"8. お問い合わせ",
            content:"プライバシーポリシーに関するお問い合わせは、アプリ内のお問い合わせフォームよりご連絡ください。"
          },
          {
            title:"9. 改定",
            content:"当サービスは、必要に応じて本プライバシーポリシーを改定することがあります。重要な変更がある場合は、アプリ内でお知らせします。"
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:16, fontWeight:700, color:"#2d4a38", marginBottom:12, paddingBottom:8, borderBottom:"1px solid #c8e6d0" }}>{section.title}</h2>
            <p style={{ fontSize:14, color:"#5a7a65", lineHeight:1.9, whiteSpace:"pre-wrap", margin:0 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}