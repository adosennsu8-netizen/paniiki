"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

interface NearbyUser { id: string; comment?: string; x: number; y: number; seed: number; }

const ANON_EMOJI = ["凄","晴","ｦ・,"ｦ・,"製","棲","生","請","西","精","ｦ・,"凄"];

export default function MapPage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [comment, setComment] = useState("");
  const [myComment, setMyComment] = useState("");
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setIsPremium(true) // ベータ期間中は全機能無料（2026年5月末まで）;
      setIsJoining(data?.mapJoining || false);
      setMyComment(data?.mapComment || "");
      await loadNearbyUsers(user.uid);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    intervalRef.current = setInterval(() => loadNearbyUsers(uid), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [uid]);

  const loadNearbyUsers = async (userId: string) => {
    const snap = await getDocs(collection(db, "mapUsers"));
    const users: NearbyUser[] = [];
    snap.forEach(d => {
      if (d.id === userId) return;
      const data = d.data();
      if (!data.joining) return;
      const seed = d.id.charCodeAt(0) + d.id.charCodeAt(1);
      users.push({
        id: d.id,
        comment: data.comment || "",
        x: 15 + (seed * 37) % 70,
        y: 15 + (seed * 53) % 70,
        seed: seed % 12,
      });
    });
    setNearbyUsers(users);
  };

  const handleJoinToggle = async () => {
    const newJoining = !isJoining;
    setIsJoining(newJoining);
    await setDoc(doc(db, "mapUsers", uid), {
      joining: newJoining,
      comment: myComment,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, "users", uid), {
      mapJoining: newJoining,
    }, { merge: true });
    if (newJoining) await loadNearbyUsers(uid);
  };

  const handleComment = async () => {
    if (!isPremium || !comment.trim()) return;
    setLoading(true);
    try {
      const newComment = comment.trim();
      setMyComment(newComment);
      await setDoc(doc(db, "mapUsers", uid), {
        joining: true,
        comment: newComment,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(db, "users", uid), {
        mapJoining: true,
        mapComment: newComment,
      }, { merge: true });
      setIsJoining(true);
      setComment("");
      await loadNearbyUsers(uid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>亮 霑代￥縺ｮ莉ｲ髢・/div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>縺ｱ縺ｫ縺・″ 窶・300m遽・峇</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>竊・謌ｻ繧・/button>
      </div>

      {/* 謫ｬ莨ｼ繝槭ャ繝・*/}
      <div style={{ margin:"12px 16px 0", borderRadius:16, overflow:"hidden", border:"1px solid #c8e6d0", position:"relative", height:280, background:"#e8f0eb", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <svg width="100%" height="100%" style={{ position:"absolute", top:0, left:0 }}>
          {[0,1,2,3,4].map(i=><line key={`h${i}`} x1="0" y1={`${i*25}%`} x2="100%" y2={`${i*25}%`} stroke="#c8ddd0" strokeWidth="1"/>)}
          {[0,1,2,3,4].map(i=><line key={`v${i}`} x1={`${i*25}%`} y1="0" x2={`${i*25}%`} y2="100%" stroke="#c8ddd0" strokeWidth="1"/>)}
          <rect x="0" y="45%" width="100%" height="10%" fill="#d4e8da" rx="2"/>
          <rect x="45%" y="0" width="10%" height="100%" fill="#d4e8da" rx="2"/>
          <rect x="10%" y="10%" width="15%" height="20%" fill="#c8ddd0" rx="3" opacity="0.6"/>
          <rect x="72%" y="12%" width="18%" height="16%" fill="#c8ddd0" rx="3" opacity="0.6"/>
          <rect x="8%" y="65%" width="20%" height="22%" fill="#c8ddd0" rx="3" opacity="0.6"/>
          <rect x="68%" y="65%" width="22%" height="20%" fill="#c8ddd0" rx="3" opacity="0.6"/>
        </svg>

        {/* 閾ｪ蛻・・繝峨ャ繝・*/}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:10 }}>
          <div style={{ width:20, height:20, background:"#5ba872", borderRadius:"50%", border:"3px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}/>
          <div style={{ position:"absolute", top:-4, left:-4, width:28, height:28, border:"2px solid #5ba872", borderRadius:"50%", opacity:0.4, animation:"pulse 2s infinite" }}/>
        </div>

        {/* 霑代￥縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ */}
        {nearbyUsers.map(u => (
          <div key={u.id} onClick={() => setShowBubble(showBubble === u.id ? null : u.id)}
            style={{ position:"absolute", top:`${u.y}%`, left:`${u.x}%`, cursor:"pointer", zIndex:5 }}>
            <div style={{ width:16, height:16, background:"#e07070", borderRadius:"50%", border:"2px solid white", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
            {showBubble === u.id && u.comment && (
              <div style={{ position:"absolute", bottom:22, left:-48, background:"#fff", borderRadius:10, padding:"6px 10px", fontSize:11, color:"#2d4a38", boxShadow:"0 2px 8px rgba(0,0,0,0.15)", border:"1px solid #c8e6d0", width:140 }}>
                <span style={{ marginRight:4 }}>{ANON_EMOJI[u.seed]}</span>{u.comment}
              </div>
            )}
          </div>
        ))}

        <div style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,0.92)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#2d4a38" }}>
          桃 300m莉･蜀・↓ <strong>{nearbyUsers.length}莠ｺ</strong> 縺ｮ莉ｲ髢・
        </div>
        <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(255,255,255,0.92)", borderRadius:8, padding:"4px 10px", fontSize:10, color:"#5a7a65" }}>
          {isJoining ? "笳・蜿ょ刈荳ｭ" : "笳・髱櫁｡ｨ遉ｺ"}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0.1}}`}</style>
      </div>

      {/* 蜿ょ刈繝医げ繝ｫ */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:isJoining&&myComment?12:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38" }}>MAP縺ｫ蜿ょ刈縺吶ｋ</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>ON縺ｫ縺吶ｋ縺ｨ莉ｲ髢薙・蝨ｰ蝗ｳ縺ｫ陦ｨ遉ｺ縺輔ｌ縺ｾ縺呻ｼ亥諺蜷搾ｼ・/div>
          </div>
          <div onClick={handleJoinToggle} style={{ width:48, height:26, borderRadius:13, background:isJoining?"#5ba872":"#c8e6d0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:isJoining?24:2, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
          </div>
        </div>
        {isJoining && myComment && (
          <div style={{ background:"#e8f5ec", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#4a9060" }}>
            町 陦ｨ遉ｺ荳ｭ・嘴myComment}
          </div>
        )}
      </div>

      {/* 繧ｳ繝｡繝ｳ繝域兜遞ｿ */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>
          町 MAP縺ｫ繧ｳ繝｡繝ｳ繝医ｒ谿九☆
          {!isPremium && <span style={{ background:"#fef3cd", color:"#c9963a", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700, marginLeft:8 }}>箝・繝励Ξ繝溘い繝</span>}
        </div>
        <div style={{ fontSize:11, color:"#8aaa95", marginBottom:10 }}>莉翫・豌玲戟縺｡繧樽AP縺ｫ陦ｨ遉ｺ縺ｧ縺阪∪縺呻ｼ亥諺蜷搾ｼ・/div>
        <input placeholder="萓具ｼ壻ｻ頑律縺ｯ螟悶↓蜃ｺ繧峨ｌ縺滂ｼ・ value={comment} onChange={e => setComment(e.target.value)} disabled={!isPremium}
          style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:isPremium?"#e8f5ec":"#f5f5f5", outline:"none", boxSizing:"border-box", marginBottom:10, color:isPremium?"#2d4a38":"#aaa" }}/>
        <button onClick={handleComment} disabled={!isPremium||loading}
          style={{ width:"100%", background:isPremium?"linear-gradient(135deg,#5ba872,#7bbf8c)":"#e8f5ec", color:isPremium?"#fff":"#aaa", border:"none", borderRadius:12, padding:"11px", fontSize:14, fontWeight:600, cursor:isPremium?"pointer":"not-allowed" }}>
          {loading?"陦ｨ遉ｺ荳ｭ窶ｦ":"MAP縺ｫ陦ｨ遉ｺ縺吶ｋ"}
        </button>
      </div>

      {/* 蝣ｴ謇諠・ｱ縺ｸ縺ｮ繝ｪ繝ｳ繧ｯ */}
      <div style={{ margin:"12px 16px 80px" }}>
        <button onClick={() => router.push("/places")}
          style={{ width:"100%", background:"#fff", border:"1px solid #c8e6d0", borderRadius:16, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize:24 }}>桃</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38" }}>蝣ｴ謇諠・ｱ繝ｻ繧ｯ繝ｪ繝九ャ繧ｯ</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>霑代￥縺ｮ繧ｯ繝ｪ繝九ャ繧ｯ繝ｻ莨代ａ繧句ｴ謇繧呈爾縺・/div>
          </div>
          <span style={{ marginLeft:"auto", color:"#8aaa95", fontSize:18 }}>窶ｺ</span>
        </button>
      </div>
    </div>
  );
}
