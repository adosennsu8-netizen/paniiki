import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token && auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        fcmToken: token,
      }, { merge: true });
    }

    return token;
  } catch (e) {
    console.error("通知の許可取得に失敗:", e);
    return null;
  }
};