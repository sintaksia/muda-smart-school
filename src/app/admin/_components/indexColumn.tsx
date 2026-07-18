import type { ColumnDef } from "@tanstack/react-table";

/**
 * Shared "No" column for CMS data tables: renders the row's position within
 * the current page, accounting for pagination offset.
 */
export function indexColumn<T>(): ColumnDef<T> {
  return {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const pageRows = table.getRowModel().rows;
      const visualIndex = pageRows.findIndex((r) => r.id === row.id);
      return (
        <span className="text-muted-foreground">
          {pageIndex * pageSize + visualIndex + 1}
        </span>
      );
    },
  };
}
