-- WK 2026 · Betjes — Supabase schema
-- Plak dit volledige script in: Supabase Dashboard → SQL Editor → New query → Run

-- gen_random_uuid() komt uit pgcrypto (op Supabase meestal al aan)
create extension if not exists pgcrypto;

-- ─── Bets ───────────────────────────────────────────────
create table if not exists public.bets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  datum      date not null,
  tijd       text,
  wedstrijd  text not null,
  bet        text,
  odd        numeric,
  inzet      numeric not null,
  status     text not null default 'open' check (status in ('open', 'won', 'lost')),
  payout     numeric,
  resultaat  text
);

create index if not exists bets_user_id_idx on public.bets (user_id);

alter table public.bets enable row level security;

create policy "bets_select_own" on public.bets
  for select using (auth.uid() = user_id);

create policy "bets_insert_own" on public.bets
  for insert with check (auth.uid() = user_id);

create policy "bets_update_own" on public.bets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bets_delete_own" on public.bets
  for delete using (auth.uid() = user_id);

-- ─── Deposits (stortingen) ──────────────────────────────
create table if not exists public.deposits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  datum      date not null,
  bedrag     numeric not null,
  note       text
);

create index if not exists deposits_user_id_idx on public.deposits (user_id);

alter table public.deposits enable row level security;

create policy "deposits_select_own" on public.deposits
  for select using (auth.uid() = user_id);

create policy "deposits_insert_own" on public.deposits
  for insert with check (auth.uid() = user_id);

create policy "deposits_update_own" on public.deposits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deposits_delete_own" on public.deposits
  for delete using (auth.uid() = user_id);

-- ─── Competities met vrienden ───────────────────────────
create table if not exists public.competitions (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  code           text not null unique,
  created_by     uuid not null references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  start_kapitaal numeric not null default 20,
  allow_topup    boolean not null default true,
  rules_note     text
);

create table if not exists public.competition_members (
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  display_name   text not null,
  joined_at      timestamptz not null default now(),
  primary key (competition_id, user_id)
);

create index if not exists competition_members_user_id_idx on public.competition_members (user_id);

-- Competitie-bets: zelfde vorm als public.bets, maar gekoppeld aan een competitie
create table if not exists public.competition_bets (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  datum          date not null,
  tijd           text,
  wedstrijd      text not null,
  bet            text,
  odd            numeric,
  inzet          numeric not null,
  status         text not null default 'open' check (status in ('open', 'won', 'lost')),
  payout         numeric,
  resultaat      text
);

create index if not exists competition_bets_competition_id_idx on public.competition_bets (competition_id);
create index if not exists competition_bets_user_id_idx on public.competition_bets (user_id);

-- Competitie-stortingen: startkapitaal + (optioneel) bijstortingen
create table if not exists public.competition_deposits (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now(),
  datum          date not null,
  bedrag         numeric not null,
  note           text
);

create index if not exists competition_deposits_competition_id_idx on public.competition_deposits (competition_id);
create index if not exists competition_deposits_user_id_idx on public.competition_deposits (user_id);

alter table public.competitions enable row level security;
alter table public.competition_members enable row level security;
alter table public.competition_bets enable row level security;
alter table public.competition_deposits enable row level security;

-- Helper: is auth.uid() lid van deze competitie?
-- security definer omzeilt RLS in de eigen query, anders zou de policy op
-- competition_members zichzelf recursief aanroepen.
create or replace function public.is_competition_member(p_competition_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.competition_members
    where competition_id = p_competition_id and user_id = auth.uid()
  );
$$;

create policy "competitions_select_member" on public.competitions
  for select using (public.is_competition_member(id));

-- Enkel de maker mag de competitie verwijderen (cascadeert naar leden/bets/stortingen).
drop policy if exists "competitions_delete_own" on public.competitions;
create policy "competitions_delete_own" on public.competitions
  for delete using (auth.uid() = created_by);

create policy "competition_members_select" on public.competition_members
  for select using (public.is_competition_member(competition_id));

