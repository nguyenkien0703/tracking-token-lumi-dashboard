"use client";

import Link from "next/link";
import { HistoryEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: HistoryEntry[];
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  showUserId?: boolean;
}

function shortId(id: string) {
  return id.length > 14 ? `${id.slice(0, 10)}…` : id;
}

export default function SessionTable({
  entries,
  total,
  limit,
  offset,
  onPageChange,
  showUserId = false,
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
              <th className="px-3 py-3">Session ID</th>
              {showUserId && <th className="px-3 py-3">User</th>}
              <th className="px-3 py-3">Model</th>
              <th className="px-3 py-3 text-right">Prompt</th>
              <th className="px-3 py-3 text-right">Completion</th>
              <th className="px-3 py-3 text-right">Cache</th>
              <th className="px-3 py-3 text-right">Total Tokens</th>
              <th className="px-3 py-3 text-right">Input $</th>
              <th className="px-3 py-3 text-right">Output $</th>
              <th className="px-3 py-3 text-right">Total $</th>
              <th className="px-3 py-3">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={showUserId ? 12 : 11}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No records found
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.id} className="bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                <td className="px-3 py-2.5 text-center text-slate-500 text-xs tabular-nums">
                  {offset + i + 1}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs">
                  <Link
                    href={`/sessions/${e.sessionId}`}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline"
                    title={e.sessionId}
                  >
                    {shortId(e.sessionId)}
                  </Link>
                </td>
                {showUserId && (
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/users/${e.userId}`}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs"
                    >
                      #{e.userId}
                    </Link>
                  </td>
                )}
                <td className="px-3 py-2.5">
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                    {e.model === "unknown" ? (
                      <span className="text-slate-500">unknown</span>
                    ) : (
                      e.model.split("/").pop()
                    )}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                  {e.promptTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs">
                  {e.completionTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-xs">
                  {e.cacheReadTokens > 0 ? (
                    <span className="text-amber-400">{e.cacheReadTokens.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-indigo-300 text-xs">
                  {e.totalTokens.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-400 text-xs">
                  ${e.inputCostUsd.toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-400 text-xs">
                  ${e.outputCostUsd.toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-emerald-400 text-xs">
                  ${e.totalCostUsd.toFixed(4)}
                </td>
                <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                  {format(parseISO(e.createdAt), "MM/dd HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
          <span className="text-xs">
            {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()} records
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
