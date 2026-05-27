"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSessionCost, getSessionMessages } from "@/lib/api";
import { UserCostSummary, SessionMessageEntry, SessionMessagesPagination } from "@/types";
import StatCard from "@/components/StatCard";

const PAGE_LIMIT = 20;
const ORDER: "asc" | "desc" = "desc";

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const map: Record<string, string> = {
    user: "bg-primary/10 text-primary border-primary/30",
    assistant: "bg-success/10 text-success border-success/30",
    system: "bg-surface-2/60 text-text-muted border-border-default",
  };
  const cls = map[role] ?? "bg-surface-2/60 text-text-muted border-border-default";
  return (
    <span className={`inline-block border text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {role}
    </span>
  );
}

function MessageEntryCard({ entry, index }: { entry: SessionMessageEntry; index: number }) {
  return (
    <div className="border border-border-default rounded-xl bg-surface/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary w-6 text-right">{index}.</span>
          <RoleBadge role={entry.role} />
        </div>
        <span className="text-sm font-medium text-text-primary shrink-0">
          {new Date(entry.messageCreatedAt).toLocaleString()}
        </span>
      </div>

      {/* Token + Cost row */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-1 sm:gap-x-5 text-xs">
        <span className="text-text-muted">
          Input: <span className="text-primary font-semibold">{entry.totalPromptTokens.toLocaleString()}</span>
        </span>
        <span className="text-text-muted">
          Output: <span className="text-text-secondary font-semibold">{entry.totalCompletionTokens.toLocaleString()}</span>
        </span>
        <span className="text-text-muted">
          Cache Hit: <span className="text-text-secondary font-semibold">0</span>
        </span>
        <span className="text-text-muted">
          Cost: <span className="text-success font-semibold">${entry.totalCostUsd.toFixed(6)}</span>
          <span className="text-text-muted"> (in ${entry.inputCostUsd.toFixed(6)} / out ${entry.outputCostUsd.toFixed(6)})</span>
        </span>
        {entry.requestCount > 1 && (
          <span className="text-text-muted">
            Turns: <span className="text-warning font-semibold">{entry.requestCount}</span>
          </span>
        )}
      </div>

      {/* Time range (if differs) */}
      {entry.firstTrackedAt !== entry.lastTrackedAt && (
        <div className="text-xs text-text-muted border-t border-border-default pt-2">
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
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
          <Link href="/" className="hover:text-text-primary transition-colors">Overview</Link>
          {fromUserId && (
            <>
              <span>/</span>
              <Link
                href={`/users/${fromUserId}`}
                className="hover:text-text-primary transition-colors"
              >
                User #{fromUserId}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-text-primary font-mono text-xs">{shortId}</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Session Detail</h1>
        <p className="text-text-secondary text-xs mt-1 font-mono break-all">{sessionId}</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border-default rounded-xl p-5 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Total Tokens"
              value={data.totalTokens.toLocaleString()}
              loading={loading}
            />
            <StatCard
              label="Total Cost"
              value={`$${data.totalCostUsd.toFixed(4)}`}
              hint="USD"
              tone="success"
              loading={loading}
            />
            <StatCard
              label="Turns"
              value={data.requestCount.toLocaleString()}
              loading={loading}
            />
          </div>
        </>
      )}

      {/* Turn Messages */}
      <div className="bg-surface border border-border-default rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary font-semibold text-sm">
            Turn Messages
            {pagination && (
              <span className="ml-2 text-text-muted font-normal text-xs">
                ({pagination.total} total)
              </span>
            )}
          </h2>
          {pagination && totalPages > 1 && (
            <span className="text-xs text-text-muted">
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
              <div key={i} className="border border-border-default rounded-xl h-20 animate-pulse bg-surface/60" />
            ))}
          </div>
        )}

        {!msgLoading && messages.length === 0 && !msgError && (
          <p className="text-text-muted text-sm text-center py-6">No messages found.</p>
        )}

        {!msgLoading && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((entry, idx) => (
              <MessageEntryCard key={entry.messageId ?? idx} entry={entry} index={offset + idx + 1} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => goToOffset(offset - PAGE_LIMIT)}
              disabled={!pagination.hasPrev || msgLoading}
              className="px-3 py-1.5 text-xs rounded-lg border border-border-default text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
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
                    <span key={`ellipsis-${idx}`} className="px-1 text-text-muted text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToOffset(((item as number) - 1) * PAGE_LIMIT)}
                      disabled={msgLoading}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                        item === currentPage
                          ? "bg-primary border-primary text-white"
                          : "border-border-default text-text-secondary hover:bg-surface-2"
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
              className="px-3 py-1.5 text-xs rounded-lg border border-border-default text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
