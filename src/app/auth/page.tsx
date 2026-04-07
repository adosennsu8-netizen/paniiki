"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
　const handleReset = async () => {
    if (!email) { setError("メールアドレスを入力してください"); return; }
    setResetLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setResetLoading(false);
    }
  };
  const handle = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        const msg = e.message;
        if (msg.includes("invalid-email")) setError("メールアドレスの形式が正しくありません");
        else if (msg.includes("user-not-found")) setError("このメールアドレスは登録されていません");
        else if (msg.includes("wrong-password")) setError("パスワードが間違っています");
        else if (msg.includes("email-already-in-use")) setError("このメールアドレスはすでに登録されています");
        else if (msg.includes("weak-password")) setError("パスワードは8文字以上にしてください");
        else if (msg.includes("too-many-requests")) setError("ログイン試行が多すぎます。しばらく待ってからお試しください");
        else if (msg.includes("invalid-credential")) setError("メールアドレスまたはパスワードが間違っています");
        else if (msg.includes("network-request-failed")) setError("通信エラーが発生しました。電波状況を確認してください");
        else setError("エラーが発生しました。もう一度お試しください");
      }
    }
      finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:360, boxShadow:"0 8px 40px rgba(91,168,114,0.15)", border:"1px solid #c8e6d0" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🌿</div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#4a9060", margin:0 }}>ぱにいき</h1>
          <p style={{ fontSize:11, color:"#5a7a65", marginTop:4 }}>パニック障害と生きていく</p>
        </div>

        <div style={{ display:"flex", marginBottom:20, borderRadius:10, overflow:"hidden", border:"1.5px solid #c8e6d0" }}>
          {["ログイン","新規登録"].map((label, i) => (
            <button key={label} onClick={() => setIsLogin(i === 0)}
              style={{ flex:1, padding:"10px", border:"none", background:isLogin===(i===0)?"#5ba872":"#fff", color:isLogin===(i===0)?"#fff":"#5a7a65", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              {label}
            </button>
          ))}
        </div>

        <input
          type="email" placeholder="メールアドレス" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, marginBottom:10, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}
        />
        <input
          type="password" placeholder="パスワード（8文字以上）" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, marginBottom:16, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}
        />

        {error && (
          <div style={{ fontSize:12, color:"#e07070", background:"#fde8e8", borderRadius:8, padding:"8px 12px", marginBottom:12 }}>
            ⚠️ {error}
          </div>
        )}

       <button onClick={handle} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          {loading ? "処理中…" : isLogin ? "ログイン" : "登録する"}
        </button>

        {isLogin && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button onClick={handleReset} disabled={resetLoading}
              style={{ background:"none", border:"none", color:"#8aaa95", fontSize:12, cursor:"pointer", textDecoration:"underline" }}>
              {resetSent ? "✓ リセットメールを送信しました" : resetLoading ? "送信中…" : "パスワードをお忘れの方"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}