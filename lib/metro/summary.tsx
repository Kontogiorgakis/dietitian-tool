import type { Client, Measurement } from "@prisma/client";
import type { getTranslations } from "next-intl/server";

import { isTowardGoal, remainingToTarget } from "@/lib/metro/calc";
import { formatChange, formatDayMonth, formatNum } from "@/lib/metro/format";
import { RICH } from "@/lib/metro/rich";

type DetailTranslator = Awaited<ReturnType<typeof getTranslations<"ClientDetail">>>;

export interface ProgressFacts {
  /** Non-draft measurements, oldest first. */
  visits: Measurement[];
  first: Measurement | null;
  latest: Measurement | null;
  previous: Measurement | null;
  currentWeight: number | null;
  /** Change since the first weight, null with fewer than two weights. */
  change: number | null;
  towardGoal: boolean;
  latestFat: number | null;
  firstFat: number | null;
  latestWaist: number | null;
  firstWaist: number | null;
  remaining: number | null;
}

/** The numbers every client screen reads, computed once. */
export const progressFacts = (client: Pick<Client, "goalDirection" | "targetWeightKg">, visits: Measurement[]): ProgressFacts => {
  const weights = visits.filter((m) => m.weightKg !== null);
  const fats = visits.filter((m) => m.bodyFatPct !== null);
  const waists = visits.filter((m) => m.waistCm !== null);
  const first = weights[0] ?? null;
  const currentWeight = weights[weights.length - 1]?.weightKg ?? null;
  const change = weights.length >= 2 && first?.weightKg !== null && first?.weightKg !== undefined && currentWeight !== null ? currentWeight - first.weightKg : null;
  return {
    visits,
    first,
    latest: visits[visits.length - 1] ?? null,
    previous: visits[visits.length - 2] ?? null,
    currentWeight,
    change,
    towardGoal: change !== null && isTowardGoal(change, client.goalDirection),
    latestFat: fats[fats.length - 1]?.bodyFatPct ?? null,
    firstFat: fats.length >= 2 ? fats[0].bodyFatPct : null,
    latestWaist: waists[waists.length - 1]?.waistCm ?? null,
    firstWaist: waists.length >= 2 ? waists[0].waistCm : null,
    remaining: currentWeight === null ? null : remainingToTarget(currentWeight, client.targetWeightKg),
  };
};

/**
 * The sentences the app writes from the data, one per line: movement, never a verdict.
 * The first states the weight since the first visit and leads; the rest add fat, waist and
 * the distance to the target. The numbers that matter are bold.
 */
export const progressSummary = (t: DetailTranslator, client: Pick<Client, "targetWeightKg">, facts: ProgressFacts): React.ReactNode[] => {
  const { first, currentWeight, change, latestFat, firstFat, latestWaist, firstWaist, remaining, visits } = facts;
  if (!first) return [t("summary.none")];
  if (change === null) return [t.rich("summary.one", { ...RICH, date: formatDayMonth(first.visitedAt), weight: formatNum(first.weightKg) })];
  const parts: React.ReactNode[] = [t.rich("summary.progress", { ...RICH, since: formatDayMonth(first.visitedAt), visits: t("visits", { count: visits.length }), change: formatChange(change), first: formatNum(first.weightKg), last: formatNum(currentWeight) })];
  if (firstFat !== null) parts.push(t.rich("summary.fat", { ...RICH, fatFirst: formatNum(firstFat), fatLast: formatNum(latestFat) }));
  if (firstWaist !== null) parts.push(t.rich("summary.waist", { ...RICH, waistFirst: formatNum(firstWaist), waistLast: formatNum(latestWaist) }));
  if (remaining !== null && client.targetWeightKg !== null) parts.push(t.rich("summary.remaining", { ...RICH, remaining: formatNum(remaining), target: formatNum(client.targetWeightKg) }));
  return parts;
};
