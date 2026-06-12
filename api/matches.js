// Vercel serverless function: haalt WK 2026-matchen op via football-data.org.
// De API-token staat enkel server-side in process.env.FOOTBALL_DATA_TOKEN
// (geen VITE_-prefix, dus niet bereikbaar vanuit de browser).
export default async function handler(req, res) {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    res
      .status(500)
      .json({ error: "FOOTBALL_DATA_TOKEN ontbreekt op de server" });
    return;
  }

  try {
    const upstream = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers: { "X-Auth-Token": token },
      },
    );

    if (!upstream.ok) {
      res
        .status(upstream.status)
        .json({ error: "football-data.org gaf een foutmelding" });
      return;
    }

    const data = await upstream.json();
    const matches = (data.matches || []).map((m) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      home: m.homeTeam?.name || m.homeTeam?.shortName || "TBD",
      away: m.awayTeam?.name || m.awayTeam?.shortName || "TBD",
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
    }));

    // Cache ~5 min op de CDN, zodat we ruim binnen de 10 calls/min van de gratis tier blijven.
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=300",
    );
    res.status(200).json({ matches });
  } catch {
    res.status(502).json({ error: "Kon WK-matchen niet ophalen" });
  }
}
