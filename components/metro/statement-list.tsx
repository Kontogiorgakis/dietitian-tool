import { cn } from "@/lib/utils";

interface StatementListProps {
  /** One short statement per line. */
  lines: React.ReactNode[];
  /** Classes for the first line, which leads; the rest read as its details in muted ink. */
  lead?: string;
  className?: string;
}

/** Sentences the app writes from the data, one per line instead of one long paragraph, so each number gets its own line. */
export const StatementList = ({ lines, lead = "text-body text-ink", className }: StatementListProps) => (
  <ul className={cn("flex flex-col gap-1", className)}>
    {lines.map((line, i) => (
      <li key={i} className={i === 0 ? lead : "text-body text-ink-muted"}>
        {line}
      </li>
    ))}
  </ul>
);
