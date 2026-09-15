# Task: Make website ΙΚΕ-legal (Company Info page + footer)

Repo-specific prompt for `next-auth-intl-prisma-template`
(Next.js 16 App Router · next-intl `[locale]` · shadcn/ui · pnpm).

Drop this in `/prompts` (or `/tasks`) and paste into Claude Code.
Fill the values block, then run.

Legal basis: Ν. 4072/2012 Άρθρο 47 §1–§2 & 98 §2 · ΚΥΑ 46982/2025 (fines active 2/2/2026).

---

## PROMPT

Add ΙΚΕ (Greek Private Company) legal-transparency compliance to this site, following the repo's existing conventions.

### 1. New route — Company Info

Create `app/[locale]/company-info/page.tsx` (server component). Render **all** legally required fields below, grouped in `Card`s from `components/ui/`. Match the current design system (shadcn/ui + Tailwind + dark/light theme). Fully responsive.

**Required fields (Άρθρο 47 §1 + §2 + 98 §2):**

- Company name (επωνυμία) + distinctive title
- Legal form: "Ιδιωτική Κεφαλαιουχική Εταιρεία (Ι.Κ.Ε.)" — or "Μονοπρόσωπη Ι.Κ.Ε." if single-member
- ΓΕΜΗ number
- Registered seat & full address
- Share capital (εταιρικό κεφάλαιο)
- Total guarantee contributions (εγγυητικές εισφορές, αρ. 79) — if any
- "Under liquidation" indicator — only when applicable
- Partners: full names **and** addresses
- Contribution category per partner (capital / non-capital / guarantee)
- Manager(s) (διαχειριστής)
- VAT (ΑΦΜ) / tax office (ΔΟΥ)
- Activity codes (ΚΑΔ) — primary + secondary
- Financial statements / balance sheet (link or section)
- "Last updated" date

Render partners in a `Table` (`components/ui/table`). Financial statements as a list of links.

### 2. i18n — all locales

- Add a `companyInfo` namespace to **`messages/en.json`, `messages/el.json`, `messages/es.json`** with keys for every label above. Field **labels** are translated; the **legal values** (name, ΓΕΜΗ, ΑΦΜ, addresses, capital) stay identical across locales.
- Use `getTranslations` (server) in the page. No hardcoded strings.

### 3. Footer — minimal only

Update the site footer (locate the existing footer component under `components/`) to show, on **every** page:

- Company name + "Ι.Κ.Ε."
- ΓΕΜΗ number
- A link → Company Info, label key `companyInfo.footerLink` ("Εταιρικά Στοιχεία (ΓΕΜΗ)")

Use the next-intl locale-aware `Link` (from `lib/i18n` navigation), so it resolves to `/{locale}/company-info`. **Do not** dump all legal fields in the footer — minimal only; everything detailed lives on Company Info.

### 4. Config values

Store the company data in a single typed config (e.g. `lib/company-info.ts`) exporting a `companyInfo` object, so the page + footer read from one source. Type it (`types/`).

```ts
export const companyInfo = {
  name:            "{{COMPANY_NAME}}",
  brand:           "{{BRAND}}",
  singleMember:    {{true|false}},
  gemi:            "{{GEMH_NUMBER}}",
  vat:             "{{VAT}}",
  taxOffice:       "{{TAX_OFFICE}}",
  address:         "{{FULL_ADDRESS}}",
  capital:         "{{CAPITAL}}",          // e.g. "1.000 €"
  guaranteeContributions: "{{AMOUNT|—}}",
  kad:             ["{{KAD_PRIMARY}}", "{{KAD_SECONDARY}}"],
  underLiquidation: false,
  managers:        ["{{MANAGER_NAME}}"],
  partners: [
    { name: "{{PARTNER_1}}", address: "{{ADDR}}", contribution: "{{capital|non-capital|guarantee}}" },
  ],
  financials: [
    { label: "Ισολογισμός {{YEAR}}", href: "{{PDF_URL}}" },
  ],
  lastUpdated:     "{{YYYY-MM-DD}}",
} as const;
```

---

## Definition of Done

- [ ] `app/[locale]/company-info/page.tsx` exists, renders all required fields, uses shadcn/ui `Card` + `Table`
- [ ] Page is a server component using `getTranslations`; **zero** hardcoded UI strings
- [ ] `companyInfo` namespace added to `en.json`, `el.json`, `es.json` (labels translated, values identical)
- [ ] Company data lives in one typed source (`lib/company-info.ts`), read by both page and footer
- [ ] Footer shows only: name + "Ι.Κ.Ε." + ΓΕΜΗ + locale-aware link to Company Info
- [ ] Footer link works across all 3 locales → `/{locale}/company-info`
- [ ] "Μονοπρόσωπη Ι.Κ.Ε." shown automatically when `singleMember: true`
- [ ] Responsive on mobile + desktop; respects dark/light theme
- [ ] `pnpm lint` and `pnpm tsc --noEmit` pass
- [ ] `pnpm build` succeeds

---

## Post-build (manual, outside code)

- Declare the site URL at **services.businessportal.gr** → "ΙΚΕ – Αυτοματοποιημένη Καταχώριση Ιστοσελίδα" (ΑΤΕΛΩΣ / free). **The site is NOT compliant until the URL is registered in ΓΕΜΗ.**
- Keep `companyInfo` in sync with ΓΕΜΗ + partners' book on any change (partner / manager / seat / capital).
- Manager is personally liable (Άρθρο 47 §2). Fines active since 2/2/2026, up to €100.000 depending on breach/size (far lower for a small ΙΚΕ), −50% if settled within 30 days.