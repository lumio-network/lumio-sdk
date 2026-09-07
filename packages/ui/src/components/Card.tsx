import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** A raised surface for grouping content. Ink-tinted for the dark-mode-first product. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-l border border-ink-700 bg-ink-900 p-6 text-paper shadow-m",
        className,
      )}
      {...props}
    />
  );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

/** The heading slot for a {@link Card}. */
export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3 className={cn("font-display text-heading-m font-semibold text-paper", className)} {...props} />
  );
}

export type CardBodyProps = HTMLAttributes<HTMLParagraphElement>;

/** Muted supporting copy inside a {@link Card}. */
export function CardBody({ className, ...props }: CardBodyProps) {
  return <p className={cn("mt-2 font-ui text-body text-ink-400", className)} {...props} />;
}
