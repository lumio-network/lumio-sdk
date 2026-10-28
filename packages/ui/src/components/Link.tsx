import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "../cn";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Use `text-sky` for dark surfaces instead of the default `text-sky-on-light`. */
  onDark?: boolean;
}

/**
 * An anchor styled with the sky semantic token. Underlines on hover/focus with
 * the visible focus treatment used across the library.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ onDark = false, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "rounded-s font-ui transition-colors duration-fast ease-standard",
          onDark ? "text-sky" : "text-sky-on-light",
          "hover:underline focus-visible:underline",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumen",
          className,
        )}
        {...props}
      />
    );
  },
);

Link.displayName = "Link";
