import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type CodeProps = HTMLAttributes<HTMLElement>;

/**
 * Inline code styled with the mono data token. Natural pair with
 * `truncateAddress()` from `@lumio/shared` for wallet addresses, contract IDs,
 * and transaction hashes.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => {
  return (
    <code
      ref={ref}
      className={cn("rounded-s bg-ink-800 px-1 font-mono text-data text-paper", className)}
      {...props}
    />
  );
});

Code.displayName = "Code";
