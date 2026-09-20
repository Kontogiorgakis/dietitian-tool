import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { MeasurementForm } from "@/components/metro/measurement-form";
import { BackLink } from "@/components/metro/screen-chrome";
import { ageAt, fullName } from "@/lib/metro/format";
import { getClient, getDraft } from "@/lib/metro/queries";
import { ClientPageProps } from "@/types/page-props";

// Νέα μέτρηση: a full measurement entered in under a minute.
const NewMeasurementPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [client, draft] = await Promise.all([getClient(id), getDraft(id)]);
  if (!client) notFound();

  const previous = client.measurements[client.measurements.length - 1] ?? null;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-gutter pt-3.5 pb-2 lg:hidden">
        <BackLink href={`/clients/${client.id}`} label={fullName(client)} />
      </header>
      <MeasurementForm clientId={client.id} sex={client.sex} age={ageAt(client.birthDate)} heightCm={client.heightCm} previous={previous} draft={draft} />
    </div>
  );
};

export default NewMeasurementPage;
