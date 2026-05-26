"use client";

import { ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

export type ColumnAlign = "left" | "right" | "center";

export type Column<Row> = {
  key: string;
  header: string;
  align?: ColumnAlign;
  width?: string;            // e.g. "60px", "20%"
  render: (row: Row) => ReactNode;
  mobileHidden?: boolean;     // omit from card list on mobile
  primary?: boolean;          // show as card title on mobile
};

type Props<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string | number;
  emptyState?: ReactNode;
  rowHref?: (row: Row) => string;
};

const alignClass: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export default function ResponsiveTable<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  rowHref,
}: Props<Row>) {
  const isDesktop = useMediaQuery("md");

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-[10px] uppercase tracking-wider text-text-secondary">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2 font-medium ${alignClass[c.align ?? "left"]}`}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-surface-2/40 transition-colors"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${alignClass[c.align ?? "left"]}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile: card list
  return (
    <div className="divide-y divide-border-default">
      {rows.map((row) => {
        const primary = columns.find((c) => c.primary);
        const rest = columns.filter((c) => !c.primary && !c.mobileHidden);
        const content = (
          <div className="px-4 py-3">
            {primary && <div className="mb-2">{primary.render(row)}</div>}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {rest.map((c) => (
                <div key={c.key} className="flex justify-between gap-2">
                  <dt className="text-text-secondary">{c.header}</dt>
                  <dd className={`text-text-primary ${alignClass[c.align ?? "left"]}`}>
                    {c.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
        return rowHref ? (
          <a key={rowKey(row)} href={rowHref(row)} className="block hover:bg-surface-2/40">
            {content}
          </a>
        ) : (
          <div key={rowKey(row)}>{content}</div>
        );
      })}
    </div>
  );
}
