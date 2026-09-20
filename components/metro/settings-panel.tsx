"use client";

import { Languages, type LucideIcon, Moon, Smartphone, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}

const SettingRow = ({ icon: Icon, label, children }: SettingRowProps) => (
  <div className="flex flex-col gap-2 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
    <span className="flex items-center gap-1.5 text-body text-ink">
      <Icon className="size-4 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
      {label}
    </span>
    {children}
  </div>
);

const segmentClass = (on: boolean) =>
  cn("flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[7px] text-body transition-colors duration-300 lg:px-4", on ? "bg-surface-raised text-ink shadow-[0_0_0_1px_var(--hairline)]" : "text-ink-muted");
const subscribeNoop = () => () => {};
const groupClass = "flex gap-[3px] rounded-md border border-border-field bg-surface-field p-[3px] lg:w-[340px]";

/** Theme and language. The theme is read after mount, because next-themes only knows it in the browser. */
export const SettingsPanel = () => {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  // next-themes knows the theme only in the browser; render the system option until hydrated.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const themes: Array<{ value: string; label: string; icon: LucideIcon }> = [
    { value: "system", label: t("themeSystem"), icon: Smartphone },
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
  ];
  const current = mounted ? (theme ?? "system") : "system";

  return (
    <div className="flex flex-col divide-y divide-hairline">
      <SettingRow icon={Sun} label={t("theme")}>
        <div role="radiogroup" aria-label={t("theme")} className={groupClass}>
          {themes.map((option) => (
            <button key={option.value} type="button" role="radio" aria-checked={current === option.value} onClick={() => setTheme(option.value)} className={segmentClass(current === option.value)}>
              <option.icon className="size-4" strokeWidth={1.6} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow icon={Languages} label={t("language")}>
        <div className={groupClass}>
          {(["el", "en"] as const).map((code) => (
            <Link key={code} href={pathname} locale={code} className={segmentClass(locale === code)} aria-current={locale === code ? "true" : undefined}>
              {code === "el" ? t("languageEl") : t("languageEn")}
            </Link>
          ))}
        </div>
      </SettingRow>
    </div>
  );
};
