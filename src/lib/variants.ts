import { cn } from './cn';

type Groups = Record<string, Record<string, string>>;

type Selection<G extends Groups> = { -readonly [K in keyof G]?: Extract<keyof G[K], string> };

/** The selection a helper made by `createVariants` accepts. */
export type VariantProps<Helper> = Helper extends (selection?: infer S) => string ? NonNullable<S> : never;

/**
 * A class helper: the base classes, then one class string per group for the
 * selected value, or the default when none is selected. Later classes win.
 */
export function createVariants<const G extends Groups>(base: string, groups: G, defaults: Selection<G> = {}) {
  return (selection: Selection<G> = {}): string => {
    const picked = selection as Record<string, string | undefined>;
    const fallback = defaults as Record<string, string | undefined>;
    return cn(
      base,
      Object.keys(groups).map((group) => {
        const value = picked[group] ?? fallback[group];
        return value === undefined ? undefined : groups[group]?.[value];
      })
    );
  };
}
