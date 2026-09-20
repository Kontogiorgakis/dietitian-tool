"use client";

import { CalendarDays, ClipboardList, House, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

/** The routes that carry the tab bar. Client screens have a sticky action bar instead, so the two never stack. */
const TAB_ROUTES = ["/", "/clients", "/visits", "/appointments", "/settings"];

/*
 * Phone navigation below 1024: four tabs, always visible, thumb-reachable.
 * Rendered after the page content so its spacer keeps the last row clear.
 */
export const BottomTabBar = () => {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  if (!TAB_ROUTES.includes(pathname)) return null;

  const tabs = [
    { href: "/", label: t("home"), icon: House },
    { href: "/clients", label: t("clients"), icon: Users },
    { href: "/appointments", label: t("appointments"), icon: CalendarDays },
    { href: "/visits", label: t("visits"), icon: ClipboardList },
  ];

  return (
    <>
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-hairline bg-surface-raised pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label={t("mainNav")}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex min-h-tap flex-1 flex-col items-center justify-center gap-1 text-caption transition-colors duration-300", active ? "text-accent" : "text-ink-muted")}
            >
              <tab.icon className="size-5" strokeWidth={active ? 2 : 1.6} aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
