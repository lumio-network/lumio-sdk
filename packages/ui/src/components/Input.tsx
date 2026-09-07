import type { InputHTMLAttributes } from "react";
import { cn } from "../cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** A single-line text field styled for ink surfaces. */
export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-m border border-ink-600 bg-ink-800 px-3 font-ui text-body text-paper",
        "placeholder:text-ink-400",
        "transition-colors duration-fast ease-standard",
        "focus-visible:border-lumen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumen",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
