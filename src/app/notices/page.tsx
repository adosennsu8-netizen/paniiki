"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, doc, updateDoc, arrayUnion } from "firebase/firestore";

interface Notice { id: string; title: string; body: string; createdAt: Date; }

export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      try {
        const q = query(collection(db, "notices"));
        const snap = await getDocs(q);
        const items: Notice[] = snap.docs.map(d => ({
          id: d.id,
          title: d.data().title || "",
          body: d.data().body || "",
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));
        setNotices(items);
        if (snap.docs.length > 0) {
          await updateDoc(doc(db, "users", user.uid), {
            readNotices: arrayUnion(...snap.docs.map(d => d.id)),
          });
        }
      } catch (e) {
        console.log("notices error:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>🔔 お知らせ</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:"#8aaa95" }}>読み込み中…</div>
        ) : notices.length === 0 ? (
          <div style={{ background:"#fff", borderRadius:16, padding:24, textAlign:"center", border:"1px solid #c8e6d0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
            <div style={{ fontSize:14, color:"#8aaa95" }}>お知らせはありません</div>
          </div>
        ) : notices.map(n => (
          <div key={n.id} style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:10, border:"1px solid #c8e6d0", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:11, color:"#8aaa95", marginBottom:6 }}>
              {n.createdAt.toLocaleDateString("ja-JP")}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:"#2d4a38", marginBottom:8 }}>{n.title}</div>
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}