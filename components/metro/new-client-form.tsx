"use client";

import type { Client, GoalDirection, Sex } from "@prisma/client";
import { Cake, Check, Coffee, Compass, Flag, Footprints, type LucideIcon, Mail, Phone, Pill, Ruler, Salad, ShieldAlert, Stethoscope, Target, User, VenusAndMars, Wheat } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { BackLink, StickyBar } from "@/components/metro/screen-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { formatNum, parseDecimal } from "@/lib/metro/format";
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

interface FieldProps {
  id: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

const Field = ({ id, icon: Icon, label, hint, children, className }: FieldProps) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={id} className="flex items-center gap-1.5 text-label text-ink-muted">
      <Icon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
      {label}
    </label>
    {children}
    {hint && <p className="text-caption text-ink-soft">{hint}</p>}
  </div>
);

interface SegmentedProps<T extends string> {
  icon: LucideIcon;
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}

const Segmented = <T extends string>({ icon: Icon, label, value, options, labels, onChange }: SegmentedProps<T>) => (
  <div className="flex flex-col gap-1.5">
    <span className="flex items-center gap-1.5 text-label text-ink-muted">
      <Icon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
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
            "flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[7px] text-body transition-colors duration-300",
            value === option ? "bg-surface-raised text-ink shadow-[0_0_0_1px_var(--hairline)]" : "text-ink-muted"
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  </div>
);

const Textarea = ({ id, value, onChange, rows = 2 }: { id: string; value: string; onChange: (v: string) => void; rows?: number }) => (
  <div className="rounded-md border border-border-field bg-surface-field px-3.5 py-3 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
    <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full resize-none bg-transparent text-body text-ink outline-none" />
  </div>
);

