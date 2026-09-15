---
paths:
  - "app/**/page.tsx"
  - "components/**"
  - "lib/general/constants.ts"
---

<!-- Do NOT write `app/[locale]/page.tsx` here: glob treats `[locale]` as a character
     class, so the pattern silently matches nothing. -->

# Landing Page Patterns

- **Business constants live in `lib/general/constants.ts`:** phone, email, address, social URLs, map coordinates, opening hours. One exported object. Never scatter these as magic strings across components.
- **Server/client split** for sections that need i18n plus interactivity. See `.claude/rules/i18n.md`.
- **Navbar:** fixed, transparent over the hero, solid on scroll. Keep the border always present and toggle `border-transparent` to `border-border`. Never toggle `border-b` on and off, because it flickers.
- **Mobile menu:** slide-in panel from the right with backdrop blur and body scroll lock, never a dropdown.
- **Smooth scrolling:** `scroll-behavior: smooth` on `html` in globals.css makes all anchor links (`#services`, `#contact`) glide.
- **Real photos over icons for services and products.** Use actual photos with gradient overlays and text on top, because generic Lucide icons look cheap in these cards.
- **Verify downloaded images visually.** Searching Pexels (or similar) by keyword and downloading by ID frequently returns an unrelated photo. Look at every downloaded image before shipping it, and expect 2 or 3 retry rounds.
