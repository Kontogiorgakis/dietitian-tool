import type { Measurement } from "@prisma/client";
import { useTranslations } from "next-intl";

import { formatDayMonth, formatNum } from "@/lib/metro/format";
import { cn } from "@/lib/utils";

interface VisitHistoryProps {
  /** Non-draft measurements, oldest first; rendered newest first. */
  measurements: Measurement[];
  latestId?: string;
  className?: string;
}

const Value = ({ value, unit }: { value: number | null; unit: string }) => {
  if (value === null) return <span className="text-num-s text-ink-soft">—</span>;
  return (
    <span className="text-num-s">
      {formatNum(value)} <span className="font-normal text-ink-soft">{unit}</span>
    </span>
  );
};

/** Ιστορικό επισκέψεων: date, weight, fat %, waist and her note per visit, newest first. */
export const VisitHistory = ({ measurements, className }: VisitHistoryProps) => {
  const t = useTranslations("ClientDetail");
  const visits = [...measurements].reverse();

  return (
    <section className={cn("flex flex-col", className)}>
      <h3 className="pb-2 text-title-m">{t("history")}</h3>
      {visits.length === 0 && <p className="border-t border-hairline py-3.5 text-body text-ink-muted">{t("noHistory")}</p>}
      {visits.map((m) => (
        <article key={m.id} className="flex flex-col gap-1.5 border-t border-hairline py-3.5">
          <div className="flex items-baseline justify-between gap-2.5">
            <span className="text-body font-semibold">{formatDayMonth(m.visitedAt)}</span>
            <span className="flex gap-3.5">
              <Value value={m.weightKg} unit="kg" />
              <Value value={m.bodyFatPct} unit="%" />
              <Value value={m.waistCm} unit="cm" />
            </span>
          </div>
          {m.note && <p className="text-body text-ink-muted">{m.note}</p>}
        </article>
      ))}
    </section>
  );
};