const StepColumn = ({ active }: { active: 1 | 2 }) => {
  const t = useTranslations("NewClient.steps");
  const steps = [
    { name: t("basics"), hint: t("basicsHint"), note: null },
    { name: t("history"), hint: t("historyHint"), note: t("historyLater") },
  ];
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col gap-7 pt-2 lg:flex">
      {steps.map((s, i) => {
        const n = (i + 1) as 1 | 2;
        const done = n < active;
        const on = n === active;
        return (
          <div key={s.name} className="flex gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-num-s",
                done && "bg-accent-soft text-accent",
                on && "bg-accent-strong text-on-accent",
                !done && !on && "border border-hairline bg-surface-field text-ink-muted"
              )}
            >
              {done ? <Check className="size-4" strokeWidth={1.6} aria-hidden="true" /> : n}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-body font-semibold", !on && "text-ink-muted")}>{s.name}</span>
              <span className="text-caption text-ink-muted">{s.hint}</span>
              {s.note && <span className="mt-0.5 text-caption text-ink-soft">{s.note}</span>}
            </div>
          </div>
        );
      })}
    </aside>
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
  const pair = "grid gap-4 lg:grid-cols-2 lg:gap-3";
  const stepName = props.step === 1 ? t("steps.basics") : t("steps.history");
  const laterHref = props.step === 2 ? `/clients/${props.client.id}` : "/clients";
  const title = edit ? t("editTitle") : t("title");
  let primaryLabel = t("save");
  if (edit) primaryLabel = t("saveBasics");
  else if (props.step === 1) primaryLabel = t("continue");

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex flex-col gap-0.5 px-gutter pt-3.5 pb-2 lg:px-12 lg:pt-10 lg:pb-6">
        <BackLink href={edit ? `/clients/${edit.id}` : "/clients"} label={edit ? `${edit.firstName} ${edit.lastName}` : tCommon("clients")} />
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-title-l">{title}</h1>
          {props.step === 2 && (
            <Link href={laterHref} className="text-body text-accent lg:hidden">
              {t("later")}
            </Link>
          )}
        </div>
      </header>

      {/* Phone step indicator: two bars and one caption. */}
      {!edit && (
      <div className="flex flex-col gap-2 px-gutter pt-1.5 pb-5 lg:hidden">
        <div className="flex gap-2">
          <span className="h-[3px] flex-1 rounded-sm bg-accent" />
          <span className={cn("h-[3px] flex-1 rounded-sm", props.step === 2 ? "bg-accent" : "bg-hairline")} />
        </div>
        <p className="text-caption text-ink-muted">{t("stepOf", { step: props.step, name: stepName })}</p>
      </div>
      )}

      <div className="flex flex-1 flex-col lg:flex-row lg:gap-12 lg:px-12 lg:pb-10">
        {!edit && <StepColumn active={props.step} />}

        <form className={cn("flex w-full flex-col gap-4 px-gutter pb-6 lg:w-[640px] lg:px-0", edit && "lg:px-10")} onSubmit={(e) => e.preventDefault()}>
          {!edit && <h2 className="hidden text-title-m lg:block">{stepName}</h2>}

          {props.step === 1 ? (
            <>
              <div className={pair}>
                <Field id="firstName" icon={User} label={t("fields.firstName")}>
                  <Input id="firstName" autoComplete="given-name" value={basics.firstName} onChange={(e) => setB("firstName")(e.target.value)} />
                </Field>
                <Field id="lastName" icon={User} label={t("fields.lastName")}>
                  <Input id="lastName" autoComplete="family-name" value={basics.lastName} onChange={(e) => setB("lastName")(e.target.value)} />
                </Field>
              </div>
              <Segmented icon={VenusAndMars} label={t("fields.sex")} value={basics.sex} options={SEX_OPTIONS} labels={sexLabels} onChange={(v) => setBasics((b) => ({ ...b, sex: v }))} />
              <div className={pair}>
                <Field id="birthDate" icon={Cake} label={t("fields.birthDate")}>
                  <Input id="birthDate" type="date" value={basics.birthDate} onChange={(e) => setB("birthDate")(e.target.value)} />
                </Field>
                <Field id="heightCm" icon={Ruler} label={t("fields.height")}>
                  <div className="flex h-field items-center gap-2 rounded-md border border-border-field bg-surface-field px-3.5 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
                    <input id="heightCm" inputMode="decimal" value={basics.heightCm} onChange={(e) => setB("heightCm")(e.target.value)} className="min-w-0 flex-1 bg-transparent text-num-m text-ink outline-none" />
                    <span className="text-body text-ink-soft">cm</span>
                  </div>
                </Field>
              </div>
              <div className={pair}>
                <Field id="phone" icon={Phone} label={t("fields.phone")}>
                  <Input id="phone" type="tel" autoComplete="tel" value={basics.phone} onChange={(e) => setB("phone")(e.target.value)} />
                </Field>
                <Field id="email" icon={Mail} label={t("fields.email")}>
                  <Input id="email" type="email" autoComplete="email" placeholder={t("fields.optional")} value={basics.email} onChange={(e) => setB("email")(e.target.value)} />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field id="goalText" icon={Target} label={t("fields.goal")}>
                <Input id="goalText" placeholder={t("fields.goalPlaceholder")} value={history.goalText} onChange={(e) => setH("goalText")(e.target.value)} />
              </Field>
              <div className={pair}>
                <Segmented icon={Compass} label={t("fields.goalDirection")} value={history.goalDirection} options={DIRECTION_OPTIONS} labels={directionLabels} onChange={(v) => setHistory((h) => ({ ...h, goalDirection: v }))} />
                <Field id="targetWeightKg" icon={Flag} label={t("fields.targetWeight")}>
                  <div className="flex h-field items-center gap-2 rounded-md border border-border-field bg-surface-field px-3.5 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
                    <input id="targetWeightKg" inputMode="decimal" value={history.targetWeightKg} onChange={(e) => setH("targetWeightKg")(e.target.value)} className="min-w-0 flex-1 bg-transparent text-num-m text-ink outline-none" />
                    <span className="text-body text-ink-soft">kg</span>
                  </div>
                </Field>
              </div>
              <Field id="activityLevel" icon={Footprints} label={t("fields.activityLevel")}>
                <Input id="activityLevel" value={history.activityLevel} onChange={(e) => setH("activityLevel")(e.target.value)} />
              </Field>
              <div className={pair}>
                <Field id="medicalHistory" icon={Stethoscope} label={t("fields.medicalHistory")}>
                  <Textarea id="medicalHistory" value={history.medicalHistory} onChange={setH("medicalHistory")} />
                </Field>
                <Field id="medication" icon={Pill} label={t("fields.medication")} hint={t("fields.feedsAttention")}>
                  <Textarea id="medication" value={history.medication} onChange={setH("medication")} />
                </Field>
              </div>
              <div className={pair}>
                <Field id="allergies" icon={ShieldAlert} label={t("fields.allergies")} hint={t("fields.feedsAttention")}>
                  <Textarea id="allergies" value={history.allergies} onChange={setH("allergies")} />
                </Field>
                <Field id="intolerances" icon={Wheat} label={t("fields.intolerances")} hint={t("fields.feedsAttention")}>
                  <Textarea id="intolerances" value={history.intolerances} onChange={setH("intolerances")} />
                </Field>
              </div>
              <Field id="conditions" icon={Stethoscope} label={t("fields.conditions")} hint={t("fields.feedsAttention")}>
                <Textarea id="conditions" value={history.conditions} onChange={setH("conditions")} />
              </Field>
              <Field id="dietPreferences" icon={Salad} label={t("fields.dietPreferences")}>
                <Textarea id="dietPreferences" value={history.dietPreferences} onChange={setH("dietPreferences")} />
              </Field>
              <Field id="habits" icon={Coffee} label={t("fields.habits")}>
                <Textarea id="habits" value={history.habits} onChange={setH("habits")} />
              </Field>
            </>
          )}

          <div className="hidden justify-end gap-2 pt-4 lg:flex">
            {props.step === 2 && (
              <Button asChild variant="quiet">
                <Link href={laterHref}>{t("later")}</Link>
              </Button>
            )}
            <Button onClick={props.step === 1 ? submitBasics : submitHistory} loading={isPending}>
              {primaryLabel}
            </Button>
          </div>
        </form>
      </div>

      <StickyBar className="lg:hidden">
        <Button onClick={props.step === 1 ? submitBasics : submitHistory} loading={isPending} className="w-full">
          {primaryLabel}
        </Button>
        {props.step === 2 && (
          <Button asChild variant="quiet" className="w-full">
            <Link href={laterHref}>{t("later")}</Link>
          </Button>
        )}
      </StickyBar>
    </div>
  );
};
