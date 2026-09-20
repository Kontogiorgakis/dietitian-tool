"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

import type { ChartSpec } from "./chart-spec";

// Recharts measures its container in the browser, so the chart loads client-side only.
// The placeholder keeps the frame's height so the page does not jump.
const MetroLineChart = dynamic(() => import("./metro-line-chart").then((m) => m.MetroLineChart), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-lg bg-surface-field/60" aria-hidden="true" />,
});

interface MetroLineChartLazyProps {
  spec: ChartSpec;
  /** An aspect-ratio class; the placeholder and the chart share it so nothing jumps. */
  aspect: string;
}

export const MetroLineChartLazy = ({ spec, aspect }: MetroLineChartLazyProps) => (
  <div className={cn(aspect, "w-full")}>
    <MetroLineChart spec={spec} className="h-full" />
  </div>
);
