import { setRequestLocale } from "next-intl/server";

import { NewClientForm } from "@/components/metro/new-client-form";
import { BasePageProps } from "@/types/page-props";

// Νέος πελάτης, step 1: what the practice cannot work without.
const NewClientPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NewClientForm step={1} />;
};

export default NewClientPage;
