"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { ChartDialog } from "@/components/metro/chart-dialog";

export const DialogProvider = () => {
  return (
    <>
      <ConfirmDialog />
      <ChartDialog />
    </>
  );
};
