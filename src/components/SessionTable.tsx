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
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-3 w-10 text-center">#</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3 text-right">Prompt</th>
              <th className="px-3 py-3 text-right">Completion</th>
              <th className="px-3 py-3 text-right">Total Tokens</th>
              <th className="px-3 py-3 text-right">Requests</th>
              <th className="px-3 py-3 text-right">Cost</th>
              <th className="px-3 py-3">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No sessions found
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.sessionId} className="bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                <td className="px-3 py-2.5 text-center text-slate-500 text-xs tabular-nums">
                  {offset + i + 1}
                </td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <Link
                    href={`/sessions/${e.sessionId}?userId=${userId}`}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium truncate block"
                    title={e.title ?? e.sessionId}
                  >
                    {e.title || <span className="text-slate-500 italic">Untitled</span>}
                  </Link>
                  <span className="text-slate-600 font-mono text-xs">{e.sessionId.slice(0, 12)}…</span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                  {e.totalPromptTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                  {e.totalCompletionTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-indigo-300 text-xs">
                  {e.totalTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                  {e.requestCount}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-emerald-400 text-xs">
                  ${e.totalCostUsd.toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">
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
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              ← Prev
            </button>
            <span className="text-xs">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(offset + limit)}
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
