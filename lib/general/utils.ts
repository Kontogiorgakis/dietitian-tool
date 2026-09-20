import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The Μέτρο type scale (globals.css). Without this, tailwind-merge reads `text-num-xl`
// as a text color and lets `text-accent` override it.
const FONT_SIZES = ["caption", "label", "body", "title-m", "title-l", "display", "num-s", "num-m", "num-l", "num-xl"]

// The named layout sizes (tap, field, row, gutter, rail), so h-tap and size-8 are seen as the same group.
const SPACING = ["tap", "field", "row", "gutter", "rail"]

const twMerge = extendTailwindMerge({
  extend: {
    theme: { spacing: SPACING },
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
