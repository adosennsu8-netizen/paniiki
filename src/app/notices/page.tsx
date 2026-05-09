useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) { router.push("/auth"); return; }
    setUid(user.uid);
    try {
      const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const items: Notice[] = snap.docs.map(d => ({
        id: d.id,
        title: d.data().title || "",
        body: d.data().body || "",
        createdAt: d.data().createdAt?.toDate() || new Date(),
      }));
      setNotices(items);
      if (snap.docs.length > 0) {
        await updateDoc(doc(db, "users", user.uid), {
          readNotices: arrayUnion(...snap.docs.map(d => d.id)),
        });
      }
    } catch (e) {
      console.log("notices error:", e);
    } finally {
      setLoading(false);
    }
  });
  return () => unsub();
}, []);