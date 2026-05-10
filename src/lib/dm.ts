// lib/dm.ts
// DM会話の作成・取得ユーティリティ

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type UserInfo = {
  uid: string;
  nickname: string;
  icon: string;
  imgSrc?: string;
};

/**
 * 2ユーザー間のDM会話IDを生成する（決定論的）
 */
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

/**
 * 会話ドキュメントを取得、なければ新規作成してIDを返す
 */
export async function createOrGetConversation(
  me: UserInfo,
  other: UserInfo
): Promise<string> {
  const convId = getConversationId(me.uid, other.uid);
  const convRef = doc(db, "dmConversations", convId);
  const snap = await getDoc(convRef);

  if (!snap.exists()) {
    await setDoc(convRef, {
      participants: [me.uid, other.uid],
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      [`unread_${me.uid}`]: 0,
      [`unread_${other.uid}`]: 0,
      [`nickname_${me.uid}`]: me.nickname,
      [`icon_${me.uid}`]: me.icon,
      [`imgSrc_${me.uid}`]: me.imgSrc ?? null,
      [`nickname_${other.uid}`]: other.nickname,
      [`icon_${other.uid}`]: other.icon,
      [`imgSrc_${other.uid}`]: other.imgSrc ?? null,
    });
  }

  return convId;
}
