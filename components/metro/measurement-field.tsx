"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

interface MeasurementFieldProps {
  id: string;
  icon: LucideIcon;
  label: string;
  unit?: string;
  /** Formatted previous value, shown as "πριν: 74,1" beside the label. */
  previous?: string | null;
  /** Output, never input: appears beneath the field once its inputs are complete. */
  derived?: string | null;
  value: string;
  onChange: (value: string) => void;
  /** Decimal keypad with the comma as the decimal point, or free text (blood pressure). */
  mode?: "decimal" | "text";
  placeholder?: string;
  className?: string;
}

/*
 * The numeric field the whole measurement screen is built from. No spinners, no
 * stepper arrows; selecting the field selects its whole value so overtyping is one
 * gesture. Leave it empty rather than pre-filling the previous value.
 */
export const MeasurementField = ({ id, icon: Icon, label, unit, previous, derived, value, onChange, mode = "decimal", placeholder, className }: MeasurementFieldProps) => {
  const t = useTranslations("Measurement");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2.5">
        <label htmlFor={id} className="flex items-center gap-1.5 text-label text-ink-muted">
          <Icon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
          {label}
        </label>
        {previous && <span className="text-caption text-ink-muted">{t("previous", { value: previous })}</span>}
      </div>
      <div className="flex h-field items-center gap-2 rounded-md border border-border-field bg-surface-field px-3.5 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
        <input
          id={id}
          type="text"
          inputMode={mode === "decimal" ? "decimal" : "text"}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          className={cn("min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-soft", mode === "decimal" ? "text-num-m" : "text-body")}
        />
        {unit && <span className="shrink-0 text-body text-ink-soft">{unit}</span>}
      </div>
      {derived && <p className="text-caption text-ink-soft">{derived}</p>}
    </div>
  );
};
