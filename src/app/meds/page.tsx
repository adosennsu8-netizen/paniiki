"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MEDS = [
  { name:"アルプラゾラム（コンスタン/ソラナックス）", type:"抗不安薬", effect:"即効性の抗不安作用。パニック発作の頓服として処方されることが多い。", caution:"依存性に注意。長期連用は避ける。", icon:"💊" },
  { name:"エチゾラム（デパス）", type:"抗不安薬", effect:"不安・緊張を和らげる。睡眠補助にも用いられる。", caution:"長期使用で依存のリスクあり。", icon:"💊" },
  { name:"クロナゼパム（リボトリール）", type:"抗不安薬", effect:"強力な抗不安・抗けいれん作用。予期不安に効果的。", caution:"眠気・ふらつきに注意。", icon:"💊" },
  { name:"パロキセチン（パキシル）", type:"SSRI", effect:"パニック障害の第一選択薬。予期不安・広場恐怖にも効果。効果発現まで2〜4週間。", caution:"急な中断で離脱症状が出ることがある。必ず医師の指示で減薬する。", icon:"🔵" },
  { name:"セルトラリン（ジェイゾロフト）", type:"SSRI", effect:"副作用が比較的少なく継続しやすい。パニック障害に保険適用あり。", caution:"飲み始めに一時的に不安が増すことがある。", icon:"🔵" },
  { name:"エスシタロプラム（レクサプロ）", type:"SSRI", effect:"副作用が少なく飲みやすい。不安障害全般に効果的。", caution:"QT延長に注意。高齢者は慎重に。", icon:"🔵" },
  { name:"ベンラファキシン（イフェクサー）", type:"SNRI", effect:"セロトニンとノルアドレナリン両方に作用。SSRIで効果不十分な場合に使用。", caution:"血圧上昇に注意。急な中断は避ける。", icon:"🟣" },
  { name:"プロプラノロール（インデラル）", type:"β遮断薬", effect:"動悸・震えなど身体症状を抑える。状況限定の頓服として使われることも。", caution:"喘息・低血圧の方は要注意。", icon:"❤️" },
];

const TYPES = ["すべて", "抗不安薬", "SSRI", "SNRI", "β遮断薬"];

export default function MedsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("すべて");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = filter === "すべて" ? MEDS : MEDS.filter(m => m.type === filter);

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>💊 薬一覧</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ margin:"12px 16px", background:"#fde8e8", borderRadius:12, padding:"10px 14px", border:"1px solid #e07070" }}>
        <div style={{ fontSize:12, color:"#e07070", fontWeight:700, marginBottom:4 }}>⚠️ 注意</div>
        <div style={{ fontSize:12, color:"#2d4a38", lineHeight:1.7 }}>薬の服用は必ず医師の指示に従ってください。このページは参考情報です。自己判断で服用・中断しないでください。</div>
      </div>

      <div style={{ padding:"0 16px", display:"flex", gap:6, flexWrap:"wrap", marginBottom:4 }}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ background:filter===t?"#5ba872":"#e8f5ec", color:filter===t?"#fff":"#5a7a65", border:"none", borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.map((m, i) => (
        <div key={i} style={{ margin:"12px 16px", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
          <div onClick={() => setOpen(open === i ? null : i)}
            style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
            <span style={{ fontSize:26 }}>{m.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#2d4a38" }}>{m.name}</div>
              <span style={{ display:"inline-block", background:"#d4edda", color:"#4a9060", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, marginTop:4 }}>{m.type}</span>
            </div>
            <span style={{ fontSize:18, color:"#8aaa95" }}>{open === i ? "▲" : "▼"}</span>
          </div>

          {open === i && (
            <div style={{ marginTop:12, borderTop:"1px solid #c8e6d0", paddingTop:12 }}>
              <div style={{ background:"#e8f5ec", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#4a9060", marginBottom:4 }}>✅ 効果・特徴</div>
                <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.7 }}>{m.effect}</div>
              </div>
              <div style={{ background:"#fde8e8", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#e07070", marginBottom:4 }}>⚠️ 注意点</div>
                <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.7 }}>{m.caution}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}