/*
 * The hover of a clickable table row: a sage layer behind the row, rounded, reaching
 * 12px past the text at either end, fading in and out. Table cells are square and
 * flush with the text, so the layer is a pseudo-element on the first cell instead,
 * positioned against the row. The row is `relative` and its own stacking context, so
 * the layer can sit behind the cells without dropping behind the page. The row's link
 * overlay covers the same area, so the whole tint is clickable.
 */
export const HOVER_ROW = "group relative isolate";

export const HOVER_ROW_TINT =
  "before:absolute before:inset-y-0 before:-inset-x-3 before:-z-10 before:rounded-md before:bg-accent-soft before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] group-hover:before:opacity-100 group-focus-within:before:opacity-100";

export const HOVER_ROW_LINK = "after:absolute after:inset-y-0 after:-inset-x-3 after:content-['']";

/** A cell in such a row: its divider fades out while the tint fades in. */
export const HOVER_ROW_CELL = "border-b border-hairline py-2.5 transition-colors duration-300 group-hover:border-transparent";
