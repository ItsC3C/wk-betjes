export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap');
* { -webkit-tap-highlight-color: transparent; }
.tnum { font-variant-numeric: tabular-nums; }
.press { cursor: pointer; transition: transform .08s ease, filter .12s ease; }
.press:active { transform: scale(.97); }
.press:hover { filter: brightness(1.12); }
.card { transition: border-color .15s ease; }
button:focus-visible, input:focus-visible { outline: 2px solid #F2C14E; outline-offset: 2px; }
input::placeholder { color: #5C6677; }
input[type=date] { color-scheme: dark; }
@media (prefers-reduced-motion: reduce) { .press, .card { transition: none; } .press:active { transform: none; } }
`;

export const S = {
  app: { width: "100%", maxWidth: 480, margin: "0 auto", padding: "10px 12px 28px", boxSizing: "border-box", fontFamily: "'Barlow', system-ui, sans-serif", color: "#E8ECF4" },
  appbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 2px 12px" },
  brand: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.06em", color: "#E8ECF4" },
  saveTag: { fontSize: 11.5, fontWeight: 600, letterSpacing: "0.03em" },
  bankroll: { background: "linear-gradient(165deg, #13203A 0%, #0A1322 100%)", border: "1px solid #1E2A42", borderRadius: 18, padding: "20px 18px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
  bankrollLow: { border: "1px solid #57222A", background: "linear-gradient(165deg, #2A1620 0%, #0A1322 100%)" },
  brLabel: { fontSize: 12, color: "#8A93A6", textTransform: "uppercase", letterSpacing: "0.1em" },
  brBig: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 52, lineHeight: 1.05, marginTop: 2 },
  brWarn: { fontSize: 12.5, color: "#FF8C8C", marginTop: 4 },
  brStats: { display: "flex", alignItems: "center", gap: 14, margin: "14px 0 16px" },
  brStat: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  brStatL: { fontSize: 10.5, color: "#5C6677", textTransform: "uppercase", letterSpacing: "0.05em" },
  brStatV: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 17, fontVariantNumeric: "tabular-nums" },
  brDiv: { width: 1, height: 26, background: "#1E2A42" },
  brActions: { display: "flex", gap: 10, width: "100%" },
  primaryBtn: { flex: 1, background: "#F2C14E", color: "#0B1322", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, padding: "13px", fontFamily: "'Barlow', sans-serif" },
  secondaryBtn: { background: "#16233C", color: "#E8ECF4", border: "1px solid #2A3A57" },
  tabs: { display: "flex", gap: 4, background: "#0B1322", border: "1px solid #1E2A42", borderRadius: 12, padding: 4, margin: "14px 0 12px" },
  potStrip: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#1A1606", border: "1px solid #3A2E10", borderRadius: 12, padding: "11px 14px", marginTop: 10 },
  potLeft: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  potDot: { width: 8, height: 8, borderRadius: 99, background: "#F2C14E", flexShrink: 0 },
  potLabel: { fontSize: 12.5, color: "#C9A94E", fontWeight: 600, lineHeight: 1.3 },
  potRight: { display: "flex", gap: 16, flexShrink: 0 },
  potBlock: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 },
  potBlockL: { fontSize: 10, color: "#8A7A45", textTransform: "uppercase", letterSpacing: "0.04em" },
  potBlockV: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: "#F2C14E", fontVariantNumeric: "tabular-nums", lineHeight: 1 },
  tab: { flex: 1, background: "transparent", border: "none", color: "#8A93A6", fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 12.5, padding: "9px 4px", borderRadius: 8 },
  tabOn: { background: "#1E2A42", color: "#E8ECF4" },
  sheet: { background: "#0E1626", border: "1px solid #1E2A42", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 },
  row: { display: "flex", gap: 9, alignItems: "center" },
  hint: { fontSize: 13, color: "#8A93A6" },
  warnHint: { fontSize: 12.5, color: "#F2C14E" },
  input: { background: "#0B1322", border: "1px solid #243352", borderRadius: 10, color: "#E8ECF4", padding: "13px 13px", fontSize: 15, fontFamily: "'Barlow', sans-serif", width: "100%", boxSizing: "border-box" },
  cta: { background: "#F2C14E", color: "#0B1322", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, padding: "13px", marginTop: 2, fontFamily: "'Barlow', sans-serif" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  empty: { textAlign: "center", color: "#5C6677", padding: "30px 0", fontSize: 14 },
  card: { background: "#0E1626", border: "1px solid #1E2A42", borderRadius: 14, padding: "13px 14px" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  match: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.1 },
  meta: { fontSize: 12, color: "#5C6677", marginTop: 3 },
  badge: { fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap", letterSpacing: "0.03em" },
  betDesc: { fontSize: 13.5, color: "#B7BFCD", margin: "9px 0", lineHeight: 1.4 },
  cardStats: { display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12.5, color: "#8A93A6", fontVariantNumeric: "tabular-nums" },
  oddInput: { width: 54, background: "#3A2E10", border: "1px solid #F2C14E", borderRadius: 6, color: "#F2C14E", padding: "4px 7px", fontSize: 12.5, fontFamily: "'Barlow', sans-serif" },
  actions: { display: "flex", gap: 8, marginTop: 12 },
  winBtn: { background: "#12331F", color: "#7BE3A0", border: "1px solid #1E4A2E", borderRadius: 10, fontSize: 13.5, fontWeight: 700, padding: "10px 14px", fontFamily: "'Barlow', sans-serif" },
  loseBtn: { background: "#3A1518", color: "#FF8C8C", border: "1px solid #57222A", borderRadius: 10, fontSize: 13.5, fontWeight: 700, padding: "10px 14px", fontFamily: "'Barlow', sans-serif" },
  ghost: { background: "transparent", color: "#5C6677", border: "1px solid #1E2A42", borderRadius: 10, fontSize: 13, padding: "10px 14px", fontFamily: "'Barlow', sans-serif", marginLeft: "auto" },
  depCard: { display: "flex", alignItems: "center", gap: 12, background: "#0C1A14", border: "1px solid #16331F", borderRadius: 14, padding: "13px 14px" },
  depIcon: { width: 34, height: 34, borderRadius: 10, background: "#12331F", color: "#7BE3A0", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 },
  depTitle: { fontWeight: 600, fontSize: 14.5, color: "#E8ECF4" },
  depAmt: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: "#7BE3A0", fontVariantNumeric: "tabular-nums" },
  xBtn: { background: "transparent", border: "none", color: "#3A4759", fontSize: 15, padding: "4px 6px", marginLeft: 2 },
  foot: { textAlign: "center", fontSize: 11.5, color: "#5C6677", marginTop: 18, lineHeight: 1.5 },

  // ─── Auth bar (account / gast-modus indicator) ───
  authbar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "0 2px 12px" },
  authInfo: { display: "flex", alignItems: "center", gap: 6, minWidth: 0, fontSize: 12, color: "#5C6677" },
  authEmail: { color: "#8A93A6", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  authBtn: { background: "transparent", color: "#8A93A6", border: "1px solid #1E2A42", borderRadius: 8, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap", flexShrink: 0 },
  authBtnAccent: { background: "#F2C14E", color: "#0B1322", border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", fontFamily: "'Barlow', sans-serif", whiteSpace: "nowrap", flexShrink: 0 },

  // ─── Migratie-banner (gast-data → account) ───
  migrateBanner: { display: "flex", flexDirection: "column", gap: 10, background: "#13203A", border: "1px solid #2A3A57", borderRadius: 14, padding: 14, marginBottom: 12 },
  migrateText: { fontSize: 13, color: "#C7D0E0", lineHeight: 1.5 },
  migrateActions: { display: "flex", gap: 10 },
  migrateBtn: { flex: 1, background: "#F2C14E", color: "#0B1322", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13.5, padding: "10px", fontFamily: "'Barlow', sans-serif" },
  migrateGhost: { flex: 1, background: "transparent", color: "#8A93A6", border: "1px solid #2A3A57", borderRadius: 10, fontWeight: 600, fontSize: 13.5, padding: "10px", fontFamily: "'Barlow', sans-serif" },

  // ─── Navigatie (links die op knoppen lijken) ───
  navLink: { textDecoration: "none", color: "inherit", display: "inline-block" },
  appbarNav: { display: "flex", alignItems: "center", gap: 14 },
  appbarLink: { fontSize: 12.5, fontWeight: 600, color: "#8A93A6", textDecoration: "none" },

  // ─── Home-pagina ───
  homeWrap: { display: "flex", flexDirection: "column", gap: 22, padding: "4px 0 8px" },
  homeIntro: { display: "flex", flexDirection: "column", gap: 10 },
  homeTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1.15, color: "#E8ECF4" },
  homeText: { fontSize: 13.5, color: "#8A93A6", lineHeight: 1.6 },
  homeActions: { display: "flex", gap: 10, marginTop: 4 },
  homeSectionTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8A93A6", margin: "0 0 10px" },

  // ─── WK-matchen ───
  matchNote: { textAlign: "center", color: "#5C6677", padding: "20px 0", fontSize: 13.5 },
  matchList: { display: "flex", flexDirection: "column", gap: 8 },
  matchCard: { display: "flex", alignItems: "center", gap: 12, background: "#0E1626", border: "1px solid #1E2A42", borderRadius: 12, padding: "10px 12px" },
  matchWhen: { display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40, flexShrink: 0 },
  matchDate: { fontSize: 10.5, color: "#5C6677", textTransform: "uppercase", letterSpacing: "0.03em" },
  matchTime: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: "#E8ECF4", fontVariantNumeric: "tabular-nums" },
  matchTeams: { flex: 1, fontSize: 13.5, fontWeight: 600, color: "#E8ECF4", lineHeight: 1.3, minWidth: 0 },
  matchScore: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: "#F2C14E", flexShrink: 0, fontVariantNumeric: "tabular-nums" },
  matchStatus: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, letterSpacing: "0.03em", background: "#1E2A42", color: "#8A93A6", flexShrink: 0, whiteSpace: "nowrap" },

  // ─── Competities met vrienden ───
  compListMeta: { fontSize: 12, color: "#5C6677", marginTop: 3 },
  codeBadge: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "#F2C14E", background: "#0B1322", border: "1px solid #2A3A57", borderRadius: 8, padding: "4px 10px", flexShrink: 0 },
  codeReveal: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#0B1322", border: "1px solid #2A3A57", borderRadius: 14, padding: "18px 14px" },
  codeRevealLabel: { fontSize: 11, color: "#8A93A6", textTransform: "uppercase", letterSpacing: "0.1em" },
  codeRevealValue: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 36, letterSpacing: "0.18em", color: "#F2C14E" },
  copyBtn: { background: "transparent", color: "#8A93A6", border: "1px solid #1E2A42", borderRadius: 8, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", fontFamily: "'Barlow', sans-serif" },
  toggleRow: { display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" },
  toggleCheckbox: { width: 18, height: 18, accentColor: "#F2C14E", flexShrink: 0 },
  toggleLabel: { fontSize: 13.5, color: "#C7D0E0", lineHeight: 1.4 },
  compCodeRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  settingsSummary: { display: "flex", flexWrap: "wrap", gap: 8 },
  settingsChip: { fontSize: 11.5, fontWeight: 600, color: "#8A93A6", background: "#0E1626", border: "1px solid #1E2A42", borderRadius: 99, padding: "5px 11px" },
  rulesNote: { fontSize: 13, color: "#8A93A6", lineHeight: 1.5, fontStyle: "italic" },
  leaderboard: { display: "flex", flexDirection: "column", gap: 8 },
  leaderboardRow: { display: "flex", alignItems: "center", gap: 12, background: "#0E1626", border: "1px solid #1E2A42", borderRadius: 12, padding: "10px 14px" },
  leaderboardMe: { borderColor: "#F2C14E" },
  leaderboardRank: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: "#5C6677", minWidth: 22, textAlign: "center", flexShrink: 0 },
  leaderboardName: { flex: 1, fontSize: 14, fontWeight: 600, color: "#E8ECF4", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  leaderboardAmount: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 17, color: "#E8ECF4", fontVariantNumeric: "tabular-nums", flexShrink: 0 },
  backLink: { fontSize: 12.5, color: "#5C6677", textDecoration: "none" },

  // ─── Login / magic-link pagina ───
  loginWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70dvh", gap: 18, padding: "20px 4px" },
  loginBrand: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: "0.05em", color: "#E8ECF4", textAlign: "center" },
  loginSubtitle: { fontSize: 13.5, color: "#8A93A6", textAlign: "center", lineHeight: 1.5, maxWidth: 320 },
  loginCard: { width: "100%", maxWidth: 360, boxSizing: "border-box", background: "linear-gradient(165deg, #13203A 0%, #0A1322 100%)", border: "1px solid #1E2A42", borderRadius: 18, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10 },
  loginLabel: { fontSize: 12, color: "#8A93A6", textTransform: "uppercase", letterSpacing: "0.08em" },
  loginStatus: { fontSize: 13, color: "#7BE3A0", textAlign: "center", lineHeight: 1.5 },
  loginErrorText: { fontSize: 13, color: "#FF8C8C", textAlign: "center", lineHeight: 1.5 },
  loginBack: { background: "transparent", color: "#5C6677", border: "none", fontSize: 13, fontFamily: "'Barlow', sans-serif", padding: "6px 0", textAlign: "center", width: "100%" },
};
