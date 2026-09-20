import * as React from "react"

import { cn } from "@/lib/utils"

// Μέτρο field: field-height tall, surface-field ground, border-field border, radius-md.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-ink-soft selection:bg-accent-soft selection:text-ink h-field w-full min-w-0 rounded-md border border-border-field bg-surface-field px-3.5 text-body text-ink transition-colors duration-300 outline-none focus-visible:border-focus focus-visible:bg-surface-raised disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
