"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSessionCost, getSessionMessages } from "@/lib/api";
import { UserCostSummary, TurnMessage, SessionMessagesPagination } from "@/types";
import StatCard from "@/components/StatCard";
import ModelBarChart from "@/components/ModelBarChart";

const PAGE_LIMIT = 20;

function RoleBadge({ role }: { role: TurnMessage["role"] }) {
  const map = {
    user: "bg-blue-900/50 text-blue-300 border-blue-700",
    assistant: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    system: "bg-slate-700/60 text-slate-400 border-slate-600",
  };
  return (
    <span
      className={`inline-block border text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[role]}`}
    >
      {role}
    </span>
  );
}

function MessageCard({ msg }: { msg: TurnMessage }) {
  const [expanded, setExpanded] = useState(false);
  const cost = msg.costs[0];
  const isLong = msg.content.length > 400;
  const displayContent =
    isLong && !expanded ? msg.content.slice(0, 400) + "…" : msg.content;

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-800/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <RoleBadge role={msg.role} />
          {msg.metadata?.model && (
            <span className="text-xs font-mono text-slate-400">
              {msg.metadata.model as string}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {new Date(msg.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Content */}
      <div className="text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
        {displayContent}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Cost row */}
      {cost && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs border-t border-slate-700 pt-2 mt-1">
          <span className="text-slate-500">
            Tokens:{" "}
            <span className="text-indigo-300 font-semibold">
              {cost.totalTokens.toLocaleString()}
            </span>
            <span className="text-slate-600">
              {" "}(in {cost.promptTokens.toLocaleString()} / out{" "}
              {cost.completionTokens.toLocaleString()}
              {cost.cacheReadTokens > 0 ? ` / cache ${cost.cacheReadTokens.toLocaleString()}` : ""})
            </span>
          </span>
          <span className="text-slate-500">
            Cost:{" "}
            <span className="text-emerald-400 font-semibold">
              ${cost.totalCostUsd.toFixed(5)}
            </span>
          </span>
          {cost.langsmithRunId && (
            <span className="text-slate-600 font-mono truncate max-w-xs" title={cost.langsmithRunId}>
              run: {cost.langsmithRunId}
            </span>
          )}
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

  const [messages, setMessages] = useState<TurnMessage[]>([]);
  const [pagination, setPagination] = useState<SessionMessagesPagination | null>(null);
  const [msgPage, setMsgPage] = useState(1);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  useEffect(() => {
    getSessionCost(sessionId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load session"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const loadMessages = useCallback(
    (page: number) => {
      setMsgLoading(true);
      setMsgError(null);
      getSessionMessages(sessionId, page, PAGE_LIMIT)
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
    loadMessages(1);
  }, [loadMessages]);

  const goToPage = (page: number) => {
    setMsgPage(page);
    loadMessages(page);
  };

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
          {pagination && pagination.totalPages > 1 && (
            <span className="text-xs text-slate-500">
              Page {msgPage} / {pagination.totalPages}
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
              <div key={i} className="border border-slate-700 rounded-xl h-24 animate-pulse bg-slate-800/60" />
            ))}
          </div>
        )}

        {!msgLoading && messages.length === 0 && !msgError && (
          <p className="text-slate-500 text-sm text-center py-6">No messages found.</p>
        )}

        {!msgLoading && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => goToPage(msgPage - 1)}
              disabled={!pagination.hasPrev || msgLoading}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - msgPage) <= 1
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
                      onClick={() => goToPage(item as number)}
                      disabled={msgLoading}
                      className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                        item === msgPage
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
              onClick={() => goToPage(msgPage + 1)}
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
