"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";

const ANON_ANIMALS = ["ことりさん","うさぎさん","たぬきさん","きつねさん","くまさん","ねこさん","いぬさん","りすさん","ぱんださん","かえるさん","ちょうさん","はちどりさん"];
const ANON_EMOJI = ["🐦","🐰","🦝","🦊","🐻","🐱","🐶","🐿","🐼","🐸","🦋","🐦"];
const anonName = (seed: number) => ANON_ANIMALS[seed % ANON_ANIMALS.length];
const anonEmoji = (seed: number) => ANON_EMOJI[seed % ANON_EMOJI.length];

interface Post { id: string; q: string; tags: string[]; seed: number; time: string; answers: number; }
interface Answer { id: string; text: string; seed: number; likes: number; likedBy?: string[]; }
interface Survey { id: string; q: string; options: string[]; votes: number[]; seed: number; }

export default function QAPage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [view, setView] = useState<"qa"|"survey">("qa");
  const [posts, setPosts] = useState<Post[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newSurveyQ, setNewSurveyQ] = useState("");
  const [newSurveyOpts, setNewSurveyOpts] = useState(["","","",""]);
  const [votedSurveys, setVotedSurveys] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [seed] = useState(Math.floor(Math.random() * 12));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      setIsPremium(true);
      await loadPosts();
      await loadSurveys();
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => {
    const q = query(collection(db, "qaPosts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Post[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Post));
    setPosts(list);
  };

  const loadSurveys = async () => {
    const q = query(collection(db, "surveys"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list: Survey[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Survey));
    setSurveys(list);
  };

  const loadAnswers = async (postId: string) => {
    const q = query(collection(db, "qaPosts", postId, "answers"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const list: Answer[] = [];
    snap.forEach(d => list.push({ id: d.id, likes: 0, ...d.data() } as Answer));
    setAnswers(a => ({ ...a, [postId]: list }));
  };

  const handleExpand = async (postId: string) => {
    if (expanded === postId) { setExpanded(null); return; }
    setExpanded(postId);
    await loadAnswers(postId);
  };

  const handlePost = async () => {
    if (!newQ.trim() || !uid) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "qaPosts"), {
        q: newQ.trim(),
        tags: newTags.split(/[,、]/).map(t => t.trim()).filter(Boolean),
        seed, uid, answers: 0, createdAt: serverTimestamp(),
      });
      await loadPosts();
      setShowNew(false);
      setNewQ(""); setNewTags("");
    } finally { setLoading(false); }
  };

  const handleAnswer = async (postId: string) => {
    const text = answerText[postId]?.trim();
    if (!text || !uid) return;
    await addDoc(collection(db, "qaPosts", postId, "answers"), {
      text, seed, uid, likes: 0, likedBy: [], createdAt: serverTimestamp(),
    });
    const postRef = doc(db, "qaPosts", postId);
    const postSnap = await getDoc(postRef);
    const currentCount = postSnap.data()?.answers ?? 0;
    await updateDoc(postRef, { answers: currentCount + 1 });
    setAnswerText(a => ({ ...a, [postId]: "" }));
    await loadAnswers(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, answers: (p.answers ?? 0) + 1 } : p));
  };

  const handleAnswerLike = async (postId: string, answer: Answer) => {
    if (!uid) return;
    const alreadyLiked = answer.likedBy?.includes(uid);
    // 楽観的更新
    setAnswers(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).map(a => a.id === answer.id ? {
        ...a,
        likes: alreadyLiked ? a.likes - 1 : a.likes + 1,
        likedBy: alreadyLiked
          ? (a.likedBy || []).filter(id => id !== uid)
          : [...(a.likedBy || []), uid],
      } : a),
    }));
    await updateDoc(doc(db, "qaPosts", postId, "answers", answer.id), {
      likes: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
  };

  const handlePostSurvey = async () => {
    if (!newSurveyQ.trim()) return;
    const opts = newSurveyOpts.filter(o => o.trim());
    if (opts.length < 2) { alert("選択肢を2つ以上入力してください"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "surveys"), {
        q: newSurveyQ.trim(), options: opts,
        votes: opts.map(() => 0), seed, uid, createdAt: serverTimestamp(),
      });
      await loadSurveys();
      setShowNewSurvey(false);
      setNewSurveyQ(""); setNewSurveyOpts(["","","",""]);
    } finally { setLoading(false); }
  };

  const handleVote = async (survey: Survey, optIndex: number) => {
    if (votedSurveys[survey.id] !== undefined) return;
    setVotedSurveys(v => ({ ...v, [survey.id]: optIndex }));
    const newVotes = survey.votes.map((v, i) => i === optIndex ? v + 1 : v);
    setSurveys(s => s.map(sv => sv.id === survey.id ? { ...sv, votes: newVotes } : sv));
    await updateDoc(doc(db, "surveys", survey.id), { votes: newVotes });
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif", paddingBottom:80 }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>❓ 質問箱</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき — 完全匿名</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ display:"flex", gap:8, padding:"12px 16px 0" }}>
        {[["qa","❓ 質問箱"],["survey","📊 アンケート"]].map(([k,l]) => (
          <button key={k} onClick={() => setView(k as "qa"|"survey")}
            style={{ flex:1, background:view===k?"#5ba872":"#e8f5ec", color:view===k?"#fff":"#5a7a65", border:"none", borderRadius:10, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {view==="qa" && <>
        <div style={{ padding:"12px 16px 0" }}>
          <div style={{ fontSize:11, color:"#8aaa95", marginBottom:8 }}>🔒 すべての投稿・回答は完全匿名で表示されます</div>
          {isPremium ? (
            <button onClick={() => setShowNew(true)}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              ✏️ 質問を投稿する
            </button>
          ) : (
            <div style={{ background:"#fef3cd", borderRadius:12, padding:"12px 16px", border:"1.5px solid #c9963a", textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#c9963a", fontWeight:600 }}>⭐ 質問の投稿はプレミアム機能です</div>
              <div style={{ fontSize:11, color:"#5a7a65", marginTop:4 }}>閲覧・回答の閲覧は無料でできます</div>
            </div>
          )}
        </div>

        {posts.map(p => (
          <div key={p.id} style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{anonEmoji(p.seed)}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:"#5a7a65" }}>{anonName(p.seed)}（匿名）</div>
                <div style={{ fontSize:10, color:"#8aaa95" }}>{p.time}</div>
              </div>
            </div>
            <p style={{ fontSize:14, color:"#2d4a38", margin:"0 0 8px", lineHeight:1.7 }}>{p.q}</p>
            <div style={{ display:"flex", gap:6, alignItems:"center", justifyContent:"space-between" }}>
              <div>{p.tags?.map(t => (
                <span key={t} style={{ display:"inline-block", background:"#d4edda", color:"#4a9060", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, margin:"2px" }}>{t}</span>
              ))}</div>
              <button onClick={() => handleExpand(p.id)}
                style={{ background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer" }}>
                💬 {(answers[p.id]?.length ?? p.answers)}件
              </button>
            </div>
            {expanded === p.id && (
              <div style={{ marginTop:12, borderTop:"1px solid #c8e6d0", paddingTop:12 }}>
                {(answers[p.id] || []).map((a) => {
                  const isLiked = uid ? (a.likedBy?.includes(uid) ?? false) : false;
                  return (
                    <div key={a.id} style={{ background:"#e8f5ec", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                      <div style={{ fontSize:12, color:"#5a7a65", marginBottom:4 }}>{anonEmoji(a.seed)} {anonName(a.seed)}（匿名）</div>
                      <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.7, marginBottom:8 }}>{a.text}</div>
                      <button onClick={() => handleAnswerLike(p.id, a)}
                        style={{ background:isLiked?"#fde8d8":"#fff", color:isLiked?"#e8a87c":"#8aaa95", border:"none", borderRadius:20, padding:"4px 10px", fontSize:12, cursor:"pointer", fontWeight:600 }}>
                        {isLiked ? "❤️" : "🤍"} {a.likes || 0}
                      </button>
                    </div>
                  );
                })}
                {isPremium ? (
                  <>
                    <textarea placeholder="回答を書く…（匿名で投稿されます）"
                      value={answerText[p.id] || ""}
                      onChange={e => setAnswerText(a => ({ ...a, [p.id]: e.target.value }))}
                      style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", height:70, resize:"none", marginBottom:8, fontFamily:"inherit" }}/>
                    <button onClick={() => handleAnswer(p.id)}
                      style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"10px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                      回答を送る
                    </button>
                  </>
                ) : (
                  <div style={{ background:"#fef3cd", borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:12, color:"#c9963a", fontWeight:600 }}>⭐ 回答はプレミアム機能です</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </>}

      {view==="survey" && <>
        <div style={{ padding:"12px 16px 0" }}>
          {isPremium ? (
            <button onClick={() => setShowNewSurvey(true)}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              📊 アンケートを作成する
            </button>
          ) : (
            <div style={{ background:"#fef3cd", borderRadius:12, padding:"12px 16px", border:"1.5px solid #c9963a", textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#c9963a", fontWeight:600 }}>⭐ アンケート作成はプレミアム機能です</div>
              <div style={{ fontSize:11, color:"#5a7a65", marginTop:4 }}>回答・閲覧は無料でできます</div>
            </div>
          )}
        </div>
        {surveys.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"#8aaa95", fontSize:13 }}>まだアンケートがありません。</div>
        )}
        {surveys.map(s => {
          const total = s.votes.reduce((a, b) => a + b, 0);
          const voted = votedSurveys[s.id];
          return (
            <div key={s.id} style={{ margin:"12px 16px 0", background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:18 }}>{anonEmoji(s.seed)}</span>
                <div style={{ fontSize:12, color:"#5a7a65" }}>{anonName(s.seed)}（匿名）</div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:"#2d4a38", marginBottom:12 }}>📊 {s.q}</div>
              {s.options.map((opt, i) => {
                const pct = total > 0 ? Math.round(s.votes[i] / total * 100) : 0;
                const isVoted = voted === i;
                return (
                  <div key={i} style={{ marginBottom:10 }}>
                    <button onClick={() => handleVote(s, i)}
                      style={{ width:"100%", background:isVoted?"#d4edda":"#e8f5ec", border:isVoted?"1.5px solid #5ba872":"1.5px solid #c8e6d0", borderRadius:10, padding:"8px 12px", cursor:voted!==undefined?"not-allowed":"pointer", textAlign:"left", marginBottom:4 }}>
                      <span style={{ fontSize:13, color:"#2d4a38" }}>{opt}</span>
                      {isVoted && <span style={{ float:"right", fontSize:12, color:"#5ba872", fontWeight:700 }}>✓</span>}
                    </button>
                    {voted !== undefined && (
                      <div>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#5a7a65", marginBottom:2 }}>
                          <span>{opt}</span><span>{pct}%</span>
                        </div>
                        <div style={{ background:"#e8f5ec", borderRadius:20, height:8, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#5ba872,#7bbf8c)", borderRadius:20, transition:"width 0.6s" }}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ fontSize:11, color:"#8aaa95", textAlign:"right", marginTop:4 }}>総回答数: {total}人</div>
            </div>
          );
        })}
      </>}

      {showNew && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:8 }}>❓ 質問を投稿する</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginBottom:12 }}>🔒 匿名で投稿されます</div>
            <textarea placeholder="みんなに聞きたいことを書いてください…" value={newQ} onChange={e => setNewQ(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", height:100, resize:"none", marginBottom:10, fontFamily:"inherit" }}/>
            <input placeholder="タグ（例：電車、薬）" value={newTags} onChange={e => setNewTags(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:12 }}/>
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

      {showNewSurvey && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:12 }}>📊 アンケートを作成する</div>
            <input placeholder="質問文を入力" value={newSurveyQ} onChange={e => setNewSurveyQ(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
            <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>選択肢（最大4つ）</div>
            {newSurveyOpts.map((opt, i) => (
              <input key={i} placeholder={`選択肢 ${i+1}`} value={opt} onChange={e => setNewSurveyOpts(o => o.map((v, j) => j===i ? e.target.value : v))}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
            ))}
            <button onClick={handlePostSurvey} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "作成中…" : "作成する"}
            </button>
            <button onClick={() => setShowNewSurvey(false)}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
