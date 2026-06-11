"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";

interface Place {
  id: string;
  name: string;
  category: string;
  note: string;
  address?: string;
  lat: number;
  lng: number;
  seed: number;
  distance?: number;
}

const CATEGORIES = ["すべて", "クリニック", "薬局", "休める場所", "その他"];
const ANON_ANIMALS = ["ことりさん","うさぎさん","たぬきさん","きつねさん","くまさん","ねこさん","いぬさん","りすさん","ぱんださん","かえるさん","ちょうさん","はちどりさん"];
const ANON_EMOJI = ["🐦","🐰","🦝","🦊","🐻","🐱","🐶","🐿","🐼","🐸","🦋","🐦"];
const anonName = (seed: number) => ANON_ANIMALS[seed % ANON_ANIMALS.length];
const anonEmoji = (seed: number) => ANON_EMOJI[seed % ANON_EMOJI.length];

const CATEGORY_ICONS: Record<string, string> = {
  "クリニック": "🏥",
  "薬局": "💊",
  "休める場所": "🪑",
  "その他": "📍",
};

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function PlacesPage() {
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [filter, setFilter] = useState("すべて");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("クリニック");
  const [newNote, setNewNote] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [seed] = useState(Math.floor(Math.random() * 12));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/auth"); return; }
      setUid(user.uid);
      await getDoc(doc(db, "users", user.uid));
      setIsPremium(true);
      getLocation();
      await loadPlaces();
    });
    return () => unsub();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) { setLocationError("位置情報が使えません"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => setLocationError("位置情報の取得に失敗しました。設定を確認してください。")
    );
  };

  const loadPlaces = async () => {
    const snap = await getDocs(collection(db, "places"));
    const list: Place[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as Place));
    setPlaces(list);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newNote.trim()) return;
    if (userLat === null || userLng === null) { alert("位置情報を取得してから投稿してください"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, "places"), {
        name: newName.trim(),
        category: newCategory,
        note: newNote.trim(),
        address: newAddress.trim(),
        lat: userLat,
        lng: userLng,
        seed,
        uid,
        createdAt: serverTimestamp(),
      });
      await loadPlaces();
      setShowAdd(false);
      setNewName("");
      setNewNote("");
      setNewAddress("");
    } finally { setLoading(false); }
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  const placesWithDistance = places.map(p => ({
    ...p,
    distance: userLat && userLng ? calcDistance(userLat, userLng, p.lat, p.lng) : undefined,
  })).sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

  const filtered = filter === "すべて" ? placesWithDistance : placesWithDistance.filter(p => p.category === filter);

  const formatDistance = (d?: number) => {
    if (d === undefined) return "";
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f7f2", fontFamily:"'Hiragino Maru Gothic ProN',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#5ba872,#7bbf8c)", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 12px rgba(91,168,114,0.25)" }}>
        <div>
          <div style={{ color:"#fff", fontSize:20, fontWeight:800 }}>📍 近くの場所</div>
          <div style={{ color:"rgba(255,255,255,0.75)", fontSize:9 }}>ぱにいき</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background:"rgba(255,255,255,0.2)", color:"#fff", border:"none", borderRadius:20, padding:"6px 14px", fontSize:13, cursor:"pointer" }}>← 戻る</button>
      </div>

      <div style={{ margin:"12px 16px 0" }}>
        {locationError ? (
          <div style={{ background:"#fde8e8", borderRadius:12, padding:"10px 14px", border:"1px solid #e07070", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:12, color:"#e07070" }}>⚠️ {locationError}</div>
            <button onClick={getLocation} style={{ background:"#e07070", color:"#fff", border:"none", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer" }}>再試行</button>
          </div>
        ) : userLat ? (
          <div style={{ background:"#d4edda", borderRadius:12, padding:"10px 14px", border:"1px solid #7bbf8c" }}>
            <div style={{ fontSize:12, color:"#4a9060" }}>📍 現在地を取得しました。近い順に表示しています。</div>
          </div>
        ) : (
          <div style={{ background:"#e8f5ec", borderRadius:12, padding:"10px 14px", border:"1px solid #c8e6d0" }}>
            <div style={{ fontSize:12, color:"#5a7a65" }}>📍 位置情報を取得中…</div>
          </div>
        )}
      </div>

      <div style={{ padding:"12px 16px 0" }}>
        {isPremium ? (
          <button onClick={() => setShowAdd(true)}
            style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>
            ✏️ 場所を投稿する
          </button>
        ) : (
          <div style={{ background:"#fef3cd", borderRadius:12, padding:"12px 16px", border:"1.5px solid #c9963a", textAlign:"center" }}>
            <div style={{ fontSize:13, color:"#c9963a", fontWeight:600 }}>⭐ 投稿はプレミアム機能です</div>
            <div style={{ fontSize:11, color:"#5a7a65", marginTop:4 }}>閲覧は無料でできます</div>
          </div>
        )}
      </div>

      <div style={{ padding:"12px 16px 0", display:"flex", gap:6, flexWrap:"wrap" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ background:filter===c?"#5ba872":"#e8f5ec", color:filter===c?"#fff":"#5a7a65", border:"none", borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ padding:"12px 16px 100px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:"#8aaa95", fontSize:13 }}>
            まだ投稿がありません。<br/>最初の場所を投稿してみてください！
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:12, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #c8e6d0" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"#e8f5ec", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {CATEGORY_ICONS[p.category] || "📍"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#2d4a38", marginBottom:2 }}>{p.name}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ background:"#d4edda", color:"#4a9060", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:600 }}>{p.category}</span>
                    {p.distance !== undefined && (
                      <span style={{ fontSize:11, color:"#8aaa95" }}>📏 {formatDistance(p.distance)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 住所 */}
              {p.address && (
                <button
                  onClick={() => openGoogleMaps(p.address!)}
                  style={{ display:"flex", alignItems:"center", gap:6, background:"#e8f5ec", border:"1px solid #b8d8c0", borderRadius:10, padding:"8px 12px", marginBottom:8, width:"100%", textAlign:"left", cursor:"pointer" }}
                >
                  <span style={{ fontSize:14 }}>🗺️</span>
                  <span style={{ fontSize:12, color:"#4a9060", fontWeight:600, flex:1 }}>{p.address}</span>
                  <span style={{ fontSize:10, color:"#8aaa95", flexShrink:0 }}>地図を開く →</span>
                </button>
              )}

              <div style={{ background:"#e8f5ec", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ fontSize:13, color:"#2d4a38", lineHeight:1.7 }}>{p.note}</div>
              </div>
              <div style={{ fontSize:11, color:"#8aaa95" }}>
                {anonEmoji(p.seed)} {anonName(p.seed)}（匿名）
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:24, width:"100%", maxWidth:430, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#2d4a38", marginBottom:8 }}>📍 場所を投稿する</div>
            <div style={{ fontSize:11, color:"#8aaa95", marginBottom:14 }}>🔒 匿名で投稿されます。現在地の情報が使われます。</div>

            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>場所の名前</div>
              <input placeholder="例：○○クリニック、△△薬局" value={newName} onChange={e => setNewName(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}/>
            </div>

            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>カテゴリ</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["クリニック","薬局","休める場所","その他"].map(c => (
                  <button key={c} onClick={() => setNewCategory(c)}
                    style={{ background:newCategory===c?"#5ba872":"#e8f5ec", color:newCategory===c?"#fff":"#5a7a65", border:"none", borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {CATEGORY_ICONS[c]} {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 住所入力欄 */}
            <div style={{ marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontSize:12, color:"#5a7a65", fontWeight:600 }}>
                  住所 <span style={{ color:"#8aaa95", fontWeight:400 }}>（任意）</span>
                </div>
                <button
                  onClick={() => window.open("https://maps.google.com/", "_blank")}
                  style={{ background:"#4a9060", color:"#fff", border:"none", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}
                >
                  🗺️ Googleマップを開く
                </button>
              </div>
              <input
                placeholder="例：福岡県福岡市中央区天神1-1-1"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box" }}
              />
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:"#5a7a65", marginBottom:6, fontWeight:600 }}>パニック障害の視点でのコメント</div>
              <textarea placeholder="例：出入口が複数あり安心。待合室が広く開放的です。" value={newNote} onChange={e => setNewNote(e.target.value)}
                style={{ width:"100%", border:"1.5px solid #c8e6d0", borderRadius:10, padding:"10px 12px", fontSize:14, background:"#e8f5ec", outline:"none", boxSizing:"border-box", height:90, resize:"none", fontFamily:"inherit" }}/>
            </div>

            <button onClick={handleAdd} disabled={loading}
              style={{ width:"100%", background:"linear-gradient(135deg,#5ba872,#7bbf8c)", color:"#fff", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:8 }}>
              {loading ? "投稿中…" : "投稿する"}
            </button>
            <button onClick={() => { setShowAdd(false); setNewAddress(""); }}
              style={{ width:"100%", background:"#e8f5ec", color:"#4a9060", border:"none", borderRadius:12, padding:"13px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
