"use client";

import { CalendarDays, Clock, NotebookPen, Timer, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { CONFIRM_DIALOG } from "@/components/confirm-dialog";
import { StickyBar } from "@/components/metro/screen-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { combineDateTime, toDateKey } from "@/lib/metro/dates";
import { formatDate, formatTime } from "@/lib/metro/format";
import { useDialogStore } from "@/lib/stores/dialog-store";
import { cn } from "@/lib/utils";
import { createAppointment, deleteAppointment, updateAppointment } from "@/server_actions/appointments";

interface AppointmentFormProps {
  clients: Array<{ id: string; name: string }>;
  /** Editing an existing appointment; absent when creating. */
  initial?: { id: string; clientId: string; startsAt: Date; durationMin: number; note: string | null };
  /** Preselected day when creating from the calendar. */
  defaultDate?: Date;
  defaultClientId?: string;
}

const DURATIONS = [30, 45, 60];

const Field = ({ id, icon: Icon, label, children }: { id: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="flex items-center gap-1.5 text-label text-ink-muted">
      <Icon className="size-3.5" strokeWidth={1.6} />
      {label}
    </label>
    {children}
  </div>
);

export const AppointmentForm = ({ clients, initial, defaultDate, defaultClientId }: AppointmentFormProps) => {
  const t = useTranslations("Appointments");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const openDialog = useDialogStore((s) => s.openDialog);
  const [isPending, startTransition] = useTransition();

  const start = initial?.startsAt ?? defaultDate ?? new Date();
  const [clientId, setClientId] = useState(initial?.clientId ?? defaultClientId ?? "");
  const [date, setDate] = useState(toDateKey(start));
  const [time, setTime] = useState(initial ? formatTime(initial.startsAt) : "10:00");
  const [duration, setDuration] = useState(initial?.durationMin ?? 45);
  const [note, setNote] = useState(initial?.note ?? "");

  const clientName = clients.find((c) => c.id === clientId)?.name ?? "";
  const backHref = `/appointments?week=${date}`;

  const submit = () => {
    const startsAt = combineDateTime(date, time);
    if (!clientId || !startsAt) {
      toast(t("errors.required"));
      return;
    }
    startTransition(async () => {
      try {
        const input = { clientId, startsAt: startsAt.toISOString(), durationMin: duration, note: note || null };
        if (initial) await updateAppointment(initial.id, input);
        else await createAppointment(input);
        router.push(backHref);
      } catch {
        toast(tCommon("saveFailed"));
      }
    });
  };

  // A delete confirmation is a word plus a quiet button; the system has no red.
  const remove = () => {
    if (!initial) return;
    openDialog(
      CONFIRM_DIALOG,
      { title: t("removeTitle"), description: t("removeBody", { name: clientName, date: formatDate(initial.startsAt) }), actionLabel: t("removeConfirm"), cancelLabel: tCommon("cancel") },
      () => {
        startTransition(async () => {
          try {
            await deleteAppointment(initial.id);
            router.push(backHref);
          } catch {
            toast(tCommon("saveFailed"));
          }
        });
      }
    );
  };

  const actions = (
    <>
      <Button onClick={submit} loading={isPending} className="w-full lg:w-auto">
        {t("save")}
      </Button>
      {initial && (
        <Button variant="quiet" onClick={remove} disabled={isPending} className="w-full lg:w-auto">
          {t("remove")}
        </Button>
      )}
    </>
  );

  return (
    <div className="flex flex-1 flex-col">
      <form className="flex w-full flex-col gap-4 px-gutter pb-6 lg:w-[560px] lg:px-10" onSubmit={(e) => e.preventDefault()}>
        <Field id="client" icon={UserRound} label={t("fields.client")}>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="client" className="h-field w-full rounded-md border-border-field bg-surface-field text-body shadow-none data-[size=default]:h-field">
              <SelectValue placeholder={t("fields.clientPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-body">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-3">
          <Field id="date" icon={CalendarDays} label={t("fields.date")}>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field id="time" icon={Clock} label={t("fields.time")}>
            <Input id="time" type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-label text-ink-muted">
            <Timer className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
            {t("fields.duration")}
          </span>
          <div role="radiogroup" aria-label={t("fields.duration")} className="flex gap-[3px] rounded-md border border-border-field bg-surface-field p-[3px]">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={duration === d}
                onClick={() => setDuration(d)}
                className={cn("flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[7px] text-body transition-colors duration-300", duration === d ? "bg-surface-raised text-ink shadow-[0_0_0_1px_var(--hairline)]" : "text-ink-muted")}
              >
                {t("minutes", { count: d })}
              </button>
            ))}
          </div>
        </div>
        <Field id="note" icon={NotebookPen} label={t("fields.note")}>
          <div className="rounded-md border border-border-field bg-surface-field px-3.5 py-3 transition-colors duration-300 focus-within:border-focus focus-within:bg-surface-raised">
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("fields.notePlaceholder")} className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-soft" />
          </div>
        </Field>

        {initial && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/clients/${initial.clientId}`}>{t("openClient")}</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/clients/${initial.clientId}/measure`}>{t("startMeasurement")}</Link>
            </Button>
          </div>
        )}

        <div className="hidden justify-end gap-2 pt-4 lg:flex lg:flex-row-reverse">{actions}</div>
      </form>
      <div className="flex-1 lg:hidden" />
      <StickyBar className="lg:hidden">{actions}</StickyBar>
    </div>
  );
};
