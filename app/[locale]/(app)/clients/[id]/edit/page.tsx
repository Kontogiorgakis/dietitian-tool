import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { NewClientForm } from "@/components/metro/new-client-form";
import { prisma } from "@/lib/db";
import { toDateKey } from "@/lib/metro/dates";
import { ClientPageProps } from "@/types/page-props";

// Στοιχεία: the basics, editable. The history has its own screen.
const EditClientPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const client = await prisma.client.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, sex: true, birthDate: true, heightCm: true, phone: true, email: true },
  });
  if (!client) notFound();

  return <NewClientForm step={1} edit={{ ...client, birthDate: toDateKey(client.birthDate) }} />;
};

export default EditClientPage;
