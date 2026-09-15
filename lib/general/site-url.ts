/**
 * The site's canonical public origin, without a trailing slash.
 *
 * NEVER hardcode a `*.vercel.app` URL as the canonical base: not here, not in
 * `NEXT_PUBLIC_SITE_URL`, not "just for now". Before the real domain exists,
 * leave `NEXT_PUBLIC_SITE_URL` unset: the production build then fails loudly
 * instead of silently shipping a wrong canonical origin into sitemap.xml,
 * robots.txt, OG tags and canonical links.
 *
 * Dev (`pnpm dev`) falls back to http://localhost:3000 so local work is unblocked.
 *
 * See `.claude/rules/deployment-urls.md`.
 */

const DEV_SITE_URL = "http://localhost:3000";

const UNSET_MESSAGE = [
  "NEXT_PUBLIC_SITE_URL is not set.",
  "Set it to the site's exact public origin (e.g. https://example.com) in the Vercel",
  "project env vars and in .env.local, then redeploy.",
  "Do NOT paste the *.vercel.app deployment URL, because a wrong canonical origin",
  "leaks into sitemap.xml, robots.txt, canonical links and OG tags.",
].join(" ");

const resolveSiteUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") throw new Error(UNSET_MESSAGE);
    return DEV_SITE_URL;
  }

  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is not a valid absolute URL: "${raw}". Expected an origin like https://example.com`,
    );
  }

  if (parsed.hostname.endsWith(".vercel.app"))
    throw new Error(
      `NEXT_PUBLIC_SITE_URL points at a Vercel deployment URL (${parsed.hostname}). Use the real domain, or leave the variable unset until it exists.`,
    );

  return parsed.origin;
};

export const SITE_URL = resolveSiteUrl();
