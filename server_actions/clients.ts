"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import type { ClientBasics, ClientHistory } from "@/types/metro";

const trimOrNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

/** Step 1. Files the client with the history still missing. */
export const createClient = async (basics: ClientBasics): Promise<{ id: string }> => {
  const firstName = basics.firstName.trim();
  const lastName = basics.lastName.trim();
  if (!firstName || !lastName) throw new Error("Το όνομα και το επώνυμο είναι απαραίτητα.");
  if (!Number.isFinite(basics.heightCm) || basics.heightCm <= 0) throw new Error("Το ύψος είναι απαραίτητο.");
  const birthDate = new Date(basics.birthDate);
  if (Number.isNaN(birthDate.getTime())) throw new Error("Η ημερομηνία γέννησης δεν είναι έγκυρη.");

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      sex: basics.sex,
      birthDate,
      heightCm: basics.heightCm,
      phone: basics.phone.trim(),
      email: trimOrNull(basics.email),
    },
    select: { id: true },
  });
  revalidatePath("/[locale]", "layout");
  return client;
};

/** Step 2. Also called later from the detail screen when the history was skipped. */
export const updateClientHistory = async (id: string, history: ClientHistory): Promise<void> => {
  await prisma.client.update({
    where: { id },
    data: {
      goalText: trimOrNull(history.goalText),
      targetWeightKg: history.targetWeightKg,
      goalDirection: history.goalDirection,
      activityLevel: trimOrNull(history.activityLevel),
      medicalHistory: trimOrNull(history.medicalHistory),
      medication: trimOrNull(history.medication),
      allergies: trimOrNull(history.allergies),
      intolerances: trimOrNull(history.intolerances),
      conditions: trimOrNull(history.conditions),
      dietPreferences: trimOrNull(history.dietPreferences),
      habits: trimOrNull(history.habits),
      historyCompleted: true,
    },
  });
  revalidatePath("/[locale]/clients/[id]", "page");
};

/** Στοιχεία: the basics can change (a new phone, a corrected height). */
export const updateClientBasics = async (id: string, basics: ClientBasics): Promise<void> => {
  const firstName = basics.firstName.trim();
  const lastName = basics.lastName.trim();
  if (!firstName || !lastName) throw new Error("Το όνομα και το επώνυμο είναι απαραίτητα.");
  if (!Number.isFinite(basics.heightCm) || basics.heightCm <= 0) throw new Error("Το ύψος είναι απαραίτητο.");
  const birthDate = new Date(basics.birthDate);
  if (Number.isNaN(birthDate.getTime())) throw new Error("Η ημερομηνία γέννησης δεν είναι έγκυρη.");

  await prisma.client.update({
    where: { id },
    data: { firstName, lastName, sex: basics.sex, birthDate, heightCm: basics.heightCm, phone: basics.phone.trim(), email: trimOrNull(basics.email) },
  });
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/clients/[id]", "page");
};
