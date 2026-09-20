/** The four tints a chip, tile or card can take. Sage is the accent; clay stays for Προσοχή. */
export type Tone = "sage" | "teal" | "sand" | "clay" | "neutral";

/** Ground and ink classes per tone, for icon chips and tinted tiles. */
export const TONE_CLASSES: Record<Tone, { chip: string; ground: string; ink: string; border: string }> = {
  sage: { chip: "bg-tint-sage-soft text-tint-sage", ground: "bg-tint-sage-soft", ink: "text-tint-sage", border: "border-tint-sage/30" },
  teal: { chip: "bg-tint-teal-soft text-tint-teal", ground: "bg-tint-teal-soft", ink: "text-tint-teal", border: "border-tint-teal/30" },
  sand: { chip: "bg-tint-sand-soft text-tint-sand", ground: "bg-tint-sand-soft", ink: "text-tint-sand", border: "border-tint-sand/30" },
  clay: { chip: "bg-tint-clay-soft text-tint-clay", ground: "bg-tint-clay-soft", ink: "text-tint-clay", border: "border-tint-clay/30" },
  neutral: { chip: "bg-surface-field text-ink-muted", ground: "bg-surface-raised", ink: "text-ink", border: "border-hairline" },
};
