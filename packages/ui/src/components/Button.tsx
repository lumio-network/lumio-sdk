import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-lumen text-ink hover:bg-lumen-dim",
  secondary: "bg-ink-700 text-paper hover:bg-ink-600",
  ghost: "bg-transparent text-paper hover:bg-ink-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-s",
  md: "h-10 px-4 text-body",
  lg: "h-12 px-6 text-heading-s",
};

/**
 * The primary action control. Amber ("lumen") by default — the one accent the
 * design language reserves for the single most important action on a surface.
 */
export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-m font-ui font-semibold",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumen",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
