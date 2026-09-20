import { Asterisk, type LucideIcon, Pill, ShieldAlert, Stethoscope, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

interface AlertBlockProps {
  allergies: string | null;
  intolerances: string | null;
  medication: string | null;
  conditions: string | null;
  className?: string;
}

/*
 * The Προσοχή block: always visible, never behind a tab. The order is fixed so her
 * eye learns it, and an empty category shows "—" rather than disappearing. This is
 * the only place warn appears.
 */
export const AlertBlock = ({ allergies, intolerances, medication, conditions, className }: AlertBlockProps) => {
  const t = useTranslations("ClientDetail.attention");
  const rows: Array<[string, string | null, LucideIcon]> = [
    [t("allergies"), allergies, ShieldAlert],
    [t("intolerances"), intolerances, Wheat],
    [t("medication"), medication, Pill],
    [t("conditions"), conditions, Stethoscope],
  ];

  return (
    <section className={cn("flex flex-col gap-2.5 rounded-lg bg-warn-soft p-4", className)}>
      <h3 className="flex items-center gap-2 text-title-m text-warn">
        <Asterisk className="size-5" strokeWidth={1.6} aria-hidden="true" />
        {t("title")}
      </h3>
      <dl className="flex flex-col">
        {rows.map(([label, value, Icon], i) => (
          <div key={label} className={cn("flex gap-3 py-[7px]", i > 0 && "border-t border-warn/15")}>
            <dt className="flex w-[104px] shrink-0 items-center gap-1.5 self-start pt-0.5 text-label text-ink-muted">
              <Icon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {label}
            </dt>
            <dd className={cn("text-body", value ? "text-ink" : "text-ink-soft")}>{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
