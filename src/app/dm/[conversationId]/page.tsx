"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
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
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<ConvMeta | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 会話メタ情報取得
  useEffect(() => {
    if (!user || !conversationId) return;
    const convRef = doc(db, "dmConversations", conversationId);
    getDoc(convRef).then((snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const otherUid = (data.participants as string[]).find(
        (uid) => uid !== user.uid
      )!;
      setMeta({
        otherUid,
        otherNickname: data[`nickname_${otherUid}`] ?? "ユーザー",
        otherIcon: data[`icon_${otherUid}`] ?? "🐾",
        otherImgSrc: data[`imgSrc_${otherUid}`] ?? undefined,
      });
    });
  }, [user, conversationId]);

  // メッセージリアルタイム取得 + 既読リセット
  useEffect(() => {
    if (!user || !conversationId) return;

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

      // 自分の未読カウントをリセット
      const convRef = doc(db, "dmConversations", conversationId);
      updateDoc(convRef, { [`unread_${user.uid}`]: 0 }).catch(() => {});
    });

    return () => unsub();
  }, [user, conversationId]);

  // 最下部スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !text.trim() || sending) return;
    setSending(true);
    const trimmed = text.trim();
    setText("");

    try {
      const convRef = doc(db, "dmConversations", conversationId);
      const msgRef = collection(db, "dmConversations", conversationId, "messages");

      // メッセージ追加
      await addDoc(msgRef, {
        text: trimmed,
        senderUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // 会話メタ更新（lastMessage・相手の未読カウントをincrement）
      const otherUid = meta?.otherUid;
      if (otherUid) {
        await updateDoc(convRef, {
          lastMessage: trimmed,
          lastMessageAt: serverTimestamp(),
          [`unread_${otherUid}`]: increment(1),
        });
      }
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
    return ts.toDate().toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white border-b border-purple-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/dm")}
          className="text-purple-400 hover:text-purple-600 transition text-lg"
        >
          ←
        </button>
        {meta && (
          <>
            {meta.otherImgSrc ? (
              <img
                src={meta.otherImgSrc}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                {meta.otherIcon}
              </div>
            )}
            <span className="font-bold text-purple-700 text-sm">
              {meta.otherNickname}
            </span>
          </>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderUid === user?.uid;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine && meta && (
                <div className="flex-shrink-0 mr-2">
                  {meta.otherImgSrc ? (
                    <img
                      src={meta.otherImgSrc}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                      {meta.otherIcon}
                    </div>
                  )}
                </div>
              )}
              <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isMine
                      ? "bg-purple-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border border-purple-100 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="sticky bottom-0 bg-white border-t border-purple-100 px-3 py-3 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力…"
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-purple-200 px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 bg-purple-50 max-h-32 overflow-y-auto"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-600 active:bg-purple-700 transition"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
