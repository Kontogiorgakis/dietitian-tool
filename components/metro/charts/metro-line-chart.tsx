"use client";

import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNum } from "@/lib/metro/format";
import { cn } from "@/lib/utils";

import type { ChartSpec } from "./chart-spec";

interface MetroLineChartProps {
  spec: ChartSpec;
  className?: string;
}

/** At most this many date labels on a full-size chart; the first and last visit always show. */
const MAX_X_TICKS = 5;

const xTicks = (points: ChartSpec["points"], compact: boolean): number[] => {
  const last = points.length - 1;
  if (compact || points.length <= MAX_X_TICKS) return compact ? [points[0].day, points[last].day] : points.map((p) => p.day);
  const step = (points.length - 1) / (MAX_X_TICKS - 1);
  const indexes = new Set<number>();
  for (let k = 0; k < MAX_X_TICKS; k++) indexes.add(Math.round(k * step));
  return [...indexes].map((i) => points[i].day);
};

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

interface EndLabel {
  text: string;
  /** Beside the point, in the right margin; or inside the plot, on the side the line leaves free (two-axis charts, where the margin holds the second axis). */
  placement: "beside" | "inside";
  /** Whether the line rises into its last point (arriving from the lower left), so an inside label goes above it. */
  rising: boolean;
}

/** A point at every visit, the last one filled and labelled with its value. */
const seriesDot = (color: string, lastIndex: number, endLabel: EndLabel) => {
  const Dot = ({ cx = 0, cy = 0, index = 0 }: DotProps) => {
    const last = index === lastIndex;
    const beside = endLabel.placement === "beside";
    const insideY = endLabel.rising ? cy - 10 : cy + 19;
    return (
      <g key={index}>
        <circle cx={cx} cy={cy} r={last ? 4.5 : 3.5} fill={last ? color : "var(--surface-page)"} stroke={color} strokeWidth={2} />
        {last && (
          <text
            x={beside ? cx + 8 : cx - 2}
            y={beside ? cy + 4 : insideY}
            textAnchor={beside ? "start" : "end"}
            fill={color}
            fontSize={14}
            fontWeight={600}
            className="tabular-nums"
          >
            {endLabel.text}
          </text>
        )}
      </g>
    );
  };
  return Dot;
};

export const MetroLineChart = ({ spec, className }: MetroLineChartProps) => {
  const { points, series, band, reference, compact, sharedAxis = false } = spec;
  const labelOf = new Map(points.map((p) => [p.day, p.label]));
  const lastIndex = points.length - 1;
  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.name, color: s.color }])) satisfies ChartConfig;
  const primary = series[0];
  // Two axes: the right margin belongs to the second axis, so the end labels move inside the plot.
  const axes = sharedAxis ? [primary] : series;
  const twoAxes = axes.length > 1;
  const endLabelOf = (s: (typeof series)[number]): EndLabel => ({
    text: s.endLabel,
    placement: twoAxes ? "inside" : "beside",
    rising: points.length > 1 && (points[lastIndex][s.key] ?? 0) > (points[lastIndex - 1][s.key] ?? 0),
  });

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-full w-full", className)} aria-label={spec.ariaLabel}>
      <LineChart data={points} margin={{ top: 12, right: twoAxes ? 8 : 52, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="day"
          type="number"
          domain={[0, points[lastIndex].day || 1]}
          ticks={xTicks(points, compact)}
          tickFormatter={(day: number) => labelOf.get(day) ?? ""}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "var(--ink-soft)", fontSize: 14 }}
        />
        {axes.map((s) => (
          <YAxis
            key={s.key}
            yAxisId={s.key}
            orientation={s.key === "a" ? "left" : "right"}
            domain={s.domain}
            ticks={s.ticks}
            tickFormatter={(v: number) => formatNum(v, 0)}
            tickLine={false}
            axisLine={false}
            width={s.key === "a" ? 42 : 38}
            tick={{ fill: twoAxes ? s.color : "var(--ink-soft)", fontSize: 14 }}
          />
        ))}
        {band && (
          <ReferenceArea
            yAxisId="a"
            y1={band.from}
            y2={band.to}
            fill="var(--chart-band)"
            fillOpacity={1}
            stroke="none"
            label={{ value: band.label, position: "insideTopLeft", fill: "var(--ink-soft)", fontSize: 14 }}
          />
        )}
        {reference && (
          <ReferenceLine
            yAxisId="a"
            y={reference.value}
            stroke="var(--chart-reference)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: reference.label, position: "insideTopRight", fill: "var(--chart-reference)", fontSize: 14 }}
          />
        )}
        <ChartTooltip
          cursor={{ stroke: "var(--hairline)" }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => labelOf.get(payload?.[0]?.payload?.day) ?? ""}
              formatter={(value, name) => {
                const s = series.find((x) => x.key === name) ?? primary;
                return (
                  <span className="flex w-full items-baseline justify-between gap-3">
                    <span className="text-ink-muted">{s.name}</span>
                    <span className="text-num-s text-ink">
                      {formatNum(Number(value), s.decimals)} <span className="font-normal text-ink-soft">{s.unit}</span>
                    </span>
                  </span>
                );
              }}
            />
          }
        />
        {series.map((s) => (
          <Line
            key={s.key}
            yAxisId={sharedAxis ? "a" : s.key}
            dataKey={s.key}
            type="linear"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            dot={seriesDot(s.color, lastIndex, endLabelOf(s))}
            activeDot={{ r: 5, fill: s.color, stroke: "var(--surface-page)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};
