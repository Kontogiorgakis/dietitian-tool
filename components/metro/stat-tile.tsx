import type { LucideIcon } from "lucide-react";

import { type Tone, TONE_CLASSES } from "@/lib/metro/tones";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  /** Already formatted with a comma; null shows "—" in ink-soft, never 0. */
  value: string | null;
  unit?: string;
  /** One caption under the number: the change since the previous visit, a hint. */
  sub?: string;
  /** Tint of the icon and, lightly, the ground. Neutral keeps the raised surface. */
  tone?: Tone;
  /** The change tile: full sage when the change moves toward the goal. */
  towardGoal?: boolean;
}

export const StatTile = ({ icon: Icon, label, value, unit, sub, tone = "neutral", towardGoal = false }: StatTileProps) => (
  <div
    className={cn(
      "flex flex-col gap-[7px] rounded-lg border px-4 pt-3.5 pb-4",
      towardGoal ? "border-transparent bg-accent-soft" : cn("border-hairline", tone === "neutral" ? "bg-surface-raised" : TONE_CLASSES[tone].ground)
    )}
  >
    <span className="flex items-center gap-1.5 text-label text-ink-muted">
      <Icon className={cn("size-4", towardGoal ? "text-accent" : TONE_CLASSES[tone].ink)} strokeWidth={1.6} aria-hidden="true" />
      {label}
    </span>
    <div className="flex items-baseline gap-1">
      {value === null ? (
        <span className="text-num-l text-ink-soft">—</span>
      ) : (
        <>
          <span className={cn("text-num-l", towardGoal ? "text-accent" : "text-ink")}>{value}</span>
          {unit && <span className="text-num-s text-ink-soft">{unit}</span>}
        </>
      )}
    </div>
    {sub && <span className="text-caption text-ink-muted">{sub}</span>}
  </div>
);
