"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState("");

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
      setChecking(false);
      // Push通知の購読
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          const { updateDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await updateDoc(doc(db, 'users', user.uid), {
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
          {isPremium && <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>⭐</span>}
          <div onClick={() => router.push("/profile-edit")}
  style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:"2px solid rgba(255,255,255,0.5)", cursor:"pointer" }}>
  {icon}
          </div>
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>
        <div onClick={() => router.push("/profile-edit")}
  style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, cursor:"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{icon}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#2d4a38" }}>{nickname}</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>{isPremium ? "⭐ プレミアム会員" : "🆓 無料プラン"}</div>
          </div>
        </div>

        <div style={{ fontSize:12, fontWeight:700, color:"#8aaa95", letterSpacing:"0.1em", marginBottom:10 }}>メニュー</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[
            { icon:"🗺", label:"近くの仲間", desc:"300m以内の仲間", path:"/map" },
            { icon:"📅", label:"カレンダー", desc:"発作・受診を記録", path:"/calendar" },
            { icon:"💊", label:"薬の管理", desc:"飲み忘れ防止・記録", path:"/medicine" },
            { icon:"📋", label:"薬一覧", desc:"処方薬の情報", path:"/meds" },
            { icon:"❓", label:"質問箱", desc:"仲間に相談する", path:"/qa" },
            { icon:"💡", label:"豆知識", desc:"経験をシェア", path:"/tips" },
            { icon:"📍", label:"場所情報", desc:"クリニック・休める場所", path:"/places" },
            { icon:"📵", label:"偽電話", desc:"その場を離れる", path:"/fake-call" },
          ].map(item => (
            <button key={item.path} onClick={() => router.push(item.path)}
              style={{ background:"#fff", border:"1px solid #c8e6d0", borderRadius:16, padding:"16px 12px", cursor:"pointer", textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
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