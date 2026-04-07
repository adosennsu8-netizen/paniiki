"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      await setDoc(doc(db, "users", user.uid), {
        isPremium: true,
        premiumSince: serverTimestamp(),
      }, { merge: true });
      setTimeout(() => router.push("/"), 3000);
    });
    return () => unsub();
  }, [router]);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ textAlign:"center", padding:24 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#4a9060", marginBottom:8 }}>プレミアム登録完了！</div>
        <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.8 }}>ありがとうございます。<br/>すべての機能が使えるようになりました。<br/>まもなくトップページに移動します。</div>
      </div>
    </div>
  );
}