import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChangeBadge } from "@/components/metro/change-badge";
import { LinkPending } from "@/components/metro/nav-button";
import { UserAvatar } from "@/components/user-avatar";
import { Link } from "@/lib/i18n/navigation";
import { formatDayMonth, formatNum } from "@/lib/metro/format";
import { HOVER_ROW, HOVER_ROW_CELL, HOVER_ROW_LINK, HOVER_ROW_TINT } from "@/lib/metro/row-hover";
import { cn } from "@/lib/utils";
import type { ClientSummary } from "@/types/metro";

interface ClientListProps {
  clients: ClientSummary[];
  query: string;
}

const EmptyList = ({ query }: { query: string }) => {
  const t = useTranslations("Clients");
  if (query) return <p className="py-10 text-center text-body text-ink-muted">{t("noResults", { query })}</p>;
  return (
    <div className="flex flex-col items-center gap-1 py-10 text-center">
      <p className="text-body font-semibold text-ink">{t("emptyTitle")}</p>
      <p className="text-body text-ink-muted">{t("emptyBody")}</p>
    </div>
  );
};

/** The phone list: full name, last visit, one number. Rows are row-height tall so the thumb can land anywhere. */
export const ClientList = ({ clients, query }: ClientListProps) => {
  const t = useTranslations("Clients");
  if (clients.length === 0) return <EmptyList query={query} />;

  return (
    <ul className="flex flex-col">
      {clients.map((c) => (
        <li key={c.id}>
          <Link
            href={`/clients/${c.id}`}
            className="flex min-h-row items-center justify-between gap-3 border-b border-hairline py-3 text-ink transition-colors duration-300 hover:bg-accent-soft/40"
          >
            <UserAvatar name={c.name} size="lg" className="size-11 text-label" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-body font-semibold">{c.name}</span>
              <span className="text-caption text-ink-muted">{c.lastVisit ? t("lastVisit", { date: formatDayMonth(c.lastVisit) }) : t("noVisits")}</span>
            </span>
            <LinkPending />
            <ChangeBadge changeKg={c.changeKg} towardGoal={c.towardGoal} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

/** The 1024+ table: the whole row is the target, hover tints it accent-soft and drops its divider. */
export const ClientTable = ({ clients, query }: ClientListProps) => {
  const t = useTranslations("Clients");
  if (clients.length === 0) return <EmptyList query={query} />;

  const th = "pb-2.5 text-label text-ink-muted font-medium border-b border-hairline";
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-2.5">
      <p className="text-caption text-ink-muted">{t("sortNote")}</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className={`${th} pr-3`}>{t("columns.client")}</th>
            <th className={`${th} px-3`}>{t("columns.lastVisit")}</th>
            <th className={`${th} px-3 text-right`}>{t("columns.visits")}</th>
            <th className={`${th} px-3 text-right`}>{t("columns.change")}</th>
            <th className={`${th} pl-3`} aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className={HOVER_ROW}>
              <td className={cn(HOVER_ROW_CELL, HOVER_ROW_TINT, "pr-3")}>
                <Link href={`/clients/${c.id}`} className={cn("flex min-h-11 items-center gap-3 text-ink", HOVER_ROW_LINK)}>
                  <UserAvatar name={c.name} size="md" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-body font-semibold">{c.name}</span>
                    <span className="text-caption text-ink-muted">{c.currentWeightKg === null ? t("noVisits") : `${formatNum(c.currentWeightKg)} kg`}</span>
                  </span>
                </Link>
              </td>
              <td className={cn(HOVER_ROW_CELL, "px-3 text-body")}>{c.lastVisit ? formatDayMonth(c.lastVisit) : "—"}</td>
              <td className={cn(HOVER_ROW_CELL, "px-3 text-right text-num-s")}>{c.visitCount}</td>
              <td className={cn(HOVER_ROW_CELL, "px-3 text-right")}>
                <ChangeBadge changeKg={c.changeKg} towardGoal={c.towardGoal} />
              </td>
              <td className={cn(HOVER_ROW_CELL, "w-8 pl-3 text-right text-ink-muted")}>
                <ChevronRight className="ml-auto size-5" strokeWidth={1.6} aria-hidden="true" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
