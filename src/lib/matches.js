import { useState, useEffect } from "react";

// ─── WK 2026 matchdata (via /api/matches, zie api/matches.js) ───
export async function fetchMatches() {
  const res = await fetch("/api/matches");
  if (!res.ok) throw new Error(`Matches API error: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.matches) ? json.matches : [];
}

export function useMatches() {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    fetchMatches()
      .then((m) => { if (!cancelled) { setMatches(m); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  return { matches, status };
}

// ─── Tijd/datum-helpers (Europe/Brussels) ───
const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("nl-BE", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit", hour12: false });

// "YYYY-MM-DD", compatibel met <input type="date">
export function toBrusselsISODate(utcDate) {
  return dateFmt.format(new Date(utcDate));
}

// "HH:MM"
export function toBrusselsTime(utcDate) {
  return timeFmt.format(new Date(utcDate));
}

export function matchStatusLabel(status) {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
    case "LIVE": return "Live";
    case "FINISHED": return "Afgelopen";
    case "POSTPONED": return "Uitgesteld";
    case "SUSPENDED": return "Onderbroken";
    case "CANCELLED": return "Geannuleerd";
    default: return null; // SCHEDULED / TIMED → geen label
  }
}
