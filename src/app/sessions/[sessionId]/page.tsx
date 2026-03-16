"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSessionCost, getSessionMessages } from "@/lib/api";
import { UserCostSummary, SessionMessageEntry, SessionMessagesPagination } from "@/types";
import StatCard from "@/components/StatCard";
import ModelBarChart from "@/components/ModelBarChart";

const PAGE_LIMIT = 20;
const ORDER: "asc" | "desc" = "asc";

function RoleBadge({ role }: { role: string | null }) {
  if (!role) {
    return (
      <span className="inline-block border text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-500 border-slate-600">
        unmapped
      </span>
    );
  }
  const map: Record<string, string> = {
    user: "bg-blue-900/50 text-blue-300 border-blue-700",
    assistant: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    system: "bg-slate-700/60 text-slate-400 border-slate-600",
  };
  const cls = map[role] ?? "bg-slate-700/60 text-slate-400 border-slate-600";
  return (
    <span className={`inline-block border text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {role}
    </span>
  );
}

function MessageEntryCard({ entry }: { entry: SessionMessageEntry }) {
  const shortId =
    entry.messagePublicId
      ? entry.messagePublicId
      : `#${String(entry.messageId).length > 12 ? "unmapped" : entry.messageId}`;

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-800/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <RoleBadge role={entry.role} />
          {entry.isUnmapped && (
            <span className="text-xs bg-amber-900/30 border border-amber-700 text-amber-400 px-2 py-0.5 rounded-full">
              unlinked
            </span>
          )}
          <span className="text-xs font-mono text-slate-600" title={String(entry.messageId)}>
            {shortId}
          </span>
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {new Date(entry.messageCreatedAt).toLocaleString()}
        </span>
      </div>

      {/* Token + Cost row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="text-slate-500">
          Tokens:{" "}
          <span className="text-indigo-300 font-semibold">
            {entry.totalTokens.toLocaleString()}
          </span>
          <span className="text-slate-600">
            {" "}(in {entry.totalPromptTokens.toLocaleString()} / out {entry.totalCompletionTokens.toLocaleString()})
          </span>
        </span>
        <span className="text-slate-500">
          Cost:{" "}
          <span className="text-emerald-400 font-semibold">
            ${entry.totalCostUsd.toFixed(6)}
          </span>
          <span className="text-slate-600">
            {" "}(in ${entry.inputCostUsd.toFixed(6)} / out ${entry.outputCostUsd.toFixed(6)})
          </span>
        </span>
        {entry.requestCount > 1 && (
          <span className="text-slate-500">
            Requests:{" "}
            <span className="text-amber-400 font-semibold">{entry.requestCount}</span>
          </span>
        )}
      </div>

      {/* Time range (if differs) */}
      {entry.firstTrackedAt !== entry.lastTrackedAt && (
        <div className="text-xs text-slate-600 border-t border-slate-700 pt-2">
          Tracked:{" "}
          {new Date(entry.firstTrackedAt).toLocaleTimeString()} →{" "}
          {new Date(entry.lastTrackedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default function SessionDetailPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const searchParams = useSearchParams();
  const fromUserId = searchParams.get("userId");

  const [data, setData] = useState<UserCostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<SessionMessageEntry[]>([]);
  const [pagination, setPagination] = useState<SessionMessagesPagination | null>(null);
  const [offset, setOffset] = useState(0);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  useEffect(() => {
    getSessionCost(sessionId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load session"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const loadMessages = useCallback(
    (off: number) => {
      setMsgLoading(true);
      setMsgError(null);
      getSessionMessages(sessionId, off, PAGE_LIMIT, ORDER)
        .then(({ data, pagination }) => {
          setMessages(data);
          setPagination(pagination);
        })
        .catch((err) =>
          setMsgError(err instanceof Error ? err.message : "Failed to load messages")
        )
        .finally(() => setMsgLoading(false));
    },
    [sessionId]
  );

  useEffect(() => {
    loadMessages(0);
  }, [loadMessages]);

  const goToOffset = (off: number) => {
    setOffset(off);
    loadMessages(off);
  };

  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const totalPages = pagination ? Math.ceil(pagination.total / PAGE_LIMIT) : 1;

  const shortId = sessionId.length > 20 ? `${sessionId.slice(0, 16)}…` : sessionId;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Link href="/" className="hover:text-slate-200 transition-colors">Overview</Link>
          {fromUserId && (
            <>
              <span>/</span>
              <Link
                href={`/users/${fromUserId}`}
                className="hover:text-slate-200 transition-colors"
              >
                User #{fromUserId}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-200 font-mono text-xs">{shortId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Session Detail</h1>
        <p className="text-slate-400 text-xs mt-1 font-mono break-all">{sessionId}</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Tokens"
              value={data.totalTokens.toLocaleString()}
              accent="indigo"
            />
            <StatCard
              label="Total Cost"
              value={`$${data.totalCostUsd.toFixed(4)}`}
              sub="USD"
              accent="emerald"
            />
            <StatCard
              label="Requests"
              value={data.requestCount.toLocaleString()}
              accent="amber"
            />
            <StatCard
              label="Models"
              value={Object.keys(data.modelUsage ?? {}).length}
              accent="indigo"
            />
          </div>

          {/* Model Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-slate-200 font-semibold text-sm mb-4">Model Usage</h2>
              <ModelBarChart modelUsage={data.modelUsage ?? {}} />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-slate-200 font-semibold text-sm mb-4">Model Detail</h2>
              <div className="space-y-3">
                {Object.entries(data.modelUsage ?? {}).map(([model, usage]) => (
                  <div
                    key={model}
                    className="flex flex-col gap-1 border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-slate-300 text-sm font-mono" title={model}>
                      {model}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        Tokens:{" "}
                        <span className="text-indigo-300 font-semibold">
                          {usage.tokens.toLocaleString()}
                        </span>
                      </span>
                      <span className="text-slate-400">
                        Cost:{" "}
                        <span className="text-emerald-400 font-semibold">
                          ${usage.costUsd.toFixed(4)}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Turn Messages */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm">
            Turn Messages
            {pagination && (
              <span className="ml-2 text-slate-500 font-normal text-xs">
                ({pagination.total} total)
              </span>
            )}
          </h2>
          {pagination && totalPages > 1 && (
            <span className="text-xs text-slate-500">
              Page {currentPage} / {totalPages}
            </span>
          )}
        </div>

        {msgError && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
            {msgError}
          </div>
        )}

        {msgLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-700 rounded-xl h-20 animate-pulse bg-slate-800/60" />
            ))}
          </div>
        )}

        {!msgLoading && messages.length === 0 && !msgError && (
          <p className="text-slate-500 text-sm text-center py-6">No messages found.</p>
        )}

        {!msgLoading && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((entry, idx) => (
              <MessageEntryCard key={entry.messageId ?? idx} entry={entry} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => goToOffset(offset - PAGE_LIMIT)}
              disabled={!pagination.hasPrev || msgLoading}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === "number" && (arr[idx - 1] as number) < p - 1) {
                    acc.push("…");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-600 text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToOffset(((item as number) - 1) * PAGE_LIMIT)}
                      disabled={msgLoading}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                        item === currentPage
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "border-slate-600 text-slate-400 hover:bg-slate-700"
                      } disabled:opacity-40`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => goToOffset(offset + PAGE_LIMIT)}
              disabled={!pagination.hasNext || msgLoading}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
