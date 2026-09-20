"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface ClientSearchProps {
  initialQuery: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

const DEBOUNCE_MS = 250;

/** Filters on name or phone as you type. The field keeps focus while the list narrows below it. */
export const ClientSearch = ({ initialQuery, placeholder, label, className }: ClientSearchProps) => {
  const t = useTranslations("Clients");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (value: string) => {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(() => {
        router.replace(value.trim() ? { pathname, query: { q: value.trim() } } : pathname, { scroll: false });
      });
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <label
      className={cn(
        "flex h-field items-center gap-2.5 rounded-full border border-border-field bg-surface-field px-4 text-ink-soft transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised",
        className
      )}
    >
      <Search className="size-5" strokeWidth={1.6} aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        aria-label={label ?? t("searchLabel")}
        className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-soft"
      />
    </label>
  );
};
