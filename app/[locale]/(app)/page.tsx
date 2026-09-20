import { CalendarDays, ChartLine, ChevronRight, ClipboardList, Clock, Settings, UserRoundSearch } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChangeBadge } from "@/components/metro/change-badge";
import { NavButton } from "@/components/metro/nav-button";
import { SectionCard } from "@/components/metro/section-card";
import { StatTile } from "@/components/metro/stat-tile";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Link } from "@/lib/i18n/navigation";
import { ATTENTION_AFTER_DAYS, getDashboard } from "@/lib/metro/dashboard";
import { toDateKey } from "@/lib/metro/dates";
import { formatDate, formatDayMonth, formatTime } from "@/lib/metro/format";
import { RICH } from "@/lib/metro/rich";
import { BasePageProps } from "@/types/page-props";

const WEEKDAYS_EL = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Αρχική: what the day holds, what the week did, who needs a call.
const HomePage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, data] = await Promise.all([getTranslations("Dashboard"), getTranslations("Nav"), getDashboard()]);
  const { today, todayAppointments, nextAppointment, week, attention, recentVisits } = data;
  const weekday = (locale === "el" ? WEEKDAYS_EL : WEEKDAYS_EN)[today.getDay()];
  const greeting = today.getHours() < 13 ? t("goodMorning") : t("goodAfternoon");

  return (
    <div className="flex min-h-svh flex-col">
      {/* The hero band: sage ground, so the day reads as one block. */}
      <header className="mx-gutter mt-4 flex flex-col gap-1 rounded-xl bg-accent-soft px-5 py-5 lg:mx-10 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:px-7 lg:py-6">
        <div className="flex flex-col gap-1">
          <p className="text-caption text-accent">{t("dateLine", { weekday, date: formatDate(today) })}</p>
          <h1 className="text-display">{greeting}</h1>
          <p className="text-body text-ink">
            {t.rich("todaySummary", { ...RICH, count: todayAppointments.length, time: todayAppointments[0] ? formatTime(todayAppointments[0].startsAt) : "" })}{" "}
            {nextAppointment ? t.rich("nextAppointment", { ...RICH, name: nextAppointment.clientName, date: formatDayMonth(nextAppointment.startsAt), time: formatTime(nextAppointment.startsAt) }) : t("noNextAppointment")}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2 lg:pt-0">
          <Button asChild variant="secondary" size="icon" className="lg:hidden" aria-label={tNav("settings")}>
            <Link href="/settings">
              <Settings strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </Button>
          <NavButton href="/appointments" variant="secondary" icon={<CalendarDays strokeWidth={1.6} aria-hidden="true" />} className="hidden lg:inline-flex">
            {t("openCalendar")}
          </NavButton>
        </div>
      </header>

      <main className="grid flex-1 gap-4 px-gutter pt-4 pb-6 lg:grid-cols-2 lg:gap-6 lg:px-10 lg:pt-6 lg:pb-10">
        <SectionCard
          icon={Clock}
          title={t("today")}
          subtitle={t("todaySubtitle")}
          action={
            <Link href={`/appointments/new?date=${toDateKey(today)}`} className="text-body text-accent">
              + {tNav("appointments")}
            </Link>
          }
        >
          {todayAppointments.length === 0 ? (
            <p className="text-body text-ink-muted">{t("todayEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {todayAppointments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="w-14 shrink-0 text-num-m">{formatTime(a.startsAt)}</span>
                  <UserAvatar name={a.clientName} size="md" />
                  <Link href={`/appointments/${a.id}`} className="flex min-w-0 flex-1 flex-col text-ink">
                    <span className="truncate text-body font-semibold">{a.clientName}</span>
                    {a.note && <span className="truncate text-caption text-ink-muted">{a.note}</span>}
                  </Link>
                  <NavButton href={`/clients/${a.clientId}/measure`} variant="secondary" size="sm">
                    {t("startMeasurement")}
                  </NavButton>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard icon={ChartLine} tone="teal" title={t("week")} subtitle={t("weekSubtitle")}>
          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={ClipboardList} tone="sage" label={t("weekVisits")} value={String(week.visits)} />
            <StatTile icon={ChartLine} label={t("weekToward")} value={String(week.towardGoal)} sub={t("weekTowardHint", { count: week.towardGoal, total: week.visits })} towardGoal={week.towardGoal > 0} />
            <StatTile icon={UserRoundSearch} tone="sand" label={t("weekNew")} value={String(week.newClients)} />
            <StatTile icon={CalendarDays} tone="teal" label={t("weekLeft")} value={String(week.appointmentsLeft)} />
          </div>
        </SectionCard>

        <SectionCard icon={UserRoundSearch} tone="sand" title={t("attention")} subtitle={t("attentionSubtitle", { days: ATTENTION_AFTER_DAYS })}>
          {attention.length === 0 ? (
            <p className="text-body text-ink-muted">{t("attentionEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {attention.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <UserAvatar name={c.name} size="md" />
                  <Link href={`/clients/${c.id}`} className="flex min-w-0 flex-1 flex-col text-ink">
                    <span className="truncate text-body font-semibold">{c.name}</span>
                    <span className="text-caption text-ink-muted">{c.daysSince === null ? t("neverVisited") : t("daysSince", { count: c.daysSince })}</span>
                  </Link>
                  <NavButton href={`/appointments/new?client=${c.id}`} variant="secondary" size="sm">
                    {t("book")}
                  </NavButton>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          tone="teal"
          title={t("recent")}
          subtitle={t("recentSubtitle")}
          action={
            <Link href="/visits" className="flex items-center text-body text-accent">
              {t("allVisits")}
              <ChevronRight className="size-4" strokeWidth={1.6} aria-hidden="true" />
            </Link>
          }
        >
          <ul className="flex flex-col divide-y divide-hairline">
            {recentVisits.map((v) => (
              <li key={v.id} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/clients/${v.clientId}`} className="flex flex-col gap-1 text-ink">
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <UserAvatar name={v.clientName} size="sm" />
                      <span className="truncate text-body font-semibold">{v.clientName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-caption text-ink-muted">{formatDayMonth(v.visitedAt)}</span>
                      {v.changeKg !== null && <ChangeBadge changeKg={v.changeKg} towardGoal={v.towardGoal} />}
                    </span>
                  </span>
                  <span className="text-body text-ink-muted">{v.note ?? t("noNote")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </main>
    </div>
  );
};

export default HomePage;
