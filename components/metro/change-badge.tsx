import { useTranslations } from "next-intl";

import { formatChange } from "@/lib/metro/format";
import { cn } from "@/lib/utils";

interface ChangeBadgeProps {
  /** Total change since the first measurement, null with fewer than two visits. */
  changeKg: number | null;
  towardGoal: boolean;
  className?: string;
}

/*
 * Never red, never an arrow. Accent when the change moves toward the client's
 * goal, neutral chip otherwise. One measurement gets the chip "πρώτη επίσκεψη".
 */
export const ChangeBadge = ({ changeKg, towardGoal, className }: ChangeBadgeProps) => {
  const t = useTranslations("Clients");

  if (changeKg === null) return <Chip className={className}>{t("firstVisit")}</Chip>;

  return (
    <span
      className={cn(
        "rounded-sm px-2.5 py-1.5 text-num-s whitespace-nowrap",
        towardGoal ? "bg-accent-soft text-accent" : "bg-chip text-ink-muted",
        className
      )}
    >
      {formatChange(changeKg)} kg
    </span>
  );
};

export const Chip = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("rounded-sm bg-chip px-2.5 py-1.5 text-caption whitespace-nowrap text-ink-muted", className)}>{children}</span>
);
