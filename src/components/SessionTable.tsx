"use client";

import Link from "next/link";
import { UserSessionEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: UserSessionEntry[];
  total: number;
  limit: number;
  offset: number;
  userId: number;
  onPageChange: (offset: number) => void;
}

function calcBurnRate(
  totalTokens: number,
  firstTrackedAt: string,
  lastTrackedAt: string
): string {
  if (!firstTrackedAt || !lastTrackedAt || firstTrackedAt === lastTrackedAt) {
    return "—";
  }
  const hours =
    (new Date(lastTrackedAt).getTime() - new Date(firstTrackedAt).getTime()) /
    3_600_000;
  if (hours < 0.01) return "—";
  const rate = totalTokens / hours;
  if (rate >= 1_000_000) return `${(rate / 1_000_000).toFixed(1)}M/hr`;
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(1)}k/hr`;
  return `${Math.round(rate)}/hr`;
}

export default function SessionTable({
  entries,
  total,
  limit,
  offset,
  userId,
  onPageChange,
}: Props) {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border-default">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-2 text-text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-3 w-10 text-center">#</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3 text-right">Turns</th>
              <th className="px-3 py-3 text-right">Input Tokens</th>
              <th className="px-3 py-3 text-right">Output Tokens</th>
              <th className="px-3 py-3 text-right">Cache Write</th>
              <th className="px-3 py-3 text-right">Cache Hit</th>
              <th className="px-3 py-3 text-right">Saving ($)</th>
              <th className="px-3 py-3 text-right">Burn Rate</th>
              <th className="px-3 py-3 text-right">Cost</th>
              <th className="px-3 py-3">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50">
            {entries.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                  No sessions found
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.sessionId} className="hover:bg-surface-2/50 transition-colors">
                <td className="px-3 py-2.5 text-center text-text-muted text-xs tabular-nums">
                  {offset + i + 1}
                </td>
                <td className="px-3 py-2.5 max-w-[200px]">
                  <Link
                    href={`/sessions/${e.sessionId}?userId=${userId}`}
                    className="text-primary hover:underline text-sm font-medium truncate block"
                    title={e.title ?? e.sessionId}
                  >
                    {e.title || <span className="text-text-muted italic">Untitled</span>}
                  </Link>
                  <span className="text-text-muted font-mono text-xs">{e.sessionId.slice(0, 12)}…</span>
                </td>
                <td className="px-3 py-2.5 text-right text-warning text-xs tabular-nums">
                  {e.requestCount}
                </td>
                <td className="px-3 py-2.5 text-right text-text-secondary text-xs tabular-nums">
                  {e.totalPromptTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-text-secondary text-xs tabular-nums">
                  {e.totalCompletionTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
                  {(e.cacheWriteTokens ?? 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
                  {(e.cacheHitTokens ?? 0).toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-text-muted text-xs tabular-nums">
                  ${(e.cacheSavingUsd ?? 0).toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-right text-primary/70 text-xs tabular-nums font-mono">
                  {calcBurnRate(e.totalTokens, e.firstTrackedAt, e.lastTrackedAt)}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-success text-xs tabular-nums">
                  ${e.totalCostUsd.toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-text-muted text-xs whitespace-nowrap">
                  {e.sessionCreatedAt ? format(parseISO(e.sessionCreatedAt), "MM/dd HH:mm") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
          <span className="text-xs">
            {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()} sessions
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(0, offset - limit))}
              className="px-3 py-1 rounded bg-surface-2 hover:bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              ← Prev
            </button>
            <span className="text-xs">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(offset + limit)}
              className="px-3 py-1 rounded bg-surface-2 hover:bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
