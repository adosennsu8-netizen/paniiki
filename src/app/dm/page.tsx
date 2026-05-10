"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; // ← プロジェクトのfirebase初期化パスに合わせて
import { useAuthState } from "react-firebase-hooks/auth";
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
  unreadCount: number; // 自分の未読数
};

export default function DMListPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "dmConversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list: Conversation[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const otherUid = (data.participants as string[]).find(
          (uid) => uid !== user.uid
        )!;

        // 相手のユーザー情報はdmConversationsに非正規化して保存する設計
        const otherNickname =
          data[`nickname_${otherUid}`] ?? "ユーザー";
        const otherIcon = data[`icon_${otherUid}`] ?? "🐾";
        const otherImgSrc = data[`imgSrc_${otherUid}`] ?? undefined;

        list.push({
          id: docSnap.id,
          participants: data.participants,
          otherUid,
          otherNickname,
          otherIcon,
          otherImgSrc,
          lastMessage: data.lastMessage ?? "",
          lastMessageAt: data.lastMessageAt ?? null,
          unreadCount: data[`unread_${user.uid}`] ?? 0,
        });
      }

      setConvs(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (isToday) {
      return d.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  };

  const totalUnread = convs.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-purple-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-purple-400 hover:text-purple-600 transition"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-purple-700 flex items-center gap-2">
          <span>💬</span> DM
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {totalUnread}
            </span>
          )}
        </h1>
      </div>

      {/* 会話リスト */}
      <div className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-purple-300">
            読み込み中…
          </div>
        ) : convs.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-sm">まだDMはありません</p>
            <p className="text-xs mt-1 text-gray-300">
              広場でプロフィールをタップしてDMを送れます
            </p>
          </div>
        ) : (
          <ul>
            {convs.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => router.push(`/dm/${conv.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-purple-50 active:bg-purple-100 transition border-b border-purple-50"
                >
                  {/* アバター */}
                  <div className="relative flex-shrink-0">
                    {conv.otherImgSrc ? (
                      <img
                        src={conv.otherImgSrc}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                        {conv.otherIcon}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* テキスト */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <span
                        className={`font-semibold text-sm truncate ${
                          conv.unreadCount > 0
                            ? "text-purple-800"
                            : "text-gray-700"
                        }`}
                      >
                        {conv.otherNickname}
                      </span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        conv.unreadCount > 0
                          ? "text-purple-600 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {conv.lastMessage || "まだメッセージはありません"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
