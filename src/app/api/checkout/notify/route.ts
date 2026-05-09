import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

export async function POST(req: NextRequest) {
  try {
    webpush.setVapidDetails(
      'mailto:info@joynovation.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );

    const { subscription, title, body } = await req.json();
    if (!subscription) return NextResponse.json({ ok: true, skipped: true });

    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}