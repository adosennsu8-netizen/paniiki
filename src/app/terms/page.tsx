import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🌿 ぱにいき</div>
        <Link href="/landing" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px 80px" }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#2d4a38", marginBottom:8 }}>利用規約</h1>
        <p style={{ fontSize:13, color:"#8aaa95", marginBottom:32 }}>最終更新日：2026年4月</p>

        {[
          {
            title:"第1条（適用）",
            content:"本規約は、ぱにいき（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で当サービスを利用するものとします。"
          },
          {
            title:"第2条（利用資格）",
            content:"当サービスはパニック障害・不安障害の当事者本人のみご利用いただけます。\n\n以下の方はご利用いただけません。\n・家族・支援者・介護者\n・医療従事者・研究者\n・その他、当事者以外のすべての方\n\n虚偽申告による登録は本規約違反となり、即時アカウント停止および法的措置の対象となります。"
          },
          {
            title:"第3条（禁止事項）",
            content:"ユーザーは以下の行為を行ってはなりません。\n\n・虚偽の情報を登録・投稿する行為\n・他のユーザーを誹謗中傷する行為\n・医療情報として不正確な情報を意図的に広める行為\n・当サービスの運営を妨害する行為\n・その他、当サービスが不適切と判断する行為"
          },
          {
            title:"第4条（医療免責）",
            content:"当サービスは医療サービスではありません。\n\n・薬の情報はあくまで参考情報です\n・服薬・治療に関する判断は必ず医師の指示に従ってください\n・当サービスの情報に基づく判断によって生じた損害について、当サービスは責任を負いません"
          },
          {
            title:"第5条（料金・決済）",
            content:"当サービスは基本無料でご利用いただけます。\n\nプレミアムプランは月額500円です。\n・料金はStripeを通じて決済されます\n・月単位での自動更新となります\n・解約はいつでも可能です\n・解約後は次回更新日までプレミアム機能をご利用いただけます"
          },
          {
            title:"第6条（投稿コンテンツ）",
            content:"ユーザーが投稿したコンテンツの著作権はユーザーに帰属します。ただし、当サービスはサービス改善のために投稿コンテンツを利用できるものとします。\n\n不適切な投稿は当サービスの判断により削除することがあります。"
          },
          {
            title:"第7条（アカウント停止）",
            content:"以下の場合、予告なくアカウントを停止することがあります。\n\n・本規約に違反した場合\n・虚偽申告が判明した場合\n・その他、当サービスが不適切と判断した場合"
          },
          {
            title:"第8条（免責事項）",
            content:"当サービスは以下について責任を負いません。\n\n・サービスの一時停止・終了による損害\n・投稿コンテンツの正確性\n・ユーザー間のトラブル\n・その他、当サービスの利用に関連して生じた損害"
          },
          {
            title:"第9条（規約の変更）",
            content:"当サービスは必要に応じて本規約を変更することがあります。重要な変更がある場合はアプリ内でお知らせします。"
          },
          {
            title:"第10条（準拠法）",
            content:"本規約は日本法に準拠し、日本法に従って解釈されます。"
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
