import type { Measurement } from "@prisma/client";
import { Activity, Droplets, Heart, HeartPulse, Layers, LayoutGrid, type LucideIcon, Ruler, Scale } from "lucide-react";
import { useTranslations } from "next-intl";

import { ChartExpandButton } from "@/components/metro/chart-dialog";
import { SectionCard } from "@/components/metro/section-card";
import { healthyWaistRange, healthyWeightRange, parseBloodPressure, remainingToTarget, whtr } from "@/lib/metro/calc";
import { formatChange, formatDayMonth, formatNum } from "@/lib/metro/format";
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
  /**
   * How the cards sit in the container `className` describes. A stack is one column. A grid
   * is the presentation's two columns at 1024 and up: weight spans both, wide and low, then
   * composition and waist side by side, then the small charts spanning both, four per row.
   */
  layout?: "stack" | "grid";
  className?: string;
}

const DAY_MS = 86_400_000;
const PRIMARY = "var(--series-primary)";
const SECONDARY = "var(--series-secondary)";

interface SeriesPoint {
  value: number;
  day: number;
  label: string;
}

/** Visits that carry a value for this series, with their day offsets and labels. */
const seriesOf = (measurements: Measurement[], pick: (m: Measurement) => number | null): SeriesPoint[] => {
  const rows = measurements.flatMap((m) => {
    const v = pick(m);
    return v === null ? [] : [{ v, at: m.visitedAt }];
  });
  const start = rows[0]?.at.getTime() ?? 0;
  return rows.map((r) => ({ value: r.v, day: Math.round((r.at.getTime() - start) / DAY_MS), label: formatDayMonth(r.at) }));
};

interface LineSpecOptions {
  points: SeriesPoint[];
  name: string;
  unit: string;
  compact: boolean;
  /** Values the domain must make room for even when the line never reaches them. */
  extra?: number[];
  step?: number;
  decimals?: number;
  /** A band beneath the line; its lower edge is clipped to the domain, like the healthy-BMI band. */
  band?: { from: number; to: number; label: string };
  reference?: ChartSpec["reference"];
  /** For assistive tech, when the series name alone would not say which chart this is. */
  ariaLabel?: string;
}

/** One line, or null below two visits. */
const lineSpec = ({ points, name, unit, compact, extra = [], step = 1, decimals = 1, band, reference, ariaLabel = name }: LineSpecOptions): ChartSpec | null => {
  if (points.length < 2) return null;
  const values = points.map((p) => p.value);
  const domain = paddedDomain(values, extra, step);
  return {
    points: points.map((p) => ({ day: p.day, label: p.label, a: p.value })),
    series: [{ key: "a", name, unit, color: PRIMARY, domain, ticks: ticksFor(domain), decimals, endLabel: formatNum(values[values.length - 1], decimals) }],
    band: band && { ...band, from: Math.max(domain[0], band.from) },
    reference,
    compact,
    ariaLabel,
  };
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
  className?: string;
  children: React.ReactNode;
}

const ChartFrame = ({ icon: Icon, title, unit, caption, card = false, spec, expandable = false, tone = "sage", className, children }: ChartFrameProps) => card ? (
  <SectionCard
    icon={Icon}
    tone={tone}
    title={title}
    subtitle={caption}
    className={className}
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
  <section className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    <div className="flex items-center justify-between gap-2.5">
      <h3 className="flex items-center gap-1.5 text-label text-ink-muted">
        <Icon className="size-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        {title}
      </h3>
      <span className="flex items-center gap-2">
        <span className="text-caption text-ink-soft">{unit}</span>
        {expandable && spec && <ChartExpandButton spec={spec} title={title} unit={unit} caption={caption} />}
      </span>
    </div>
    {children}
    {caption && <p className="mt-2.5 text-body text-ink-muted">{caption}</p>}
  </section>
);

/** Which way a change went, with a dead band that counts as steady. */
const trend = (delta: number, deadBand: number): "down" | "up" | "flat" => {
  if (delta <= -deadBand) return "down";
  if (delta >= deadBand) return "up";
  return "flat";
};

/** Below two measurements: a dashed hairline frame and one sentence, nothing else. */
const EmptyChart = ({ message, aspect }: { message: string; aspect: string }) => (
  <div className={cn(aspect, "flex items-center justify-center rounded-lg border border-dashed border-border-field px-6 text-center text-body text-ink-muted")}>
    {message}
  </div>
);

/** One of the small charts: a value the form records that is not one of the three main charts. */
interface Mini {
  key: string;
  icon: LucideIcon;
  title: string;
  unit: string;
  spec: ChartSpec;
  /** First and last reading, for the presentation's from-to line. */
  first: string;
  last: string;
}

