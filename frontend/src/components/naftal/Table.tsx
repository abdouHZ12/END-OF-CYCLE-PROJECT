import * as React from "react";
import { cn } from "@/lib/cn";

export type TableColumn<T> = {
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  cell: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Array<TableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string | number;
  className?: string;
  onRowClick?: (row: T) => void;
};

export default function Table<T>({
  columns,
  rows,
  getRowKey,
  className,
  onRowClick,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-(--naftal-border-subtle) bg-(--naftal-surface-1) shadow-(--naftal-shadow-soft)",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-(--naftal-surface-0)">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.header}
                  className={cn(
                    "px-5 py-3 font-semibold text-(--naftal-text-secondary)",
                    c.headerClassName
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--naftal-border-subtle)">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer",
                  "hover:bg-(--naftal-surface-2-hover)"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <td
                    key={c.header}
                    className={cn(
                      "px-5 py-4 align-middle text-(--naftal-text-primary)",
                      c.cellClassName
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
