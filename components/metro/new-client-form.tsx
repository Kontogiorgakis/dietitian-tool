"use client";

import type { Client, GoalDirection, Sex } from "@prisma/client";
import { Cake, Check, Coffee, Compass, Flag, Footprints, HeartPulse, type LucideIcon, Mail, Phone, Pill, Ruler, Salad, ShieldAlert, Stethoscope, Target, User, UserRound, VenusAndMars, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { BackLink, StickyBar } from "@/components/metro/screen-chrome";
import { SectionCard } from "@/components/metro/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { ageAt, formatNum, parseDecimal } from "@/lib/metro/format";
import { cn } from "@/lib/utils";
import { createClient, updateClientBasics, updateClientHistory } from "@/server_actions/clients";
import type { ClientBasics } from "@/types/metro";

/*
 * Adding a client in two steps, so the second one can wait. Step 1 (Βασικά) files
 * the client; step 2 (Ιστορικό) is its own route, so "Αργότερα" is a real escape
 * and the same screen completes a skipped history later.
 */
type NewClientFormProps =
  | { step: 1; edit?: ClientBasics & { id: string } }
  | { step: 2; client: Pick<Client, "id" | "goalText" | "targetWeightKg" | "goalDirection" | "activityLevel" | "medicalHistory" | "medication" | "allergies" | "intolerances" | "conditions" | "dietPreferences" | "habits"> };

const SEX_OPTIONS: Sex[] = ["FEMALE", "MALE", "OTHER"];
const DIRECTION_OPTIONS: GoalDirection[] = ["LOSE", "GAIN", "MAINTAIN"];
/** Stored as the label text, so an older free-text value still shows. */
const ACTIVITY_KEYS = ["sedentary", "light", "moderate", "active"] as const;

interface FieldProps {
  id: string;
  icon: LucideIcon;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

const Field = ({ id, icon: Icon, label, required, hint, children, className }: FieldProps) => {
  const t = useTranslations("NewClient");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-label text-ink-muted">
        <Icon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {label}
        {required && <span className="text-caption text-accent">· {t("required")}</span>}
      </label>
      {children}
      {hint && <p className="text-caption text-ink-soft">{hint}</p>}
    </div>
  );
};

interface SegmentedProps<T extends string> {
  icon: LucideIcon;
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  hint?: string;
}

const Segmented = <T extends string>({ icon: Icon, label, value, options, labels, onChange, hint }: SegmentedProps<T>) => (
  <div className="flex flex-col gap-1.5">
    <span className="flex items-center gap-1.5 text-label text-ink-muted">
      <Icon className="size-4" strokeWidth={1.6} aria-hidden="true" />
      {label}
    </span>
    <div role="radiogroup" aria-label={label} className="flex gap-[3px] rounded-md border border-border-field bg-surface-field p-[3px]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[7px] px-2 text-body transition-colors duration-300",
            value === option ? "bg-accent-strong text-on-accent" : "text-ink-muted hover:text-ink"
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
    {hint && <p className="text-caption text-ink-soft">{hint}</p>}
  </div>
);

const Textarea = ({ id, value, onChange, rows = 2, placeholder }: { id: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) => (
  <div className="rounded-md border border-border-field bg-surface-field px-3.5 py-3 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
    <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-soft" />
  </div>
);

/** A number field with its unit pinned right, the same box as the measurement form. */
const UnitInput = ({ id, value, onChange, unit, placeholder }: { id: string; value: string; onChange: (v: string) => void; unit: string; placeholder?: string }) => (
  <div className="flex h-field items-center gap-2 rounded-md border border-border-field bg-surface-field px-3.5 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
    <input id={id} inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 bg-transparent text-num-m text-ink outline-none placeholder:font-normal placeholder:text-ink-soft" />
    <span className="text-body text-ink-soft">{unit}</span>
  </div>
);

const StepColumn = ({ active }: { active: 1 | 2 }) => {
  const t = useTranslations("NewClient.steps");
  const steps = [
    { name: t("basics"), hint: t("basicsHint"), note: null },
    { name: t("history"), hint: t("historyHint"), note: t("historyLater") },
  ];
  return (
    <ol className="flex gap-6 lg:flex-col lg:gap-7 lg:pt-2">
      {steps.map((s, i) => {
        const n = (i + 1) as 1 | 2;
        const done = n < active;
        const on = n === active;
        return (
          <li key={s.name} className="flex flex-1 gap-3 lg:flex-none">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-num-s",
                done && "bg-accent-soft text-accent",
                on && "bg-accent-strong text-on-accent",
                !done && !on && "border border-hairline bg-surface-field text-ink-muted"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={1.6} aria-hidden="true" /> : n}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-body font-semibold", !on && "text-ink-muted")}>{s.name}</span>
              <span className="hidden text-caption text-ink-muted lg:block">{s.hint}</span>
              {s.note && <span className="mt-0.5 hidden text-caption text-ink-soft lg:block">{s.note}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export const NewClientForm = (props: NewClientFormProps) => {
  const t = useTranslations("NewClient");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const edit = props.step === 1 ? props.edit : undefined;
  const [basics, setBasics] = useState({
    firstName: edit?.firstName ?? "",
    lastName: edit?.lastName ?? "",
    sex: edit?.sex ?? ("FEMALE" as Sex),
    birthDate: edit?.birthDate ?? "",
    heightCm: edit ? formatNum(edit.heightCm, 0) : "",
    phone: edit?.phone ?? "",
    email: edit?.email ?? "",
  });
  const initial = props.step === 2 ? props.client : null;
  const [history, setHistory] = useState({
    goalText: initial?.goalText ?? "",
    targetWeightKg: initial?.targetWeightKg === null || initial?.targetWeightKg === undefined ? "" : String(initial.targetWeightKg).replace(".", ","),
    goalDirection: initial?.goalDirection ?? ("LOSE" as GoalDirection),
    activityLevel: initial?.activityLevel ?? "",
    medicalHistory: initial?.medicalHistory ?? "",
    medication: initial?.medication ?? "",
    allergies: initial?.allergies ?? "",
    intolerances: initial?.intolerances ?? "",
    conditions: initial?.conditions ?? "",
    dietPreferences: initial?.dietPreferences ?? "",
    habits: initial?.habits ?? "",
  });

  const setB = (key: keyof typeof basics) => (value: string) => setBasics((b) => ({ ...b, [key]: value }));
  const setH = (key: keyof typeof history) => (value: string) => setHistory((h) => ({ ...h, [key]: value }));

  const submitBasics = () => {
    const heightCm = parseDecimal(basics.heightCm);
    if (!basics.firstName.trim() || !basics.lastName.trim() || !basics.birthDate || heightCm === null) {
      toast(t("errors.required"));
      return;
    }
    startTransition(async () => {
      try {
        const input = { ...basics, heightCm, email: basics.email || null };
        if (edit) {
          await updateClientBasics(edit.id, input);
          router.push(`/clients/${edit.id}`);
          return;
        }
        const { id } = await createClient(input);
        router.push(`/clients/${id}/history`);
      } catch {
        toast(tCommon("saveFailed"));
      }
    });
  };

  const submitHistory = () => {
    if (props.step !== 2) return;
    const id = props.client.id;
    startTransition(async () => {
      try {
        await updateClientHistory(id, { ...history, targetWeightKg: parseDecimal(history.targetWeightKg) });
        router.push(`/clients/${id}`);
      } catch {
        toast(tCommon("saveFailed"));
      }
    });
  };

  const sexLabels: Record<Sex, string> = { FEMALE: t("fields.female"), MALE: t("fields.male"), OTHER: t("fields.other") };
  const directionLabels: Record<GoalDirection, string> = { LOSE: t("fields.lose"), GAIN: t("fields.gain"), MAINTAIN: t("fields.maintain") };
  const activityLabels = Object.fromEntries(ACTIVITY_KEYS.map((k) => [t(`activity.${k}`), t(`activity.${k}`)])) as Record<string, string>;
  const activityOptions = ACTIVITY_KEYS.map((k) => t(`activity.${k}`));
  const pair = "grid gap-4 sm:grid-cols-2 sm:gap-3";
  const laterHref = props.step === 2 ? `/clients/${props.client.id}` : "/clients";
  const title = edit ? t("editTitle") : t("title");
  let primaryLabel = t("save");
  if (edit) primaryLabel = t("saveBasics");
  else if (props.step === 1) primaryLabel = t("continue");

  // The live preview: the list row this client will become, as she types.
  const previewName = `${basics.firstName} ${basics.lastName}`.trim();
  const birth = basics.birthDate ? new Date(basics.birthDate) : null;
  const age = birth && !Number.isNaN(birth.getTime()) ? ageAt(birth) : null;
  const height = parseDecimal(basics.heightCm);
  const preview = (
    <SectionCard icon={UserRound} tone="sage" title={t("preview.title")} subtitle={t("preview.hint")}>
      <div className="flex items-center gap-3">
        <UserAvatar name={previewName || "?"} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className={cn("truncate text-body font-semibold", previewName ? "text-ink" : "text-ink-soft")}>{previewName || t("preview.namePlaceholder")}</span>
          <span className="text-caption text-ink-muted">
            {t("preview.meta", { age: age === null ? t("preview.unknownAge") : String(age), height: height === null ? t("preview.unknownHeight") : formatNum(height, 0) })}
          </span>
        </div>
      </div>
    </SectionCard>
  );

  const actions = (
    <>
      <Button onClick={props.step === 1 ? submitBasics : submitHistory} loading={isPending} className="w-full lg:w-auto">
        {primaryLabel}
      </Button>
      {props.step === 2 && (
        <Button asChild variant="quiet" className="w-full lg:w-auto">
          <Link href={laterHref}>{t("later")}</Link>
        </Button>
      )}
    </>
  );

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex flex-col gap-1 px-gutter pt-3.5 pb-2 lg:px-10 lg:pt-8 lg:pb-4">
        <BackLink href={edit ? `/clients/${edit.id}` : "/clients"} label={edit ? `${edit.firstName} ${edit.lastName}` : tCommon("clients")} />
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-display">{title}</h1>
          {props.step === 2 && (
            <Link href={laterHref} className="text-body text-accent lg:hidden">
              {t("later")}
            </Link>
          )}
        </div>
        {!edit && <p className="max-w-[64ch] text-body text-ink-muted">{props.step === 1 ? t("intro1") : t("intro2")}</p>}
      </header>

      {!edit && (
        <div className="px-gutter pt-2 pb-4 lg:hidden">
          <StepColumn active={props.step} />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-6 px-gutter pb-6 lg:flex-row lg:gap-10 lg:px-10 lg:pb-10">
        {(!edit || props.step === 1) && (
          <aside className="hidden w-[260px] shrink-0 flex-col gap-8 lg:flex">
            {!edit && <StepColumn active={props.step} />}
            {props.step === 1 && preview}
          </aside>
        )}

        <form className="flex w-full min-w-0 flex-col gap-4 lg:max-w-[640px] lg:gap-6" onSubmit={(e) => e.preventDefault()}>
          {props.step === 1 ? (
            <>
              <div className="lg:hidden">{preview}</div>
              <SectionCard icon={User} tone="sage" title={t("cards.identity")} subtitle={t("cards.identityHint")} contentClassName="flex flex-col gap-4">
                <div className={pair}>
                  <Field id="firstName" icon={User} label={t("fields.firstName")} required>
                    <Input id="firstName" autoComplete="given-name" value={basics.firstName} onChange={(e) => setB("firstName")(e.target.value)} />
                  </Field>
                  <Field id="lastName" icon={User} label={t("fields.lastName")} required>
                    <Input id="lastName" autoComplete="family-name" value={basics.lastName} onChange={(e) => setB("lastName")(e.target.value)} />
                  </Field>
                </div>
                <div className={pair}>
                  <Segmented icon={VenusAndMars} label={t("fields.sex")} value={basics.sex} options={SEX_OPTIONS} labels={sexLabels} onChange={(v) => setBasics((b) => ({ ...b, sex: v }))} />
                  <Field id="birthDate" icon={Cake} label={t("fields.birthDate")} required>
                    <Input id="birthDate" type="date" value={basics.birthDate} onChange={(e) => setB("birthDate")(e.target.value)} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={Phone} tone="teal" title={t("cards.contact")} subtitle={t("cards.contactHint")} contentClassName="flex flex-col gap-4">
                <div className={pair}>
                  <Field id="phone" icon={Phone} label={t("fields.phone")} hint={t("preview.phoneHint")}>
                    <Input id="phone" type="tel" autoComplete="tel" value={basics.phone} onChange={(e) => setB("phone")(e.target.value)} />
                  </Field>
                  <Field id="email" icon={Mail} label={t("fields.email")}>
                    <Input id="email" type="email" autoComplete="email" placeholder={t("fields.optional")} value={basics.email} onChange={(e) => setB("email")(e.target.value)} />
                  </Field>
                </div>
                <Field id="heightCm" icon={Ruler} label={t("fields.height")} required hint={t("preview.heightHint")} className="sm:max-w-[50%] sm:pr-1.5">
                  <UnitInput id="heightCm" value={basics.heightCm} onChange={setB("heightCm")} unit="cm" placeholder="165" />
                </Field>
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard icon={Target} tone="sage" title={t("cards.goal")} subtitle={t("cards.goalHint")} contentClassName="flex flex-col gap-4">
                <Field id="goalText" icon={Target} label={t("fields.goal")}>
                  <Input id="goalText" placeholder={t("fields.goalPlaceholder")} value={history.goalText} onChange={(e) => setH("goalText")(e.target.value)} />
                </Field>
                <div className={pair}>
                  <Segmented icon={Compass} label={t("fields.goalDirection")} value={history.goalDirection} options={DIRECTION_OPTIONS} labels={directionLabels} onChange={(v) => setHistory((h) => ({ ...h, goalDirection: v }))} />
                  <Field id="targetWeightKg" icon={Flag} label={t("fields.targetWeight")} hint={t("preview.targetHint")}>
                    <UnitInput id="targetWeightKg" value={history.targetWeightKg} onChange={setH("targetWeightKg")} unit="kg" placeholder="70,0" />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={Stethoscope} tone="clay" title={t("cards.medical")} subtitle={t("cards.medicalHint")} contentClassName="flex flex-col gap-4">
                <Field id="conditions" icon={HeartPulse} label={t("fields.conditions")}>
                  <Textarea id="conditions" value={history.conditions} onChange={setH("conditions")} />
                </Field>
                <div className={pair}>
                  <Field id="medication" icon={Pill} label={t("fields.medication")}>
                    <Textarea id="medication" value={history.medication} onChange={setH("medication")} />
                  </Field>
                  <Field id="medicalHistory" icon={Stethoscope} label={t("fields.medicalHistory")}>
                    <Textarea id="medicalHistory" value={history.medicalHistory} onChange={setH("medicalHistory")} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={ShieldAlert} tone="sand" title={t("cards.allergies")} subtitle={t("cards.allergiesHint")} contentClassName="flex flex-col gap-4">
                <div className={pair}>
                  <Field id="allergies" icon={ShieldAlert} label={t("fields.allergies")}>
                    <Textarea id="allergies" value={history.allergies} onChange={setH("allergies")} />
                  </Field>
                  <Field id="intolerances" icon={Wheat} label={t("fields.intolerances")}>
                    <Textarea id="intolerances" value={history.intolerances} onChange={setH("intolerances")} />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard icon={Footprints} tone="teal" title={t("cards.lifestyle")} subtitle={t("cards.lifestyleHint")} contentClassName="flex flex-col gap-4">
                <Segmented icon={Footprints} label={t("fields.activityLevel")} value={history.activityLevel} options={activityOptions} labels={activityLabels} onChange={setH("activityLevel")} />
                <div className={pair}>
                  <Field id="dietPreferences" icon={Salad} label={t("fields.dietPreferences")}>
                    <Textarea id="dietPreferences" value={history.dietPreferences} onChange={setH("dietPreferences")} />
                  </Field>
                  <Field id="habits" icon={Coffee} label={t("fields.habits")}>
                    <Textarea id="habits" value={history.habits} onChange={setH("habits")} />
                  </Field>
                </div>
              </SectionCard>
            </>
          )}

          <div className="hidden justify-end gap-2 pt-2 lg:flex lg:flex-row-reverse">{actions}</div>
        </form>

      </div>

      <StickyBar className="lg:hidden">{actions}</StickyBar>
    </div>
  );
};
