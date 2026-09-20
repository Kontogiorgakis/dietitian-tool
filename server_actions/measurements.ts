"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import type { MeasurementValues } from "@/types/metro";

interface SaveArgs {
  clientId: string;
  /** The draft row being edited, or undefined on the first keystroke of a new visit. */
  draftId?: string;
  values: MeasurementValues;
}

const toData = (values: MeasurementValues) => ({
  ...values,
  bloodPressure: values.bloodPressure?.trim() || null,
  note: values.note?.trim() || null,
});

/** The quiet autosave. Upserts the draft and returns when it was saved. */
export const saveMeasurementDraft = async ({ clientId, draftId, values }: SaveArgs): Promise<{ id: string; savedAt: string }> => {
  const data = toData(values);
  const row = draftId
    ? await prisma.measurement.update({ where: { id: draftId, clientId }, data, select: { id: true, updatedAt: true } })
    : await prisma.measurement.create({ data: { clientId, draft: true, ...data }, select: { id: true, updatedAt: true } });
  return { id: row.id, savedAt: row.updatedAt.toISOString() };
};

/** Closes the visit: the draft becomes a real measurement dated now. */
export const saveMeasurement = async ({ clientId, draftId, values }: SaveArgs): Promise<{ id: string }> => {
  const data = { ...toData(values), draft: false, visitedAt: new Date() };
  const row = draftId
    ? await prisma.measurement.update({ where: { id: draftId, clientId }, data, select: { id: true } })
    : await prisma.measurement.create({ data: { clientId, ...data }, select: { id: true } });
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/clients/[id]", "page");
  return row;
};
