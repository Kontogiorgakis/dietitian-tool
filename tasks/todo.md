# Μέτρο: build the dietitian app from the design system

Design reference: the Μέτρο design system (tokens, component cards) and the
screen-map canvas https://claude.ai/artifact/N41vS6eWsH8werYHZZjHUm.

Decisions (confirmed with Manos, 2026-09-20):

- Design system wins over the "icon in every input" rule for measurement fields. Exception recorded in `.claude/rules/ui-design.md`.
- `el` is the default locale, `en.json` keeps English translations of every key.
- No auth for now: the home route is Πελάτες with no sign-in gate. NextAuth wiring stays but nothing is protected.
- Landing page, admin panel and todo examples are replaced by the app.

## Plan

### 1. Foundation
- [x] `tasks/todo.md`
- [x] Source Sans 3 via `next/font` (greek + latin, 400/500/600), replaces Roboto
- [x] Μέτρο tokens in `globals.css` (light + `[data-theme="dark"]`), Tailwind theme mapping (colors, type scale, radii, shadows, named sizes, breakpoints `lg` 1024 rail and `split` 1200 two columns)
- [x] Global focus ring, `tabular-nums` on numbers, no pure white anywhere
- [x] `next-themes` switched to `attribute="data-theme"`
- [x] shadcn `Button` variants restyled to primary / secondary / quiet, `tap` size
- [x] `components/ui/typography.tsx` mapped to the Μέτρο type scale
- [x] Remove landing page, admin panel, todo examples and their server actions

### 2. Data
- [x] Prisma models `Client` and `Measurement` (Todo removed, User kept)
- [x] Migration + `prisma generate` (needs `DATABASE_URL` / `DIRECT_URL` in `.env.local`)
- [x] Seed: eight clients, Μαρία Παπαδοπούλου with eight visits
- [x] `lib/metro/calc.ts`: BMI, WHtR, Durnin-Womersley skinfold fat %, fat and lean mass, change toward goal
- [x] `lib/metro/format.ts`: comma decimals, `12 Σεπ` dates, age

### 3. Server actions
- [x] `server_actions/clients.ts`: list (sorted by last visit, search by name or phone), get, create (step 1), update history (step 2)
- [x] `server_actions/measurements.ts`: autosave draft (upsert), finalize, previous measurement

### 4. Screens
- [x] Πελάτες: list at <1024, table at ≥1024, search, FAB, `πρώτη επίσκεψη` chip, toward-goal badge
- [x] Καρτέλα πελάτη: header, goal banner, four tiles, three charts, Προσοχή, history, sticky bar; rail ≥1024, two columns ≥1200
- [x] Νέα μέτρηση: six sections (collapsible <1024, all open ≥1024), previous values, live derived values, comma decimal input, autosave stamp, derived panel ≥1024
- [x] Νέος πελάτης: two steps, `Αργότερα` escape on step 2 only, `Λείπει το ιστορικό` chip, step column ≥1024
- [x] Λειτουργία παρουσίασης: fullscreen, num-xl change, three charts, Έξοδος / Esc
- [x] ProgressCharts: zoomed y axis, healthy-BMI band, dashed target, dual-axis composition, date-proportional x, empty state under two measurements

### 5. Verify
- [x] `pnpm tsc --noEmit` and `pnpm lint` clean
- [x] Screenshots of every screen at 390 and 1280, inspected
- [x] Real DB round trip: create client, save measurement, read back on the detail screen
- [x] i18n keys in both `messages/el.json` and `messages/en.json`, dev server restarted

## Review (2026-09-20)

Everything above was driven in the running app against Supabase (session pooler, aws-1-eu-west-1), not just compiled.

