import { Percent, Ruler, Scale } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProgressCharts } from "@/components/metro/charts/progress-charts";
import { PresentationShell } from "@/components/metro/presentation-shell";
import { StatTile } from "@/components/metro/stat-tile";
import { Link } from "@/lib/i18n/navigation";
import { formatChange, formatDate, formatDayMonth, formatNum, formatTime, fullName } from "@/lib/metro/format";
import { getClient, getNextAppointment } from "@/lib/metro/queries";
import { RICH } from "@/lib/metro/rich";
import { progressFacts, progressSummary } from "@/lib/metro/summary";
import { cn } from "@/lib/utils";
import { ClientPageProps } from "@/types/page-props";

// Λειτουργία παρουσίασης: the moment the phone is turned around. No navigation, no form chrome.
const PresentationPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [t, tDetail, client, nextAppointment] = await Promise.all([getTranslations("Presentation"), getTranslations("ClientDetail"), getClient(id), getNextAppointment(id)]);
  if (!client) notFound();

  const facts = progressFacts(client, client.measurements);
  const { first, change, towardGoal, currentWeight, latestFat, firstFat, latestWaist, firstWaist } = facts;
  const summary = progressSummary(tDetail, client, facts);
  const exitHref = `/clients/${client.id}`;

  const sinceStart = (current: number | null, start: number | null) => (current !== null && start !== null ? t("sinceStart", { value: formatChange(current - start) }) : undefined);

  return (
    <PresentationShell exitHref={exitHref}>
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-gutter py-12 lg:gap-10 lg:px-12 lg:py-16">
        {/* The hero: the client, one number, and the story in words. */}
        <section className="flex flex-col gap-6 rounded-xl border border-hairline bg-surface-raised p-6 lg:flex-row lg:items-stretch lg:gap-10 lg:p-8">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-display">{fullName(client)}</h1>
              <p className="text-body text-ink-muted">{first ? t("heroSubtitle", { visits: tDetail("visits", { count: client.measurements.length }), since: formatDate(first.visitedAt) }) : tDetail("noHistory")}</p>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-4">
              <p className={cn("text-num-xl whitespace-nowrap", towardGoal ? "text-accent" : "text-ink")}>{change === null ? "—" : `${formatChange(change)} kg`}</p>
              <p className="text-body text-ink-muted">
                {facts.remaining !== null && client.targetWeightKg !== null ? t.rich("remaining", { ...RICH, remaining: formatNum(facts.remaining), target: formatNum(client.targetWeightKg) }) : t("noTarget")}
              </p>
            </div>
            <p className="max-w-[60ch] text-title-m font-normal leading-7 text-ink">{summary}</p>
            {nextAppointment && <p className="text-body text-ink-muted">{t("nextVisit", { date: formatDayMonth(nextAppointment.startsAt), time: formatTime(nextAppointment.startsAt) })}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 lg:w-[400px] lg:grid-cols-1 lg:content-center">
            <StatTile icon={Scale} label={t("weight")} value={currentWeight === null ? null : formatNum(currentWeight)} unit="kg" sub={sinceStart(currentWeight, first?.weightKg ?? null)} />
            <StatTile icon={Percent} label={t("fat")} value={latestFat === null ? null : formatNum(latestFat)} unit="%" sub={sinceStart(latestFat, firstFat)} />
            <StatTile icon={Ruler} label={t("waist")} value={latestWaist === null ? null : formatNum(latestWaist)} unit="cm" sub={sinceStart(latestWaist, firstWaist)} />
          </div>
        </section>

        <ProgressCharts
          measurements={client.measurements}
          heightCm={client.heightCm}
          targetWeightKg={client.targetWeightKg}
          captions
          compact={false}
          frame="card"
          className="grid gap-6 lg:grid-cols-3 lg:gap-8"
        />
      </main>

      <div className="mt-auto flex justify-center pb-6 lg:hidden">
        <Link href={exitHref} className="flex min-h-tap items-center text-body text-ink-soft">
          {t("exit")}
        </Link>
      </div>
      <p className="mt-auto hidden pr-12 pb-7 text-right text-caption text-ink-soft lg:block">{t("exitEsc")}</p>
    </PresentationShell>
  );
};

export default PresentationPage;
