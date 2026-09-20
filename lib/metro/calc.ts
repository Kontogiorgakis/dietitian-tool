import type { GoalDirection, Sex } from "@prisma/client";

export const bmi = (weightKg: number, heightCm: number): number => {
  const m = heightCm / 100;
  return weightKg / (m * m);
};

/** Waist-to-height ratio. */
export const whtr = (waistCm: number, heightCm: number): number => waistCm / heightCm;

/** The weight range of the healthy BMI band (18,5 to 24,9) for this height. */
export const healthyWeightRange = (heightCm: number): { low: number; high: number } => {
  const m2 = (heightCm / 100) ** 2;
  return { low: 18.5 * m2, high: 24.9 * m2 };
};

export interface Skinfolds {
  biceps: number;
  triceps: number;
  subscapular: number;
  suprailiac: number;
}

// Durnin and Womersley (1974) body-density coefficients for the four-site sum, by sex and age band.
const DENSITY_COEFFICIENTS: Record<"FEMALE" | "MALE", Array<{ maxAge: number; c: number; m: number }>> = {
  FEMALE: [
    { maxAge: 19, c: 1.1549, m: 0.0678 },
    { maxAge: 29, c: 1.1599, m: 0.0717 },
    { maxAge: 39, c: 1.1423, m: 0.0632 },
    { maxAge: 49, c: 1.1333, m: 0.0612 },
    { maxAge: Infinity, c: 1.1339, m: 0.0645 },
  ],
  MALE: [
    { maxAge: 19, c: 1.162, m: 0.063 },
    { maxAge: 29, c: 1.1631, m: 0.0632 },
    { maxAge: 39, c: 1.1422, m: 0.0544 },
    { maxAge: 49, c: 1.162, m: 0.07 },
    { maxAge: Infinity, c: 1.1715, m: 0.0779 },
  ],
};

/** Body fat % from the four Durnin-Womersley skinfolds, Siri equation. `OTHER` uses the female table. */
export const skinfoldBodyFatPct = ({ skinfolds, sex, age }: { skinfolds: Skinfolds; sex: Sex; age: number }): number => {
  const sum = skinfolds.biceps + skinfolds.triceps + skinfolds.subscapular + skinfolds.suprailiac;
  const table = DENSITY_COEFFICIENTS[sex === "MALE" ? "MALE" : "FEMALE"];
  const band = table.find((b) => age <= b.maxAge) ?? table[table.length - 1];
  const density = band.c - band.m * Math.log10(sum);
  return 495 / density - 450;
};

export const fatMassKg = (weightKg: number, bodyFatPct: number): number => weightKg * (bodyFatPct / 100);
export const leanMassKg = (weightKg: number, bodyFatPct: number): number => weightKg - fatMassKg(weightKg, bodyFatPct);

/**
 * Whether a weight change moves toward the client's goal. Direction is judged
 * against the goal, not against zero. A MAINTAIN goal treats staying within
 * half a kilo as toward, anything else as away.
 */
export const isTowardGoal = (change: number, direction: GoalDirection): boolean => {
  if (direction === "LOSE") return change < 0;
  if (direction === "GAIN") return change > 0;
  return Math.abs(change) <= 0.5;
};

/** Distance still to go, as a positive number, or null when there is no target. */
export const remainingToTarget = (currentKg: number, targetKg: number | null): number | null => {
  if (targetKg === null) return null;
  return Math.abs(currentKg - targetKg);
};
