import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AppointmentForm } from "@/components/metro/appointment-form";
import { PageHeader } from "@/components/metro/page-header";
import { BackLink } from "@/components/metro/screen-chrome";
import { toDateKey } from "@/lib/metro/dates";
import { formatDate } from "@/lib/metro/format";
import { getAppointment, listClientNames } from "@/lib/metro/queries";
import { ClientPageProps } from "@/types/page-props";

const EditAppointmentPage = async ({ params }: ClientPageProps) => {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [t, appointment, clients] = await Promise.all([getTranslations("Appointments"), getAppointment(id), listClientNames()]);
  if (!appointment) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <div className="px-gutter pt-3.5 lg:px-10 lg:pt-8">
        <BackLink href={`/appointments?week=${toDateKey(appointment.startsAt)}`} label={t("title")} />
      </div>
      <PageHeader title={t("editAppointment")} meta={formatDate(appointment.startsAt)} className="pt-1 lg:pt-1" />
      <AppointmentForm clients={clients} initial={appointment} />
    </div>
  );
};

export default EditAppointmentPage;
