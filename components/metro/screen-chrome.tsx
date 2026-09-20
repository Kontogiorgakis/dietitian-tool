import { ChevronLeft } from "lucide-react";

import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

/** The back chevron and where it goes, tap-target tall. */
export const BackLink = ({ href, label, className }: BackLinkProps) => (
  <Link href={href} className={cn("inline-flex min-h-6 items-center gap-1 text-body text-ink-muted transition-colors duration-300 hover:text-ink", className)}>
    <ChevronLeft className="size-6" strokeWidth={1.6} aria-hidden="true" />
    {label}
  </Link>
);

/** The sticky bar at the bottom of a screen with a primary action. */
export const StickyBar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("sticky bottom-0 z-10 flex flex-col gap-2 border-t border-hairline bg-surface-raised px-gutter pt-3 pb-[22px] shadow-sheet", className)}>
    {children}
  </div>
);
