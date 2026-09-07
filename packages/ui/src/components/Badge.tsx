import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type BadgeVariant = "neutral" | "lumen" | "teal" | "coral" | "sky";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-ink-700 text-paper",
  lumen: "bg-lumen text-ink",
  teal: "bg-teal text-paper",
  coral: "bg-coral text-paper",
  sky: "bg-sky text-paper",
};

/** A small status pill. Colors come straight from the semantic token set. */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-round px-2.5 py-0.5 font-ui text-caption font-medium",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
