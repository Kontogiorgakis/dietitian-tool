---
paths:
  - "app/**"
  - "components/**"
  - "hooks/**"
  - "server_actions/**"
---

# React & Next.js Patterns

## Server / client boundary

- **Server Components by default.** Use `"use client"` only for event handlers, browser APIs, `useState`/`useEffect`, or animation, and push it as far down the tree as possible.
- **`page.tsx` and `layout.tsx` stay server components.** Never add `"use client"` to them; extract a client child instead.
- **Small components with isolated state.** A component that owns state re-renders only itself, and the Server Component parent ships zero JS for it.
- **Always await `params`** in pages and layouts. It is a `Promise`, not a plain object (Next.js 16).
- **Never put `redirect()` inside try/catch.** It throws internally to trigger navigation, so catching it silently breaks the redirect.

  ```typescript
  // GOOD
  const data = await fetchData();
  if (!data) redirect("/error");

  // BAD, the redirect is swallowed
  try {
    if (!data) redirect("/error");
  } catch (error) {}
  ```

## Component structure

- Order inside a component: **State, then Callbacks, then useEffects, then Return.** No exceptions.
- ALL `useEffect`s sit immediately before the return, after every callback.
- Component-specific interfaces go immediately above the component; shared ones in `types/`.

## useEffect

- **Minimal dependencies:** only what is used AND should trigger a re-run. Never include state the effect itself updates.
- **Prefer derived state.** Compute during render instead of syncing with an effect.
- **Always clean up** subscriptions, timers and listeners, and use the `isMountedRef` pattern for async work.

## Performance

- **Lazy-load heavy client components** with `next/dynamic` and `ssr: false`: modals, charts, editors, below-the-fold widgets. Wrap route segments in `<Suspense>`.
- **Memoize where it matters.** `React.memo` on leaf components with stable props; `useMemo`/`useCallback` for expensive derivations only. Never pass inline objects, arrays or functions to a memoized child.
- **Images via `next/image`** with explicit width/height to prevent CLS. Use `priority` only on the above-the-fold LCP image.
- **Fonts via `next/font`**, third-party scripts via `next/script` (`lazyOnload` for analytics, `afterInteractive` for tag managers). Never a raw `<script>`.
- **`useTransition` and `useDeferredValue`** for non-urgent updates.

## Drag & drop (dnd-kit)

- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`.
- `PointerSensor` with `distance: 8` prevents accidental drags on interactive elements.
- `closestCorners` collision detection for column and grid layouts (Kanban).
- Always render a `DragOverlay` ghost (`shadow-xl rotate-2 opacity-90`).
- `useSortable` for items, `useDroppable` for columns. Move optimistically on drop, revert on API error.

## State transitions

- Allowed transitions live in one `VALID_TRANSITIONS: Record<Status, Status[]>` map, client-side, validated before the API call.
- Forward skips are allowed (for example `PREPARING` straight to `DELIVERING`). Terminal states map to `[]` and their items are not draggable.
- Transitions needing extra input (rejection reason, ETA) open a dialog before confirming.
