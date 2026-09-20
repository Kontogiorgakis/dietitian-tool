"use client";

import { Loader2 } from "lucide-react";
// eslint-disable-next-line no-restricted-imports -- the hook lives only in next/link; the Link component itself still comes from lib/i18n/navigation
import { useLinkStatus } from "next/link";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick" | "asChild" | "loading"> {
  href: string;
}

/** A button that navigates, and spins until the next page has rendered. */
export const NavButton = ({ href, children, disabled, ...props }: NavButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button {...props} loading={isPending} disabled={disabled} onClick={() => startTransition(() => router.push(href))}>
      {children}
    </Button>
  );
};

/** Inside a Link: a small spinner while that link's navigation is pending. */
export const LinkPending = ({ className }: { className?: string }) => {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className={cn("size-4 shrink-0 animate-spin text-accent", className)} strokeWidth={1.6} aria-hidden="true" />;
};
