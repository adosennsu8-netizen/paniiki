"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc, getDoc,
  collection, getDocs, query, orderBy, limit, where,
  onSnapshot,
} from "firebase/firestore";

export default function HomePage() {
  const [dmUnread, setDmUnread] = useState(0);
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadPlaza, setUnreadPlaza] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/landing"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      if (!data?.pledged) { router.push("/pledge"); return; }
      if (!data?.nickname) { router.push("/profile-setup"); return; }
      setIsPremium(true);
      setEmail(user.email || "");
      setUid(user.uid);
      setNickname(data?.nickname || "");
      setIcon(data?.icon || "🍀");
      setImgSrc(data?.imgSrc || "");
      setChecking(false);

      try {
        const noticesSnap = await getDocs(query(collection(db, "notices"), orderBy("createdAt", "desc")));
        const readNotices: string[] = data?.readNotices || [];
        const unread = noticesSnap.docs.filter(d => !readNotices.includes(d.id)).length;
        setUnreadCount(unread);
      } catch (e) {
        console.log("notices fetch failed:", e);
      }

      try {
        const lastSeen = data?.lastSeenPlaza?.toDate() || new Date(0);
        const msgsSnap = await getDocs(query(collection(db, "chatMessages"), orderBy("createdAt", "desc"), limit(1)));
        if (!msgsSnap.empty) {
          const latest = msgsSnap.docs[0].data().createdAt?.toDate();
          if (latest && latest > lastSeen) setUnreadPlaza(true);
        }
      } catch (e) {
        console.log("plaza unread check failed:", e);
      }

      // DM未読＋友達申請カウント監視
      const dmQ = query(collection(db, "dmConversations"), where("participants", "array-contains", user.uid));
      const reqQ = query(collection(db, "friendRequests"), where("toUid", "==", user.uid), where("status", "==", "pending"));
      let dmTotal = 0; let reqTotal = 0;
      onSnapshot(dmQ, (dmSnap) => {
        dmTotal = dmSnap.docs.reduce((s, d) => s + (d.data()[`unread_${user.uid}`] ?? 0), 0);
        setDmUnread(dmTotal + reqTotal);
      });
      onSnapshot(reqQ, (reqSnap) => {
        reqTotal = reqSnap.size;
        setDmUnread(dmTotal + reqTotal);
      });

      // Push通知の購読
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          const { updateDoc, doc: firestoreDoc } = await import('firebase/firestore');
          const { db: firestoreDb } = await import('@/lib/firebase');
          await updateDoc(firestoreDoc(firestoreDb, 'users', user.uid), {
            pushSubscription: JSON.parse(JSON.stringify(sub))
          });
        } catch (e) {
          console.log('Push subscription failed:', e);
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handlePremium = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/landing");
  };

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🌿</div>
        <div style={{ fontSize:14, color:"#5a7a65" }}>読み込み中…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🌿 ぱにいき</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9, letterSpacing:"0.15em" }}>パニック障害と生きていく</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isPremium && (
            <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>⭐</span>
          )}

          {/* ベルアイコン（お知らせ） */}
          <div onClick={() => router.push("/notices")} style={{ position:"relative", cursor:"pointer" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔔</div>
            {unreadCount > 0 && (
              <div style={{ position:"absolute", top:-4, right:-4, background:"#e07070", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {unreadCount}
              </div>
            )}
          </div>

          {/* DMアイコン */}
          <div onClick={() => router.push("/dm")} style={{ position:"relative", cursor:"pointer" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            {dmUnread > 0 && (
              <div style={{ position:"absolute", top:-4, right:-4, background:"#e07070", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {dmUnread > 9 ? "9+" : dmUnread}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>
        <div onClick={() => router.push("/profile-edit")}
          style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, cursor:"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, overflow:"hidden" }}>
            {imgSrc
              ? <img src={imgSrc} alt="icon" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : icon}
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#2d4a38" }}>{nickname}</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>{isPremium ? "⭐ プレミアム会員" : "🆓 無料プラン"}</div>
          </div>
        </div>

        <div style={{ fontSize:12, fontWeight:700, color:"#8aaa95", letterSpacing:"0.1em", marginBottom:10 }}>メニュー</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[
            { icon:"🗺", label:"近くの仲間", desc:"300m以内の仲間", path:"/map" },
            { icon:"💬", label:"広場", desc:"みんなとチャット", path:"/plaza" },
            { icon:"📅", label:"カレンダー", desc:"発作・受診を記録", path:"/calendar" },
            { icon:"💊", label:"薬の管理", desc:"飲み忘れ防止・記録", path:"/medicine" },
            { icon:"📋", label:"薬一覧", desc:"処方薬の情報", path:"/meds" },
            { icon:"❓", label:"質問箱", desc:"仲間に相談する", path:"/qa" },
            { icon:"💡", label:"豆知識", desc:"経験をシェア", path:"/tips" },
            { icon:"📍", label:"場所情報", desc:"クリニック・休める場所", path:"/places" },
            { icon:"📵", label:"偽電話", desc:"その場を離れる", path:"/fake-call" },
          ].map(item => (
            <button key={item.path} onClick={() => router.push(item.path)}
              style={{ background:"#fff", border:"1px solid #c8e6d0", borderRadius:16, padding:"16px 12px", cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", position:"relative" }}>
              {item.path === "/plaza" && unreadPlaza && (
                <div style={{ position:"absolute", top:10, right:10, width:10, height:10, background:"#e07070", borderRadius:"50%" }}/>
              )}
              <div style={{ fontSize:28, marginBottom:6 }}>{item.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:2 }}>{item.label}</div>
              <div style={{ fontSize:11, color:"#8aaa95" }}>{item.desc}</div>
            </button>
          ))}
        </div>

        <button onClick={() => router.push("/sos")}
          style={{ width:"100%", background:"linear-gradient(135deg,#e8938a,#c96060)", color:"#fff", border:"none", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 20px rgba(201,96,96,0.35)", marginBottom:12, letterSpacing:"0.05em" }}>
          🆘 発作サポート
        </button>

        <button onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: "ぱにいき",
              text: "パニック障害と生きていく。当事者専用アプリ「ぱにいき」を使ってみてください。",
              url: "https://paniiki-g1rb.vercel.app/landing",
            });
          } else {
            navigator.clipboard.writeText("https://paniiki-g1rb.vercel.app/landing");
            alert("URLをコピーしました！");
          }
        }}
          style={{ width:"100%", background:"#fff", color:"#5a7a65", border:"1px solid #c8e6d0", borderRadius:12, padding:"11px", fontSize:13, cursor:"pointer", marginBottom:10 }}>
          🔗 友だちに紹介する
        </button>

        <button onClick={() => router.push("/help")}
          style={{ width:"100%", background:"#fff", color:"#5a7a65", border:"1px solid #c8e6d0", borderRadius:12, padding:"11px", fontSize:13, cursor:"pointer", marginBottom:10 }}>
          ❓ ヘルプ・使い方
        </button>

        <button onClick={handleLogout}
          style={{ width:"100%", background:"#e8f5ec", color:"#8aaa95", border:"none", borderRadius:12, padding:"11px", fontSize:13, cursor:"pointer" }}>
          ログアウト
        </button>
      </div>
    </div>
  );
}
