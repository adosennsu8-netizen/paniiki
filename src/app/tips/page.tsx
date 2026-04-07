"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";

const ANON_ANIMALS = ["ことりさん","うさぎさん","たぬきさん","きつねさん","くまさん","ねこさん","いぬさん","りすさん","ぱんださん","かえるさん","ちょうさん","はちどりさん"];
const ANON_EMOJI = ["🐦","🐰","🦝","🦊","🐻","🐱","🐶","🐿","🐼","🐸","🦋","🐦"];
const anonName = (seed: number) => ANON_ANIMALS[seed % ANON_ANIMALS.length];
const anonEmoji = (seed: number) => ANON_EMOJI[seed % ANON_EMOJI.length];

interface Tip { id: string; title: string; body: string; seed: number; likes: number; }

export default function TipsPage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      setSeed(Math.floor(Math.random() * 12));
      const snap = await getDoc(doc(db, "users", user.uid));
      setIsPremium(snap.data()?.isPremium || false);
      await loadTips();
    });
    return () => unsub();
  }, []);

  const loadTips = async () => {
    const q = query(collection(db, "tips"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Tip[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Tip));
    setTips(list);
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newBody.trim() || !uid) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "tips"), {
        title: newTitle.trim(),
        body: newBody.trim(),
        seed,
        uid,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      await loadTips();
      setShowNew(false);
      setNewTitle("");
      setNewBody("");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (tip: Tip) => {
    if (liked[tip.id]) return;
    setLiked(l => ({ ...l, [tip.id]: true }));
    setTips(ts => ts.map(t => t.id === tip.id ? { ...t, likes: t.likes + 1 } : t));
    await updateDoc(doc(db, "tips", tip.id), { likes: increment(1) });
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>💡 豆知識</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき — 完全匿名</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ padding:"12px 16px" }}>
        <div style={{ fontSize:11, color:"#8aaa95", marginBottom:8 }}>🔒 すべての投稿は完全匿名で表示されます</div>
        {isPremium ? (
          <button onClick={() => setShowNew(true)}
            style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            💡 豆知識を投稿する
          </button>
        ) : (
          <div style={{ background:"#fef3cd", borderRadius:12, padding:"12px 16px", border:"1.5px solid #c9963a", textAlign:"center" }}>
            <div style={{ fontSize:13, color:"#c9963a", fontWeight:600 }}>⭐ 投稿はプレミアム機能です</div>
            <div style={{ fontSize:11, color:"#5a7a65", marginTop:4 }}>閲覧・いいねは無料でできます</div>
          </div>
        )}
      </div>

      {tips.map(t => (
        <div key={t.id} style={{ margin:"0 16px 12px", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:22 }}>{anonEmoji(t.seed)}</span>
            <div style={{ fontSize:12, color:"#5a7a65" }}>{anonName(t.seed)}（匿名）</div>
          </div>
          <div style={{ fontWeight:700, fontSize:15, color:"#2d4a38", marginBottom:8 }}>{t.title}</div>
          <p style={{ fontSize:13, color:"#5a7a65", margin:"0 0 12px", lineHeight:1.8, background:"#e8f5ec", borderRadius:10, padding:"10px 14px" }}>{t.body}</p>
          <button onClick={() => handleLike(t)}
            style={{ background:liked[t.id]?"#fde8d8":"#e8f5ec", color:liked[t.id]?"#e8a87c":"#5a7a65", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer", fontWeight:600 }}>
            {liked[t.id] ? "❤️" : "🤍"} {t.likes}
          </button>
        </div>
      ))}

      {tips.length === 0 && (
        <div style={{ textAlign:"center", padding:40, color:"#8aaa95", fontSize:13 }}>
          まだ投稿がありません。<br/>最初の豆知識を投稿してみてください！
        </div>
      )}

      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:8 }}>💡 豆知識を投稿する</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginBottom:12 }}>🔒 匿名で投稿されます</div>
            <input
              placeholder="タイトル"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:10 }}
            />
            <textarea
              placeholder="経験や知識をシェアしてください…"
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", height:100, resize:"none", marginBottom:12, fontFamily:"inherit" }}
            />
            <button onClick={handlePost} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "投稿中…" : "投稿する"}
            </button>
            <button onClick={() => setShowNew(false)}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}