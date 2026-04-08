"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";

interface NearbyUser { id: string; comment?: string; x: number; y: number; seed: number; }

const ANON_EMOJI = ["🐦","🐰","🦝","🦊","🐻","🐱","🐶","🐿","🐼","🐸","🦋","🐦"];

// 2点間の距離計算（メートル）
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

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
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setIsPremium(true);
      setIsJoining(data?.mapJoining || false);
      setMyComment(data?.mapComment || "");
      getLocation(user.uid);
    });
    return () => unsub();
  }, []);

  const getLocation = (userId: string) => {
    if (!navigator.geolocation) {
      setLocationError("位置情報が使えません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMyLat(lat);
        setMyLng(lng);
        loadNearbyUsers(userId, lat, lng);
      },
      () => {
        setLocationError("位置情報を取得できませんでした");
        loadNearbyUsers(userId, null, null);
      }
    );
  };

  useEffect(() => {
    if (!uid || myLat === null || myLng === null) return;
    intervalRef.current = setInterval(() => loadNearbyUsers(uid, myLat, myLng), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [uid, myLat, myLng]);

  const loadNearbyUsers = async (userId: string, lat: number | null, lng: number | null) => {
    const snap = await getDocs(collection(db, "mapUsers"));
    const users: NearbyUser[] = [];
    snap.forEach(d => {
      if (d.id === userId) return;
      const data = d.data();
      if (!data.joining) return;

      // 位置情報がある場合は300m以内のみ表示
      if (lat !== null && lng !== null && data.lat && data.lng) {
        const dist = calcDistance(lat, lng, data.lat, data.lng);
        if (dist > 300) return;
      } else if (lat !== null && lng !== null) {
        // 相手の位置情報がない場合は表示しない
        return;
      }

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

    const updateData: Record<string, unknown> = {
      joining: newJoining,
      comment: myComment,
      updatedAt: serverTimestamp(),
    };

    // 参加する時は位置情報も保存
    if (newJoining && myLat !== null && myLng !== null) {
      updateData.lat = myLat;
      updateData.lng = myLng;
    }

    await setDoc(doc(db, "mapUsers", uid), updateData, { merge: true });
    await setDoc(doc(db, "users", uid), { mapJoining: newJoining }, { merge: true });
    if (newJoining && myLat !== null && myLng !== null) {
      await loadNearbyUsers(uid, myLat, myLng);
    }
  };

  const handleComment = async () => {
    if (!isPremium || !comment.trim()) return;
    setLoading(true);
    try {
      const newComment = comment.trim();
      setMyComment(newComment);
      const updateData: Record<string, unknown> = {
        joining: true,
        comment: newComment,
        updatedAt: serverTimestamp(),
      };
      if (myLat !== null && myLng !== null) {
        updateData.lat = myLat;
        updateData.lng = myLng;
      }
      await setDoc(doc(db, "mapUsers", uid), updateData, { merge: true });
      await setDoc(doc(db, "users", uid), { mapJoining: true, mapComment: newComment }, { merge: true });
      setIsJoining(true);
      setComment("");
      if (myLat !== null && myLng !== null) {
        await loadNearbyUsers(uid, myLat, myLng);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>🗺 近くの仲間</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき — 300m範囲</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      {/* 位置情報エラー */}
      {locationError && (
        <div style={{ margin:"12px 16px 0", background:"#fde8e8", borderRadius:12, padding:"10px 14px", border:"1px solid #e07070" }}>
          <div style={{ fontSize:12, color:"#e07070" }}>⚠️ {locationError}</div>
        </div>
      )}

      {/* 擬似マップ */}
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

        {/* 自分のドット */}
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:10 }}>
          <div style={{ width:20, height:20, background:"#5ba872", borderRadius:"50%", border:"3px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}/>
          <div style={{ position:"absolute", top:-4, left:-4, width:28, height:28, border:"2px solid #5ba872", borderRadius:"50%", opacity:0.4, animation:"pulse 2s infinite" }}/>
        </div>

        {/* 近くのユーザー */}
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
          📍 300m以内に <strong>{nearbyUsers.length}人</strong> の仲間
        </div>
        <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(255,255,255,0.92)", borderRadius:8, padding:"4px 10px", fontSize:10, color:"#5a7a65" }}>
          {isJoining ? "● 参加中" : "○ 非表示"}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(2.2);opacity:0.1}}`}</style>
      </div>

      {/* 参加トグル */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:isJoining&&myComment?12:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38" }}>MAPに参加する</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>ONにすると仲間の地図に表示されます（匿名）</div>
          </div>
          <div onClick={handleJoinToggle} style={{ width:48, height:26, borderRadius:13, background:isJoining?"#5ba872":"#c8e6d0", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:isJoining?24:2, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
          </div>
        </div>
        {isJoining && myComment && (
          <div style={{ background:"#e8f5ec", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#4a9060" }}>
            💬 表示中：{myComment}
          </div>
        )}
      </div>

      {/* コメント投稿 */}
      <div style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, border:"1px solid #c8e6d0", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:4 }}>
          💬 MAPにコメントを残す
        </div>
        <div style={{ fontSize:11, color:"#8aaa95", marginBottom:10 }}>今の気持ちをMAPに表示できます（匿名）</div>
        <input placeholder="例：今日は外に出られた！" value={comment} onChange={e => setComment(e.target.value)}
          style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
        <button onClick={handleComment} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"11px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
          {loading?"表示中…":"MAPに表示する"}
        </button>
      </div>

      {/* 場所情報へのリンク */}
      <div style={{ margin:"12px 16px 80px" }}>
        <button onClick={() => router.push("/places")}
          style={{ width:"100%", background:"#fff", border:"1px solid #c8e6d0", borderRadius:16, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <span style={{ fontSize:24 }}>📍</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38" }}>場所情報・クリニック</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>近くのクリニック・休める場所を探す</div>
          </div>
          <span style={{ marginLeft:"auto", color:"#8aaa95", fontSize:18 }}>›</span>
        </button>
      </div>
    </div>
  );
}