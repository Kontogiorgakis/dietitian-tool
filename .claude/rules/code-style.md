---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Code Style

- **Arrow functions for client-side code:** callbacks, hooks, utilities, event handlers. Server components and exported async functions may use `function` declarations, since `export async function` reads better.
- **Object parameter for 3+ arguments.** Functions with more than two parameters take a single object.
- **Static objects outside components.** Define constants and config objects outside the component body, so they aren't recreated on every render.
- **`@/` path alias** for all imports, and `cn()` from `@/lib/general/utils.ts` for merging Tailwind classes.
- **If/else formatting is symmetric.** Both branches single-line without braces, or both with braces. Never mixed.

  ```typescript
  // GOOD
  if (condition) doSomething();
  else doSomethingElse();

  // GOOD
  if (condition) {
    doSomething();
    doMore();
  } else {
    doSomethingElse();
  }

  // BAD
  if (condition) doSomething();
  else {
    doSomethingElse();
    doMore();
  }
  ```
