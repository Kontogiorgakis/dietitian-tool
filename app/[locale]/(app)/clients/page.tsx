import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ClientList, ClientTable } from "@/components/metro/client-list";
import { ClientSearch } from "@/components/metro/client-search";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { listClients } from "@/lib/metro/queries";
import { BasePageProps } from "@/types/page-props";

interface ClientsPageProps extends BasePageProps {
  searchParams: Promise<{ q?: string }>;
}

// Πελάτες: the practice's home screen. A list at 390, a full-width table at 1024 and above, no rail.
const ClientsPage = async ({ params, searchParams }: ClientsPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = "" } = await searchParams;
  const [t, clients] = await Promise.all([getTranslations("Clients"), listClients(q)]);

  return (
    <div className="relative flex min-h-svh flex-col">
      <header className="flex flex-col gap-3.5 px-gutter pt-[18px] pb-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10 lg:pt-8 lg:pb-5">
        <div className="flex items-baseline justify-between gap-3 lg:justify-start">
          <h1 className="text-title-l">{t("title")}</h1>
          <span className="text-caption text-ink-muted">{t("count", { count: clients.length })}</span>
        </div>
        <div className="flex items-center gap-4">
          <ClientSearch initialQuery={q} className="w-full lg:w-[360px]" />
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/clients/new">
              <Plus strokeWidth={1.6} aria-hidden="true" />
              {t("newClient")}
            </Link>
          </Button>
        </div>
      </header>

      {/* The FAB clears the last row by space-16 of scroll padding so it never covers one. */}
      <main className="flex-1 px-gutter pb-16 lg:hidden">
        <ClientList clients={clients} query={q} />
      </main>
      <main className="hidden flex-1 px-10 pb-10 lg:block">
        <ClientTable clients={clients} query={q} />
      </main>

      <Button asChild variant="fab" className="fixed right-gutter bottom-[calc(64px+16px)] z-30 pr-[22px] pl-[18px] lg:hidden">
        <Link href="/clients/new">
          <Plus strokeWidth={1.6} aria-hidden="true" />
          {t("newClient")}
        </Link>
      </Button>
    </div>
  );
};

export default ClientsPage;
