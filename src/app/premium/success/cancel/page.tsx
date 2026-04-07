"use client";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ textAlign:"center", padding:24 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>😔</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#2d4a38", marginBottom:8 }}>キャンセルしました</div>
        <div style={{ fontSize:14, color:"#5a7a65", lineHeight:1.8, marginBottom:24 }}>いつでもプレミアムに登録できます。</div>
        <button onClick={() => router.push("/")}
          style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"12px 32px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
          トップページへ
        </button>
      </div>
    </div>
  );
}