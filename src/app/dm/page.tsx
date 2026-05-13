"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, query, where, orderBy, onSnapshot,
  Timestamp, doc, updateDoc, serverTimestamp, getDoc, setDoc,
} from "firebase/firestore";
import { getConversationId } from "@/lib/dm";

type Conversation = {
  id: string; otherUid: string; otherNickname: string;
  otherIcon: string; otherImgSrc?: string;
  lastMessage: string; lastMessageAt: Timestamp | null; unreadCount: number;
};
type FriendRequest = {
  id: string; fromUid: string; fromNickname: string;
  fromIcon: string; fromImgSrc: string; createdAt: Timestamp | null;
};

export default function DMListPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState("");
  const [myIcon, setMyIcon] = useState("");
  const [myImgSrc, setMyImgSrc] = useState("");
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      setMyNickname(data?.nickname || "");
      setMyIcon(data?.icon || "");
      setMyImgSrc(data?.imgSrc || "");
    });
    return () => unsub();
  }, [router]);

  // DM一覧
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "dmConversations"),
      where("participants", "array-contains", uid),
      orderBy("lastMessageAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setConvs(snap.docs.map(d => {
        const data = d.data();
        const otherUid = (data.participants as string[]).find(u => u !== uid)!;
        return {
          id: d.id, otherUid,
          otherNickname: data[`nickname_${otherUid}`] ?? "ユーザー",
          otherIcon: data[`icon_${otherUid}`] ?? "🐾",
          otherImgSrc: data[`imgSrc_${otherUid}`] ?? undefined,
          lastMessage: data.lastMessage ?? "",
          lastMessageAt: data.lastMessageAt ?? null,
          unreadCount: data[`unread_${uid}`] ?? 0,
        };
      }));
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // 友達申請受信
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({
        id: d.id,
        fromUid: d.data().fromUid,
        fromNickname: d.data().fromNickname || "ユーザー",
        fromIcon: d.data().fromIcon || "🐾",
        fromImgSrc: d.data().fromImgSrc || "",
        createdAt: d.data().createdAt ?? null,
      })));
    });
    return () => unsub();
  }, [uid]);

  const handleAccept = async (req: FriendRequest) => {
    if (!uid || actionLoading) return;
    setActionLoading(req.id);
    try {
      const convId = getConversationId(uid, req.fromUid);

      // DM会話を作成（両者のparticipantsに入るので双方から見える）
      await setDoc(doc(db, "dmConversations", convId), {
        participants: [uid, req.fromUid],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        [`unread_${uid}`]: 0,
        [`unread_${req.fromUid}`]: 0,
        [`nickname_${uid}`]: myNickname,
        [`icon_${uid}`]: myIcon,
        [`imgSrc_${uid}`]: myImgSrc || null,
        [`nickname_${req.fromUid}`]: req.fromNickname,
        [`icon_${req.fromUid}`]: req.fromIcon,
        [`imgSrc_${req.fromUid}`]: req.fromImgSrc || null,
      }, { merge: true });

      // 双方向で friends/list に追加（ドキュメントIDを相手のUIDにする）
      await setDoc(doc(db, "friends", uid, "list", req.fromUid), {
        uid: req.fromUid, createdAt: serverTimestamp()
      });
      await setDoc(doc(db, "friends", req.fromUid, "list", uid), {
        uid, createdAt: serverTimestamp()
      });

      // 申請をacceptedに更新
      await updateDoc(doc(db, "friendRequests", req.id), { status: "accepted" });

    } catch(e) { console.error(e); } finally { setActionLoading(null); }
  };

  const handleReject = async (req: FriendRequest) => {
    if (!uid || actionLoading) return;
    setActionLoading(req.id);
    try {
      await updateDoc(doc(db, "friendRequests", req.id), { status: "rejected" });
    } catch(e) { console.error(e); } finally { setActionLoading(null); }
  };

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate(), now = new Date();
    const isToday = d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
    return isToday
      ? d.toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"})
      : d.toLocaleDateString("ja-JP",{month:"numeric",day:"numeric"});
  };

  const totalUnread = convs.reduce((s,c) => s+c.unreadCount, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <button onClick={() => router.back()} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
        <div style={{ color:"#fff", fontSize:18, fontWeight:800, display:"flex", alignItems:"center", gap:8 }}>
          💬 DM
          {(totalUnread + requests.length) > 0 && (
            <span style={{ background:"#e07070", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>
              {totalUnread + requests.length}
            </span>
          )}
        </div>
      </div>

      {/* 友達申請 */}
      {requests.length > 0 && (
        <div style={{ padding:"12px 16px 0" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#8aaa95", letterSpacing:"0.1em", marginBottom:8 }}>👋 友達申請</div>
          {requests.map(req => (
            <div key={req.id} style={{ background:"#fff", borderRadius:16, padding:14, marginBottom:10, display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, overflow:"hidden", flexShrink:0 }}>
                {req.fromImgSrc
                  ? <img src={req.fromImgSrc} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : req.fromIcon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#2d4a38" }}>{req.fromNickname}</div>
                <div style={{ fontSize:11, color:"#8aaa95", marginTop:2 }}>友達申請が届いています</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => handleAccept(req)} disabled={actionLoading===req.id}
                  style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  {actionLoading===req.id ? "…" : "承認"}
                </button>
                <button onClick={() => handleReject(req)} disabled={actionLoading===req.id}
                  style={{ background:"#f5e8e8", color:"#c97070", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  拒否
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DM一覧 */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", paddingTop:60, color:"#8aaa95" }}>読み込み中…</div>
      ) : convs.length === 0 ? (
        <div style={{ textAlign:"center", paddingTop:60, color:"#8aaa95" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
          <div style={{ fontSize:14 }}>まだDMはありません</div>
          <div style={{ fontSize:12, marginTop:4, color:"#b0c4b8" }}>友達申請が承認されるとDMできます</div>
        </div>
      ) : (
        <>
          {requests.length > 0 && (
            <div style={{ fontSize:12, fontWeight:700, color:"#8aaa95", letterSpacing:"0.1em", padding:"12px 16px 8px" }}>💬 メッセージ</div>
          )}
          <ul style={{ listStyle:"none", margin:0, padding:0 }}>
            {convs.map(conv => (
              <li key={conv.id}>
                <button onClick={() => router.push(`/dm/${conv.id}`)}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"16px", background:"#fff", border:"none", borderBottom:"1px solid #e8f5ec", cursor:"pointer", textAlign:"left" }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    {conv.otherImgSrc
                      ? <img src={conv.otherImgSrc} alt="" style={{ width:48, height:48, borderRadius:"50%", objectFit:"cover" }}/>
                      : <div style={{ width:48, height:48, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{conv.otherIcon}</div>}
                    {conv.unreadCount > 0 && (
                      <div style={{ position:"absolute", top:-4, right:-4, background:"#e07070", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                      <span style={{ fontWeight:700, fontSize:14, color: conv.unreadCount>0?"#2d4a38":"#5a7a65" }}>{conv.otherNickname}</span>
                      <span style={{ fontSize:11, color:"#8aaa95", marginLeft:8, flexShrink:0 }}>{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <div style={{ fontSize:12, marginTop:2, color: conv.unreadCount>0?"#3d7a55":"#8aaa95", fontWeight: conv.unreadCount>0?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {conv.lastMessage || "まだメッセージはありません"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