- Verified at 375px (browser pane, mobile preset) and 1280px: Πελάτες, Καρτέλα πελάτη, Νέα μέτρηση, Νέος πελάτης (both steps), Λειτουργία παρουσίασης.
- Round trips: typed 72,1 kg and 83,6 cm, saw ΔΜΣ 26,5 and WHtR 0,51 live, the autosave stamp, saved the visit, read it back on the detail (9 visits, −5,9 kg) and in the DB (draft = false, no leftover drafts). Created a client through step 1, skipped step 2 with Αργότερα, saw the chip and the empty charts, then removed the test client.
- Fixes found by screenshots: tailwind-merge dropped the custom type-scale classes (text-num-xl lost to text-accent), fixed in lib/general/utils.ts; end labels of the composition chart collided; x labels collided at 390 in full-size charts; 2,5 tick steps printed as whole numbers; desktop header could not hold the name and two buttons; presentation exit line was not pinned to the bottom.
- Environment notes: Prisma 7 does not load .env by itself, so prisma.config.ts loads it with process.loadEnvFile. DIRECT_URL alone is enough in development (DATABASE_URL optional). The direct Supabase host is IPv6-only and unreachable from this network; the session pooler works.
- Puppeteer's Chrome is not installed on this machine (npx puppeteer browsers install chrome would download it), so screenshots came from the app's browser pane. screenshot.mjs now takes SHOT_WIDTH and SHOT_FULL for when it is.

Refactor (2026-09-20, later): charts moved to shadcn/Recharts (components/ui/chart.tsx, lazy client component, server-computed spec) and Lucide icons added to every field label, section header, tile, chart title and Προσοχή row, per Manos. Verified in the browser pane at the phone preset: three charts mounted with band, target line and dual axes; icons present.

Not done, by decision: auth (nothing is gated), and a delete for clients or measurements (the system has no destructive variant; a word plus a quiet button if ever added).

## Round 2: app navigation (2026-09-20, decided with Manos)

- [x] `Appointment` model + migration
- [x] shadcn `sidebar` and `select` installed, sidebar breakpoint moved to 1024, sidebar tokens mapped to Μέτρο
- [x] `(app)` route group: sidebar + bottom tab bar layout; presentation mode stays outside
- [x] `AppSidebar`: Πελάτες, Επισκέψεις, Ραντεβού, client section (Καρτέλα, Νέα μέτρηση, Στοιχεία, Ιστορικό, Παρουσίαση), Ρυθμίσεις; current client via a Zustand store set by the client layout
- [x] `BottomTabBar` on top-level routes only
- [x] Επισκέψεις page (all visits, search, change vs previous)
- [x] Ραντεβού: week view, new/edit/delete appointment
- [x] Ρυθμίσεις: theme + language
- [x] Στοιχεία: edit client basics
- [x] Messages in el + en, tsc, lint, screenshots at 390 and 1280, DB round trip for an appointment

Round 2 review: verified in the browser pane at 1280 (sidebar with app pages, client section, settings at the bottom; calendar with seven columns; Επισκέψεις table; Ρυθμίσεις) and at the phone preset (tab bar, day list, FAB above the bar). Round trip: created an appointment for Μαρία (11:30, 45′, note), saw it on the calendar, opened it, deleted it through the confirm dialog. Left out on purpose: drag to reschedule, recurring appointments, reminders.

## Round 3: dashboard and Καρτέλα (2026-09-20, decided with Manos)

- [x] `SectionCard` primitive on shadcn Card
- [x] Αρχική dashboard: greeting, today's appointments, week numbers, clients needing attention, recent visits; client list moved to /clients; sidebar and tab bar updated
- [x] Καρτέλα rebuilt: profile card, generated summary, tiles with vs-previous, chart cards with captions, Προσοχή beside Ιστορικό, history table
- [x] Messages el + en, tsc, lint, screenshots at 1280 and phone

Round 3 review: verified at 1280 (dashboard cards, profile card) and at the phone preset (summary text, tiles, Προσοχή, chart cards, waist chart). The "8 new clients this week" on the dashboard is the seed's createdAt, not a bug.

