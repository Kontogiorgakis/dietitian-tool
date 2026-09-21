import { Asterisk, Cake, CalendarCheck, ChartLine, ClipboardList, Compass, Footprints, Gauge, Mail, NotebookText, Percent, Phone, Plus, Ruler, Scale, SquarePen, Target, TrendingDown, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Chip } from "@/components/metro/change-badge";
import { ProgressCharts } from "@/components/metro/charts/progress-charts";
import { NavButton } from "@/components/metro/nav-button";
import { BackLink, StickyBar } from "@/components/metro/screen-chrome";
import { SectionCard } from "@/components/metro/section-card";
import { StatTile } from "@/components/metro/stat-tile";
import { StatementList } from "@/components/metro/statement-list";
import { Link } from "@/lib/i18n/navigation";
import { bmi } from "@/lib/metro/calc";
import { ageAt, formatChange, formatDate, formatDayMonth, formatNum, formatTime, fullName } from "@/lib/metro/format";
import { getClient, getNextAppointment } from "@/lib/metro/queries";
import { progressFacts, progressSummary } from "@/lib/metro/summary";
import { cn } from "@/lib/utils";
import { ClientPageProps } from "@/types/page-props";

interface FactProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | null;
}

/** One line of the profile card: icon, label, value; "—" when unknown. Truncated (with the
 *  full value in a tooltip) since an email or a long free-typed activity note has no spaces
 *  to wrap at and would otherwise overflow into the next column of the grid. */
const Fact = ({ icon: Icon, label, value }: FactProps) => (
  <div className="flex items-start gap-2.5 py-1.5">
    <Icon className="mt-1 size-4 shrink-0 text-ink-muted" strokeWidth={1.6} />
    <span className="flex min-w-0 flex-col">
      <span className="text-caption text-ink-muted">{label}</span>
      <span className={cn("truncate text-body", value ? "text-ink" : "text-ink-soft")} title={value ?? undefined}>
        {value ?? "—"}
      </span>
    </span>
  </div>
);

/** Whether a change since the previous visit moves toward the goal, formatted for a tile sub-line. */
const delta = (current: number | null, previous: number | null, decimals = 1): string | null =>
  current === null || previous === null ? null : formatChange(current - previous, decimals);

