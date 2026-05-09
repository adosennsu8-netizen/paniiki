"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PRESET_ICONS = ["🌸","🍀","☀️","🌊","❄️","🌙","🌈","🦋","🌻","🍃","⭐","🌷"];

export default function ProfileEditPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setNickname(data?.nickname || "");
      setIcon(data?.icon || "");
      setImgSrc(data?.imgSrc || "");
      setBio(data?.bio || "");
    });
    return () => unsub();
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const MAX = 200;
    let w = img.width;
    let h = img.height;
    if (w > h) { h = (h / w) * MAX; w = MAX; }
    else { w = (w / h) * MAX; h = MAX; }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL("image/jpeg", 0.7);
    setImgSrc(compressed);
    setIcon("");
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

  const handleSave = async () => {
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!icon && !imgSrc) { setError("アイコンを選択してください"); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, "users", user.uid), {
        nickname: nickname.trim(),
        icon: icon || "",
        imgSrc: imgSrc || "",
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => router.push("/"), 1000);
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>👤 プロフィール編集</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ padding:"20px 16px 100px" }}>
        {/* アイコン */}
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:14 }}>アイコン</div>
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <div onClick={() => fileRef.current?.click()}
              style={{ width:80, height:80, borderRadius:"50%", background:"#e8f5ec", border:`3px dashed ${imgSrc||icon?"#5ba872":"#c8e6d0"}`, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}>
              {imgSrc
                ? <img src={imgSrc} alt="icon" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : icon
                ? <span style={{ fontSize:40 }}>{icon}</span>
                : <div><div style={{ fontSize:24 }}>📷</div><div style={{ fontSize:9, color:"#8aaa95" }}>写真</div></div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
            <button onClick={() => fileRef.current?.click()}
              style={{ background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:20, padding:"5px 14px", fontSize:12, cursor:"pointer" }}>
              📷 写真をアップロード
            </button>
          </div>
          <div style={{ fontSize:12, color:"#5a7a65", marginBottom:8, fontWeight:600 }}>または絵文字から選ぶ</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
            {PRESET_ICONS.map(em => (
              <div key={em} onClick={() => { setIcon(em); setImgSrc(""); }}
                style={{ aspectRatio:"1", borderRadius:10, background:icon===em?"#d4edda":"#e8f5ec", border:`2px solid ${icon===em?"#5ba872":"#c8e6d0"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, cursor:"pointer" }}>
                {em}
              </div>
            ))}
          </div>
        </div>

        {/* ニックネーム */}
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:12, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:10 }}>ニックネーム</div>
          <input
            placeholder="例：みどりさん（本名は避けてください）"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError(""); }}
            style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {/* 一言自己紹介 */}
        <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:20, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>一言自己紹介</div>
          <div style={{ fontSize:11, color:"#8aaa95", marginBottom:10 }}>任意・MAPや質問箱に表示されます</div>
          <textarea
            placeholder="例：発症5年目。少しずつ外出できるようになってきました🍀"
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={80}
            rows={3}
            style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", resize:"none", fontFamily:"inherit" }}
          />
          <div style={{ textAlign:"right", fontSize:11, color:"#8aaa95" }}>{bio.length}/80</div>
        </div>

        {error && (
          <div style={{ fontSize:12, color:"#e07070", background:"#fde8e8", borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{ fontSize:12, color:"#4a9060", background:"#d4edda", borderRadius:8, padding:"8px 12px", marginBottom:12, textAlign:"center" }}>
            ✅ 保存しました！
          </div>
        )}

        <button onClick={handleSave} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          {loading ? "保存中…" : "保存する 🍃"}
        </button>
      </div>
    </div>
  );
}