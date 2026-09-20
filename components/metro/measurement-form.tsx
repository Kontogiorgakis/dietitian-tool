"use client";

import type { Measurement, Sex } from "@prisma/client";
import { Activity, ChevronDown, ChevronUp, Droplets, Dumbbell, HeartPulse, Layers, type LucideIcon, NotebookPen, Percent, Ruler, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { MeasurementField } from "@/components/metro/measurement-field";
import { StickyBar } from "@/components/metro/screen-chrome";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { bmi, fatMassKg, leanMassKg, skinfoldBodyFatPct, whtr } from "@/lib/metro/calc";
import { formatDayMonth, formatNum, formatTime, parseDecimal } from "@/lib/metro/format";
import { cn } from "@/lib/utils";
import { saveMeasurement, saveMeasurementDraft } from "@/server_actions/measurements";
import { EMPTY_MEASUREMENT, type MeasurementValues } from "@/types/metro";

interface MeasurementFormProps {
  clientId: string;
  sex: Sex;
  age: number;
  heightCm: number;
  /** The last saved visit, whose values sit beside every field as "πριν". */
  previous: Measurement | null;
  /** An autosaved visit in progress, if the form was left half way. */
  draft: Measurement | null;
}

type FieldKey = keyof MeasurementValues;
type Draft = Record<FieldKey, string>;
type SectionKey = "weight" | "circumferences" | "composition" | "skinfolds" | "clinical" | "notes";

const AUTOSAVE_MS = 800;
const NUMERIC_KEYS: FieldKey[] = [
  "weightKg", "waistCm", "hipCm", "chestCm", "armCm", "thighCm", "bodyFatPct", "leanMassKg", "waterPct",
  "skinfoldBicepsMm", "skinfoldTricepsMm", "skinfoldSubscapularMm", "skinfoldSuprailiacMm", "pulseBpm",
];

// Λιπομετρία and Κλινικά start collapsed on the phone; at 1024 and above every section is open.
const SECTION_ICONS: Record<SectionKey, LucideIcon> = { weight: Scale, circumferences: Ruler, composition: Percent, skinfolds: Layers, clinical: HeartPulse, notes: NotebookPen };

const INITIAL_OPEN: Record<SectionKey, boolean> = { weight: true, circumferences: true, composition: true, skinfolds: false, clinical: false, notes: true };

const toDraft = (m: Measurement | null): Draft => {
  const d = {} as Draft;
  for (const key of Object.keys(EMPTY_MEASUREMENT) as FieldKey[]) {
    const v = m?.[key] ?? null;
    if (v === null) d[key] = "";
    else d[key] = typeof v === "number" ? formatNum(v, key === "pulseBpm" ? 0 : 1) : v;
  }
  return d;
};

const toValues = (d: Draft): MeasurementValues => {
  const v = { ...EMPTY_MEASUREMENT };
  for (const key of NUMERIC_KEYS) (v as Record<FieldKey, number | string | null>)[key] = parseDecimal(d[key]);
  v.pulseBpm = v.pulseBpm === null ? null : Math.round(v.pulseBpm);
  v.bloodPressure = d.bloodPressure || null;
  v.note = d.note || null;
  return v;
};

const prev = (m: Measurement | null, key: FieldKey, decimals = 1): string | null => {
  const v = m?.[key];
  if (v === null || v === undefined) return null;
  return typeof v === "number" ? formatNum(v, decimals) : v;
};

export const MeasurementForm = ({ clientId, sex, age, heightCm, previous, draft }: MeasurementFormProps) => {
  const t = useTranslations("Measurement");
  const tCommon = useTranslations("Common");
  const router = useRouter();

  const [values, setValues] = useState<Draft>(() => toDraft(draft));
  const [open, setOpen] = useState(INITIAL_OPEN);
  const [savedAt, setSavedAt] = useState<Date | null>(draft ? draft.updatedAt : null);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const draftId = useRef<string | undefined>(draft?.id);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const set = useCallback((key: FieldKey) => (value: string) => {
    dirty.current = true;
    setValues((v) => ({ ...v, [key]: value }));
  }, []);

  const toggle = (key: SectionKey) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const onSave = () => {
    if (timer.current) clearTimeout(timer.current);
    startTransition(async () => {
      try {
        await saveMeasurement({ clientId, draftId: draftId.current, values: toValues(values) });
        router.push(`/clients/${clientId}`);
      } catch {
        toast(tCommon("saveFailed"));
      }
    });
  };

  // Derived values, live as she types. They are never inputs and never take ink weight.
  const parsed = toValues(values);
  const bmiText = parsed.weightKg === null ? null : t("derived.bmi", { value: formatNum(bmi(parsed.weightKg, heightCm)) });
  const whtrText = parsed.waistCm === null ? null : t("derived.whtr", { value: formatNum(whtr(parsed.waistCm, heightCm), 2) });
  const skinfoldsComplete =
    parsed.skinfoldBicepsMm !== null && parsed.skinfoldTricepsMm !== null && parsed.skinfoldSubscapularMm !== null && parsed.skinfoldSuprailiacMm !== null;
  const skinfoldFat = skinfoldsComplete
    ? skinfoldBodyFatPct({
        skinfolds: { biceps: parsed.skinfoldBicepsMm!, triceps: parsed.skinfoldTricepsMm!, subscapular: parsed.skinfoldSubscapularMm!, suprailiac: parsed.skinfoldSuprailiacMm! },
        sex,
        age,
      })
    : null;
  const fatPct = parsed.bodyFatPct ?? skinfoldFat;
  const fatMass = parsed.weightKg !== null && fatPct !== null ? fatMassKg(parsed.weightKg, fatPct) : null;
  const leanMass = parsed.leanMassKg ?? (parsed.weightKg !== null && fatPct !== null ? leanMassKg(parsed.weightKg, fatPct) : null);
  const skinfoldText =
    skinfoldFat !== null && parsed.weightKg !== null
      ? t("derived.skinfolds", { fat: formatNum(skinfoldFat), fatMass: formatNum(fatMassKg(parsed.weightKg, skinfoldFat)), lean: formatNum(leanMassKg(parsed.weightKg, skinfoldFat)) })
      : null;

  const prevBmi = previous?.weightKg ? formatNum(bmi(previous.weightKg, heightCm)) : null;
  const prevWhtr = previous?.waistCm ? formatNum(whtr(previous.waistCm, heightCm), 2) : null;
  const prevFat = prev(previous, "bodyFatPct");
  const prevFatMass = previous?.weightKg && previous.bodyFatPct ? formatNum(fatMassKg(previous.weightKg, previous.bodyFatPct)) : null;
  const prevLean = prev(previous, "leanMassKg");

  // The quiet autosave: debounced after every change, stamped in the header.
  useEffect(() => {
    if (!dirty.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const result = await saveMeasurementDraft({ clientId, draftId: draftId.current, values: toValues(values) });
        draftId.current = result.id;
        if (isMounted.current) setSavedAt(new Date(result.savedAt));
      } catch {
        if (isMounted.current) toast(tCommon("saveFailed"));
      } finally {
        if (isMounted.current) setSaving(false);
      }
    }, AUTOSAVE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [values, clientId, tCommon]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const section = (key: SectionKey, summary: string | null, body: React.ReactNode, last = false) => {
    const Icon = SECTION_ICONS[key];
    return (
    <section className={cn("flex flex-col border-t border-hairline", last && "border-b")}>
      <button
        type="button"
        onClick={() => toggle(key)}
        aria-expanded={open[key]}
        className="flex min-h-tap w-full cursor-pointer items-center gap-2.5 py-3 text-left lg:cursor-default"
      >
        <Icon className="size-5 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
        <span className="text-title-m">{t(`sections.${key}`)}</span>
        {summary && !open[key] && <span className="ml-1 truncate text-caption text-ink-muted lg:hidden">{summary}</span>}
        <span className="ml-auto flex text-accent lg:hidden">
          {open[key] ? <ChevronUp className="size-5" strokeWidth={1.6} aria-hidden="true" /> : <ChevronDown className="size-5" strokeWidth={1.6} aria-hidden="true" />}
        </span>
      </button>
      <div className={cn("flex-col gap-4 pb-5", open[key] ? "flex" : "hidden lg:flex")}>{body}</div>
    </section>
    );
  };

  const two = "grid grid-cols-2 gap-3";
  let stamp = "";
  if (savedAt) stamp = tCommon("savedAt", { time: formatTime(savedAt) });
  else if (saving) stamp = tCommon("saving");
  const autosave = (
    <span className={cn("flex items-center gap-1.5 text-caption text-ink-soft transition-opacity duration-300", !stamp && "opacity-0")} aria-live="polite">
      <i className={cn("block size-1.5 rounded-full bg-accent transition-opacity duration-300", saving && "opacity-40")} />
      {stamp}
    </span>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 lg:px-12 lg:pb-10">
        <div className="flex min-w-0 flex-1 flex-col lg:max-w-content">
          <div className="flex items-baseline justify-between gap-3 px-gutter pb-3.5 lg:px-0 lg:pt-10 lg:pb-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-title-l">{t("title")}</h1>
              <p className="text-caption text-ink-muted">
                {t("visitLine", { date: formatDayMonth(new Date()) })}
                {" · "}
                {previous ? t("previousVisit", { date: formatDayMonth(previous.visitedAt) }) : t("noPrevious")}
              </p>
            </div>
            {autosave}
          </div>

          <form className="flex flex-col px-gutter pb-6 lg:px-0" onSubmit={(e) => e.preventDefault()}>
            {section("weight", null,
              <MeasurementField id="weightKg" icon={Scale} label={t("fields.weight")} unit="kg" previous={prev(previous, "weightKg")} derived={bmiText} value={values.weightKg} onChange={set("weightKg")} />
            )}
            {section("circumferences", null, (
              <>
                <MeasurementField id="waistCm" icon={Ruler} label={t("fields.waist")} unit="cm" previous={prev(previous, "waistCm")} derived={whtrText} value={values.waistCm} onChange={set("waistCm")} />
                <div className={two}>
                  <MeasurementField id="hipCm" icon={Ruler} label={t("fields.hip")} unit="cm" previous={prev(previous, "hipCm")} value={values.hipCm} onChange={set("hipCm")} />
                  <MeasurementField id="chestCm" icon={Ruler} label={t("fields.chest")} unit="cm" previous={prev(previous, "chestCm")} value={values.chestCm} onChange={set("chestCm")} />
                </div>
                <div className={two}>
                  <MeasurementField id="armCm" icon={Ruler} label={t("fields.arm")} unit="cm" previous={prev(previous, "armCm")} value={values.armCm} onChange={set("armCm")} />
                  <MeasurementField id="thighCm" icon={Ruler} label={t("fields.thigh")} unit="cm" previous={prev(previous, "thighCm")} value={values.thighCm} onChange={set("thighCm")} />
                </div>
              </>
            ))}
            {section("composition", null, (
              <>
                <div className={two}>
                  <MeasurementField id="bodyFatPct" icon={Percent} label={t("fields.bodyFat")} unit="%" previous={prevFat} value={values.bodyFatPct} onChange={set("bodyFatPct")} />
                  <MeasurementField id="leanMassKg" icon={Dumbbell} label={t("fields.leanMass")} unit="kg" previous={prevLean} value={values.leanMassKg} onChange={set("leanMassKg")} />
                </div>
                <MeasurementField id="waterPct" icon={Droplets} label={t("fields.water")} unit="%" previous={prev(previous, "waterPct")} value={values.waterPct} onChange={set("waterPct")} />
              </>
            ))}
            {section("skinfolds", prevFat ? t("summaries.skinfoldsPrev", { fat: prevFat }) : t("summaries.skinfolds"), (
              <>
                <div className={two}>
                  <MeasurementField id="skinfoldBicepsMm" icon={Layers} label={t("fields.biceps")} unit="mm" previous={prev(previous, "skinfoldBicepsMm")} value={values.skinfoldBicepsMm} onChange={set("skinfoldBicepsMm")} />
                  <MeasurementField id="skinfoldTricepsMm" icon={Layers} label={t("fields.triceps")} unit="mm" previous={prev(previous, "skinfoldTricepsMm")} value={values.skinfoldTricepsMm} onChange={set("skinfoldTricepsMm")} />
                </div>
                <div className={two}>
                  <MeasurementField id="skinfoldSubscapularMm" icon={Layers} label={t("fields.subscapular")} unit="mm" previous={prev(previous, "skinfoldSubscapularMm")} value={values.skinfoldSubscapularMm} onChange={set("skinfoldSubscapularMm")} />
                  <MeasurementField id="skinfoldSuprailiacMm" icon={Layers} label={t("fields.suprailiac")} unit="mm" previous={prev(previous, "skinfoldSuprailiacMm")} value={values.skinfoldSuprailiacMm} onChange={set("skinfoldSuprailiacMm")} />
                </div>
                <p className="text-caption text-ink-soft">{skinfoldText ?? t("derived.skinfoldsHint")}</p>
              </>
            ))}
            {section("clinical", t("summaries.clinical"), (
              <div className={two}>
                <MeasurementField id="bloodPressure" icon={HeartPulse} label={t("fields.bloodPressure")} unit="mmHg" mode="text" previous={prev(previous, "bloodPressure")} value={values.bloodPressure} onChange={set("bloodPressure")} placeholder="120/80" />
                <MeasurementField id="pulseBpm" icon={Activity} label={t("fields.pulse")} unit="bpm" previous={prev(previous, "pulseBpm", 0)} value={values.pulseBpm} onChange={set("pulseBpm")} />
              </div>
            ))}
            {section("notes", null, (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="note" className="flex items-center gap-1.5 text-label text-ink-muted">
                  <NotebookPen className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                  {t("fields.note")}
                </label>
                <div className="rounded-md border border-border-field bg-surface-field px-3.5 py-3 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
                  <textarea
                    id="note"
                    rows={3}
                    value={values.note}
                    onChange={(e) => set("note")(e.target.value)}
                    placeholder={t("fields.notePlaceholder")}
                    className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-soft"
                  />
                </div>
              </div>
            ), true)}
          </form>

          <div className="hidden justify-end gap-2 pt-6 lg:flex">
            <Button asChild variant="quiet">
              <Link href={`/clients/${clientId}`}>{tCommon("cancel")}</Link>
            </Button>
            <Button onClick={onSave} loading={isPending}>{t("save")}</Button>
          </div>
        </div>

        {/* At 1024 and above the field-by-field consistency check happens at a glance. */}
        <aside className="sticky top-10 mt-10 hidden w-[280px] shrink-0 flex-col gap-3.5 rounded-lg border border-hairline bg-surface-raised p-5 lg:flex">
          <h3 className="text-label text-ink-muted">{t("derivedTitle")}</h3>
          {[
            [t("derived.bmiLabel"), parsed.weightKg === null ? null : formatNum(bmi(parsed.weightKg, heightCm)), "", prevBmi],
            [t("derived.whtrLabel"), parsed.waistCm === null ? null : formatNum(whtr(parsed.waistCm, heightCm), 2), "", prevWhtr],
            [t("derived.fatLabel"), fatPct === null ? null : formatNum(fatPct), "%", prevFat],
            [t("derived.fatMassLabel"), fatMass === null ? null : formatNum(fatMass), "kg", prevFatMass],
            [t("derived.leanLabel"), leanMass === null ? null : formatNum(leanMass), "kg", prevLean],
          ].map(([label, value, unit, before], i) => (
            <div key={label} className={cn("flex items-baseline justify-between gap-2.5", i > 0 && "border-t border-hairline pt-3")}>
              <span className="text-body text-ink-muted">{label}</span>
              <span className="flex flex-col items-end">
                <span className={cn("text-num-m", value === null && "text-ink-soft")}>
                  {value ?? "—"}
                  {value !== null && unit && <span className="text-num-s text-ink-soft"> {unit}</span>}
                </span>
                {before && <span className="text-caption text-ink-muted">{t("previous", { value: before })}</span>}
              </span>
            </div>
          ))}
        </aside>
      </div>

      <div className="flex-1 lg:hidden" />
      <StickyBar className="lg:hidden">
        <Button onClick={onSave} loading={isPending} className="w-full">{t("save")}</Button>
      </StickyBar>
    </div>
  );
};
