"use client";

import { useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "@/lib/i18n/navigation";

interface PresentationShellProps {
  exitHref: string;
  children: React.ReactNode;
}

/*
 * Nothing here is tappable except leaving. On the phone the only exit is the
 * Έξοδος line; at a desk the exit is Esc or a click anywhere, because the keyboard
 * is the nearest control.
 */
export const PresentationShell = ({ exitHref, children }: PresentationShellProps) => {
  const router = useRouter();

  const onClick = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) router.push(exitHref);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(exitHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, exitHref]);

  return (
    <div onClick={onClick} className="flex h-svh max-h-svh flex-col overflow-hidden bg-surface-page">
      <ScrollArea className="h-0 flex-1" viewportClassName="!overflow-y-scroll">
        <div className="flex min-h-svh flex-col">{children}</div>
      </ScrollArea>
    </div>
  );
};
