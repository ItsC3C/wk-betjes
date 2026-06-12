import { Link } from "react-router-dom";
import { S } from "../styles";
import { useMatches, toBrusselsISODate, toBrusselsTime, matchStatusLabel } from "../lib/matches";

const ddmm = (d) => (d ? d.split("-").reverse().join("/") : "");

export default function Home({ session, isSupabaseConfigured }) {
  const { matches, status } = useMatches();

  const todayISO = toBrusselsISODate(new Date().toISOString());
  const upcoming = matches
    .filter((m) => toBrusselsISODate(m.utcDate) >= todayISO)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 8);

  return (
    <div style={S.homeWrap}>
      <div style={S.homeIntro}>
        <div style={S.homeTitle}>Houd je WK-bets bij, zonder rompslomp</div>
        <div style={S.homeText}>
          Betjes helpt je je kapitaal, inzetten en odds overzichtelijk te houden.
          Plaats een bet, rond hem af zodra de wedstrijd voorbij is, en zie meteen
          je beschikbare kapitaal en mogelijke winst.
        </div>
        <div style={S.homeActions}>
          <Link to="/bets" className="press" style={{ ...S.navLink, ...S.primaryBtn, textAlign: "center" }}>Mijn bets</Link>
          <Link to="/competitions" className="press" style={{ ...S.navLink, ...S.primaryBtn, ...S.secondaryBtn, textAlign: "center" }}>Competities</Link>
          {!session && isSupabaseConfigured && (
            <Link to="/login" className="press" style={{ ...S.navLink, ...S.primaryBtn, ...S.secondaryBtn, textAlign: "center" }}>Inloggen</Link>
          )}
        </div>
      </div>

      <div>
        <div style={S.homeSectionTitle}>WK 2026 — vandaag &amp; komende matchen</div>
        {status === "loading" && <div style={S.matchNote}>Wedstrijden laden…</div>}
        {status === "error" && <div style={S.matchNote}>Wedstrijddata is momenteel niet beschikbaar.</div>}
        {status === "ready" && upcoming.length === 0 && (
          <div style={S.matchNote}>Geen matchen gevonden voor vandaag of de komende dagen.</div>
        )}
        {status === "ready" && upcoming.length > 0 && (
          <div style={S.matchList}>
            {upcoming.map((m) => {
              const label = matchStatusLabel(m.status);
              const score = m.homeScore != null && m.awayScore != null ? `${m.homeScore}-${m.awayScore}` : null;
              return (
                <div key={m.id} style={S.matchCard}>
                  <div style={S.matchWhen}>
                    <span style={S.matchDate}>{ddmm(toBrusselsISODate(m.utcDate))}</span>
                    <span style={S.matchTime}>{toBrusselsTime(m.utcDate)}</span>
                  </div>
                  <div style={S.matchTeams}>{m.home} – {m.away}</div>
                  {score && <span style={S.matchScore}>{score}</span>}
                  {label && <span style={S.matchStatus}>{label}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
