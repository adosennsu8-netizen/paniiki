"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore";

type Message = {
  id: string;
  text: string;
  senderUid: string;
  createdAt: Timestamp | null;
};

type ConvMeta = {
  otherNickname: string;
  otherIcon: string;
  otherImgSrc?: string;
  otherUid: string;
};

export default function DMChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<ConvMeta | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 認証確認
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
    });
    return () => unsub();
  }, [router]);

  // 会話メタ情報取得
  useEffect(() => {
    if (!uid || !conversationId) return;
    getDoc(doc(db, "dmConversations", conversationId)).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const otherUid = (data.participants as string[]).find((u) => u !== uid)!;
      setMeta({
        otherUid,
        otherNickname: data[`nickname_${otherUid}`] ?? "ユーザー",
        otherIcon: data[`icon_${otherUid}`] ?? "🐾",
        otherImgSrc: data[`imgSrc_${otherUid}`] ?? undefined,
      });
    });
  }, [uid, conversationId]);

  // メッセージリアルタイム取得 + 既読リセット
  useEffect(() => {
    if (!uid || !conversationId) return;

    const q = query(
      collection(db, "dmConversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs.map((d) => ({
        id: d.id,
        text: d.data().text,
        senderUid: d.data().senderUid,
        createdAt: d.data().createdAt ?? null,
      }));
      setMessages(msgs);
      // 既読リセット
      updateDoc(doc(db, "dmConversations", conversationId), {
        [`unread_${uid}`]: 0,
      }).catch(() => {});
    });

    return () => unsub();
  }, [uid, conversationId]);

  // 最下部スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!uid || !text.trim() || sending || !meta) return;
    setSending(true);
    const trimmed = text.trim();
    setText("");

    try {
      await addDoc(
        collection(db, "dmConversations", conversationId, "messages"),
        { text: trimmed, senderUid: uid, createdAt: serverTimestamp() }
      );
      await updateDoc(doc(db, "dmConversations", conversationId), {
        lastMessage: trimmed,
        lastMessageAt: serverTimestamp(),
        [`unread_${meta.otherUid}`]: increment(1),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    return ts.toDate().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      {/* ヘッダー */}
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 2px 12px rgba(91,168,114,0.25)", flexShrink:0 }}>
        <button onClick={() => router.push("/dm")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 12px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
        {meta && (
          <>
            {meta.otherImgSrc ? (
              <img src={meta.otherImgSrc} alt="" style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover" }} />
            ) : (
              <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                {meta.otherIcon}
              </div>
            )}
            <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>{meta.otherNickname}</span>
          </>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 12px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((msg) => {
          const isMine = msg.senderUid === uid;
          return (
            <div key={msg.id} style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems:"flex-end", gap:8 }}>
              {!isMine && meta && (
                <div style={{ flexShrink:0 }}>
                  {meta.otherImgSrc ? (
                    <img src={meta.otherImgSrc} alt="" style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
                      {meta.otherIcon}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", alignItems: isMine ? "flex-end" : "flex-start", gap:4, maxWidth:"70%" }}>
                <div style={{
                  padding:"10px 14px",
                  borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMine ? "linear-gradient(135deg,#5ba872,#7bbf8c)" : "#fff",
                  color: isMine ? "#fff" : "#2d4a38",
                  fontSize:14,
                  lineHeight:1.6,
                  boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
                  whiteSpace:"pre-wrap",
                  wordBreak:"break-word",
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize:10, color:"#8aaa95" }}>{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div style={{ background:"#fff", borderTop:"1px solid #c8e6d0", padding:"10px 12px", display:"flex", alignItems:"flex-end", gap:8, flexShrink:0 }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力…"
          rows={1}
          style={{ flex:1, resize:"none", borderRadius:20, border:"1px solid #c8e6d0", padding:"10px 14px", fontSize:14, outline:"none", background:"#f0f7f2", maxHeight:120, overflowY:"auto", lineHeight:1.5, fontFamily:"inherit" }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          style={{ width:40, height:40, borderRadius:"50%", background: text.trim() ? "linear-gradient(135deg,#5ba872,#7bbf8c)" : "#c8e6d0", border:"none", color:"#fff", fontSize:18, cursor: text.trim() ? "pointer" : "not-allowed", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          ↑
        </button>
      </div>
    </div>
  );
}
