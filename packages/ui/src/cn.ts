/** A value that can appear in a `cn(...)` call. */
export type ClassValue = string | number | null | false | undefined;

/**
 * Join truthy class names into a single string.
 *
 * A dependency-free stand-in for `clsx` — enough for conditional classes in the
 * scaffold's components without pulling in a runtime dependency.
 *
 * ```ts
 * cn("btn", isPrimary && "btn-primary", null) // "btn btn-primary"
 * ```
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
