import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { S, CSS } from "./styles";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import Login from "./Login.jsx";
import Home from "./pages/Home.jsx";
import Tracker from "./pages/Tracker.jsx";
import Competitions from "./pages/Competitions.jsx";
import CompetitionDetail from "./pages/CompetitionDetail.jsx";

const GUEST_KEY = "wk2026-tracker-v2";

// ─── Gast-modus: data lokaal in localStorage ───
const guestStore = {
  load() {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      let d = raw ? JSON.parse(raw) : { bets: [], deposits: [] };
      // one-time fix: oude default-startkapitaal van €50 → €20
      const sk = d.deposits.find(x => x.id === "d1");
      if (sk && sk.bedrag === 50 && (sk.note || "").startsWith("Startkapitaal")) {
        d = { ...d, deposits: d.deposits.map(x => x.id === "d1" ? { ...x, bedrag: 20, note: "Startkapitaal" } : x) };
        try { localStorage.setItem(GUEST_KEY, JSON.stringify(d)); } catch {}
      }
      return d;
    } catch { return { bets: [], deposits: [] }; }
  },
  save(data) {
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(data)); return true; } catch { return false; }
  },
  hasData() {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      return (d.bets?.length || 0) > 0 || (d.deposits?.length || 0) > 0;
    } catch { return false; }
  },
  clear() {
    try { localStorage.removeItem(GUEST_KEY); } catch {}
  },
};

// ─── Account: data in Supabase (per gebruiker, via RLS) ───
async function loadCloudData(userId) {
  const [betsRes, depRes] = await Promise.all([
    supabase.from("bets").select("*").eq("user_id", userId),
    supabase.from("deposits").select("*").eq("user_id", userId),
  ]);
  if (betsRes.error) throw betsRes.error;
  if (depRes.error) throw depRes.error;
  return { bets: betsRes.data || [], deposits: depRes.data || [] };
}

export default function App() {
  const [session, setSession] = useState("loading"); // "loading" | null (gast) | session object
  const [data, setData] = useState(null);
  const [migration, setMigration] = useState(null); // gast-data die gemigreerd kan worden
  const [saved, setSaved] = useState("idle");
  const location = useLocation();

  // ── auth state ──
  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── data laden: gast (localStorage) of account (Supabase) ──
  const userId = session === "loading" ? "loading" : session ? session.user.id : "guest";
  useEffect(() => {
    if (userId === "loading") return;
    let cancelled = false;
    (async () => {
      if (userId !== "guest") {
        try {
          const d = await loadCloudData(userId);
          if (cancelled) return;
          setData(d);
          setMigration(guestStore.hasData() ? guestStore.load() : null);
        } catch (e) {
          console.error(e);
          if (!cancelled) setData({ bets: [], deposits: [] });
        }
      } else {
        setMigration(null);
        const d = guestStore.load();
        if (!cancelled) setData(d);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const persist = async (next, mutation) => {
    setData(next); setSaved("saving");
    try {
      if (session) {
        const { error } = await mutation.cloud(session.user.id);
        if (error) throw error;
      } else {
        guestStore.save(next);
      }
      setSaved("saved"); setTimeout(() => setSaved("idle"), 1400);
    } catch (e) { console.error(e); setSaved("error"); }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const migrateGuestData = async () => {
    if (!migration || !session) return;
    setSaved("saving");
    try {
      const newBets = (migration.bets || []).map(({ id, ...b }) => ({ ...b, id: crypto.randomUUID(), user_id: session.user.id }));
      const newDeps = (migration.deposits || []).map(({ id, ...d }) => ({ ...d, id: crypto.randomUUID(), user_id: session.user.id }));
      if (newBets.length) { const { error } = await supabase.from("bets").insert(newBets); if (error) throw error; }
      if (newDeps.length) { const { error } = await supabase.from("deposits").insert(newDeps); if (error) throw error; }
      setData(d => ({ bets: [...d.bets, ...newBets], deposits: [...d.deposits, ...newDeps] }));
      guestStore.clear();
      setMigration(null);
      setSaved("saved"); setTimeout(() => setSaved("idle"), 1400);
    } catch (e) { console.error(e); setSaved("error"); }
  };
  const dismissMigration = () => setMigration(null);

  if (session === "loading") return (
    <div style={{ ...S.app, minHeight: 320, display: "grid", placeItems: "center" }}>
      <style>{CSS}</style><span style={{ color: "#8A93A6" }}>Laden…</span>
    </div>
  );

  if (!data) return (
    <div style={{ ...S.app, minHeight: 320, display: "grid", placeItems: "center" }}>
      <style>{CSS}</style><span style={{ color: "#8A93A6" }}>Laden…</span>
    </div>
  );

  const record = { w: data.bets.filter(b => b.status === "won").length, l: data.bets.filter(b => b.status === "lost").length, o: data.bets.filter(b => b.status === "open").length };

  return (
    <div style={S.app}>
      <style>{CSS}</style>

      {/* App bar */}
      <div style={S.appbar}>
        <Link to="/" className="press" style={{ ...S.navLink, ...S.brand }}>WK&nbsp;2026 · Betjes</Link>
        <div style={S.appbarNav}>
          {!location.pathname.startsWith("/competitions") && (
            <Link to="/competitions" className="press" style={{ ...S.navLink, ...S.appbarLink }}>Competities</Link>
          )}
          {location.pathname === "/bets" && (
            <span style={{ ...S.saveTag, color: saved === "error" ? "#FF6B6B" : "#5C6677" }}>
              {saved === "saving" ? "opslaan…" : saved === "saved" ? "✓ bewaard" : `${record.w}W · ${record.l}V · ${record.o} open`}
            </span>
          )}
        </div>
      </div>

      {/* Account bar */}
      <div style={S.authbar}>
        {session ? (
          <>
            <span style={S.authInfo}><span style={S.authEmail}>{session.user.email}</span></span>
            <button className="press" style={S.authBtn} onClick={signOut}>Uitloggen</button>
          </>
        ) : (
          <>
            <span style={S.authInfo}>Gast-modus · data lokaal op dit toestel</span>
            {isSupabaseConfigured && location.pathname !== "/login" && (
              <Link to="/login" className="press" style={{ ...S.navLink, ...S.authBtnAccent, textAlign: "center" }}>Inloggen</Link>
            )}
          </>
        )}
      </div>

      {/* Migratie-banner: gast-data samenvoegen met account */}
      {migration && session && (
        <div style={S.migrateBanner}>
          <div style={S.migrateText}>
            We vonden lokale gast-data op dit toestel ({(migration.bets || []).length} bets, {(migration.deposits || []).length} stortingen).
            Wil je die samenvoegen met je account <b>{session.user.email}</b>?
          </div>
          <div style={S.migrateActions}>
            <button className="press" style={S.migrateBtn} onClick={migrateGuestData}>Migreren naar account</button>
            <button className="press" style={S.migrateGhost} onClick={dismissMigration}>Negeren</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home session={session} isSupabaseConfigured={isSupabaseConfigured} />} />
        <Route path="/bets" element={<Tracker data={data} persist={persist} />} />
        <Route path="/competitions" element={<Competitions session={session} isSupabaseConfigured={isSupabaseConfigured} />} />
        <Route path="/competitions/:id" element={<CompetitionDetail session={session} />} />
        <Route path="/login" element={session || !isSupabaseConfigured ? <Navigate to="/" replace /> : <Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
