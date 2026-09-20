import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { NewClientForm } from "@/components/metro/new-client-form";
import { prisma } from "@/lib/db";
import { ClientPageProps } from "@/types/page-props";

// Νέος πελάτης, step 2: the history, which can always wait. Also completes a skipped history later.
const ClientHistoryPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      goalText: true,
      targetWeightKg: true,
      goalDirection: true,
      activityLevel: true,
      medicalHistory: true,
      medication: true,
      allergies: true,
      intolerances: true,
      conditions: true,
      dietPreferences: true,
      habits: true,
    },
  });
  if (!client) notFound();

  return <NewClientForm step={2} client={client} />;
};

export default ClientHistoryPage;
