"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, query, orderBy, limit, onSnapshot,
  serverTimestamp, doc, getDoc, getDocs, where,
} from "firebase/firestore";

const ANIMALS = ["🐶","🐱","🐻","🐼","🦊","🐨","🐯","🦁","🐮","🐷","🐸","🐙","🦋","🐬","🦒","🦘","🦔","🐧","🦅","🐳"];
const COLORS  = ["#f28b82","#fb8c00","#fdd835","#81c995","#4fc3f7","#a78bfa","#f48fb1","#80cbc4","#ffb74d","#ce93d8","#ef9a9a","#80deea","#c5e1a5","#ffe082","#b0bec5","#90caf9","#ffcc80","#a5d6a7","#f8bbd0","#b39ddb"];
function hashUid(uid: string, mod: number) { let h=0; for(let i=0;i<uid.length;i++) h=(h*31+uid.charCodeAt(i))>>>0; return h%mod; }
function getAnonAvatar(uid: string) { return { animal: ANIMALS[hashUid(uid,ANIMALS.length)], color: COLORS[hashUid(uid+"color",COLORS.length)] }; }

interface Message {
  id: string; text: string; createdAt: Date; uid: string;
  nickname: string; icon: string; imgSrc: string; isPublic: boolean;
  replyTo?: { id: string; nickname: string; text: string } | null;
}
interface BottomSheetUser {
  uid: string; nickname: string; icon: string; imgSrc: string; bio: string; isPublic: boolean;
}

