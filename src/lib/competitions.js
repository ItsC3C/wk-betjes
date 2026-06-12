import { supabase } from "./supabaseClient";
import { computeBankroll } from "./format";

// ─── Competities met vrienden (zie supabase/schema.sql) ───

// Competities waar de gebruiker lid van is, met zijn eigen weergavenaam erbij.
export async function fetchMyCompetitions(userId) {
  const { data, error } = await supabase
    .from("competition_members")
    .select("display_name, competitions(id, name, code, start_kapitaal, allow_topup, rules_note, created_by)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || [])
    .filter(row => row.competitions)
    .map(row => ({ ...row.competitions, display_name: row.display_name }));
}

// Maakt een nieuwe competitie + zet de maker als eerste lid met startkapitaal.
// Geeft { id, code } terug.
export async function createCompetition({ name, displayName, startKapitaal, allowTopup, rulesNote }) {
  const { data, error } = await supabase.rpc("create_competition", {
    p_name: name,
    p_display_name: displayName,
    p_start_kapitaal: startKapitaal,
    p_allow_topup: allowTopup,
    p_rules_note: rulesNote || null,
  });
  if (error) throw error;
  return data?.[0];
}

// Sluit aan bij een bestaande competitie via de invite-code.
// Geeft { id, name, start_kapitaal, allow_topup, rules_note } terug.
export async function joinCompetition({ code, displayName }) {
  const { data, error } = await supabase.rpc("join_competition", {
    p_code: code,
    p_display_name: displayName,
  });
  if (error) throw error;
  return data?.[0];
}

// Verwijdert een competitie (enkel toegestaan voor de maker, via RLS).
// Cascadeert naar leden, bets en stortingen van alle leden.
export async function deleteCompetition(competitionId) {
  const { error } = await supabase.from("competitions").delete().eq("id", competitionId);
  if (error) throw error;
}

// Alle data voor de detailpagina: de competitie zelf, alle leden en alle
// bets/stortingen van alle leden (toegestaan via de is_competition_member-policy).
export async function fetchCompetitionDetail(competitionId) {
  const [compRes, membersRes, betsRes, depRes] = await Promise.all([
    supabase.from("competitions").select("*").eq("id", competitionId).single(),
    supabase.from("competition_members").select("*").eq("competition_id", competitionId),
    supabase.from("competition_bets").select("*").eq("competition_id", competitionId),
    supabase.from("competition_deposits").select("*").eq("competition_id", competitionId),
  ]);
  if (compRes.error) throw compRes.error;
  if (membersRes.error) throw membersRes.error;
  if (betsRes.error) throw betsRes.error;
  if (depRes.error) throw depRes.error;
  return {
    competition: compRes.data,
    members: membersRes.data || [],
    bets: betsRes.data || [],
    deposits: depRes.data || [],
  };
}

// Klassement: huidig kapitaal per lid, hoog → laag.
export function computeLeaderboard(members, bets, deposits) {
  return members
    .map(m => {
      const { available } = computeBankroll(
        bets.filter(b => b.user_id === m.user_id),
        deposits.filter(d => d.user_id === m.user_id)
      );
      return { user_id: m.user_id, display_name: m.display_name, available };
    })
    .sort((a, b) => b.available - a.available);
}