// Three charts, always in this order: weight, composition, waist. Then, only when a client
// has them at two or more visits, the rest of what the form records as small charts.
export const ProgressCharts = ({ measurements, heightCm, targetWeightKg, compact = false, captions = false, size = "default", frame = "plain", expandable = false, layout = "stack", className }: ProgressChartsProps) => {
  const card = frame === "card";
  const grid = layout === "grid";
  const t = useTranslations("Charts");
  const aspect = size === "large" ? "aspect-[16/8]" : "aspect-[360/190]";
  const wide = grid ? "lg:col-span-2" : undefined;

  const weight = seriesOf(measurements, (m) => m.weightKg);
  const fat = seriesOf(measurements, (m) => m.bodyFatPct);
  const lean = seriesOf(measurements, (m) => m.leanMassKg);
  const waist = seriesOf(measurements, (m) => m.waistCm);
  const weightBand = healthyWeightRange(heightCm);
  const waistBand = healthyWaistRange(heightCm);

  // The domain makes room for the target line and the top edge of the band, and never starts at zero.
  const weightSpec = lineSpec({
    points: weight,
    name: t("weight"),
    unit: "kg",
    compact,
    extra: [weightBand.high, ...(targetWeightKg === null ? [] : [targetWeightKg])],
    step: 2,
    band: { from: weightBand.low, to: weightBand.high, label: t("healthyBmi") },
    reference: targetWeightKg === null ? undefined : { value: targetWeightKg, label: t("target", { weight: formatNum(targetWeightKg) }) },
  });
  let weightCaption: React.ReactNode;
  if (weightSpec && captions) {
    const first = weight[0].value;
    const last = weight[weight.length - 1].value;
    const remaining = remainingToTarget(last, targetWeightKg);
    weightCaption = (
      <>
        {t.rich("weightStory", { ...RICH, first: formatNum(first), last: formatNum(last) })}
        {remaining !== null && <> {t.rich("weightRemaining", { ...RICH, remaining: formatNum(remaining) })}</>}
      </>
    );
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
    // One caption states the story in words: what fat did, then what lean mass did.
    // Fat within half a point and lean mass within a kilo count as steady.
    const fatTrend = trend(fatValues[fatValues.length - 1] - fatValues[0], 0.5);
    const leanTrend = trend(leanValues[leanValues.length - 1] - leanValues[0], 1);
    compositionCaption = (
      <>
        {t.rich(`compositionFat.${fatTrend}`, RICH)}, {t(`compositionLean.${leanTrend}`)}.
      </>
    );
  }

  // The NICE waist-to-height band, in centimetres for this height, the way the weight chart carries the BMI band.
  const waistSpec = lineSpec({
    points: waist,
    name: t("waist"),
    unit: "cm",
    compact,
    extra: [waistBand.high],
    step: 2,
    band: { from: waistBand.low, to: waistBand.high, label: t("healthyWaist") },
  });
  let waistCaption: React.ReactNode;
  if (waistSpec && captions) {
    const last = waist[waist.length - 1].value;
    waistCaption = (
      <>
        {t.rich("waistStory", { ...RICH, diff: formatChange(last - waist[0].value) })} {t("whtrNow", { ratio: formatNum(whtr(last, heightCm), 2) })}
      </>
    );
  }

  const minis: Mini[] = [];
  const addMini = ({ key, icon, title, unit, points, decimals = 1, name = title }: { key: string; icon: LucideIcon; title: string; unit: string; points: SeriesPoint[]; decimals?: number; name?: string }) => {
    const spec = lineSpec({ points, name, unit, compact: true, decimals, ariaLabel: title });
    if (spec) minis.push({ key, icon, title, unit, spec, first: formatNum(points[0].value, decimals), last: formatNum(points[points.length - 1].value, decimals) });
  };
  addMini({ key: "hip", icon: Ruler, title: t("hip"), unit: "cm", points: seriesOf(measurements, (m) => m.hipCm) });
  addMini({ key: "chest", icon: Ruler, title: t("chest"), unit: "cm", points: seriesOf(measurements, (m) => m.chestCm) });
  addMini({ key: "arm", icon: Ruler, title: t("arm"), unit: "cm", points: seriesOf(measurements, (m) => m.armCm) });
  addMini({ key: "thigh", icon: Ruler, title: t("thigh"), unit: "cm", points: seriesOf(measurements, (m) => m.thighCm) });
  addMini({ key: "water", icon: Droplets, title: t("water"), unit: "%", points: seriesOf(measurements, (m) => m.waterPct) });
  addMini({
    key: "skinfolds",
    icon: Layers,
    title: t("skinfolds"),
    name: t("skinfoldSum"),
    unit: "mm",
    points: seriesOf(measurements, (m) =>
      m.skinfoldBicepsMm !== null && m.skinfoldTricepsMm !== null && m.skinfoldSubscapularMm !== null && m.skinfoldSuprailiacMm !== null
        ? m.skinfoldBicepsMm + m.skinfoldTricepsMm + m.skinfoldSubscapularMm + m.skinfoldSuprailiacMm
        : null,
    ),
  });

  // Blood pressure: two readings on one scale, so the gap between them stays honest.
  const systolic = seriesOf(measurements, (m) => parseBloodPressure(m.bloodPressure)?.systolic ?? null);
  const diastolic = seriesOf(measurements, (m) => parseBloodPressure(m.bloodPressure)?.diastolic ?? null);
  if (systolic.length >= 2) {
    const values = [...systolic.map((p) => p.value), ...diastolic.map((p) => p.value)];
    const domain = paddedDomain(values, [], 10);
    const axis = { domain, ticks: ticksFor(domain, 4), decimals: 0 };
    const last = systolic.length - 1;
    minis.push({
      key: "bloodPressure",
      icon: HeartPulse,
      title: t("bloodPressure"),
      unit: "mmHg",
      spec: {
        points: systolic.map((p, i) => ({ day: p.day, label: p.label, a: p.value, b: diastolic[i].value })),
        series: [
          { key: "a", name: t("systolic"), unit: "mmHg", color: PRIMARY, ...axis, endLabel: formatNum(systolic[last].value, 0) },
          { key: "b", name: t("diastolic"), unit: "mmHg", color: SECONDARY, ...axis, endLabel: formatNum(diastolic[last].value, 0) },
        ],
        sharedAxis: true,
        compact: true,
        ariaLabel: t("bloodPressure"),
      },
      first: `${systolic[0].value}/${diastolic[0].value}`,
      last: `${systolic[last].value}/${diastolic[last].value}`,
    });
  }
  addMini({ key: "pulse", icon: Heart, title: t("pulse"), unit: "bpm", points: seriesOf(measurements, (m) => m.pulseBpm), decimals: 0 });

  const chartOrEmpty = (spec: ChartSpec | null, frameAspect = aspect) => (spec ? <MetroLineChartLazy spec={spec} aspect={frameAspect} /> : <EmptyChart message={t("needTwo")} aspect={frameAspect} />);

  const miniGrid = (
    <div className={cn("grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2", grid && "lg:grid-cols-4")}>
      {minis.map((mini) => (
        <ChartFrame
          key={mini.key}
          icon={mini.icon}
          title={mini.title}
          unit={mini.unit}
          spec={mini.spec}
          expandable={expandable}
          caption={captions ? t.rich("fromTo", { ...RICH, first: mini.first, last: mini.last }) : undefined}
        >
          <MetroLineChartLazy spec={mini.spec} aspect="aspect-[16/9]" />
        </ChartFrame>
      ))}
    </div>
  );

  return (
    <div className={className}>
      <ChartFrame icon={Scale} title={t("weight")} unit="kg" caption={weightCaption} card={card} spec={weightSpec} expandable={expandable} tone="sage" className={wide}>
        {chartOrEmpty(weightSpec, grid ? cn(aspect, "lg:aspect-[16/6]") : aspect)}
      </ChartFrame>
      <ChartFrame icon={Activity} title={t("composition")} unit={t("compositionUnits")} caption={compositionCaption} card={card} spec={compositionSpec} expandable={expandable} tone="teal">
        {chartOrEmpty(compositionSpec)}
      </ChartFrame>
      <ChartFrame icon={Ruler} title={t("waist")} unit="cm" caption={waistCaption} card={card} spec={waistSpec} expandable={expandable} tone="sand">
        {chartOrEmpty(waistSpec)}
      </ChartFrame>
      {minis.length > 0 &&
        (card ? (
          <SectionCard icon={LayoutGrid} tone="neutral" title={t("more")} subtitle={t("moreSubtitle")} className={wide}>
            {miniGrid}
          </SectionCard>
        ) : (
          <section className={cn("flex flex-col gap-4", wide)}>
            <h3 className="flex items-center gap-1.5 text-label text-ink-muted">
              <LayoutGrid className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {t("more")}
            </h3>
            {miniGrid}
          </section>
        ))}
    </div>
  );
};
