import { forwardRef, useId } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

/** A multi-line text field styled for ink surfaces. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      id,
      label,
      hint,
      error,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const hasDescription = hint != null || error != null;
    const enhanced = label != null || hasDescription;
    const textareaId = id ?? (enhanced ? generatedId : undefined);
    const hintId = hint != null && textareaId ? `${textareaId}-hint` : undefined;
    const errorId = error != null && textareaId ? `${textareaId}-error` : undefined;
    const describedBy = [ariaDescribedBy, hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <>
        {label != null && (
          <label className="mb-1 block font-ui text-body-s text-paper" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-describedby={describedBy}
          aria-invalid={error != null ? true : ariaInvalid}
          className={cn(
            "min-h-24 w-full rounded-m border border-ink-600 bg-ink-800 px-3 py-2 font-ui text-body text-paper",
            "placeholder:text-ink-400",
            "transition-colors duration-fast ease-standard",
            "focus-visible:border-lumen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumen focus-visible:ring-offset-2 focus-visible:ring-offset-ink-800",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {hint != null && (
          <span className="mt-1 block font-ui text-body-s text-ink-400" id={hintId}>
            {hint}
          </span>
        )}
        {error != null && (
          <span
            className="mt-1 block font-ui text-body-s text-coral-on-light"
            id={errorId}
            role="alert"
          >
            {error}
          </span>
        )}
      </>
    );
  },
);

Textarea.displayName = "Textarea";