## Round 4: client tree in the sidebar (2026-09-20)

- [x] Sidebar lists every client under Πελάτες with a + for a new client; the open client (from the pathname) expands into Καρτέλα, Νέα μέτρηση, Στοιχεία, Ιστορικό, Παρουσίαση; other clients expand on their chevron
- [x] Store and client layout removed; names come from the (app) layout; client actions revalidate the layout
- [x] Chart expand dialog and bold spans verified after a clean restart (the earlier "not working" was a stale tab against a server that had been restarted)

## Round 5: polish (2026-09-20)

- [x] Nothing under 14px: caption 14, label 15, body 16, title-m 18, num-s 16, num-m 19; chart axes 14; shadcn tooltip/dialog text lifted
- [x] Tints (sage, teal, sand, clay) on card chips, tiles, chart cards, dashboard hero, calendar; initials avatars in every list
- [x] Sidebar client tree: avatars, accordion, chevron at the right edge, bigger rows; ScrollArea shells; collapsed trigger centered
- [x] shadcn CLI trap found: sidebar.tsx and select.tsx imported cn from the stray "cn" package, so overrides never merged; fixed and recorded
- [x] Νέος πελάτης rebuilt: intro text, cards (Ταυτότητα, Επικοινωνία; Στόχος, Ιατρικό, Αλλεργίες, Τρόπος ζωής), required marks and hints, activity as a choice, live preview of the list row
- [x] Private Vercel deploy: no sitemap, robots disallow, noindex, no metadataBase

## Round 6: more charts from the recorded values, three full demo clients (2026-09-21)

Decided with Manos: chart everything the measurement form already records, on the Καρτέλα and in the presentation, and replace the eight thin demo clients with three whose every field is filled.

- [x] Seed rewritten: three clients (Μαρία, LOSE, 8 visits; Γιώργος, GAIN, 6 visits; Ελένη, MAINTAIN, 5 visits), every history field and every measurement field filled at every visit, skinfold sums consistent with the fat % through Durnin and Womersley, a past appointment per visit and upcoming ones across four weeks, createdAt backdated to the first visit. Re-run deleted every previous client, measurement and appointment, including the hand-made ΓΕΩΠΟΝΙΚΟ ΕΡΕΥΝΑΣ.
- [x] Waist chart carries the NICE waist-to-height band (0,4 to 0,5 of height, in cm for the client) and its caption states the ratio and the signed change. No separate ratio chart.
- [x] "Περισσότερες μετρήσεις" card: hip, chest, arm, thigh, water, skinfold sum, blood pressure (both readings on one axis), pulse, each only when measured at two or more visits, each expandable on the Καρτέλα, each with a from-to line in the presentation.
- [x] Renderer: `sharedAxis` on a spec; two-axis charts keep their end labels inside the plot on the side the line leaves free, so they no longer collide with the right axis.
- [x] Presentation grid rebalanced (Manos: three in a row was too tight): weight wide on top, composition and waist side by side, small charts four per row. Καρτέλα unchanged: one column, small charts two per row.
- [x] Composition caption says what fat did and what lean mass did, each with its own direction (it called rising lean mass "falling").
- [x] Generated sentences one per line (Manos): `StatementList` on the dashboard hero, the Καρτέλα progress card and the presentation hero.
- [x] Messages el + en, seed run, dev server restarted, tsc, lint, screenshots at 1280 and 390 of the Καρτέλα, the presentation, the dashboard and the calendar.

Round 6 review: verified in the browser at 1280 (Μαρία's Καρτέλα with all eight small charts, Γιώργος's waist inside the band, the blood pressure expand dialog, the presentation grid, the dashboard's two lines, the calendar week) and at 390 (presentation and Καρτέλα stack, small charts one per row). Two verification traps recorded in corrections.md: puppeteer's clip and fullPage captures catch Recharts mid-measure, and a killed `next dev` can leave `.next` unreadable.
