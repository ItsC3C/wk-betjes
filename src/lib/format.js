// ─── Gedeelde formatters & bankroll-rekenwerk ───
// Gebruikt door de persoonlijke tracker (src/pages/Tracker.jsx) en de
// competitie-tracker/het klassement (src/pages/CompetitionDetail.jsx).

export const eur = (n) => (n == null || isNaN(n) ? "—" : "€ " + Number(n).toFixed(2).replace(".", ","));
export const sgn = (n) => (n >= 0 ? "+" : "−") + " € " + Math.abs(n).toFixed(2).replace(".", ",");
export const num = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; };
export const ddmm = (d) => (d ? d.split("-").reverse().join("/") : "");

export const EMPTY_BET = { wedstrijd: "", bet: "", datum: "", tijd: "", odd: "", inzet: "" };

// Berekent kapitaal/winst-statistieken uit een set bets + stortingen.
export function computeBankroll(bets, deposits) {
  const totalDeposited = deposits.reduce((s, d) => s + (d.bedrag || 0), 0);
  const wonProfit = bets.filter(b => b.status === "won").reduce((s, b) => s + ((b.payout || 0) - b.inzet), 0);
  const lostStake = bets.filter(b => b.status === "lost").reduce((s, b) => s + b.inzet, 0);
  const openStake = bets.filter(b => b.status === "open").reduce((s, b) => s + (b.inzet || 0), 0);
  const realizedProfit = wonProfit - lostStake;
  const available = totalDeposited + realizedProfit - openStake; // spendable cash
  const openPotential = bets.filter(b => b.status === "open").reduce((s, b) => s + (b.odd && b.inzet ? b.odd * b.inzet : 0), 0);
  const openStakeWithOdd = bets.filter(b => b.status === "open" && b.odd && b.inzet).reduce((s, b) => s + b.inzet, 0);
  const openProfit = openPotential - openStakeWithOdd;
  const missingOdds = bets.filter(b => b.status === "open" && !b.odd).length;
  const record = { w: bets.filter(b => b.status === "won").length, l: bets.filter(b => b.status === "lost").length, o: bets.filter(b => b.status === "open").length };
  const low = available <= 0;
  return { totalDeposited, realizedProfit, openStake, available, openPotential, openProfit, missingOdds, record, low };
}
