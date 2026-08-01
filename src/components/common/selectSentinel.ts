/**
 * Radix `SelectItem` rejects an empty string as a value — it reserves `""` for
 * "nothing selected", so an option carrying it throws at render time. Our data
 * model, meanwhile, uses `""`/`null` for "no filter" and "not set".
 *
 * These helpers translate between the two at the component boundary so no
 * caller has to invent its own sentinel (which is what pushed several forms
 * back onto a native `<select>` in the first place).
 */
export const EMPTY_SELECT_VALUE = "__EMPTY__";

/** Domain value → a value Radix will accept. */
export function toSelectValue(value: string | null | undefined): string {
  return value ? value : EMPTY_SELECT_VALUE;
}

/** Radix value → the domain value, restoring the caller's empty representation. */
export function fromSelectValue<T extends string | null>(
  value: string,
  empty: T,
): string | T {
  return value === EMPTY_SELECT_VALUE ? empty : value;
}
