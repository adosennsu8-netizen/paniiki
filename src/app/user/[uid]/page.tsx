"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createOrGetConversation } from "@/lib/dm";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const targetUid = params.uid as string;

  const [currentUid, setCurrentUid] = useState("");
  const [myProfile, setMyProfile] = useState<{ nickname: string; icon: string; imgSrc?: string } | null>(null);

  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [dmLoading, setDmLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setCurrentUid(user.uid);

      // 自分のプロフィール取得（DM送信に必要）
      const mySnap = await getDoc(doc(db, "users", user.uid));
      if (mySnap.exists()) {
        const d = mySnap.data();
        setMyProfile({ nickname: d.nickname, icon: d.icon, imgSrc: d.imgSrc });
      }

      // 相手のプロフィール取得
      try {
        const snap = await getDoc(doc(db, "users", targetUid));
        const data = snap.data();
        setNickname(data?.nickname || "");
        setIcon(data?.icon || "🍀");
        setImgSrc(data?.imgSrc || "");
        setBio(data?.bio || "");
      } catch (e) {
        console.log("user fetch failed:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [targetUid]);

  const handleDM = async () => {
    if (!currentUid || !myProfile || dmLoading) return;
    setDmLoading(true);
    try {
      const convId = await createOrGetConversation(
        { uid: currentUid, ...myProfile },
        { uid: targetUid, nickname, icon, imgSrc: imgSrc || undefined }
      );
      router.push(`/dm/${convId}`);
    } catch (e) {
      console.error("DM作成失敗:", e);
    } finally {
      setDmLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🌿</div>
        <div style={{ fontSize:14, color:"#5a7a65" }}>読み込み中…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>👤 プロフィール</div>
        <button onClick={() => router.back()} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ padding:"24px 16px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:24, textAlign:"center", border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, margin:"0 auto 16px", overflow:"hidden", border:"3px solid #c8e6d0" }}>
            {imgSrc
              ? <img src={imgSrc} alt="icon" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : icon}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"#2d4a38", marginBottom:8 }}>{nickname}</div>
          {bio && (
            <div style={{ fontSize:13, color:"#5a7a65", lineHeight:1.8, background:"#e8f5ec", borderRadius:12, padding:"10px 14px", marginTop:8 }}>
              {bio}
            </div>
          )}
        </div>

        {/* 自分以外にのみDMボタンを表示 */}
        {currentUid && currentUid !== targetUid && (
          <button
            onClick={handleDM}
            disabled={dmLoading}
            style={{
              width:"100%",
              background: dmLoading ? "#c8e6d0" : "linear-gradient(135deg,#5ba872,#7bbf8c)",
              color:"#fff",
              border:"none",
              borderRadius:12,
              padding:"14px",
              fontSize:15,
              fontWeight:700,
              cursor: dmLoading ? "not-allowed" : "pointer",
              boxShadow:"0 4px 16px rgba(91,168,114,0.3)",
              transition:"opacity 0.2s",
            }}>
            {dmLoading ? "移動中…" : "💬 DM を送る"}
          </button>
        )}
      </div>
    </div>
  );
}
