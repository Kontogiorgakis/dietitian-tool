"use client";

import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { MetroLineChartLazy } from "@/components/metro/charts/metro-line-chart-lazy";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDialogStore } from "@/lib/stores/dialog-store";

import type { ChartSpec } from "./charts/chart-spec";

export const CHART_DIALOG = "chart";

export interface ChartDialogData {
  spec: ChartSpec;
  title: string;
  unit: string;
  caption?: React.ReactNode;
}

/** The expand button in a chart card's header. */
export const ChartExpandButton = (data: ChartDialogData) => {
  const t = useTranslations("Charts");
  const openDialog = useDialogStore((s) => s.openDialog);
  return (
    <Button variant="quiet" size="sm" className="-mr-2 h-8 px-2 text-ink-muted" aria-label={t("expand")} onClick={() => openDialog(CHART_DIALOG, data)}>
      <Maximize2 className="size-4" strokeWidth={1.6} aria-hidden="true" />
    </Button>
  );
};

/** One chart, large, with every visit labelled. Registered in the dialog provider. */
export const ChartDialog = () => {
  const open = useDialogStore((s) => s.currentDialog === CHART_DIALOG);
  const data = useDialogStore((s) => s.dialogData) as ChartDialogData | null;
  const closeDialog = useDialogStore((s) => s.closeDialog);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) closeDialog(CHART_DIALOG);
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] gap-5 rounded-xl border-hairline bg-surface-raised p-6 shadow-none sm:max-w-[1100px]">
        {data && (
          <>
            <DialogHeader className="gap-1 text-left">
              <DialogTitle className="flex items-baseline justify-between gap-3 text-title-l">
                {data.title}
                <span className="text-caption font-normal text-ink-soft">{data.unit}</span>
              </DialogTitle>
              {data.caption && <DialogDescription className="text-body text-ink-muted">{data.caption}</DialogDescription>}
            </DialogHeader>
            <MetroLineChartLazy spec={{ ...data.spec, compact: false }} aspect="aspect-[16/9]" />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
