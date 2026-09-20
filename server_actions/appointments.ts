"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

export interface AppointmentInput {
  clientId: string;
  /** Local date and time, already combined by the form. */
  startsAt: string;
  durationMin: number;
  note: string | null;
}

const toData = (input: AppointmentInput) => {
  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) throw new Error("Η ημερομηνία δεν είναι έγκυρη.");
  if (!input.clientId) throw new Error("Επιλέξτε πελάτη.");
  return { clientId: input.clientId, startsAt, durationMin: input.durationMin, note: input.note?.trim() || null };
};

const revalidate = () => revalidatePath("/[locale]/appointments", "page");

export const createAppointment = async (input: AppointmentInput): Promise<{ id: string }> => {
  const row = await prisma.appointment.create({ data: toData(input), select: { id: true } });
  revalidate();
  return row;
};

export const updateAppointment = async (id: string, input: AppointmentInput): Promise<void> => {
  await prisma.appointment.update({ where: { id }, data: toData(input) });
  revalidate();
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await prisma.appointment.delete({ where: { id } });
  revalidate();
};
