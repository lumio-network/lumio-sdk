import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
}

/**
 * A visual separator using the ink border tokens. Renders a semantic separator
 * element with the appropriate ARIA orientation.
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        aria-orientation={orientation}
        className={cn(
          orientation === "horizontal" ? "border-t border-ink-700" : "border-l border-ink-700",
          className,
        )}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
