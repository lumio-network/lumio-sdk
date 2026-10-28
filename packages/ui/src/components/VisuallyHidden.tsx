import { forwardRef } from "react";
import type { HTMLAttributes, ElementType } from "react";
import { cn } from "../cn";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

/**
 * Content that is accessible to screen readers but visually hidden. Uses the
 * sr-only technique (absolute positioning + clipping).
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ as: Component = "span", className, ...props }, ref) => {
    return <Component ref={ref} className={cn("sr-only", className)} {...props} />;
  },
);

VisuallyHidden.displayName = "VisuallyHidden";
