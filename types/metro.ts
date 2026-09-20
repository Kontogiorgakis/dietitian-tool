import type { Client, GoalDirection, Measurement } from "@prisma/client";

/** One row of the client list: name, last visit and one number. */
export interface ClientSummary {
  id: string;
  name: string;
  phone: string;
  goalDirection: GoalDirection;
  lastVisit: Date | null;
  visitCount: number;
  currentWeightKg: number | null;
  /** Change since the first measurement, null with fewer than two visits. */
  changeKg: number | null;
  towardGoal: boolean;
}

export type ClientWithMeasurements = Client & { measurements: Measurement[] };

/** The numeric and text fields of the measurement form, all optional while a visit is in progress. */
export interface MeasurementValues {
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  bodyFatPct: number | null;
  leanMassKg: number | null;
  waterPct: number | null;
  skinfoldBicepsMm: number | null;
  skinfoldTricepsMm: number | null;
  skinfoldSubscapularMm: number | null;
  skinfoldSuprailiacMm: number | null;
  bloodPressure: string | null;
  pulseBpm: number | null;
  note: string | null;
}

export const EMPTY_MEASUREMENT: MeasurementValues = {
  weightKg: null,
  waistCm: null,
  hipCm: null,
  chestCm: null,
  armCm: null,
  thighCm: null,
  bodyFatPct: null,
  leanMassKg: null,
  waterPct: null,
  skinfoldBicepsMm: null,
  skinfoldTricepsMm: null,
  skinfoldSubscapularMm: null,
  skinfoldSuprailiacMm: null,
  bloodPressure: null,
  pulseBpm: null,
  note: null,
};

/** Step 1 of Νέος πελάτης: what the practice cannot work without. */
export interface ClientBasics {
  firstName: string;
  lastName: string;
  sex: Client["sex"];
  birthDate: string;
  heightCm: number;
  phone: string;
  email: string | null;
}

/** Step 2 of Νέος πελάτης: everything that makes the advice good. */
export interface ClientHistory {
  goalText: string | null;
  targetWeightKg: number | null;
  goalDirection: GoalDirection;
  activityLevel: string | null;
  medicalHistory: string | null;
  medication: string | null;
  allergies: string | null;
  intolerances: string | null;
  conditions: string | null;
  dietPreferences: string | null;
  habits: string | null;
}
