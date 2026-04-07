import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ぱにいき — パニック障害と生きていく",
  description: "パニック障害・不安障害の当事者同士がつながるアプリです。発作サポート・記録・仲間との交流ができます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2919662383586718"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ margin:0, padding:0 }}>{children}</body>
    </html>
  );
}