-- Leden zien alle bets/stortingen van hun competitie (voor het klassement),
-- maar wijzigen enkel hun eigen rijen.
create policy "competition_bets_select" on public.competition_bets
  for select using (public.is_competition_member(competition_id));

create policy "competition_bets_insert_own" on public.competition_bets
  for insert with check (auth.uid() = user_id and public.is_competition_member(competition_id));

create policy "competition_bets_update_own" on public.competition_bets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "competition_bets_delete_own" on public.competition_bets
  for delete using (auth.uid() = user_id);

create policy "competition_deposits_select" on public.competition_deposits
  for select using (public.is_competition_member(competition_id));

create policy "competition_deposits_insert_own" on public.competition_deposits
  for insert with check (auth.uid() = user_id and public.is_competition_member(competition_id));

create policy "competition_deposits_update_own" on public.competition_deposits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "competition_deposits_delete_own" on public.competition_deposits
  for delete using (auth.uid() = user_id);

-- ─── Competitie aanmaken / joinen via code ───────────────
-- De `code`-kolom mag niet via select leesbaar zijn voor niet-leden, dus
-- aanmaken/joinen verloopt via deze security-definer functies (niet via
-- rechtstreekse inserts).

-- Genereert een leesbare 8-tekens code (geen 0/O/1/I, om verwarring te voorkomen).
-- 8 tekens (32^8 ≈ 1,1 biljoen combinaties) maakt brute-force gokken van een
-- andermans code praktisch onhaalbaar.
create or replace function public.generate_competition_code()
returns text
language plpgsql
as $$
declare
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i      int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.create_competition(
  p_name text,
  p_display_name text,
  p_start_kapitaal numeric,
  p_allow_topup boolean,
  p_rules_note text
)
returns table (id uuid, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id       uuid := gen_random_uuid();
  v_code     text;
  v_attempts int := 0;
begin
  loop
    v_code := public.generate_competition_code();
    exit when not exists (select 1 from public.competitions c where c.code = v_code);
    v_attempts := v_attempts + 1;
    if v_attempts > 10 then
      raise exception 'Kon geen unieke code genereren, probeer opnieuw';
    end if;
  end loop;

  insert into public.competitions (id, name, code, created_by, start_kapitaal, allow_topup, rules_note)
  values (v_id, p_name, v_code, auth.uid(), p_start_kapitaal, p_allow_topup, p_rules_note);

  insert into public.competition_members (competition_id, user_id, display_name)
  values (v_id, auth.uid(), p_display_name);

  insert into public.competition_deposits (competition_id, user_id, datum, bedrag, note)
  values (v_id, auth.uid(), current_date, p_start_kapitaal, 'Startkapitaal');

  return query select v_id, v_code;
end;
$$;

create or replace function public.join_competition(
  p_code text,
  p_display_name text
)
returns table (id uuid, name text, start_kapitaal numeric, allow_topup boolean, rules_note text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_competition public.competitions%rowtype;
begin
  select * into v_competition from public.competitions c where c.code = upper(p_code);

  if v_competition.id is null then
    raise exception 'Onbekende code';
  end if;

  if exists (
    select 1 from public.competition_members m
    where m.competition_id = v_competition.id and m.user_id = auth.uid()
  ) then
    raise exception 'Je bent al lid van deze competitie';
  end if;

  insert into public.competition_members (competition_id, user_id, display_name)
  values (v_competition.id, auth.uid(), p_display_name);

  insert into public.competition_deposits (competition_id, user_id, datum, bedrag, note)
  values (v_competition.id, auth.uid(), current_date, v_competition.start_kapitaal, 'Startkapitaal');

  return query select v_competition.id, v_competition.name, v_competition.start_kapitaal, v_competition.allow_topup, v_competition.rules_note;
end;
$$;

grant execute on function public.create_competition(text, text, numeric, boolean, text) to authenticated;
grant execute on function public.join_competition(text, text) to authenticated;
