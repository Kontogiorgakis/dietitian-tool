---
paths:
  - "components/**"
  - "app/**/*.tsx"
  - "app/**/*.css"
---

# UI & Design Rules

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

- CSS variables live in `app/[locale]/globals.css` (including brand colors like `--forest`, `--leaf`, `--cream`). Dark mode via `next-themes`, class strategy, `@custom-variant dark (&:is(.dark *))`.
- **Semantic tokens only:** `text-foreground`, `bg-background`. Never raw color values. New brand colors become CSS variables with semantic names, referenced as `bg-forest` or `text-leaf`.
- **Tailwind 4 canonical class names:** `z-100` not `z-[100]`, `bg-linear-to-t` not `bg-gradient-to-t`.
- **Transitions use `transition-all duration-300` or `transition-colors`** on interactive elements, so nothing changes state abruptly. Animate `transform` and `opacity` only, never width/height/top/left.
- **Never toggle a CSS property on/off under `transition-all`.** Toggling `border-b` flickers because the property appears and disappears. Keep it present and toggle the VALUE: `border-transparent` to `border-border`.

## Mobile

- Mobile menus are **slide-in panels** (full height, from the right, backdrop blur, body scroll lock, close button), never cramped dropdowns.
- Icon-only buttons when space is tight: `hidden sm:inline` on the text span, icon always visible.

## Radix scrollbar and layout-shift fix

Radix dialogs and sheets inject scroll-locking styles that make the scrollbar disappear and the page jump. **This is already fixed in `globals.css`:** `overflow-y: scroll !important` on `html`, plus zeroed compensating margins and padding on `body[data-scroll-locked]`. If you add a CSS file or reset globals, preserve it.
