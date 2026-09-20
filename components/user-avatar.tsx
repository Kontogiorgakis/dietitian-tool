import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** Full name; the initials come from its first two words. */
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "size-6 text-[11px]",
  md: "size-9 text-label",
  lg: "size-12 text-body",
} as const;

/** The first letters of the first two words, as typed, so Greek accents survive. */
export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

/** A round avatar with the person's initials when there is no photo. Accent-soft ground, accent ink. */
export const UserAvatar = ({ name, image, size = "md", className }: UserAvatarProps) => (
  <Avatar className={cn(SIZES[size], "shrink-0", className)}>
    {image && <AvatarImage src={image} alt={name} />}
    <AvatarFallback className="bg-accent-soft font-semibold leading-none tracking-wide text-accent" aria-hidden="true">
      {initialsOf(name)}
    </AvatarFallback>
  </Avatar>
);
