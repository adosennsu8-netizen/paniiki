import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ぱにいき - パニック障害と生きていく",
  description: "パニック障害・不安障害の当事者同士がつながるアプリです。発作サポート・記録・仲間との交流ができます。",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
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