import type { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Tone, TONE_CLASSES } from "@/lib/metro/tones";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon?: LucideIcon;
  title: string;
  /** One line that says what the section is for, or what the numbers add up to. */
  subtitle?: React.ReactNode;
  /** Right-aligned in the header: a link, a button, a count. */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** The icon chip's tint. Clay is for the Προσοχή block, which also tints the whole card. */
  tone?: Tone;
}

/*
 * Every section of a screen is a card: raised surface, radius-lg, hairline edge,
 * a title, one line of explanation, then the content. No shadow: the system
 * separates surfaces with hairlines.
 */
export const SectionCard = ({ icon: Icon, title, subtitle, action, children, className, contentClassName, tone = "sage" }: SectionCardProps) => (
  <Card className={cn("gap-4 rounded-lg border-hairline py-5 shadow-none", tone === "clay" ? "border-transparent bg-warn-soft" : "bg-surface-raised", className)}>
    <CardHeader className="gap-1 px-5">
      <CardTitle className={cn("flex items-center gap-2.5 text-title-m leading-6", tone === "clay" ? "text-warn" : "text-ink")}>
        {Icon && (
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", tone === "clay" ? "bg-warn/15 text-warn" : TONE_CLASSES[tone].chip)}>
            <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
          </span>
        )}
        {title}
      </CardTitle>
      {subtitle && <CardDescription className="text-body text-ink-muted">{subtitle}</CardDescription>}
      {action && <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent className={cn("px-5", contentClassName)}>{children}</CardContent>
  </Card>
);
