"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const PLEDGES = [
  "私はパニック障害または不安障害の当事者本人です",
  "このコミュニティを当事者同士が安心できる場として大切に使います",
  "虚偽申告による登録は利用規約違反となり、即時アカウント停止および法的措置の対象となることを理解しています",
  "上記すべてに同意し、誠実にぱにいきを利用することを誓います",
];

export default function PledgePage() {
  const [checked, setChecked] = useState([false, false, false, false]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => {
    setChecked(c => c.map((v, j) => j === i ? !v : v));
  };

  const handle = async () => {
    if (!allChecked) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) { router.push("/auth"); return; }
      await setDoc(doc(db, "users", user.uid), {
        pledgedAt: serverTimestamp(),
        email: user.email,
        pledged: true,
      }, { merge: true });
      router.push("/profile-setup");
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
          <div style={{ fontSize:40, marginBottom:8 }}>📋</div>
          <h1 style={{ fontSize:20, fontWeight:800, color:"#2d4a38", margin:0 }}>ご利用資格の確認</h1>
          <p style={{ fontSize:12, color:"#5a7a65", marginTop:8, lineHeight:1.8 }}>
            ぱにいきは<strong>パニック障害・不安障害の<br/>当事者本人</strong>のための場所です。
          </p>
        </div>

        <div style={{ background:"#fde8e8", border:"1px solid #e07070", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#e07070", fontWeight:700, marginBottom:4 }}>⚠️ ご利用いただけない方</div>
          <div style={{ fontSize:12, color:"#2d4a38", lineHeight:1.8 }}>
            ・家族・支援者・介護者<br/>
            ・医療従事者・研究者<br/>
            ・その他、当事者以外のすべての方
          </div>
        </div>

        {PLEDGES.map((text, i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{ display:"flex", alignItems:"flex-start", gap:12, background:checked[i]?"#d4edda":"#e8f5ec", border:`2px solid ${checked[i]?"#5ba872":"#c8e6d0"}`, borderRadius:12, padding:"12px 14px", marginBottom:10, cursor:"pointer" }}>
            <div style={{ width:22, height:22, borderRadius:6, background:checked[i]?"#5ba872":"#fff", border:`2px solid ${checked[i]?"#5ba872":"#c8e6d0"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              {checked[i] && <span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>✓</span>}
            </div>
            <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.7 }}>{text}</div>
          </div>
        ))}

        <div style={{ background:"#e8f5ec", borderRadius:10, padding:"8px 14px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#5a7a65", lineHeight:1.7 }}>
            🔐 同意日時・登録情報はサーバーに記録されます。虚偽登録があった場合の法的証拠として使用されます。
          </div>
        </div>

        <button onClick={handle} disabled={!allChecked || loading}
          style={{ width:"100%", background:allChecked?"linear-gradient(135deg,#5ba872,#7bbf8c)":"#c8e6d0", color:allChecked?"#fff":"#8aaa95", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:allChecked?"pointer":"not-allowed" }}>
          {loading ? "処理中…" : allChecked ? "同意してはじめる →" : "すべてチェックしてください"}
        </button>

      </div>
    </div>
  );
}