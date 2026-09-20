import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/general/site-url";
import { routing } from "@/lib/i18n/routing";
import { BaseLayoutProps } from "@/types/page-props";

// Source Sans 3 ships a complete Greek set with real tonos. Only 400, 500 and 600.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Μέτρο",
  description: "Μετρήσεις και πρόοδος πελατών διαιτολογικού γραφείου.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#191714" },
  ],
};

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

const LocaleLayout = async ({ children, params }: BaseLayoutProps) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sourceSans.variable} font-sans`}>
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default LocaleLayout;
