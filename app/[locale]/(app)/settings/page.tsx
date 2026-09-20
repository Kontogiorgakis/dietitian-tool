import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/metro/page-header";
import { SettingsPanel } from "@/components/metro/settings-panel";
import { prisma } from "@/lib/db";
import packageJson from "@/package.json";
import { BasePageProps } from "@/types/page-props";

// Ρυθμίσεις: appearance and language, plus a line about the practice.
const SettingsPage = async ({ params }: BasePageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, clients, visits] = await Promise.all([getTranslations("Settings"), prisma.client.count(), prisma.measurement.count({ where: { draft: false } })]);

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader title={t("title")} />
      <main className="flex flex-1 flex-col gap-10 px-gutter pb-10 lg:max-w-content lg:px-10">
        <section className="flex flex-col">
          <h2 className="border-b border-hairline pb-2 text-title-m">{t("appearance")}</h2>
          <SettingsPanel />
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="border-b border-hairline pb-2 text-title-m">{t("practice")}</h2>
          <p className="pt-2 text-body text-ink-muted">
            {t("clientsCount", { count: clients })} · {t("visitsCount", { count: visits })}
          </p>
          <p className="text-caption text-ink-soft">{t("version", { version: packageJson.version })}</p>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
