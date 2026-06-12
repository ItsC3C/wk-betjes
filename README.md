# WK 2026 · Betjes

Persoonlijke weddenschap-tracker (React + Vite). Kapitaalbeheer, open/afgeronde bets,
stortingen en potentiële winst.

De app heeft de volgende pagina's:

- **/** — Home: korte uitleg + een overzicht van de WK 2026-matchen van vandaag
  en de komende dagen.
- **/bets** — je eigen bet-tracker (kapitaal, bets, stortingen).
- **/competitions** — competities met vrienden: aanmaken, deelnemen met een
  code en een overzicht van je competities.
- **/competitions/:id** — klassement + je eigen bets/stortingen binnen die
  competitie.
- **/login** — magic-link login.

De app werkt direct in **gast-modus**: data wordt lokaal in de browser bewaard
via `localStorage`. Wil je je data veilig bewaren en synchroniseren tussen
toestellen (telefoon + laptop), maak dan gratis een **Supabase**-account aan en
log in met een magic link (geen wachtwoord) — zie de sectie
[Multi-user met Supabase](#multi-user-met-supabase-optioneel) hieronder.

## Lokaal draaien

```bash
npm install
npm run dev
```

Open de URL die Vite toont (meestal http://localhost:5173).

Zonder extra configuratie draait de app gewoon in gast-modus. De WK-matchen op
de homepagina komen van `/api/matches`; die serverless function draait niet mee
met `npm run dev` (gewone Vite). Zie
[WK-matchdata](#wk-matchdata-football-dataorg-optioneel) hieronder om dat lokaal
te testen met `vercel dev`.

## Productie-build testen

```bash
npm run build
npm run preview
```

## Naar GitHub

```bash
git init
git add .
git commit -m "WK 2026 betjes tracker"
git branch -M main
git remote add origin https://github.com/<jouw-gebruiker>/wk-betjes.git
git push -u origin main
```

## Deployen op Vercel

1. Ga naar vercel.com en log in met je GitHub-account.
2. "Add New… → Project" en kies de repo `wk-betjes`.
3. Vercel herkent Vite automatisch:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Klik **Deploy**. Na ~1 minuut heb je een live URL.

Elke `git push` naar `main` zorgt voortaan voor een automatische nieuwe deploy.

(Cloudflare Pages of Netlify werkt identiek: build command `npm run build`, output `dist`.)

## Op je telefoon als app

Open de Vercel-URL in Safari/Chrome → deel-menu → **Toevoegen aan beginscherm**.
Door de meegeleverde `manifest.webmanifest` opent hij dan schermvullend, als een app.

## Multi-user met Supabase (optioneel)

Met Supabase krijgt elke gebruiker een eigen account (inloggen via een
magic-link e-mail, geen wachtwoord) met zijn eigen kapitaal, bets en
stortingen — afgeschermd van andere gebruikers via Row Level Security (RLS).
Zonder Supabase-configuratie blijft de app gewoon werken in gast-modus.

### 1. Maak een gratis Supabase-project

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account.
2. Klik **New project**, kies een naam, een databasewachtwoord en een regio.
3. Wacht tot het project is aangemaakt (1–2 minuten).

### 2. Haal je API-keys op

1. Ga naar **Project Settings → API**.
2. Kopieer de **Project URL** en de **anon public** key. Die heb je nodig in
   stap 5.

### 3. Plak het SQL-script

1. Ga naar **SQL Editor → New query**.
2. Plak de volledige inhoud van [`supabase/schema.sql`](supabase/schema.sql)
   uit deze repo en klik **Run**.

Dit maakt de tabellen `bets` en `deposits` aan met Row Level Security
ingeschakeld: elke gebruiker kan via policies enkel zijn eigen rijen
zien, toevoegen, wijzigen en verwijderen (`auth.uid() = user_id`).

### 4. Magic link: redirect-URL's instellen

1. Ga naar **Authentication → URL Configuration**.
2. Zet **Site URL** op de URL waar je app draait (bv. je Vercel-URL, of
   `http://localhost:5173` tijdens lokale ontwikkeling).
3. Voeg onder **Redirect URLs** zowel je lokale adres
   (`http://localhost:5173`) als je productie-URL toe. Zo komt de magic link
   altijd terug naar de juiste omgeving.

E-mail/magic-link staat standaard aan bij de ingebouwde e-mail-provider van
Supabase — verder geen actie nodig.

### 5. Env-variabelen lokaal instellen

Kopieer `.env.example` naar `.env` en vul de waarden uit stap 2 in:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

Herstart de dev-server (`npm run dev`). In de app-bar verschijnt nu een
**Inloggen**-knop.

### 6. Dezelfde env-variabelen op Vercel zetten

1. Open je project op vercel.com → **Settings → Environment Variables**.
2. Voeg beide variabelen toe met dezelfde waarden als in je `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Vink **Production**, **Preview** én **Development** aan.
3. Redeploy het project (Deployments → ⋯ → Redeploy, of doe een nieuwe
   `git push`) zodat de variabelen in de build terechtkomen.

Vergeet niet je Vercel-URL ook toe te voegen aan **Redirect URLs** in Supabase
(stap 4) — anders werkt de magic link niet in productie.

## Competities met vrienden

Naast je persoonlijke tracker (`/bets`) kun je een **competitie** starten met
vrienden: iedereen speelt met hetzelfde startkapitaal, plaatst zijn eigen bets
en stortingen binnen die competitie, en een **klassement** toont wie er voor
staat (op basis van huidig kapitaal).

Dit vereist een **Supabase-account** (zie
[Multi-user met Supabase](#multi-user-met-supabase-optioneel) hierboven) —
gast-data is lokaal per toestel en kan niet gedeeld worden. Zonder account of
Supabase-configuratie toont `/competitions` een korte uitleg met een link naar
`/login`.

### Heb je Supabase al ingesteld?

Het `supabase/schema.sql`-script is aangevuld met de tabellen en functies voor
competities. **Plak het volledige script opnieuw** in **SQL Editor → New
query** en klik **Run** — bestaande tabellen, data en policies worden niet
aangetast (`create table if not exists` / `create or replace function`).

### Een competitie aanmaken

1. Ga naar **/competitions** → **Nieuwe competitie**.
2. Vul een naam, jouw weergavenaam en het startkapitaal in, kies of leden
   tijdens de competitie mogen **bijstorten**, en vul eventueel **regels** in
   (vrije tekst, bv. "enkel WK-matchen" — dit is een afspraak tussen de leden,
   niet technisch afgedwongen).
3. Je krijgt een **code** van 6 tekens — deel die met je vrienden.

### Deelnemen met een code

1. Ga naar **/competitions** → **Deelnemen met code**.
2. Vul de code en je weergavenaam in. Je start met hetzelfde startkapitaal als
   de andere leden en verschijnt meteen in het klassement.

## WK-matchdata (football-data.org, optioneel)

De homepagina toont de WK 2026-matchen van vandaag en de komende dagen, en in
het bet-formulier kun je een match kiezen die de wedstrijd, datum en tijd
automatisch invult. Deze data komt van [football-data.org](https://www.football-data.org/)
via de serverless function [`api/matches.js`](api/matches.js). Zonder token
toont de homepagina gewoon een melding dat de matchdata niet beschikbaar is —
de rest van de app blijft normaal werken.

### 1. Maak een gratis football-data.org token

1. Ga naar [football-data.org/client/register](https://www.football-data.org/client/register)
   en maak een gratis account aan.
2. Je ontvangt per mail een API-token (gratis tier, 10 calls/minuut, inclusief
   het WK).

### 2. Token lokaal instellen

Voeg in je `.env` (zie `.env.example`) toe:

```
FOOTBALL_DATA_TOKEN=jouw-token
```

**Belangrijk:** dit is een server-side secret, dus zonder `VITE_`-prefix. Hij
wordt nooit naar de browser gestuurd.

### 3. Lokaal testen met `vercel dev`

`npm run dev` (Vite) draait alleen de frontend — serverless functions in `/api`
worden dan niet uitgevoerd en `/api/matches` geeft een 404. Om dit lokaal te
testen:

```bash
npm install -g vercel   # eenmalig
vercel dev
```

`vercel dev` leest `.env` automatisch in en draait zowel de Vite-frontend als
`api/matches.js`.

### 4. Token op Vercel zetten

Voeg net als bij Supabase een Environment Variable toe in
**Settings → Environment Variables**:

- `FOOTBALL_DATA_TOKEN` — voor Production, Preview én Development.

Redeploy daarna het project.

## Gast-modus vs. account

- **Niet ingelogd (gast-modus)** — data staat lokaal in `localStorage` van dit
  toestel/deze browser. Werkt zonder Supabase-configuratie en synchroniseert
  niet tussen toestellen.
- **Ingelogd** — data staat in Supabase, gekoppeld aan jouw account en
  afgeschermd van andere gebruikers via RLS. Een gloednieuw account start met
  dezelfde voorbeeld-data (seed) als gast-modus, zodat je meteen ziet hoe het
  werkt.
- Had je al gast-data op dit toestel staan toen je voor het eerst inlogde? Dan
  toont de app een banner met de optie om die lokale data samen te voegen met
  je account.

## Startkapitaal

Het startkapitaal staat als eerste storting op €20. Pas dit aan in de app
(storting verwijderen + nieuwe toevoegen), of pas voor nieuwe gebruikers de
`SEED_DEPOSITS` in `src/App.jsx` aan.
