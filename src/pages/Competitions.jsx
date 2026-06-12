import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { S } from "../styles";
import { fetchMyCompetitions, createCompetition, joinCompetition } from "../lib/competitions";
import { eur, num } from "../lib/format";

export default function Competitions({ session, isSupabaseConfigured }) {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState(null); // null = laden
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null); // 'create' | 'join' | null
  const [created, setCreated] = useState(null); // { id, code } na aanmaken
  const [busy, setBusy] = useState(false);

  const defaultName = session?.user?.email ? session.user.email.split("@")[0] : "";
  const [createForm, setCreateForm] = useState({ name: "", displayName: defaultName, startKapitaal: "20", allowTopup: true, rulesNote: "" });
  const [joinForm, setJoinForm] = useState({ code: "", displayName: defaultName });

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchMyCompetitions(session.user.id)
      .then(list => { if (!cancelled) setCompetitions(list); })
      .catch(e => { console.error(e); if (!cancelled) { setError("Kon je competities niet laden."); setCompetitions([]); } });
    return () => { cancelled = true; };
  }, [session]);

  if (!session) {
    return (
      <div style={S.homeWrap}>
        <div style={S.homeIntro}>
          <div style={S.homeTitle}>Competities met vrienden</div>
          <div style={S.homeText}>
            Start een competitie met een startkapitaal, deel de code met
            vrienden en speel mee. Iedereen houdt zijn eigen kapitaal bij en het
            klassement toont wie er voor staat.
          </div>
          {isSupabaseConfigured ? (
            <>
              <div style={S.homeText}>Hiervoor heb je een account nodig, zodat jullie elkaars voortgang kunnen zien.</div>
              <div style={S.homeActions}>
                <Link to="/login" className="press" style={{ ...S.navLink, ...S.primaryBtn, textAlign: "center" }}>Inloggen</Link>
              </div>
            </>
          ) : (
            <div style={S.hint}>Deze functie is niet beschikbaar (Supabase is niet geconfigureerd).</div>
          )}
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    const startKapitaal = num(createForm.startKapitaal);
    if (!createForm.name.trim() || !createForm.displayName.trim() || startKapitaal == null || startKapitaal < 0) return;
    setBusy(true); setError("");
    try {
      const res = await createCompetition({
        name: createForm.name.trim(),
        displayName: createForm.displayName.trim(),
        startKapitaal,
        allowTopup: createForm.allowTopup,
        rulesNote: createForm.rulesNote.trim(),
      });
      setCompetitions(list => [...(list || []), {
        id: res.id, name: createForm.name.trim(), code: res.code,
        start_kapitaal: startKapitaal, allow_topup: createForm.allowTopup,
        rules_note: createForm.rulesNote.trim(), display_name: createForm.displayName.trim(),
      }]);
      setSheet(null); setCreated(res);
    } catch (e) {
      console.error(e); setError(e.message || "Aanmaken mislukt, probeer opnieuw.");
    } finally { setBusy(false); }
  };

  const handleJoin = async () => {
    if (!joinForm.code.trim() || !joinForm.displayName.trim()) return;
    setBusy(true); setError("");
    try {
      const res = await joinCompetition({ code: joinForm.code.trim(), displayName: joinForm.displayName.trim() });
      navigate(`/competitions/${res.id}`);
    } catch (e) {
      console.error(e); setError(e.message || "Deelnemen mislukt, controleer de code.");
    } finally { setBusy(false); }
  };

  return (
    <div style={S.homeWrap}>
      <div style={S.homeIntro}>
        <div style={S.homeTitle}>Competities met vrienden</div>
        <div style={S.homeText}>
          Maak een competitie met een startkapitaal, deel de code met vrienden
          en speel mee. Klassement op basis van huidig kapitaal.
        </div>
        <div style={S.homeActions}>
          <button className="press" style={S.primaryBtn} onClick={() => { setSheet("create"); setCreated(null); setError(""); }}>Nieuwe competitie</button>
          <button className="press" style={{ ...S.primaryBtn, ...S.secondaryBtn }} onClick={() => { setSheet("join"); setCreated(null); setError(""); }}>Deelnemen met code</button>
        </div>
      </div>

      {sheet === "create" && (
        <div style={S.sheet}>
          <input style={S.input} placeholder="Naam van de competitie" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          <input style={S.input} placeholder="Jouw naam" value={createForm.displayName} onChange={e => setCreateForm({ ...createForm, displayName: e.target.value })} />
          <input style={S.input} placeholder="Startkapitaal €" inputMode="decimal" value={createForm.startKapitaal} onChange={e => setCreateForm({ ...createForm, startKapitaal: e.target.value })} />
          <label style={S.toggleRow}>
            <input style={S.toggleCheckbox} type="checkbox" checked={createForm.allowTopup} onChange={e => setCreateForm({ ...createForm, allowTopup: e.target.checked })} />
            <span style={S.toggleLabel}>Leden mogen tijdens de competitie bijstorten</span>
          </label>
          <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} placeholder="Regels (optioneel, bv. 'enkel WK-matchen', 'geen live bets')" value={createForm.rulesNote} onChange={e => setCreateForm({ ...createForm, rulesNote: e.target.value })} />
          {error && <div style={S.warnHint}>{error}</div>}
          <button className="press" style={S.cta} disabled={busy} onClick={handleCreate}>{busy ? "Aanmaken…" : "Competitie aanmaken"}</button>
        </div>
      )}

      {created && (
        <div style={S.sheet}>
          <div style={S.codeReveal}>
            <span style={S.codeRevealLabel}>Deel deze code met je vrienden</span>
            <span className="tnum" style={S.codeRevealValue}>{created.code}</span>
          </div>
          <button className="press" style={S.cta} onClick={() => navigate(`/competitions/${created.id}`)}>Naar de competitie</button>
        </div>
      )}

      {sheet === "join" && (
        <div style={S.sheet}>
          <input style={S.input} placeholder="Code (bv. AB12CD34)" value={joinForm.code} onChange={e => setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })} />
          <input style={S.input} placeholder="Jouw naam" value={joinForm.displayName} onChange={e => setJoinForm({ ...joinForm, displayName: e.target.value })} />
          {error && <div style={S.warnHint}>{error}</div>}
          <button className="press" style={S.cta} disabled={busy} onClick={handleJoin}>{busy ? "Bezig…" : "Deelnemen"}</button>
        </div>
      )}

      <div>
        <div style={S.homeSectionTitle}>Mijn competities</div>
        {competitions === null && <div style={S.matchNote}>Laden…</div>}
        {competitions && competitions.length === 0 && <div style={S.matchNote}>Je doet nog aan geen competities mee.</div>}
        {competitions && competitions.length > 0 && (
          <div style={S.matchList}>
            {competitions.map(c => (
              <Link key={c.id} to={`/competitions/${c.id}`} className="press" style={{ ...S.navLink, ...S.matchCard }}>
                <div style={S.matchTeams}>
                  {c.name}
                  <div style={S.compListMeta}>Startkapitaal {eur(c.start_kapitaal)} · jij: {c.display_name}</div>
                </div>
                <span style={S.codeBadge}>{c.code}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
