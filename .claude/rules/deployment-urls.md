# Deployment URLs & Public Origin

<!-- No `paths` frontmatter on purpose: this rule loads every session. The mistake it
     prevents happens in conversation ("let's deploy"), not while reading a file. -->

## NEVER hardcode a `*.vercel.app` URL as the canonical base

**Before the domain exists: leave `NEXT_PUBLIC_SITE_URL` unset and let the build fail loudly. Do not paste the Vercel URL "for now".**

A `*.vercel.app` origin written into the canonical base leaks into `sitemap.xml`, `robots.txt`, `<link rel="canonical">`, OG/Twitter image URLs, and any absolute link built from it. Search engines index the preview host, the real domain later competes with it, and the damage outlives the "temporary" commit. A failed build is a 30-second fix; a wrong indexed origin is not.

This is enforced in code, not just documented. `lib/general/site-url.ts` throws when `NEXT_PUBLIC_SITE_URL` is unset in a production build, and throws again if the value's hostname ends in `.vercel.app`.

### Before the domain is bought

- Leave `NEXT_PUBLIC_SITE_URL` **unset**, in `.env.local`, in `.env.template`, and in the Vercel project.
- `pnpm dev` still works (it falls back to `http://localhost:3000`). `pnpm build` fails with an explicit message. That is the design, not a bug to work around.
- Do not "unblock" the build by inventing a value: no `*.vercel.app`, no `http://localhost:3000` committed as production, no `||` fallback added back into `site-url.ts`, `robots.ts`, `sitemap.ts`, or `metadataBase`.

### After the domain is bought

1. Set `NEXT_PUBLIC_SITE_URL` in the Vercel project env vars (Production, plus Preview/Development if those need absolute URLs) to the **exact public origin**: scheme + host, no trailing slash, no path. Match the redirect target, so `https://example.com` rather than `https://www.example.com` if www redirects to apex.
2. Uncomment and set the same value in `.env.template`, so the next clone starts correct.
3. Redeploy. Env var changes do not apply to an existing deployment.
4. Add the production callback URL to Google OAuth (`https://your-domain.com/api/auth/callback/google`) and set `NEXTAUTH_URL` to the same origin.

### Reading the origin in code

- Always `import { SITE_URL } from "@/lib/general/site-url"`. Never read `process.env.NEXT_PUBLIC_SITE_URL` at a call site, and never re-derive an origin from `VERCEL_URL`, `headers().get("host")`, or a hardcoded string.
- `SITE_URL` is already normalized (origin only, no trailing slash), so build paths as `${SITE_URL}/${locale}/...`.
- Any new absolute-URL surface (feed, OG image route, email template, webhook callback, share link) goes through `SITE_URL`.

### Legacy

`NEXT_PUBLIC_BASE_URL` was the old name and had a silent `|| "http://localhost:3000"` fallback, which is exactly the failure this rule prevents. It is gone. Do not reintroduce it under either name.
