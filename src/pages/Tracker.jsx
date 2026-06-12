import { useState } from "react";
import { S } from "../styles";
import { supabase } from "../lib/supabaseClient";
import { useMatches, toBrusselsISODate, toBrusselsTime } from "../lib/matches";
import { eur, sgn, num, ddmm, EMPTY_BET, computeBankroll } from "../lib/format";

export default function Tracker({ data, persist }) {
  const { bets, deposits } = data;
  const [filter, setFilter] = useState("alles");
  const [betForm, setBetForm] = useState(EMPTY_BET);
  const [sheet, setSheet] = useState(null); // 'bet' | 'storten' | null
  const [depForm, setDepForm] = useState({ bedrag: "", note: "" });
  const [settling, setSettling] = useState(null);
  const [settleVals, setSettleVals] = useState({ resultaat: "", payout: "" });
  const { matches, status: matchesStatus } = useMatches();

  // ── bankroll math ──
  const { totalDeposited, realizedProfit, openStake, available, openPotential, openProfit, missingOdds, record, low } = computeBankroll(bets, deposits);

  // ── unified timeline ──
  const items = [
    ...bets.map(b => ({ kind: "bet", sortKey: b.datum + (b.tijd || "99:99"), ...b })),
    ...deposits.map(d => ({ kind: "dep", sortKey: d.datum + "00:00", ...d })),
  ].sort((a, b) => (b.sortKey).localeCompare(a.sortKey));
  const shown = items.filter(it => filter === "alles" ? true : filter === "stortingen" ? it.kind === "dep" : it.kind === "bet" && (filter === "open" ? it.status === "open" : it.status !== "open"));

  // ── WK-matchen helpers ──
  const matchLabel = (m) => `${ddmm(toBrusselsISODate(m.utcDate))} ${toBrusselsTime(m.utcDate)} · ${m.home} – ${m.away}`;
  const applyMatch = (id) => {
    const m = matches.find(x => String(x.id) === id);
    if (!m) return;
    setBetForm({ ...betForm, wedstrijd: `${m.home} – ${m.away}`, datum: toBrusselsISODate(m.utcDate), tijd: toBrusselsTime(m.utcDate) });
  };
  const findMatchForBet = (b) => matches.find(m => `${m.home} – ${m.away}` === b.wedstrijd);

  // ── actions ──
  const addBet = () => {
    if (!betForm.wedstrijd.trim() || !num(betForm.odd) || !num(betForm.inzet)) return;
    const b = { id: crypto.randomUUID(), wedstrijd: betForm.wedstrijd.trim(), bet: betForm.bet.trim(), datum: betForm.datum || new Date().toISOString().slice(0, 10), tijd: betForm.tijd || "", odd: num(betForm.odd), inzet: num(betForm.inzet), status: "open", payout: null, resultaat: "" };
    persist({ ...data, bets: [...bets, b] }, { cloud: (uid) => supabase.from("bets").insert({ ...b, user_id: uid }) });
    setBetForm(EMPTY_BET); setSheet(null);
  };
  const addDeposit = () => {
    if (!num(depForm.bedrag) || num(depForm.bedrag) <= 0) return;
    const d = { id: crypto.randomUUID(), datum: new Date().toISOString().slice(0, 10), bedrag: num(depForm.bedrag), note: depForm.note.trim() || "Storting" };
    persist({ ...data, deposits: [...deposits, d] }, { cloud: (uid) => supabase.from("deposits").insert({ ...d, user_id: uid }) });
    setDepForm({ bedrag: "", note: "" }); setSheet(null);
  };
  const settleLose = (b) => persist(
    { ...data, bets: bets.map(x => x.id === b.id ? { ...x, status: "lost", payout: 0 } : x) },
    { cloud: () => supabase.from("bets").update({ status: "lost", payout: 0 }).eq("id", b.id) }
  );
  const startWin = (b) => {
    const m = findMatchForBet(b);
    const suggested = m && m.status === "FINISHED" && m.homeScore != null && m.awayScore != null ? `${m.homeScore}-${m.awayScore}` : "";
    setSettling(b.id);
    setSettleVals({ resultaat: suggested, payout: b.odd && b.inzet ? (b.odd * b.inzet).toFixed(2) : "" });
  };
  const confirmWin = (b) => {
    const patch = { status: "won", payout: num(settleVals.payout) ?? 0, resultaat: settleVals.resultaat };
    persist(
      { ...data, bets: bets.map(x => x.id === b.id ? { ...x, ...patch } : x) },
      { cloud: () => supabase.from("bets").update(patch).eq("id", b.id) }
    );
    setSettling(null);
  };
  const reopen = (b) => persist(
    { ...data, bets: bets.map(x => x.id === b.id ? { ...x, status: "open", payout: null, resultaat: "" } : x) },
    { cloud: () => supabase.from("bets").update({ status: "open", payout: null, resultaat: "" }).eq("id", b.id) }
  );
  const removeBet = (b) => persist(
    { ...data, bets: bets.filter(x => x.id !== b.id) },
    { cloud: () => supabase.from("bets").delete().eq("id", b.id) }
  );
  const removeDep = (d) => persist(
    { ...data, deposits: deposits.filter(x => x.id !== d.id) },
    { cloud: () => supabase.from("deposits").delete().eq("id", d.id) }
  );
  const updateOdd = (b, v) => persist(
    { ...data, bets: bets.map(x => x.id === b.id ? { ...x, odd: num(v) } : x) },
    { cloud: () => supabase.from("bets").update({ odd: num(v) }).eq("id", b.id) }
  );

  const newBetInzet = num(betForm.inzet);
  const insufficient = newBetInzet && newBetInzet > available;

  return (
    <>
      {/* Bankroll card */}
      <div style={{ ...S.bankroll, ...(low ? S.bankrollLow : {}) }}>
        <span style={S.brLabel}>Beschikbaar kapitaal</span>
        <span className="tnum" style={{ ...S.brBig, color: low ? "#FF8C8C" : "#E8ECF4" }}>{eur(available)}</span>
        {low && <span style={S.brWarn}>Je pot is leeg — stort bij om verder te spelen.</span>}
        <div style={S.brStats}>
          <div style={S.brStat}><span style={S.brStatL}>Vastgezet</span><span style={S.brStatV}>{eur(openStake)}</span></div>
          <div style={S.brDiv} />
          <div style={S.brStat}><span style={S.brStatL}>Netto winst</span><span style={{ ...S.brStatV, color: realizedProfit >= 0 ? "#7BE3A0" : "#FF8C8C" }}>{sgn(realizedProfit)}</span></div>
          <div style={S.brDiv} />
          <div style={S.brStat}><span style={S.brStatL}>Gestort</span><span style={S.brStatV}>{eur(totalDeposited)}</span></div>
        </div>
        <div style={S.brActions}>
          <button className="press" style={{ ...S.primaryBtn, ...(low ? {} : S.secondaryBtn) }} onClick={() => { setSheet("storten"); setSettling(null); }}>＋ Storten</button>
          <button className="press" style={{ ...S.primaryBtn, ...(low ? S.secondaryBtn : {}) }} onClick={() => { setSheet("bet"); setSettling(null); }}>＋ Nieuwe bet</button>
        </div>
      </div>

      {/* Potential from open bets */}
      {record.o > 0 && (
        <div style={S.potStrip}>
          <div style={S.potLeft}>
            <span style={S.potDot} />
            <span style={S.potLabel}>{record.o} open {record.o === 1 ? "bet" : "bets"}{missingOdds ? ` · ${missingOdds} zonder odd` : ""}</span>
          </div>
          <div style={S.potRight}>
            <div style={S.potBlock}><span style={S.potBlockL}>Mogelijke payout</span><span style={S.potBlockV}>{eur(openPotential)}</span></div>
            <div style={S.potBlock}><span style={S.potBlockL}>Mogelijke winst</span><span style={{ ...S.potBlockV, color: "#7BE3A0" }}>{sgn(openProfit)}</span></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabs}>
        {["alles", "open", "afgerond", "stortingen"].map(t => (
          <button key={t} onClick={() => setFilter(t)} className="press" style={{ ...S.tab, ...(filter === t ? S.tabOn : {}) }}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Sheets */}
      {sheet === "bet" && (
        <div style={S.sheet}>
          {matchesStatus === "ready" && matches.length > 0 && (
            <select style={S.input} value="" onChange={e => applyMatch(e.target.value)}>
              <option value="">Kies een WK-match (optioneel)…</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>{matchLabel(m)}</option>
              ))}
            </select>
          )}
          {matchesStatus === "error" && <div style={S.hint}>WK-matchen niet beschikbaar — vul de wedstrijd handmatig in.</div>}
          <input style={S.input} placeholder="Wedstrijd (bv. Nederland – Japan)" value={betForm.wedstrijd} onChange={e => setBetForm({ ...betForm, wedstrijd: e.target.value })} />
          <input style={S.input} placeholder="Bet (bv. over 2,5 goals)" value={betForm.bet} onChange={e => setBetForm({ ...betForm, bet: e.target.value })} />
          <div style={S.row}>
            <input style={{ ...S.input, flex: 1.3 }} type="date" value={betForm.datum} onChange={e => setBetForm({ ...betForm, datum: e.target.value })} />
            <input style={{ ...S.input, flex: 0.7 }} placeholder="Tijd" value={betForm.tijd} onChange={e => setBetForm({ ...betForm, tijd: e.target.value })} />
          </div>
          <div style={S.row}>
            <input style={{ ...S.input, flex: 1 }} placeholder="Odd (1,85)" inputMode="decimal" value={betForm.odd} onChange={e => setBetForm({ ...betForm, odd: e.target.value })} />
            <input style={{ ...S.input, flex: 1 }} placeholder="Inzet €" inputMode="decimal" value={betForm.inzet} onChange={e => setBetForm({ ...betForm, inzet: e.target.value })} />
          </div>
          {num(betForm.odd) && newBetInzet ? <div style={S.hint}>Mogelijke payout: <b>{eur(num(betForm.odd) * newBetInzet)}</b></div> : null}
          {insufficient ? <div style={S.warnHint}>Inzet hoger dan je kapitaal ({eur(available)}). Stort eventueel eerst bij.</div> : null}
          <button className="press" style={S.cta} onClick={addBet}>Bet plaatsen</button>
        </div>
      )}
      {sheet === "storten" && (
        <div style={S.sheet}>
          <input style={S.input} placeholder="Bedrag €" inputMode="decimal" autoFocus value={depForm.bedrag} onChange={e => setDepForm({ ...depForm, bedrag: e.target.value })} />
          <input style={S.input} placeholder="Omschrijving (optioneel)" value={depForm.note} onChange={e => setDepForm({ ...depForm, note: e.target.value })} />
          <button className="press" style={S.cta} onClick={addDeposit}>Storten</button>
        </div>
      )}

      {/* Timeline */}
      <div style={S.list}>
        {shown.length === 0 && <div style={S.empty}>Niks hier. Plaats een bet of doe een storting.</div>}
        {shown.map(it => it.kind === "dep" ? (
          <div key={it.id} style={S.depCard}>
            <div style={S.depIcon}>＋</div>
            <div style={{ flex: 1 }}>
              <div style={S.depTitle}>{it.note}</div>
              <div style={S.meta}>{ddmm(it.datum)} · storting</div>
            </div>
            <div style={S.depAmt}>{sgn(it.bedrag)}</div>
            <button className="press" style={S.xBtn} onClick={() => removeDep(it)}>✕</button>
          </div>
        ) : (() => {
          const b = it;
          const profit = b.status === "won" ? (b.payout || 0) - b.inzet : b.status === "lost" ? -b.inzet : null;
          const accent = b.status === "won" ? "#7BE3A0" : b.status === "lost" ? "#FF6B6B" : "#F2C14E";
          return (
            <div key={b.id} className="card" style={{ ...S.card, borderLeft: `3px solid ${accent}` }}>
              <div style={S.cardTop}>
                <div style={{ flex: 1 }}>
                  <div style={S.match}>{b.wedstrijd}</div>
                  <div style={S.meta}>{ddmm(b.datum)}{b.tijd ? " · " + b.tijd : ""}{b.resultaat ? " · " + b.resultaat : ""}</div>
                </div>
                <span style={{ ...S.badge, background: b.status === "won" ? "#12331F" : b.status === "lost" ? "#3A1518" : "#3A2E10", color: accent }}>
                  {b.status === "won" ? "Gewonnen" : b.status === "lost" ? "Verloren" : "Open"}
                </span>
              </div>
              <div style={S.betDesc}>{b.bet || "—"}</div>
              <div style={S.cardStats}>
                <span>Odd {b.odd == null ? <input style={S.oddInput} placeholder="?" inputMode="decimal" onBlur={e => e.target.value && updateOdd(b, e.target.value)} onKeyDown={e => e.key === "Enter" && e.target.value && updateOdd(b, e.target.value)} /> : <b>{String(b.odd).replace(".", ",")}</b>}</span>
                <span>Inzet <b>{eur(b.inzet)}</b></span>
                <span>{b.status === "open" ? "Mogelijk " : "Payout "}<b>{b.status === "open" ? (b.odd ? eur(b.odd * b.inzet) : "—") : eur(b.payout)}</b></span>
                {profit != null && <span style={{ color: profit >= 0 ? "#7BE3A0" : "#FF8C8C" }}>Winst <b>{sgn(profit)}</b></span>}
              </div>
              {b.status === "open" && settling !== b.id && (
                <div style={S.actions}>
                  <button className="press" style={S.winBtn} onClick={() => startWin(b)}>✓ Gewonnen</button>
                  <button className="press" style={S.loseBtn} onClick={() => settleLose(b)}>✕ Verloren</button>
                  <button className="press" style={S.ghost} onClick={() => removeBet(b)}>Verwijder</button>
                </div>
              )}
              {settling === b.id && (
                <div style={S.row}>
                  <input style={{ ...S.input, flex: 0.8 }} placeholder="Uitslag" value={settleVals.resultaat} onChange={e => setSettleVals({ ...settleVals, resultaat: e.target.value })} />
                  <input style={{ ...S.input, flex: 1 }} placeholder="Payout €" inputMode="decimal" value={settleVals.payout} onChange={e => setSettleVals({ ...settleVals, payout: e.target.value })} />
                  <button className="press" style={{ ...S.cta, marginTop: 0, padding: "12px 16px", whiteSpace: "nowrap" }} onClick={() => confirmWin(b)}>OK</button>
                </div>
              )}
              {b.status !== "open" && (
                <div style={S.actions}>
                  <button className="press" style={S.ghost} onClick={() => reopen(b)}>Heropen</button>
                  <button className="press" style={S.ghost} onClick={() => removeBet(b)}>Verwijder</button>
                </div>
              )}
            </div>
          );
        })())}
      </div>
      <div style={S.foot}>Inzetten gaan automatisch van je kapitaal af; payout bij winst komt erbij. Pas de payout aan bij een profit boost. Alles wordt automatisch bewaard.</div>
    </>
  );
}
