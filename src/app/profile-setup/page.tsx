"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const PRESET_ICONS = ["🌸","🍀","☀️","🌊","❄️","🌙","🌈","🦋","🌻","🍃","⭐","🌷"];

export default function ProfileSetupPage() {
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImgSrc(ev.target?.result as string);
      setIcon("");
    };
    reader.readAsDataURL(file);
  };

  const handle = async () => {
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!icon && !imgSrc) { setError("アイコンを選択してください"); return; }
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { router.push("/auth"); return; }
      await setDoc(doc(db, "users", user.uid), {
        nickname: nickname.trim(),
        icon: icon || "",
        imgSrc: imgSrc || "",
        updatedAt: serverTimestamp(),
      }, { merge: true });
      router.push("/add-to-home");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:400, boxShadow:"0 8px 40px rgba(91,168,114,0.15)", border:"1px solid #c8e6d0" }}>

        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>👤</div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#2d4a38", margin:0 }}>プロフィール設定</h1>
          <p style={{ fontSize:12, color:"#5a7a65", marginTop:8, lineHeight:1.8 }}>本名は使わないことをおすすめします</p>
        </div>

        {/* アイコン */}
        <div style={{ textAlign:"center", marginBottom:16 }}>
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

        {/* 絵文字アイコン */}
        <div style={{ marginBottom:16 }}>
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
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>ニックネーム</div>
          <input
            placeholder="例：みどりさん（本名は避けてください）"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setError(""); }}
            style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {error && (
          <div style={{ fontSize:12, color:"#e07070", background:"#fde8e8", borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handle} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          {loading ? "保存中…" : "はじめる 🍃"}
        </button>

      </div>
    </div>
  );
}