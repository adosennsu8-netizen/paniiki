"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, getCountFromServer, doc, deleteDoc, getDocs, query, where } from "firebase/firestore";

const ADMIN_UID = "tYMe5rMBWRbPk8etZl1NbQSwARs1";

const HELP_ITEMS = [
  { icon:"🗺", title:"MAPの使い方", desc:"近くの仲間を確認する方法", path:"/help/map" },
  { icon:"📅", title:"カレンダーの使い方", desc:"発作・受診・体調を記録する方法", path:"/help/calendar" },
  { icon:"💊", title:"薬管理の使い方", desc:"飲み忘れ防止アラームの設定方法", path:"/help/medicine" },
  { icon:"❓", title:"質問箱の使い方", desc:"仲間に相談・回答する方法", path:"/help/qa" },
  { icon:"💡", title:"豆知識の使い方", desc:"経験や知識を投稿する方法", path:"/help/tips" },
  { icon:"🆘", title:"発作サポートの使い方", desc:"呼吸アシスト・そっとしておいてカード", path:"/help/sos" },
  { icon:"📵", title:"偽電話の使い方", desc:"その場を自然に離れる方法", path:"/help/fake-call" },
  { icon:"📍", title:"場所情報の使い方", desc:"クリニック・休める場所を探す方法", path:"/help/places" },
  { icon:"⭐", title:"プレミアムプランについて", desc:"有料機能と料金について", path:"/help/premium" },
];

export default function HelpPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [uid, setUid] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      if (user.uid === ADMIN_UID) {
        setIsAdmin(true);
        try {
          const snap = await getCountFromServer(collection(db, "users"));
          setUserCount(snap.data().count);
        } catch (e) {
          console.error(e);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !uid) return;
    setDeleting(true);
    setDeleteError("");
    try {
      // calEvents削除
      const calQ = query(collection(db, "calEvents"), where("uid", "==", uid));
      const calSnap = await getDocs(calQ);
      for (const d of calSnap.docs) {
        await deleteDoc(doc(db, "calEvents", d.id));
      }
      // mapUsers削除
      await deleteDoc(doc(db, "mapUsers", uid));
      // users削除
      await deleteDoc(doc(db, "users", uid));
      // Firebase Auth削除
      await deleteUser(auth.currentUser);
      window.location.replace("/auth");
    } catch (e: any) {
      if (e.code === "auth/requires-recent-login") {
        setDeleteError("セキュリティのため、一度ログアウトして再ログイン後にお試しください。");
      } else {
        setDeleteError("エラーが発生しました。時間をおいて再度お試しください。");
      }
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN','BIZ UDPGothic',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>❓ ヘルプ・使い方</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <Link href="/" style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, textDecoration:"none" }}>← 戻る</Link>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginBottom:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>📲 まずはホーム画面に追加しよう</div>
          <div style={{ fontSize:12, color:"#5a7a65", lineHeight:2.0 }}>
            ぱにいきはホーム画面に追加してアプリとして使えます。<br/>
            <br/>
            <strong>iPhoneの場合</strong><br/>
            Safari で開く → 下の共有ボタン（□↑）をタップ →「ホーム画面に追加」をタップ<br/>
            <br/>
            <strong>Androidの場合</strong><br/>
            Chrome で開く → 右上の「⋮」をタップ →「ホーム画面に追加」をタップ<br/>
            <br/>
            <strong>PCの場合</strong><br/>
            Chrome のアドレスバー右側の「⊕」アイコンをクリック → インストール
          </div>
        </div>
        <div style={{ background:"#fff8e1", borderRadius:16, padding:"14px 16px", marginBottom:16, border:"1px solid #ffe082" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#b07800", marginBottom:4 }}>⚠️ アプリが開かない場合</div>
          <div style={{ fontSize:12, color:"#7a5800", lineHeight:1.8 }}>
            ブラウザの「サイトの設定」→「データを削除」を行ってから再度アクセスしてください。それでも解決しない場合は、シークレットモード（プライベートブラウジング）でお試しください。
          </div>
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:"14px 16px", marginBottom:16, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8 }}>
            各機能の使い方は下のメニューからご確認ください。
          </div>
        </div>
        {HELP_ITEMS.map(item => (
          <Link key={item.path} href={item.path} style={{ textDecoration:"none" }}>
            <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,0.05)", border:"1px solid #c8e6d0", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                {item.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:3 }}>{item.title}</div>
                <div style={{ fontSize:12, color:"#8aaa95" }}>{item.desc}</div>
              </div>
              <div style={{ color:"#c8e6d0", fontSize:20 }}>›</div>
            </div>
          </Link>
        ))}

        <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginTop:8, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>📩 解決しない場合</div>
          <div style={{ fontSize:12, color:"#5a7a65", lineHeight:1.8 }}>
            お問い合わせは下記メールアドレスよりご連絡ください。<br/>
            <a href="https://www.joynovation.com" target="_blank" style={{ color:"#5ba872" }}>www.joynovation.com</a>
          </div>
        </div>

        {/* 退会セクション */}
        <div style={{ background:"#fff", borderRadius:16, padding:"16px", marginTop:10, border:"1px solid #f5c6c6" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#c0392b", marginBottom:8 }}>🚪 退会する</div>
          <div style={{ fontSize:12, color:"#5a7a65", lineHeight:1.8, marginBottom:12 }}>
            退会すると以下のデータが削除されます。この操作は取り消せません。<br/>
            ・アカウント情報<br/>
            ・カレンダーの記録<br/>
            ・マップ情報<br/>
            ※匿名の投稿（質問箱・広場など）は残ります。
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ width:"100%", background:"#fff0f0", color:"#c0392b", border:"1.5px solid #f5c6c6", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            退会手続きへ
          </button>
        </div>

        <div style={{ background:"#e8f5ec", borderRadius:16, padding:"16px", marginTop:10, border:"1px solid #c8e6d0" }}>
          <div style={{ fontSize:11, color:"#8aaa95", lineHeight:2.0, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              運営会社：Joynovation（ジョイノベーション）<br/>
              所在地：福岡県福岡市<br/>
              Webサイト：<a href="https://www.joynovation.com" target="_blank" style={{ color:"#5ba872" }}>www.joynovation.com</a>
            </div>
            {isAdmin && userCount !== null && (
              <div style={{ fontSize:11, color:"#c8e6d0", fontWeight:700, marginLeft:8, flexShrink:0 }}>
                {userCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 退会確認モーダル */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#c0392b", marginBottom:8, textAlign:"center" }}>⚠️ 本当に退会しますか？</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, marginBottom:16, textAlign:"center" }}>
              アカウントと個人データが完全に削除されます。<br/>この操作は取り消せません。
            </div>
            {deleteError && (
              <div style={{ background:"#fff0f0", border:"1px solid #f5c6c6", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#c0392b", marginBottom:12 }}>
                {deleteError}
              </div>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{ width:"100%", background:deleting?"#ccc":"#e74c3c", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:deleting?"not-allowed":"pointer", marginBottom:10 }}>
              {deleting ? "削除中…" : "退会して全データを削除する"}
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
              disabled={deleting}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
