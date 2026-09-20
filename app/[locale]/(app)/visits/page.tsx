import { ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChangeBadge } from "@/components/metro/change-badge";
import { ClientSearch } from "@/components/metro/client-search";
import { PageHeader } from "@/components/metro/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Link } from "@/lib/i18n/navigation";
import { formatDayMonth, formatNum } from "@/lib/metro/format";
import { listVisits } from "@/lib/metro/queries";
import { cn } from "@/lib/utils";
import { BasePageProps } from "@/types/page-props";

interface VisitsPageProps extends BasePageProps {
  searchParams: Promise<{ q?: string }>;
}

const Value = ({ value, unit }: { value: number | null; unit: string }) =>
  value === null ? (
    <span className="text-num-s text-ink-soft">—</span>
  ) : (
    <span className="text-num-s">
      {formatNum(value)} <span className="font-normal text-ink-soft">{unit}</span>
    </span>
  );

// Επισκέψεις: every saved measurement in the practice, newest first.
const VisitsPage = async ({ params, searchParams }: VisitsPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = "" } = await searchParams;
  const [t, visits] = await Promise.all([getTranslations("Visits"), listVisits(q)]);
  const th = "pb-2.5 text-label text-ink-muted font-medium border-b border-hairline";

  const empty = <p className="py-10 text-center text-body text-ink-muted">{q ? t("noResults", { query: q }) : t("empty")}</p>;

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader title={t("title")} meta={t("count", { count: visits.length })}>
        <ClientSearch initialQuery={q} placeholder={t("searchPlaceholder")} label={t("searchLabel")} className="w-full lg:w-[360px]" />
      </PageHeader>

      {/* Phone: one row per visit. */}
      <main className="flex-1 px-gutter pb-6 lg:hidden">
        {visits.length === 0 && empty}
        <ul className="flex flex-col">
          {visits.map((v) => (
            <li key={v.id}>
              <Link href={`/clients/${v.clientId}`} className="flex min-h-row flex-col justify-center gap-1 border-b border-hairline py-3 text-ink">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-body font-semibold">{v.clientName}</span>
                  <span className="text-caption text-ink-muted">{formatDayMonth(v.visitedAt)}</span>
                </span>
                <span className="flex items-center justify-between gap-3">
                  <span className="flex gap-3.5">
                    <Value value={v.weightKg} unit="kg" />
                    <Value value={v.bodyFatPct} unit="%" />
                    <Value value={v.waistCm} unit="cm" />
                  </span>
                  {v.changeKg === null ? <span className="text-caption text-ink-soft">{t("firstVisit")}</span> : <ChangeBadge changeKg={v.changeKg} towardGoal={v.towardGoal} />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      {/* 1024 and above: a table. */}
      <main className="hidden flex-1 px-10 pb-10 lg:block">
        {visits.length === 0 && empty}
        {visits.length > 0 && (
          <table className="w-full max-w-[1000px] border-collapse">
            <thead>
              <tr className="text-left">
                <th className={`${th} pr-3`}>{t("columns.date")}</th>
                <th className={`${th} px-3`}>{t("columns.client")}</th>
                <th className={`${th} px-3 text-right`}>{t("columns.weight")}</th>
                <th className={`${th} px-3 text-right`}>{t("columns.fat")}</th>
                <th className={`${th} px-3 text-right`}>{t("columns.waist")}</th>
                <th className={`${th} px-3 text-right`}>{t("columns.change")}</th>
                <th className={`${th} pl-3`} aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => {
                const td = cn("border-b border-hairline px-3 py-2.5 group-hover:border-transparent");
                return (
                  <tr key={v.id} className="group relative transition-colors duration-300 hover:bg-accent-soft focus-within:bg-accent-soft">
                    <td className={cn(td, "pl-0 text-body font-semibold whitespace-nowrap")}>
                      <Link href={`/clients/${v.clientId}`} className="text-ink after:absolute after:inset-0 after:content-['']">
                        {formatDayMonth(v.visitedAt)}
                      </Link>
                    </td>
                    <td className={cn(td, "max-w-[360px]")}>
                      <span className="flex items-center gap-2.5">
                        <UserAvatar name={v.clientName} size="sm" />
                        <span className="min-w-0">
                          <span className="block text-body">{v.clientName}</span>
                          {v.note && <span className="block truncate text-caption text-ink-muted">{v.note}</span>}
                        </span>
                      </span>
                    </td>
                    <td className={cn(td, "text-right")}><Value value={v.weightKg} unit="kg" /></td>
                    <td className={cn(td, "text-right")}><Value value={v.bodyFatPct} unit="%" /></td>
                    <td className={cn(td, "text-right")}><Value value={v.waistCm} unit="cm" /></td>
                    <td className={cn(td, "text-right")}>
                      {v.changeKg === null ? <span className="text-caption text-ink-soft">{t("firstVisit")}</span> : <ChangeBadge changeKg={v.changeKg} towardGoal={v.towardGoal} />}
                    </td>
                    <td className={cn(td, "w-8 pr-0 text-right text-ink-muted")}>
                      <ChevronRight className="ml-auto size-5" strokeWidth={1.6} aria-hidden="true" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default VisitsPage;
