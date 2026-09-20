import type { Measurement } from "@prisma/client";
import { Activity, type LucideIcon, Ruler, Scale } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChartExpandButton } from "@/components/metro/chart-dialog";
import { SectionCard } from "@/components/metro/section-card";
import { healthyWeightRange, remainingToTarget } from "@/lib/metro/calc";
import { formatDayMonth, formatNum } from "@/lib/metro/format";
import { RICH } from "@/lib/metro/rich";
import type { Tone } from "@/lib/metro/tones";
import { cn } from "@/lib/utils";

import { type ChartSpec, paddedDomain, ticksFor } from "./chart-spec";
import { MetroLineChartLazy } from "./metro-line-chart-lazy";

interface ProgressChartsProps {
  /** Non-draft measurements, oldest first. */
  measurements: Measurement[];
  heightCm: number;
  targetWeightKg: number | null;
  /** Compact charts label the first and last visit only. */
  compact?: boolean;
  /** Presentation mode adds one line of plain-language context under each chart. */
  captions?: boolean;
  /** Large charts sit in a wide column and keep a low profile (16:8), so all three stay in view. */
  size?: "default" | "large";
  /** Card frames put each chart in a SectionCard with its caption as the subtitle. */
  frame?: "plain" | "card";
  /** An expand button in each card, opening the chart large. Never in presentation mode. */
  expandable?: boolean;
  className?: string;
}

const DAY_MS = 86_400_000;
const PRIMARY = "var(--series-primary)";
const SECONDARY = "var(--series-secondary)";

/** Visits that carry a value for this series, with their day offsets and labels. */
const seriesOf = (measurements: Measurement[], pick: (m: Measurement) => number | null) => {
  const rows = measurements.flatMap((m) => {
    const v = pick(m);
    return v === null ? [] : [{ v, at: m.visitedAt }];
  });
  const start = rows[0]?.at.getTime() ?? 0;
  return rows.map((r) => ({ value: r.v, day: Math.round((r.at.getTime() - start) / DAY_MS), label: formatDayMonth(r.at) }));
};

interface ChartFrameProps {
  icon: LucideIcon;
  title: string;
  unit: string;
  caption?: React.ReactNode;
  card?: boolean;
  spec?: ChartSpec | null;
  expandable?: boolean;
  tone?: Tone;
  children: React.ReactNode;
}

const ChartFrame = ({ icon: Icon, title, unit, caption, card = false, spec, expandable = false, tone = "sage", children }: ChartFrameProps) => card ? (
  <SectionCard
    icon={Icon}
    tone={tone}
    title={title}
    subtitle={caption}
    action={
      <span className="flex items-center gap-2">
        <span className="text-caption text-ink-soft">{unit}</span>
        {expandable && spec && <ChartExpandButton spec={spec} title={title} unit={unit} caption={caption} />}
      </span>
    }
  >
    {children}
  </SectionCard>
) : (
  <section className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2.5">
      <h3 className="flex items-center gap-1.5 text-label text-ink-muted">
        <Icon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
        {title}
      </h3>
      <span className="text-caption text-ink-soft">{unit}</span>
    </div>
    {children}
    {caption && <p className="mt-2.5 text-body text-ink-muted">{caption}</p>}
  </section>
);

/** Below two measurements: a dashed hairline frame and one sentence, nothing else. */
const EmptyChart = ({ message, aspect }: { message: string; aspect: string }) => (
  <div className={cn(aspect, "flex items-center justify-center rounded-lg border border-dashed border-border-field px-6 text-center text-body text-ink-muted")}>
    {message}
  </div>
);

