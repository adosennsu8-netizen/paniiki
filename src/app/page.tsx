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
      setIcon(data?.icon || "??");
      setChecking(false);
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
        <div style={{ fontSize:48, marginBottom:12 }}>??</div>
        <div style={{ fontSize:14, color:"#5a7a65" }}>�ǂݍ��ݒ��c</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>?? �ςɂ���</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9, letterSpacing:"0.15em" }}>�p�j�b�N��Q�Ɛ����Ă���</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {isPremium && <span style={{ background:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>?</span>}
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, border:"2px solid rgba(255,255,255,0.5)" }}>
            {icon}
          </div>
        </div>
      </div>

      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{icon}</div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:"#2d4a38" }}>{nickname}</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>{isPremium ? "? �v���~�A�����" : "?? �����v����"}</div>
          </div>
        </div>

        {!isPremium && (
          <div style={{ background:"#fef3cd", borderRadius:16, padding:16, border:"1.5px solid #c9963a", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#c9963a", marginBottom:6 }}>? �v���~�A���ɃA�b�v�O���[�h</div>
            <div style={{ fontSize:11, color:"#5a7a65", lineHeight:1.8, marginBottom:12 }}>���z500�~�œ��e�E�R�����g�E����T�|�[�g���g���܂��B</div>
            <button onClick={handlePremium} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#c9963a,#e8b84b)", color:"#fff", border:"none", borderRadius:12, padding:"11px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {loading ? "�������c" : "? �v���~�A���ɂȂ�i���z500�~�j"}
            </button>
          </div>
        )}

        <div style={{ fontSize:12, fontWeight:700, color:"#8aaa95", letterSpacing:"0.1em", marginBottom:10 }}>���j���[</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[
            { icon:"??", label:"�߂��̒���", desc:"300m�ȓ��̒���", path:"/map" },
            { icon:"??", label:"�J�����_�[", desc:"����E��f���L�^", path:"/calendar" },
            { icon:"??", label:"��̊Ǘ�", desc:"���ݖY��h�~�E�L�^", path:"/medicine" },
            { icon:"??", label:"��ꗗ", desc:"������̏��", path:"/meds" },
            { icon:"?", label:"���┠", desc:"���Ԃɑ��k����", path:"/qa" },
            { icon:"??", label:"���m��", desc:"�o�����V�F�A", path:"/tips" },
            { icon:"??", label:"�ꏊ���", desc:"�N���j�b�N�E�x�߂�ꏊ", path:"/places" },
            { icon:"??", label:"�U�d�b", desc:"���̏�𗣂��", path:"/fake-call" },
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
          ?? ����T�|�[�g
        </button>

        <button onClick={handleLogout}
          style={{ width:"100%", background:"#e8f5ec", color:"#8aaa95", border:"none", borderRadius:12, padding:"11px", fontSize:13, cursor:"pointer" }}>
          ���O�A�E�g
        </button>
      </div>
    </div>
  );
}
