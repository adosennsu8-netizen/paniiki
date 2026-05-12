"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getCountFromServer } from "firebase/firestore";

const ADMIN_UID = "tYMe5rMBWRbPk8etZl1NbQSwARs1";

export default function StatsPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || user.uid !== ADMIN_UID) {
        router.push("/");
        return;
      }
      setAllowed(true);
      try {
        const snap = await getCountFromServer(collection(db, "users"));
        setUserCount(snap.data().count);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (!allowed) return null;

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:40, textAlign:"center", border:"1px solid #c8e6d0", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", minWidth:240 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🌿</div>
        <div style={{ fontSize:13, color:"#8aaa95", marginBottom:20, letterSpacing:"0.1em" }}>管理者統計</div>
        {loading ? (
          <div style={{ color:"#8aaa95", fontSize:14 }}>読み込み中…</div>
        ) : (
          <div>
            <div style={{ fontSize:13, color:"#8aaa95", marginBottom:6 }}>登録ユーザー数</div>
            <div style={{ fontSize:52, fontWeight:800, color:"#2d4a38", lineHeight:1 }}>{userCount?.toLocaleString()}</div>
            <div style={{ fontSize:13, color:"#8aaa95", marginTop:6 }}>人</div>
          </div>
        )}
        <button onClick={() => router.push("/")}
          style={{ marginTop:28, background:"#e8f5ec", color:"#5a7a65", border:"none", borderRadius:12, padding:"10px 24px", fontSize:13, cursor:"pointer" }}>
          ← ホームに戻る
        </button>
      </div>
    </div>
  );
}
