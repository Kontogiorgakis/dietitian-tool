---
paths:
  - "components/**"
  - "lib/stores/**"
---

# Dialog System

All dialogs go through the central Zustand store. Never use a local `useState` boolean for a modal that anything outside the component needs to open.

- Store: `lib/stores/dialog-store.ts` holds global dialog state imperatively.
- Open with `useDialogStore().openDialog(key, data?, onSuccess?)`.
- Register every new dialog in `components/dialog-provider.tsx`.
- Each dialog decides its own visibility with `currentDialog === MY_KEY`.
- **Use individual Zustand selectors**, not full-store destructuring. Destructuring re-renders on every unrelated store change.
- `components/confirm-dialog.tsx` (key `CONFIRM_DIALOG`) is the reusable confirm/delete dialog. Never hand-roll another confirmation modal.
- Radix scroll-lock layout shift is already handled in `globals.css`. See `.claude/rules/ui-design.md`.
