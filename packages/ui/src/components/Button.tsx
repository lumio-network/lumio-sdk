import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
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

const SPINNER_VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-ink",
  secondary: "border-paper",
  ghost: "border-paper",
};

/**
 * The primary action control. Amber ("lumen") by default — the one accent the
 * design language reserves for the single most important action on a surface.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      "aria-busy": ariaBusy,
      className,
      style,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        {...props}
        disabled={disabled || loading}
        aria-busy={loading ? true : ariaBusy}
        style={loading ? { ...style, position: "relative", color: "transparent" } : style}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-m font-ui font-semibold",
          "transition-colors duration-fast ease-standard",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumen",
          "disabled:cursor-not-allowed disabled:opacity-50",
          loading && "[&>*:not(.lumio-button-spinner)]:!opacity-0",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
      >
        {children}
        {loading && (
          <span
            aria-hidden="true"
            className={cn(
              "lumio-button-spinner absolute inset-0 m-auto h-4 w-4 animate-spin motion-reduce:animate-none rounded-full border-2 border-r-transparent",
              "lumio-button-spinner absolute inset-0 m-auto h-4 w-4 animate-spin rounded-full border-2 border-r-transparent motion-reduce:animate-none",
              SPINNER_VARIANTS[variant],
            )}
          />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
