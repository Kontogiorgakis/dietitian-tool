import { cn } from "@/lib/general/utils";

// The Μέτρο type scale. Words use the text styles, numbers use the num styles.
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const TypographyDisplay = ({ className, children, ...props }: TypographyProps) => (
  <h1 className={cn("text-display text-ink", className)} {...props}>
    {children}
  </h1>
);

export const TypographyTitleL = ({ className, children, ...props }: TypographyProps) => (
  <h1 className={cn("text-title-l text-ink", className)} {...props}>
    {children}
  </h1>
);

export const TypographyTitleM = ({ className, children, ...props }: TypographyProps) => (
  <h2 className={cn("text-title-m text-ink", className)} {...props}>
    {children}
  </h2>
);

export const TypographyBody = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("text-body text-ink", className)} {...props}>
    {children}
  </p>
);

export const TypographyBodyStrong = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("text-body font-semibold text-ink", className)} {...props}>
    {children}
  </p>
);

export const TypographyLabel = ({ className, children, ...props }: TypographyProps) => (
  <span className={cn("text-label text-ink-muted", className)} {...props}>
    {children}
  </span>
);

export const TypographyCaption = ({ className, children, ...props }: TypographyProps) => (
  <p className={cn("text-caption text-ink-muted", className)} {...props}>
    {children}
  </p>
);
