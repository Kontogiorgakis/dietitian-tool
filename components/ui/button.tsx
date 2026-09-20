import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { Slot } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

// Three buttons, one accent: primary (default), secondary, quiet. No destructive variant:
// the system has no red, and a delete confirmation is a word plus a quiet button.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-body font-semibold whitespace-nowrap transition-colors duration-300 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-accent-strong text-on-accent hover:bg-accent",
        secondary:
          "border border-border-field bg-surface-raised text-ink hover:bg-surface-field",
        quiet: "text-accent hover:text-accent-strong",
        fab: "rounded-full bg-accent-strong text-on-accent shadow-fab hover:bg-accent",
      },
      size: {
        default: "h-tap px-5",
        sm: "h-10 px-4",
        icon: "size-tap",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  icon,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    icon?: React.ReactNode
  }) {
  const Comp = asChild ? Slot.Root : "button"

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {!loading && icon}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
