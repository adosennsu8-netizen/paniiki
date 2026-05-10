"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

type Conversation = {
  id: string;
  participants: string[];
  otherUid: string;
  otherNickname: string;
  otherIcon: string;
  otherImgSrc?: string;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  unreadCount: number;
};

export default function DMListPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "dmConversations"),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Conversation[] = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const otherUid = (data.participants as string[]).find((u) => u !== uid)!;
        return {
          id: docSnap.id,
          participants: data.participants,
          otherUid,
          otherNickname: data[`nickname_${otherUid}`] ?? "ユーザー",
          otherIcon: data[`icon_${otherUid}`] ?? "🐾",
          otherImgSrc: data[`imgSrc_${otherUid}`] ?? undefined,
          lastMessage: data.lastMessage ?? "",
          lastMessageAt: data.lastMessageAt ?? null,
          unreadCount: data[`unread_${uid}`] ?? 0,
        };
      });
      setConvs(list);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (isToday) {
      return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  };

  const totalUnread = convs.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <button onClick={() => router.back()} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800, display:"flex", alignItems:"center", gap:8 }}>
          💬 DM
          {totalUnread > 0 && (
            <span style={{ background:"#e07070", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", paddingTop:80, color:"#8aaa95" }}>読み込み中…</div>
      ) : convs.length === 0 ? (
        <div style={{ textAlign:"center", paddingTop:80, color:"#8aaa95" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
          <div style={{ fontSize:14 }}>まだDMはありません</div>
          <div style={{ fontSize:12, marginTop:4, color:"#b0c4b8" }}>広場でプロフィールをタップしてDMを送れます</div>
        </div>
      ) : (
        <ul style={{ listStyle:"none", margin:0, padding:0 }}>
          {convs.map((conv) => (
            <li key={conv.id}>
              <button
                onClick={() => router.push(`/dm/${conv.id}`)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"16px", background:"#fff", border:"none", borderBottom:"1px solid #e8f5ec", cursor:"pointer", textAlign:"left" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  {conv.otherImgSrc ? (
                    <img src={conv.otherImgSrc} alt="" style={{ width:48, height:48, borderRadius:"50%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:48, height:48, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                      {conv.otherIcon}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div style={{ position:"absolute", top:-4, right:-4, background:"#e07070", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </div>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontWeight:700, fontSize:14, color: conv.unreadCount > 0 ? "#2d4a38" : "#5a7a65" }}>
                      {conv.otherNickname}
                    </span>
                    <span style={{ fontSize:11, color:"#8aaa95", marginLeft:8, flexShrink:0 }}>
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div style={{ fontSize:12, marginTop:2, color: conv.unreadCount > 0 ? "#3d7a55" : "#8aaa95", fontWeight: conv.unreadCount > 0 ? 600 : 400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {conv.lastMessage || "まだメッセージはありません"}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
