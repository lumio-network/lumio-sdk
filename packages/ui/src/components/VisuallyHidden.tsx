import { forwardRef } from "react";
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../cn";

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  /** The element to render. Defaults to `"span"`. */
  as?: ElementType;
}

/**
 * Text that is present in the DOM for assistive technologies but visually
 * hidden. Use it to label icon-only controls or expose extra spoken context.
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ as: Component = "span", className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 m-[-1px] clip-[rect(0,0,0,0)]",
          className,
        )}
        {...props}
      />
    );
  },
);

VisuallyHidden.displayName = "VisuallyHidden";