// Καρτέλα πελάτη: everything about one client, in cards, in the order she needs it.
const ClientDetailPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [t, tCommon, client, nextAppointment] = await Promise.all([getTranslations("ClientDetail"), getTranslations("Common"), getClient(id), getNextAppointment(id)]);
  if (!client) notFound();

  const visits = client.measurements;
  const facts = progressFacts(client, visits);
  const { first, latest, previous, currentWeight, change, towardGoal, latestFat } = facts;
  const previousFat = [...visits].reverse().filter((m) => m.bodyFatPct !== null)[1]?.bodyFatPct ?? null;
  const name = fullName(client);
  const directionLabel = { LOSE: t("lose"), GAIN: t("gain"), MAINTAIN: t("maintain") }[client.goalDirection];
  const summary = progressSummary(t, client, facts);

  const actions = (
    <>
      <NavButton href={`/clients/${client.id}/measure`} icon={<Plus strokeWidth={1.6} aria-hidden="true" />} className="w-full split:w-auto">
        {t("newMeasurement")}
      </NavButton>
      <NavButton href={`/clients/${client.id}/present`} variant="secondary" className="w-full split:w-auto">
        {t("presentation")}
      </NavButton>
    </>
  );

  const th = "pb-2 text-label text-ink-muted font-medium border-b border-hairline text-left";
  const td = "border-b border-hairline py-2.5 align-top";

  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-gutter pt-3.5 pb-2 lg:hidden">
        <BackLink href="/clients" label={tCommon("clients")} />
      </header>

      <div className="flex flex-col gap-3 px-gutter pb-4 lg:px-10 lg:pt-8 lg:pb-6 split:flex-row split:items-end split:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display">{name}</h1>
            {!client.historyCompleted && (
              <Link href={`/clients/${client.id}/history`}>
                <Chip>{t("missingHistory")}</Chip>
              </Link>
            )}
          </div>
          <p className="text-body text-ink-muted">
            {t("meta", { age: ageAt(client.birthDate), height: formatNum(client.heightCm, 0) })}
            {visits.length > 0 && ` · ${t("visits", { count: visits.length })}`}
          </p>
        </div>
        <div className="hidden gap-2 split:flex">{actions}</div>
      </div>

      <main className="grid grid-cols-1 gap-4 px-gutter pb-6 lg:gap-6 lg:px-10 lg:pb-10 split:grid-cols-[minmax(0,1fr)_minmax(440px,50%)]">
        {/* Reading column */}
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <SectionCard
            icon={UserRound}
            title={t("profile")}
            subtitle={t("profileSubtitle")}
            action={
              <Link href={`/clients/${client.id}/edit`} className="flex items-center gap-1 text-body text-accent">
                <SquarePen className="size-4" strokeWidth={1.6} aria-hidden="true" />
                {t("edit")}
              </Link>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-accent-soft px-4 py-3">
                <p className="flex items-center gap-1.5 text-caption text-ink-muted">
                  <Target className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                  {t("goal")}
                </p>
                <p className="text-body font-semibold text-ink break-words">{client.goalText ?? t("noGoal")}</p>
                <p className="text-caption text-ink-muted">
                  {directionLabel}
                  {client.targetWeightKg !== null && ` · ${t("targetWeight", { weight: formatNum(client.targetWeightKg) })}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
                <Fact icon={Phone} label={t("phone")} value={client.phone || null} />
                <Fact icon={Mail} label={t("email")} value={client.email} />
                <Fact icon={Cake} label={t("birthDate")} value={formatDate(client.birthDate)} />
                <Fact icon={Ruler} label={t("height")} value={`${formatNum(client.heightCm, 0)} cm`} />
                <Fact icon={Footprints} label={t("activity")} value={client.activityLevel} />
                <Fact icon={Compass} label={t("clientSince")} value={formatDate(first?.visitedAt ?? client.createdAt)} />
                <Fact icon={CalendarCheck} label={t("nextAppointment")} value={nextAppointment ? `${formatDate(nextAppointment.startsAt)}, ${formatTime(nextAppointment.startsAt)}` : t("noAppointment")} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={ChartLine} tone="teal" title={t("progress")} subtitle={t("progressSubtitle")}>
            <StatementList lines={summary} className="pb-4" />
            <div className="grid grid-cols-2 gap-3 min-[1440px]:grid-cols-4">
              <StatTile icon={Scale} tone="sage" label={t("tiles.currentWeight")} value={currentWeight === null ? null : formatNum(currentWeight)} unit="kg" sub={previous ? t("vsPrevious", { value: delta(latest?.weightKg ?? null, previous.weightKg) ?? "—" }) : undefined} />
              <StatTile icon={TrendingDown} label={t("tiles.sinceStart")} value={change === null ? null : formatChange(change)} unit="kg" towardGoal={towardGoal} sub={first ? t("since", { date: formatDayMonth(first.visitedAt) }) : undefined} />
              <StatTile icon={Percent} tone="teal" label={t("tiles.fat")} value={latestFat === null ? null : formatNum(latestFat)} unit="%" sub={previousFat !== null ? t("vsPrevious", { value: delta(latestFat, previousFat) ?? "—" }) : undefined} />
              <StatTile icon={Gauge} tone="sand" label={t("tiles.bmi")} value={currentWeight === null ? null : formatNum(bmi(currentWeight, client.heightCm))} sub={previous?.weightKg ? t("vsPrevious", { value: delta(currentWeight === null ? null : bmi(currentWeight, client.heightCm), bmi(previous.weightKg, client.heightCm)) ?? "—" }) : undefined} />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
            <SectionCard icon={Asterisk} title={t("attention.title")} subtitle={t("attentionSubtitle")} tone="clay">
              <dl className="flex flex-col">
                {[
                  [t("attention.allergies"), client.allergies],
                  [t("attention.intolerances"), client.intolerances],
                  [t("attention.medication"), client.medication],
                  [t("attention.conditions"), client.conditions],
                ].map(([label, value], i) => (
                  <div key={label} className={cn("flex flex-col py-2", i > 0 && "border-t border-warn/15")}>
                    <dt className="text-caption text-ink-muted">{label}</dt>
                    <dd className={cn("text-body", value ? "text-ink" : "text-ink-soft")}>{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>

            <SectionCard
              icon={NotebookText}
              tone="sand"
              title={t("background")}
              subtitle={t("backgroundSubtitle")}
              action={
                <Link href={`/clients/${client.id}/history`} className="text-body text-accent">
                  {t("edit")}
                </Link>
              }
            >
              <dl className="flex flex-col">
                {[
                  [t("medicalHistory"), client.medicalHistory],
                  [t("dietPreferences"), client.dietPreferences],
                  [t("habits"), client.habits],
                ].map(([label, value], i) => (
                  <div key={label} className={cn("flex flex-col py-2", i > 0 && "border-t border-hairline")}>
                    <dt className="text-caption text-ink-muted">{label}</dt>
                    <dd className={cn("text-body", value ? "text-ink" : "text-ink-soft")}>{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          </div>

          <SectionCard icon={ClipboardList} tone="neutral" title={t("history")} subtitle={visits.length === 0 ? t("noHistory") : t("historySubtitle", { count: visits.length })}>
            {visits.length > 0 && (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>{t("columns.date")}</th>
                    <th className={`${th} text-right`}>{t("columns.weight")}</th>
                    <th className={`${th} text-right`}>{t("columns.fat")}</th>
                    <th className={`${th} text-right`}>{t("columns.waist")}</th>
                    <th className={`${th} hidden pl-4 sm:table-cell`}>{t("columns.note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...visits].reverse().map((m) => (
                    <tr key={m.id} className="group">
                      <td className={cn(td, "text-body font-semibold whitespace-nowrap group-last:border-b-0")}>{formatDayMonth(m.visitedAt)}</td>
                      <td className={cn(td, "text-right text-num-s group-last:border-b-0")}>{formatNum(m.weightKg)}</td>
                      <td className={cn(td, "text-right text-num-s group-last:border-b-0")}>{formatNum(m.bodyFatPct)}</td>
                      <td className={cn(td, "text-right text-num-s group-last:border-b-0")}>{formatNum(m.waistCm)}</td>
                      <td className={cn(td, "hidden max-w-60 pl-4 text-body text-ink-muted break-words sm:table-cell group-last:border-b-0")}>{m.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>

        {/* Chart column */}
        <ProgressCharts
          measurements={visits}
          heightCm={client.heightCm}
          targetWeightKg={client.targetWeightKg}
          compact
          captions
          frame="card"
          expandable
          size="large"
          className="flex min-w-0 flex-col gap-4 lg:gap-6"
        />
      </main>

      <div className="flex-1 split:hidden" />
      <StickyBar className="split:hidden">{actions}</StickyBar>
    </div>
  );
};

export default ClientDetailPage;
