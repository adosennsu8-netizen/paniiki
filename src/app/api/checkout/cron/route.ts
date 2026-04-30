import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

webpush.setVapidDetails(
  'mailto:info@joynovation.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function GET() {
  try {
    const db = getFirestore();
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const currentTime = `${jst.getHours().toString().padStart(2,'0')}:${jst.getMinutes().toString().padStart(2,'0')}`;
    const todayStr = jst.toISOString().slice(0, 10);

    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const subscription = userData.pushSubscription;
      if (!subscription) continue;

      const alarmsSnap = await db.collection('users').doc(userDoc.id).collection('alarms').get();
      for (const alarmDoc of alarmsSnap.docs) {
        const alarm = alarmDoc.data();
        if (!alarm.enabled) continue;
        if (alarm.time !== currentTime) continue;

        const takenSnap = await db.collection('users').doc(userDoc.id).collection('takenRecords')
          .where('date', '==', todayStr)
          .where('alarmId', '==', alarmDoc.id)
          .get();
        if (!takenSnap.empty) continue;

        await webpush.sendNotification(subscription, JSON.stringify({
          title: '💊 薬の時間です',
          body: alarm.label || '薬を飲みましょう',
        })).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true, time: currentTime });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}