export default function PlazaPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [uid, setUid] = useState("");
  const [nickname, setNickname] = useState("");
  const [icon, setIcon] = useState("🍀");
  const [imgSrc, setImgSrc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; nickname: string; text: string } | null>(null);
  const [bottomSheet, setBottomSheet] = useState<BottomSheetUser | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none"|"pending"|"friend">("none");
  const [friendLoading, setFriendLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setUid(user.uid);
      setNickname(data?.nickname || "");
      setIcon(data?.icon || "🍀");
      setImgSrc(data?.imgSrc || "");
      setIsPublic(data?.plazaPublic || false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map(d => ({
        id: d.id, text: d.data().text || "",
        createdAt: d.data().createdAt?.toDate() || new Date(),
        uid: d.data().uid || "", nickname: d.data().nickname || "匿名",
        icon: d.data().icon || "🌿", imgSrc: d.data().imgSrc || "",
        isPublic: d.data().isPublic || false, replyTo: d.data().replyTo || null,
      })).reverse();
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, []);

  const checkFriendStatus = async (targetUid: string) => {
    if (!uid || uid === targetUid) return;
    // 友達チェック（ドキュメントIDが相手のUID）
    const friendSnap = await getDoc(doc(db, "friends", uid, "list", targetUid));
    if (friendSnap.exists()) { setFriendStatus("friend"); return; }
    // 自分→相手の申請中チェック
    const sentSnap = await getDocs(query(collection(db, "friendRequests"),
      where("fromUid", "==", uid), where("toUid", "==", targetUid), where("status", "==", "pending")));
    if (!sentSnap.empty) { setFriendStatus("pending"); return; }
    // 相手→自分の申請中チェック（相手がすでに申請済みのケース）
    const receivedSnap = await getDocs(query(collection(db, "friendRequests"),
      where("fromUid", "==", targetUid), where("toUid", "==", uid), where("status", "==", "pending")));
    setFriendStatus(receivedSnap.empty ? "none" : "pending");
  };

  const handleAvatarTap = async (m: Message) => {
    if (m.uid === uid) return;
    setFriendStatus("none");
    try {
      const snap = await getDoc(doc(db, "users", m.uid));
      const data = snap.data();
      const anon = getAnonAvatar(m.uid);
      setBottomSheet({
        uid: m.uid,
        nickname: m.isPublic ? (data?.nickname || m.nickname) : anon.animal + " のひと",
        icon: m.isPublic ? (data?.icon || m.icon) : anon.animal,
        imgSrc: m.isPublic ? (data?.imgSrc || "") : "",
        bio: data?.bio || "",
        isPublic: m.isPublic,
      });
      await checkFriendStatus(m.uid);
    } catch(e) { console.error(e); }
  };

  const handleFriendRequest = async () => {
    if (!bottomSheet || !uid || friendLoading) return;
    setFriendLoading(true);
    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUid: uid, fromNickname: nickname, fromIcon: icon, fromImgSrc: imgSrc,
        toUid: bottomSheet.uid, status: "pending", createdAt: serverTimestamp(),
      });
      setFriendStatus("pending");
    } catch(e) { console.error(e); } finally { setFriendLoading(false); }
  };

  const handleSend = async () => {
    if (!text.trim() || !uid) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "chatMessages"), {
        text: text.trim(), uid,
        nickname: isPublic ? nickname : "匿名",
        icon: isPublic ? icon : "🌿",
        imgSrc: isPublic ? imgSrc : "",
        isPublic, replyTo: replyTo || null, createdAt: serverTimestamp(),
      });
      setText(""); setReplyTo(null);
    } finally { setLoading(false); }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("ja-JP", { hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{ height:"100dvh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)", flexShrink:0 }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>💬 広場</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ background:"#fff8e1", borderLeft:"4px solid #ffc107", margin:"12px 16px 0", borderRadius:10, padding:"10px 14px", flexShrink:0 }}>
        <div style={{ fontSize:12, color:"#7a5800", lineHeight:1.8 }}>
          💡 デフォルトは<strong>匿名</strong>です。公開は<span onClick={() => router.push("/profile-edit")} style={{ color:"#5ba872", cursor:"pointer", textDecoration:"underline" }}>プロフィール設定</span>からオンにできます。
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px 0" }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"#8aaa95" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:14 }}>まだメッセージはありません</div>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.uid === uid;
          const anon = !m.isPublic ? getAnonAvatar(m.uid) : null;
          const displayName = m.isPublic ? m.nickname : (anon?.animal + " のひと");
          return (
            <div key={m.id} style={{ display:"flex", flexDirection:isMe?"row-reverse":"row", alignItems:"flex-end", gap:8, marginBottom:12 }}>
              <div onClick={() => handleAvatarTap(m)} style={{ width:32, height:32, borderRadius:"50%", background: anon ? anon.color : "#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, overflow:"hidden", cursor: m.uid!==uid ? "pointer" : "default", border: anon ? "2px solid rgba(0,0,0,0.08)" : "none" }}>
                {m.imgSrc ? <img src={m.imgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : anon ? anon.animal : m.icon}
              </div>
              <div style={{ maxWidth:"72%" }}>
                {!isMe && <div style={{ fontSize:11, color:"#8aaa95", marginBottom:3, paddingLeft:4 }}>{displayName}</div>}
                {m.replyTo && (
                  <div style={{ background:"rgba(0,0,0,0.06)", borderLeft:"3px solid #5ba872", borderRadius:"8px 8px 0 0", padding:"6px 10px", fontSize:11, color:"#5a7a65" }}>
                    <span style={{ fontWeight:700 }}>↩ {m.replyTo.nickname}</span>
                    <div style={{ marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{m.replyTo.text}</div>
                  </div>
                )}
                <div onClick={() => { if(!isMe) setReplyTo({ id:m.id, nickname:displayName, text:m.text }); }}
                  style={{ background:isMe?"linear-gradient(135deg,#5ba872,#7bbf8c)":"#fff", color:isMe?"#fff":"#2d4a38", borderRadius: m.replyTo?(isMe?"0 16px 4px 16px":"0 16px 16px 4px"):(isMe?"16px 16px 4px 16px":"16px 16px 16px 4px"), padding:"10px 14px", fontSize:14, lineHeight:1.6, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", cursor: isMe?"default":"pointer" }}>
                  {m.text}
                </div>
                <div style={{ fontSize:10, color:"#8aaa95", marginTop:3, textAlign:isMe?"right":"left", paddingLeft:4, paddingRight:4 }}>{formatTime(m.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {replyTo && (
        <div style={{ background:"#e8f5ec", borderTop:"1px solid #c8e6d0", padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontSize:12, color:"#5a7a65" }}>
            <span style={{ fontWeight:700 }}>↩ {replyTo.nickname}</span> へ返信中
            <div style={{ fontSize:11, color:"#8aaa95", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:240 }}>{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#8aaa95" }}>✕</button>
        </div>
      )}

      <div style={{ padding:"12px 16px 24px", background:"#fff", borderTop:"1px solid #c8e6d0", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();} }}
          placeholder="メッセージを入力…"
          style={{ flex:1, border:"1.5px solid #c8e6d0", borderRadius:20, padding:"10px 16px", fontSize:14, background:"#e8f5ec", outline:"none" }}/>
        <button onClick={handleSend} disabled={loading||!text.trim()}
          style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:text.trim()?1:0.5 }}>➤</button>
      </div>

      {bottomSheet && (
        <>
          <div onClick={() => setBottomSheet(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100 }}/>
          <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderRadius:"20px 20px 0 0", padding:"24px 20px 40px", zIndex:101, boxShadow:"0 -4px 24px rgba(0,0,0,0.15)" }}>
            <div style={{ width:40, height:4, background:"#c8e6d0", borderRadius:2, margin:"0 auto 20px" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background: !bottomSheet.isPublic ? getAnonAvatar(bottomSheet.uid).color : "#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, overflow:"hidden", flexShrink:0, border:"3px solid #c8e6d0" }}>
                {bottomSheet.imgSrc ? <img src={bottomSheet.imgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : bottomSheet.icon}
              </div>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:"#2d4a38" }}>{bottomSheet.nickname}</div>
                <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>{bottomSheet.isPublic ? "公開アカウント" : "匿名ユーザー"}</div>
              </div>
            </div>
            {bottomSheet.bio
              ? <div style={{ background:"#e8f5ec", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#5a7a65", lineHeight:1.8, marginBottom:16 }}>{bottomSheet.bio}</div>
              : <div style={{ color:"#b0c4b8", fontSize:13, marginBottom:16, textAlign:"center" }}>自己紹介はありません</div>}
            {friendStatus === "none" && (
              <button onClick={handleFriendRequest} disabled={friendLoading}
                style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                {friendLoading ? "送信中…" : "👋 友達申請を送る"}
              </button>
            )}
            {friendStatus === "pending" && <div style={{ width:"100%", background:"#e8f5ec", color:"#8aaa95", borderRadius:12, padding:"14px", fontSize:14, fontWeight:700, textAlign:"center" }}>⏳ 申請中…</div>}
            {friendStatus === "friend" && <div style={{ width:"100%", background:"#e8f5ec", color:"#5ba872", borderRadius:12, padding:"14px", fontSize:14, fontWeight:700, textAlign:"center" }}>✅ 友達です</div>}
          </div>
        </>
      )}
    </div>
  );
}
