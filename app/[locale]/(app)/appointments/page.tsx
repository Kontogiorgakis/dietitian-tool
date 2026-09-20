import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/metro/page-header";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { addDays, fromDateKey, isSameDay, startOfWeek, toDateKey } from "@/lib/metro/dates";
import { formatDayMonth, formatTime } from "@/lib/metro/format";
import { listAppointments } from "@/lib/metro/queries";
import { cn } from "@/lib/utils";
import { BasePageProps } from "@/types/page-props";

interface AppointmentsPageProps extends BasePageProps {
  searchParams: Promise<{ week?: string }>;
}

const WEEKDAYS_EL = ["Δευ", "Τρί", "Τετ", "Πέμ", "Παρ", "Σάβ", "Κυρ"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Ραντεβού: one week at a time, seven columns at 1024 and above, a day list on the phone.
const AppointmentsPage = async ({ params, searchParams }: AppointmentsPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const { week } = await searchParams;
  const today = new Date();
  const weekStart = startOfWeek(fromDateKey(week) ?? today);
  const weekEnd = addDays(weekStart, 7);
  const [t, appointments] = await Promise.all([getTranslations("Appointments"), listAppointments(weekStart, weekEnd)]);
  const weekdays = locale === "el" ? WEEKDAYS_EL : WEEKDAYS_EN;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const newHref = (day: Date) => `/appointments/new?date=${toDateKey(day)}`;

  const AppointmentCard = ({ a }: { a: (typeof appointments)[number] }) => (
    <Link href={`/appointments/${a.id}`} className="flex min-h-tap flex-col justify-center gap-0.5 rounded-md border border-hairline border-l-[3px] border-l-accent bg-surface-raised px-3 py-2 text-ink transition-colors duration-300 hover:bg-accent-soft">
      <span className="flex items-baseline gap-2">
        <span className="text-num-s">{formatTime(a.startsAt)}</span>
        <span className="text-caption whitespace-nowrap text-ink-soft">{t("minutesShort", { count: a.durationMin })}</span>
      </span>
      <span className="truncate text-body font-semibold">{a.clientName}</span>
      {a.note && <span className="truncate text-caption text-ink-muted">{a.note}</span>}
    </Link>
  );

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader title={t("title")} meta={t("weekOf", { from: formatDayMonth(weekStart), to: formatDayMonth(addDays(weekStart, 6)) })}>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          <Button asChild variant="secondary" size="icon" aria-label={t("previousWeek")}>
            <Link href={`/appointments?week=${toDateKey(addDays(weekStart, -7))}`}>
              <ChevronLeft strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/appointments">{t("today")}</Link>
          </Button>
          <Button asChild variant="secondary" size="icon" aria-label={t("nextWeek")}>
            <Link href={`/appointments?week=${toDateKey(addDays(weekStart, 7))}`}>
              <ChevronRight strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild className="ml-auto hidden lg:inline-flex">
            <Link href={newHref(today)}>
              <Plus strokeWidth={1.6} aria-hidden="true" />
              {t("newAppointment")}
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Phone: the week as a list of days. */}
      <main className="flex flex-1 flex-col px-gutter pb-24 lg:hidden">
        {days.map((day) => {
          const list = appointments.filter((a) => isSameDay(a.startsAt, day));
          const isToday = isSameDay(day, today);
          return (
            <section key={day.toISOString()} className="flex flex-col gap-2 border-b border-hairline py-3">
              <div className="flex items-baseline justify-between">
                <h2 className={cn("text-label", isToday ? "text-accent" : "text-ink-muted")}>
                  {weekdays[(day.getDay() + 6) % 7]} {formatDayMonth(day)}
                </h2>
                <Link href={newHref(day)} className="text-caption text-accent">
                  + {t("newAppointment")}
                </Link>
              </div>
              {list.length === 0 ? <p className="text-caption text-ink-soft">{t("emptyDay")}</p> : list.map((a) => <AppointmentCard key={a.id} a={a} />)}
            </section>
          );
        })}
      </main>

      {/* 1024 and above: seven columns. */}
      <main className="hidden flex-1 px-10 pb-10 lg:block">
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const list = appointments.filter((a) => isSameDay(a.startsAt, day));
            const isToday = isSameDay(day, today);
            return (
              <section key={day.toISOString()} className={cn("flex min-h-[420px] flex-col gap-2 rounded-lg border p-2", isToday ? "border-accent bg-accent-soft" : "border-hairline bg-surface-raised/60")}>
                <div className="flex items-baseline justify-between px-1">
                  <h2 className={cn("text-label", isToday ? "text-accent" : "text-ink-muted")}>{weekdays[(day.getDay() + 6) % 7]}</h2>
                  <span className="text-num-s text-ink-muted">{day.getDate()}</span>
                </div>
                {list.map((a) => (
                  <AppointmentCard key={a.id} a={a} />
                ))}
                <Link href={newHref(day)} className="mt-auto flex min-h-10 items-center justify-center rounded-md text-caption text-ink-soft transition-colors duration-300 hover:bg-surface-field hover:text-accent" aria-label={`${t("newAppointment")}, ${formatDayMonth(day)}`}>
                  <Plus className="size-4" strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </section>
            );
          })}
        </div>
        {appointments.length === 0 && <p className="pt-6 text-body text-ink-muted">{t("emptyWeek")}</p>}
      </main>

      <Button asChild variant="fab" className="fixed right-gutter bottom-[calc(64px+16px)] z-30 pr-[22px] pl-[18px] lg:hidden">
        <Link href={newHref(today)}>
          <Plus strokeWidth={1.6} aria-hidden="true" />
          {t("newAppointment")}
        </Link>
      </Button>
    </div>
  );
};

export default AppointmentsPage;
