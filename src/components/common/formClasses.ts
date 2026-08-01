/**
 * Size/tone overrides layered on top of the shadcn primitives — never a
 * replacement for them. See docs/design_system.md §6.1.
 */

/** Admin master-data forms use a 44px control instead of the 36px shadcn
 *  default so fields line up with the taller grid rows. */
export const ADMIN_FIELD_CLASS = "h-11 bg-white";

/** Filter bars above a table use a compact, fixed-width control. */
export const FILTER_FIELD_CLASS = "h-9 w-44 bg-white text-xs";
