/**
 * Size/tone overrides layered on top of the shadcn primitives — never a
 * replacement for them. See docs/design_system.md §6.1.
 */

/** Admin master-data forms use a 44px control instead of the 36px shadcn
 *  default so fields line up with the taller grid rows. */
export const ADMIN_FIELD_CLASS = "h-11 bg-white";

/**
 * The one class every filter-bar and in-table control wears: the 36px shadcn
 * height at a fixed width. Type size is deliberately *not* overridden — a
 * filter reads at the same `text-sm` as every other control in the app, so a
 * dropdown never looks shrunken next to the form fields beside it.
 */
export const FILTER_FIELD_CLASS = "h-9 w-44 bg-white";
