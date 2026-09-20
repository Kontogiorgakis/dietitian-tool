import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppointmentForm } from "@/components/metro/appointment-form";
import { PageHeader } from "@/components/metro/page-header";
import { BackLink } from "@/components/metro/screen-chrome";
import { fromDateKey } from "@/lib/metro/dates";
import { listClientNames } from "@/lib/metro/queries";
import { BasePageProps } from "@/types/page-props";

interface NewAppointmentPageProps extends BasePageProps {
  searchParams: Promise<{ date?: string; client?: string }>;
}

const NewAppointmentPage = async ({ params, searchParams }: NewAppointmentPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const { date, client } = await searchParams;
  const [t, clients] = await Promise.all([getTranslations("Appointments"), listClientNames()]);

  return (
    <div className="flex min-h-svh flex-col">
      <div className="px-gutter pt-3.5 lg:px-10 lg:pt-8">
        <BackLink href="/appointments" label={t("title")} />
      </div>
      <PageHeader title={t("newAppointment")} className="pt-1 lg:pt-1" />
      <AppointmentForm clients={clients} defaultDate={fromDateKey(date) ?? undefined} defaultClientId={client} />
    </div>
  );
};

export default NewAppointmentPage;
