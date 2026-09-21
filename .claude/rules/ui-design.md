---
paths:
  - "components/**"
  - "app/**/*.tsx"
  - "app/**/*.css"
---

# UI & Design Rules

## Μέτρο design system (binding, decided 2026-09-20)

The app implements the Μέτρο design system (tokens in `app/[locale]/globals.css`, screen map at https://claude.ai/artifact/N41vS6eWsH8werYHZZjHUm). Where its rules and the generic rules below disagree, **the design system wins**:

- **Lucide icons everywhere, at the system's metrics** (decided 2026-09-20, reversing an earlier exception): every field label, section header, stat tile, chart title and Προσοχή row carries one. `strokeWidth={1.6}`, `size-3.5` inline in labels, `size-5` in section headers, `size-6` in screen headers, `currentColor`.
- **Charts are shadcn charts** (`components/ui/chart.tsx`, Recharts): `ChartContainer` + `LineChart`, colors as `var(--series-primary)` / `var(--series-secondary)`, band via `ReferenceArea`, target via dashed `ReferenceLine`, lazy-loaded with `ssr: false` through `metro-line-chart-lazy.tsx`. The server computes a plain `ChartSpec` (`chart-spec.ts`); no hand-drawn SVG charts.
- **Tints (added 2026-09-20 at Manos' request, the system alone read as pale):** `tint-sage`, `tint-teal`, `tint-sand`, `tint-clay` with `-soft` grounds, in `globals.css` and `lib/metro/tones.ts`. Used for card icon chips (`SectionCard tone`), tinted stat tiles (`StatTile tone`), chart cards (weight sage, composition teal, waist sand), the dashboard hero band, and initials avatars (`UserAvatar`) in every list. Clay stays reserved for Προσοχή. Still no red, no gradients.
- **No red anywhere.** There is no destructive Button variant. `warn` (clay) appears only in the Προσοχή block.
- **Dark mode is an attribute:** `<html data-theme="dark">` via next-themes `attribute="data-theme"`, and `@custom-variant dark` targets it. Not the `.dark` class.
- **Button variants are `default` (primary), `secondary`, `quiet`, `fab`.** Sizes `default` (tap-target, 48px), `sm`, `icon`.
- **Type scale classes:** `text-caption`, `text-label`, `text-body`, `text-title-m`, `text-title-l`, `text-display`, and `text-num-s|m|l|xl` for numbers only (tabular figures are applied automatically). Never `uppercase` on Greek text.
- **Breakpoints:** `lg` (1024) shows the client rail, `split` (1200) splits a screen into two content columns. Nothing in between.
- **Copy is Greek, sentence case, no emoji, no exclamation marks, and describes movement, never a verdict.** Decimal comma via `formatNum` in `lib/metro/format.ts`.
- **The starter's landing page, admin panel and todo demo are gone.** The home route is Πελάτες. No auth gate for now (NextAuth wiring stays).
- **Navigation (decided 2026-09-20):** every screen except presentation mode lives in the `(app)` route group, whose layout renders the shadcn `Sidebar` (`components/metro/app-sidebar.tsx`, breakpoint moved to 1024 in `components/ui/sidebar.tsx` and `hooks/use-mobile.ts`) and the `BottomTabBar` (top-level routes only, so it never stacks with a sticky action bar). The sidebar is four nav items (Αρχική, Επισκέψεις, Ραντεβού, Πελάτες), a `SidebarSeparator`, then every client as a collapsible tree (`listClientNames()` from the `(app)` layout); the open client comes from the pathname, no store. There is no group label and no plus in the sidebar (decided 2026-09-21): the new-client action lives on the dashboard hero and the Πελάτες page. Actions that add or rename clients revalidate `"/[locale]"` as a `layout` so the tree refreshes. The sidebar's CSS variables in `globals.css` point at the Μέτρο tokens; never paste the CLI's hsl defaults back.
- **Screens are built from `SectionCard`s (`components/metro/section-card.tsx`, on shadcn Card, no shadow):** icon, title, one subtitle line that explains the section, then the content. Numbers get words: the Καρτέλα writes a summary sentence from the measurements and every stat tile carries a sub-line (`sub`). The home route is Αρχική (`(app)/page.tsx`, data from `lib/metro/dashboard.ts`); the client list is `/clients`.
- **Scrolling goes through shadcn `ScrollArea` everywhere** (decided 2026-09-20): the `(app)` layout constrains `SidebarInset` to `h-svh overflow-hidden` and scrolls the page in `<ScrollArea className="h-0 flex-1" viewportClassName="!overflow-y-scroll">`; the sidebar tree and presentation mode do the same. Sticky bars and the tab-bar spacer live inside the viewport. `components/ui/scroll-area.tsx` takes `viewportClassName` for this.
- **`cn()` knows the named sizes** (`tap`, `field`, `row`, `gutter`, `rail`) as spacing, so `size-8` can override `size-tap`. Add any new named size to `SPACING` in `lib/general/utils.ts`.
- **Row hover has room and rounded corners** (corrected 2026-09-21): a clickable table row's tint reaches 12px past the text at either end with `rounded-md`, never a square tint flush with the text. It comes from `lib/metro/row-hover.ts` (a pseudo-element behind the row, since cells cannot bleed or round), used by the Επισκέψεις and Πελάτες tables.
- **Sentences the app writes go one per line** (corrected 2026-09-21): `StatementList` (`components/metro/statement-list.tsx`) stacks them, the first as the lead and the rest muted. Never join generated sentences into one paragraph (dashboard hero, Καρτέλα progress, presentation hero).
- **Charts:** the three main charts plus `ProgressCharts`' small charts for the rest of the form's values (hip, chest, arm, thigh, water, skinfold sum, blood pressure, pulse), each only when a client has it at two or more visits, so nothing renders empty. The waist chart carries the NICE waist-to-height band the way the weight chart carries the BMI band. The presentation never puts the three main charts in one row (corrected 2026-09-21): weight spans the row on top, then composition and waist, then the small charts four per row (`layout="grid"`).
- **Loaders:** navigation buttons are `NavButton` (`components/metro/nav-button.tsx`, spins until the next page renders); links in lists and the sidebar carry `<LinkPending />` (`useLinkStatus`); every route segment has a `loading.tsx` built from `PageSkeleton` / `CardSkeleton`. Form submits use the Button's own `loading` prop.
- **shadcn CLI overwrites:** `shadcn add` rewrites `button.tsx`, `input.tsx`, injects variables into `globals.css`, and writes `import { cn } from "cn"` (a stray npm package that does not merge classes, so overrides silently lose). Fix the import to `@/lib/utils` in every added file. After any `add`, diff `components/ui/` and `globals.css` and restore the Μέτρο versions (they are in git once committed; until then, from this file's descriptions).

## Component sourcing

- **Always use the frontend-design plugin** for any design or UI task.
- **Always use shadcn/ui components.** If the component exists in the shadcn/ui library, install it (`npx shadcn@latest add <component>`) and use its official API. Never hand-build a Button, Dialog, Select, Input, Table, and so on. Look the API up (web, context7) instead of guessing.
- **`components/ui/` is shadcn/ui ONLY.** Custom components live in `components/`.
- **Always use Lucide icons** (`lucide-react`), the icon set shadcn/ui ships with. Search for the correct icon name rather than guessing.

## Shared primitives: grep `components/` before writing a new one

| Component | Use for |
| --- | --- |
| `CircleIcon` (`components/CircleIcon.tsx`) | Any prominent icon display: feature cards, services, about, highlights. Raw Lucide icons are only for small inline UI (button icons, form labels, nav items). |
| `SocialIcon` (`components/social-icon.tsx`) | ALL social media links (footer, contact, navbar). Platform colors and hover effects included. Never build a custom social button. |
| `ExpandMap` (`components/expand-map.tsx`) | ALL map displays. Props: `address`, `mapsUrl`, `coordinates`. Never embed a raw Google Maps iframe. |
| `EmptyState` | Icon + title + optional description (empty tables, lists). |
| `PageHeader` | Title + optional description + children slot for action buttons. |
| `UserAvatar` | Image with initials fallback, size variants (sm/md/lg). |
| `PaginationControls` | Prev/next with page count, auto-hides when `totalPages <= 1`. |

Extract a new shared component once 3+ duplications exist, into `components/`, not `components/ui/`.

## Button

- Use the shadcn `Button` with **variants and sizes only**. Never add Tailwind classes that duplicate a variant. `className` is for layout (`w-full`, `flex-1`) or conditional state (`isOpen && "border-primary"`).
- Built-in props: `loading={true}` renders a `<Loader2>` spinner and auto-disables; `icon={<Plus />}` renders before children and is hidden while loading; `variant="brand"` uses the `--brand-primary` CSS variable.
- Pattern: `<Button loading={isPending} icon={<Save className="size-4" />}>Save</Button>`

## Forms & interactivity

- **Every input, textarea and select gets a Lucide icon**, at the start of the label or inside the field. Use `inline size-3.5`: `<FormLabel><User className="inline size-3.5" /> {t("name")}</FormLabel>`. For an icon inside the input, absolutely position it at the start and add `pl-9` to the input.
- **`cursor-pointer` on EVERY interactive element:** buttons, dropdowns, selects, links, toggles, switches, cards with `onClick`. If a shadcn component lacks it, add it in the `components/ui/` override.
- **Loading states never use "..." dots.** Use a spinner: `{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : t("save")}`

## Typography

- Admin and app pages: use the components in `@/components/ui/typography.tsx`.
- Landing page sections: raw `<h2>`/`<p>` with Tailwind is fine, since it gives more design flexibility.

## ScrollArea (shadcn), preferred over native overflow

Radix's Viewport uses `display: table` internally, which breaks height calculation in flex containers:

- Add `min-h-0` when the ScrollArea is a flex child (`className="flex-1 min-h-0"`).
- Add `viewportClassName="!overflow-y-scroll"`. The `!important` is required to beat Radix's inline styles.
- The parent flex container needs a **constrained** height (`h-screen`, `h-[80vh]`). `h-auto` plus `max-h-*` will NOT work, because the container grows with content.
- Alternative: `h-0 flex-1` on the ScrollArea. `h-0` gives a definite base, `flex-1` grows it, so the viewport's `height: 100%` resolves.
- Admin shells: constrain to `h-svh max-h-svh overflow-hidden`, then use `<ScrollArea className="h-0 flex-1">` for content.

```tsx
<div className="h-screen flex flex-col">
  <header>...</header>
  <ScrollArea className="flex-1 min-h-0" viewportClassName="!overflow-y-scroll">
    <div className="p-4">{content}</div>
  </ScrollArea>
  <footer>...</footer>
</div>
```

## Styling

- CSS variables live in `app/[locale]/globals.css` (the Μέτρο tokens). Dark mode via `next-themes` with `attribute="data-theme"`, see the Μέτρο section above.
- **Semantic tokens only:** `text-foreground`, `bg-background`. Never raw color values. New brand colors become CSS variables with semantic names, referenced as `bg-forest` or `text-leaf`.
- **Tailwind 4 canonical class names:** `z-100` not `z-[100]`, `bg-linear-to-t` not `bg-gradient-to-t`.
- **Transitions use `transition-all duration-300` or `transition-colors`** on interactive elements, so nothing changes state abruptly. Animate `transform` and `opacity` only, never width/height/top/left.
- **Never toggle a CSS property on/off under `transition-all`.** Toggling `border-b` flickers because the property appears and disappears. Keep it present and toggle the VALUE: `border-transparent` to `border-border`.

## Mobile

- Mobile menus are **slide-in panels** (full height, from the right, backdrop blur, body scroll lock, close button), never cramped dropdowns.
- Icon-only buttons when space is tight: `hidden sm:inline` on the text span, icon always visible.

## Radix scrollbar and layout-shift fix

Radix dialogs and sheets inject scroll-locking styles that make the scrollbar disappear and the page jump. **This is already fixed in `globals.css`:** `overflow-y: scroll !important` on `html`, plus zeroed compensating margins and padding on `body[data-scroll-locked]`. If you add a CSS file or reset globals, preserve it.
