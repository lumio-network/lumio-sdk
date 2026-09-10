import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** A raised surface for grouping content. Ink-tinted for the dark-mode-first product. */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-l border border-ink-700 bg-ink-900 p-6 text-paper shadow-m",
        className,
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

/** The heading slot for a {@link Card}. */
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("font-display text-heading-m font-semibold text-paper", className)}
        {...props}
      />
    );
  },
);

CardTitle.displayName = "CardTitle";

export type CardBodyProps = HTMLAttributes<HTMLParagraphElement>;

/** Muted supporting copy inside a {@link Card}. */
export const CardBody = forwardRef<HTMLParagraphElement, CardBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("mt-2 font-ui text-body text-ink-400", className)} {...props} />
    );
  },
);

CardBody.displayName = "CardBody";