// Three charts, always in this order: weight, composition, waist.
export const ProgressCharts = ({ measurements, heightCm, targetWeightKg, compact = false, captions = false, size = "default", frame = "plain", expandable = false, className }: ProgressChartsProps) => {
  const card = frame === "card";
  const t = useTranslations("Charts");
  const aspect = size === "large" ? "aspect-[16/8]" : "aspect-[360/190]";

  const weight = seriesOf(measurements, (m) => m.weightKg);
  const fat = seriesOf(measurements, (m) => m.bodyFatPct);
  const lean = seriesOf(measurements, (m) => m.leanMassKg);
  const waist = seriesOf(measurements, (m) => m.waistCm);
  const band = healthyWeightRange(heightCm);

  let weightSpec: ChartSpec | null = null;
  let weightCaption: React.ReactNode;
  if (weight.length >= 2) {
    // The domain makes room for the target line and the top edge of the band, and never starts at zero.
    const values = weight.map((p) => p.value);
    const last = values[values.length - 1];
    const extra = [band.high, ...(targetWeightKg === null ? [] : [targetWeightKg])];
    const domain = paddedDomain(values, extra, 2);
    weightSpec = {
      points: weight.map((p) => ({ day: p.day, label: p.label, a: p.value })),
      series: [{ key: "a", name: t("weight"), unit: "kg", color: PRIMARY, domain, ticks: ticksFor(domain), decimals: 1, endLabel: formatNum(last) }],
      band: { from: Math.max(domain[0], band.low), to: band.high, label: t("healthyBmi") },
      reference: targetWeightKg === null ? undefined : { value: targetWeightKg, label: t("target", { weight: formatNum(targetWeightKg) }) },
      compact,
      ariaLabel: t("weight"),
    };
    if (captions) {
      const remaining = remainingToTarget(last, targetWeightKg);
      weightCaption = (
        <>
          {t.rich("weightStory", { ...RICH, first: formatNum(values[0]), last: formatNum(last) })}
          {remaining !== null && <> {t.rich("weightRemaining", { ...RICH, remaining: formatNum(remaining) })}</>}
        </>
      );
    }
  }

  let compositionSpec: ChartSpec | null = null;
  let compositionCaption: React.ReactNode;
  if (fat.length >= 2 && lean.length === fat.length) {
    const fatValues = fat.map((p) => p.value);
    const leanValues = lean.map((p) => p.value);
    const leftDomain = paddedDomain(fatValues, [], 1);
    const rightDomain = paddedDomain(leanValues, [], 1);
    compositionSpec = {
      points: fat.map((p, i) => ({ day: p.day, label: p.label, a: p.value, b: leanValues[i] })),
      series: [
        { key: "a", name: t("fat"), unit: "%", color: PRIMARY, domain: leftDomain, ticks: ticksFor(leftDomain), decimals: 1, endLabel: `${formatNum(fatValues[fatValues.length - 1])} %` },
        { key: "b", name: t("lean"), unit: "kg", color: SECONDARY, domain: rightDomain, ticks: ticksFor(rightDomain), decimals: 1, endLabel: formatNum(leanValues[leanValues.length - 1]) },
      ],
      compact,
      ariaLabel: t("composition"),
    };
    // One caption states the story in words. Lean mass within a kilo counts as holding.
    const fatDelta = fatValues[fatValues.length - 1] - fatValues[0];
    const leanDelta = leanValues[leanValues.length - 1] - leanValues[0];
    const leanHolds = Math.abs(leanDelta) <= 1;
    if (fatDelta <= -0.5 && leanHolds) compositionCaption = t.rich("compositionStory", RICH);
    else if (fatDelta <= -0.5) compositionCaption = t.rich("compositionStoryLeanDrop", RICH);
    else if (fatDelta >= 0.5 && leanHolds) compositionCaption = t.rich("compositionStoryFatUp", RICH);
    else compositionCaption = t("compositionStoryFlat");
  }

  let waistSpec: ChartSpec | null = null;
  let waistCaption: React.ReactNode;
  if (waist.length >= 2) {
    const values = waist.map((p) => p.value);
    const last = values[values.length - 1];
    const domain = paddedDomain(values, [], 2);
    waistSpec = {
      points: waist.map((p) => ({ day: p.day, label: p.label, a: p.value })),
      series: [{ key: "a", name: t("waist"), unit: "cm", color: PRIMARY, domain, ticks: ticksFor(domain), decimals: 1, endLabel: formatNum(last) }],
      compact,
      ariaLabel: t("waist"),
    };
    if (captions) waistCaption = t.rich("waistStory", { ...RICH, diff: formatNum(Math.abs(last - values[0])) });
  }

  const chartOrEmpty = (spec: ChartSpec | null) => (spec ? <MetroLineChartLazy spec={spec} aspect={aspect} /> : <EmptyChart message={t("needTwo")} aspect={aspect} />);

  return (
    <div className={className}>
      <ChartFrame icon={Scale} title={t("weight")} unit="kg" caption={weightCaption} card={card} spec={weightSpec} expandable={expandable} tone="sage">
        {chartOrEmpty(weightSpec)}
      </ChartFrame>
      <ChartFrame icon={Activity} title={t("composition")} unit={t("compositionUnits")} caption={compositionCaption} card={card} spec={compositionSpec} expandable={expandable} tone="teal">
        {chartOrEmpty(compositionSpec)}
      </ChartFrame>
      <ChartFrame icon={Ruler} title={t("waist")} unit="cm" caption={waistCaption} card={card} spec={waistSpec} expandable={expandable} tone="sand">
        {chartOrEmpty(waistSpec)}
      </ChartFrame>
    </div>
  );
};
