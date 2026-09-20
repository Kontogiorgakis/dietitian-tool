import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** A caption beside the title: a count, a date range. */
  meta?: string;
  /** Actions or a search field, right-aligned at 1024 and above. */
  children?: React.ReactNode;
  className?: string;
}

/** The header of a top-level screen: title, one caption, and whatever acts on the page. */
export const PageHeader = ({ title, meta, children, className }: PageHeaderProps) => (
  <header className={cn("flex flex-col gap-3.5 px-gutter pt-[18px] pb-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10 lg:pt-8 lg:pb-5", className)}>
    <div className="flex items-baseline justify-between gap-3 lg:justify-start">
      <h1 className="text-title-l">{title}</h1>
      {meta && <span className="text-caption text-ink-muted">{meta}</span>}
    </div>
    {children && <div className="flex items-center gap-4">{children}</div>}
  </header>
);
