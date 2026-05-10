"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc, getDoc } from "firebase/firestore";

// ===== 匿名アバター生成 =====
const ANIMALS = ["🐶","🐱","🐻","🐼","🦊","🐨","🐯","🦁","🐮","🐷","🐸","🐙","🦋","🐬","🦒","🦘","🦔","🐧","🦅","🐳"];
const COLORS  = ["#f28b82","#fb8c00","#fdd835","#81c995","#4fc3f7","#a78bfa","#f48fb1","#80cbc4","#ffb74d","#ce93d8",
                 "#ef9a9a","#80deea","#c5e1a5","#ffe082","#b0bec5","#90caf9","#ffcc80","#a5d6a7","#f8bbd0","#b39ddb"];

// UIDから0〜N-1の整数を返す（簡易ハッシュ）
function hashUid(uid: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

function getAnonAvatar(uid: string): { animal: string; color: string } {
  const animal = ANIMALS[hashUid(uid, ANIMALS.length)];
  const color  = COLORS[hashUid(uid + "color", COLORS.length)];
  return { animal, color };
}
// ============================

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  uid: string;
  nickname: string;
  icon: string;
  imgSrc: string;
  isPublic: boolean;
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
        id: d.id,
        text: d.data().text || "",
        createdAt: d.data().createdAt?.toDate() || new Date(),
        uid: d.data().uid || "",
        nickname: d.data().nickname || "匿名",
        icon: d.data().icon || "🌿",
        imgSrc: d.data().imgSrc || "",
        isPublic: d.data().isPublic || false,
      })).reverse();
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, []);

  const handleSend = async () => {
    if (!text.trim() || !uid) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "chatMessages"), {
        text: text.trim(),
        uid,
        nickname: isPublic ? nickname : "匿名",
        icon: isPublic ? icon : "🌿",
        imgSrc: isPublic ? imgSrc : "",
        isPublic,
        createdAt: serverTimestamp(),
      });
      setText("");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ height:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)", flexShrink:0 }}>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800 }}>💬 広場</div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ background:"#fff8e1", borderLeft:"4px solid #ffc107", margin:"12px 16px 0", borderRadius:10, padding:"10px 14px", flexShrink:0 }}>
        <div style={{ fontSize:12, color:"#7a5800", lineHeight:1.8 }}>
          💡 メッセージはデフォルトで<strong>匿名</strong>です。アカウントを表示したい場合は<span onClick={() => router.push("/profile-edit")} style={{ color:"#5ba872", cursor:"pointer", textDecoration:"underline" }}>プロフィール設定</span>からオンにできます。
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px 0" }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"#8aaa95" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
            <div style={{ fontSize:14 }}>まだメッセージはありません。最初に話しかけてみましょう！</div>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.uid === uid;

          // 匿名の場合はUID→動物＋色で識別
          const anonAvatar = !m.isPublic ? getAnonAvatar(m.uid) : null;

          return (
            <div key={m.id} style={{ display:"flex", flexDirection:isMe?"row-reverse":"row", alignItems:"flex-end", gap:8, marginBottom:12 }}>
              {/* アバター */}
              <div
                onClick={() => m.isPublic && router.push(`/user/${m.uid}`)}
                style={{
                  width:32, height:32, borderRadius:"50%",
                  background: anonAvatar ? anonAvatar.color : "#e8f5ec",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, flexShrink:0, overflow:"hidden",
                  cursor: m.isPublic ? "pointer" : "default",
                  border: anonAvatar ? "2px solid rgba(0,0,0,0.08)" : "none",
                }}>
                {m.imgSrc
                  ? <img src={m.imgSrc} alt="icon" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : anonAvatar ? anonAvatar.animal : m.icon}
              </div>

              <div style={{ maxWidth:"70%" }}>
                {!isMe && (
                  <div style={{ fontSize:11, color:"#8aaa95", marginBottom:3, paddingLeft:4 }}>
                    {m.isPublic ? m.nickname : anonAvatar?.animal + " のひと"}
                  </div>
                )}
                <div style={{ background:isMe?"linear-gradient(135deg,#5ba872,#7bbf8c)":"#fff", color:isMe?"#fff":"#2d4a38", borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"10px 14px", fontSize:14, lineHeight:1.6, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
                  {m.text}
                </div>
                <div style={{ fontSize:10, color:"#8aaa95", marginTop:3, textAlign:isMe?"right":"left", paddingLeft:4, paddingRight:4 }}>
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding:"12px 16px 24px", background:"#fff", borderTop:"1px solid #c8e6d0", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder="メッセージを入力…"
          style={{ flex:1, border:"1.5px solid #c8e6d0", borderRadius:20, padding:"10px 16px", fontSize:14, background:"#e8f5ec", outline:"none" }}
        />
        <button onClick={handleSend} disabled={loading || !text.trim()}
          style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:text.trim()?1:0.5 }}>
          ➤
        </button>
      </div>
    </div>
  );
}
