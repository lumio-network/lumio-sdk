import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

const SIZES: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * A loading indicator for inline states. Renders a spinning ring with an
 * accessible status role and respects reduced motion preferences.
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", label = "Loading", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(
          "animate-spin rounded-round border-2 border-r-transparent border-lumen motion-reduce:animate-none",
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Spinner.displayName = "Spinner";
