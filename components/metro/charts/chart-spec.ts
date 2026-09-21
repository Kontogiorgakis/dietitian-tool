/** Plain data handed from the server to the Recharts client component. */
export interface ChartPoint {
  /** Days since the first visit, so a long gap between visits looks like one. */
  day: number;
  /** 12 Σεπ */
  label: string;
  a: number;
  b?: number;
}

export interface ChartSeriesSpec {
  key: "a" | "b";
  name: string;
  unit: string;
  color: string;
  domain: [number, number];
  ticks: number[];
  decimals: number;
  endLabel: string;
}

export interface ChartSpec {
  points: ChartPoint[];
  series: ChartSeriesSpec[];
  /** The healthy-BMI band, drawn beneath the line. */
  band?: { from: number; to: number; label: string };
  /** The dashed target-weight line. */
  reference?: { value: number; label: string };
  /** Both series on the left axis, one scale (blood pressure); otherwise the second series gets its own axis on the right. */
  sharedAxis?: boolean;
  /** Compact charts label the first and last visit only. */
  compact: boolean;
  ariaLabel: string;
}

/** A rounded domain with padding, never starting at zero. */
export const paddedDomain = (values: number[], extra: number[] = [], step = 1): [number, number] => {
  const all = [...values, ...extra];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = Math.max((max - min) * 0.15, step / 2);
  return [Math.floor((min - pad) / step) * step, Math.ceil((max + pad) / step) * step];
};

export const ticksFor = ([lo, hi]: [number, number], count = 3): number[] => {
  const raw = (hi - lo) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(Number(t.toFixed(6)));
  return ticks;
};
