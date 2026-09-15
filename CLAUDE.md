# CLAUDE.md

Guidance for Claude Code when working in this repository. Detailed rules live in `.claude/rules/` and load automatically when you work on matching files. `.claude/rules/corrections.md` and `.claude/rules/deployment-urls.md` load every session, and they are binding.

## Commands

```bash
pnpm dev            # Dev server on http://localhost:3000
pnpm build          # Production build (runs prisma generate first)
pnpm start          # Start production server
pnpm lint           # ESLint
pnpm tsc --noEmit   # TypeScript check
npx shadcn@latest add <component>   # Add shadcn/ui components
```

Exact dependency versions: read `package.json`, don't assume.

## Rules index

| Rule | Loads when you touch | Covers |
| --- | --- | --- |
| `corrections.md` | always | Non-negotiables, incident log |
| `deployment-urls.md` | always | Canonical origin, `NEXT_PUBLIC_SITE_URL`, Vercel |
| `code-style.md` | any `.ts`/`.tsx` | Arrow functions, if/else, params, imports |
| `react-nextjs.md` | `app/`, `components/`, `hooks/`, `server_actions/` | Server/client boundary, useEffect, performance, dnd-kit |
| `ui-design.md` | `components/`, `.tsx`, `.css` | shadcn/Lucide, shared primitives, Button, ScrollArea, styling |
| `i18n.md` | `messages/`, `lib/i18n/`, `app/` | next-intl, message keys, locale params |
| `dialog-system.md` | `components/`, `lib/stores/` | Central dialog store |
| `file-uploads.md` | `lib/files/`, `server_actions/`, `app/api/` | Supabase/S3 uploads, sharp/WebP |
| `landing-page.md` | `app/**/page.tsx`, `components/` | Navbar, mobile menu, business constants |

Rule files use `paths:` frontmatter globs. Never write `app/[locale]/**` in one, because glob reads `[locale]` as a character class and the rule then silently never loads. Use `app/**` instead.

## Architecture

### Tech Stack

- **Next.js 16** (App Router, React Server Components), **React 19**, **TypeScript strict**
- **NextAuth 4** (Google OAuth), **next-intl 4** (`en`, `el`, type-safe keys via `global.d.ts`)
- **Tailwind CSS 4** (CSS variables, modern color space) plus **shadcn/ui** (New York style)
- **Prisma 7** into Supabase PostgreSQL, **Zustand** (client state), **sharp** (image compression)

### Project Structure

```
app/[locale]/          # Locale routing: page.tsx = landing, admin/ = admin panel
app/[locale]/globals.css  # All CSS variables and tokens
app/api/auth/[...nextauth]/  # NextAuth routes
app/robots.ts, sitemap.ts    # Absolute URLs, must use SITE_URL
components/            # Custom components (ui/ = shadcn ONLY, auth/, admin/, examples/)
lib/auth/ lib/i18n/ lib/db/ lib/files/ lib/stores/
lib/general/           # utils.ts (cn), constants.ts (business data), site-url.ts (SITE_URL)
messages/              # en.json, el.json
proxy.ts               # i18n middleware (NOT middleware.ts)
types/                 # Shared interfaces
```

## Environment & Auth Setup

Required env vars (`.env.template` documents every one): `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`, `DIRECT_URL`, and `NEXT_PUBLIC_SITE_URL` (**left unset until the real domain exists**, see `.claude/rules/deployment-urls.md`).

Google OAuth: create an OAuth 2.0 Client ID at [Google Cloud Console](https://console.developers.google.com/apis/credentials) with redirect URIs `http://localhost:3000/api/auth/callback/google` (dev) and `https://your-domain.com/api/auth/callback/google` (prod).

## Definition of Done

Work is complete only when all of these hold. Run them, don't assume:

1. `pnpm tsc --noEmit` and `pnpm lint` show zero new errors, with output never filtered.
2. The change was **driven, not just compiled**. UI: screenshot the running app and inspect it. Server or DB: hit the real route and read the data back.
3. New or renamed i18n keys exist in BOTH `messages/en.json` and `messages/el.json`, and the dev server was restarted.
4. Schema changes: migration run, `prisma generate` verified, dev server restarted.
5. The abstracted lesson from any correction was written into `.claude/rules/`.

## Workflow

- **Plan first.** Enter plan mode for anything non-trivial (3+ steps or an architectural decision). Write the plan to `tasks/todo.md` with checkable items, confirm it, then track progress there and add a review section at the end. If something goes sideways, stop and re-plan instead of pushing.
- **Use subagents** for research, exploration and parallel analysis to keep the main context clean, one task per subagent.
- **Self-improvement loop.** After ANY correction from the user, update `.claude/rules/corrections.md` (or the relevant scoped rule) with the pattern that prevents a repeat.
- **Verify before "done".** Never mark a task complete without proving it works. Would a staff engineer approve this?
- **Demand elegance (balanced).** For non-trivial changes, ask whether there is a cleaner way; if a fix feels hacky, redo it properly. Skip this for simple, obvious fixes.
- **Autonomous bug fixing.** Given a bug report, a log, or a failing check: just fix it, with no hand-holding round-trips.

## Core Principles

- **Simplicity first.** Every change as simple as it can be, touching minimal code.
- **No laziness.** Root causes, not temporary patches. Senior-engineer standards.
- **Minimal impact.** Only touch what's necessary, and don't introduce collateral bugs.

## Writing Style

- **Em dashes are never allowed.** Do not use the `—` character, and do not use `--` as a substitute for one.
- This applies everywhere: UI copy, translation files (`messages/en.json`, `messages/el.json`), code comments, JSDoc, variable names, commit messages, PR descriptions, documentation, and chat responses.
- Rewrite with a comma, a colon, parentheses, or two separate sentences instead.

## Screenshot Workflow

Puppeteer is a devDependency with bundled Chromium. Always screenshot from localhost with `pnpm dev` running.

```bash
node screenshot.mjs http://localhost:3000                 # -> screenshots/screenshot-N.png
node screenshot.mjs http://localhost:3000/en/admin admin  # -> screenshot-N-admin.png
```

Screenshots auto-increment and are never overwritten. After capturing, read the PNG with the Read tool and inspect it. When comparing against a reference, be specific about differences: spacing, font sizes, colors (hex), alignment, border-radius, shadows.

**Auto-verification:** after each meaningful UI change (a section, component or layout adjustment), screenshot, inspect, fix, and re-screenshot until correct, then move on. Do NOT batch every change and screenshot once at the end.
