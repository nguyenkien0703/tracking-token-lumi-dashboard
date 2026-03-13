"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSessionCost, getSessionMessages, getMessageCostDetail } from "@/lib/api";
import { UserCostSummary, TurnMessage, SessionMessagesPagination, MessageCostDetail } from "@/types";
import StatCard from "@/components/StatCard";
import ModelBarChart from "@/components/ModelBarChart";

const PAGE_LIMIT = 20;
const ORDER: "asc" | "desc" = "asc";

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

function MessageCard({
  msg,
  sessionId,
}: {
  msg: TurnMessage;
  sessionId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MessageCostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const cost = msg.costs[0];
  const isLong = msg.content.length > 400;
  const displayContent =
    isLong && !expanded ? msg.content.slice(0, 400) + "…" : msg.content;

  const toggleDetail = () => {
    if (!detailOpen && !detail) {
      setDetailLoading(true);
      setDetailError(null);
      getMessageCostDetail(sessionId, msg.id)
        .then(setDetail)
        .catch((err) =>
          setDetailError(err instanceof Error ? err.message : "Failed to load")
        )
        .finally(() => setDetailLoading(false));
    }
    setDetailOpen((v) => !v);
  };

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-800/60 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <RoleBadge role={msg.role} />
          {typeof msg.metadata?.model === "string" && (
            <span className="text-xs font-mono text-slate-400">
              {msg.metadata.model}
            </span>
          )}
          <span className="text-xs font-mono text-slate-600">#{msg.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">
            {new Date(msg.createdAt).toLocaleString()}
          </span>
          <button
            onClick={toggleDetail}
            className="text-xs px-2 py-0.5 rounded border border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >
            {detailOpen ? "Hide Cost" : "Cost Detail"}
          </button>
        </div>
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

      {/* Basic cost row */}
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
              {cost.cacheReadTokens > 0
                ? ` / cache ${cost.cacheReadTokens.toLocaleString()}`
                : ""}
              )
            </span>
          </span>
          <span className="text-slate-500">
            Cost:{" "}
            <span className="text-emerald-400 font-semibold">
              ${cost.totalCostUsd.toFixed(5)}
            </span>
          </span>
          {cost.langsmithRunId && (
            <span
              className="text-slate-600 font-mono truncate max-w-xs"
              title={cost.langsmithRunId}
            >
              run: {cost.langsmithRunId}
            </span>
          )}
        </div>
      )}

      {/* Cost Detail Panel */}
      {detailOpen && (
        <div className="border-t border-slate-700 pt-3 mt-1 space-y-3">
          {detailLoading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg bg-slate-700/50 animate-pulse"
                />
              ))}
            </div>
          )}

          {detailError && (
            <p className="text-xs text-red-400">{detailError}</p>
          )}

          {detail && !detailLoading && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Prompt", value: detail.summary.totalPromptTokens.toLocaleString(), unit: "tok" },
                  { label: "Completion", value: detail.summary.totalCompletionTokens.toLocaleString(), unit: "tok" },
                  { label: "Total Tokens", value: detail.summary.totalTokens.toLocaleString(), unit: "tok" },
                  { label: "Cost", value: `$${detail.summary.totalCostUsd.toFixed(6)}`, unit: "" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-900/60 rounded-lg px-3 py-2 text-center"
                  >
                    <p className="text-slate-500 text-xs">{s.label}</p>
                    <p className="text-slate-200 font-semibold text-sm">
                      {s.value}
                      {s.unit && (
                        <span className="text-slate-600 font-normal text-xs ml-1">
                          {s.unit}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Entries table */}
              {detail.entries.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                  <table className="w-full text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-500">
                      <tr>
                        <th className="text-left px-3 py-2">Model</th>
                        <th className="text-right px-3 py-2">Prompt</th>
                        <th className="text-right px-3 py-2">Completion</th>
                        <th className="text-right px-3 py-2">Cache</th>
                        <th className="text-right px-3 py-2">Total</th>
                        <th className="text-right px-3 py-2">Cost (USD)</th>
                        <th className="text-right px-3 py-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.entries.map((e, i) => (
                        <tr
                          key={i}
                          className="border-t border-slate-800 hover:bg-slate-700/30"
                        >
                          <td className="px-3 py-2 font-mono text-slate-400 max-w-[180px] truncate" title={e.model}>
                            {e.model}
                          </td>
                          <td className="px-3 py-2 text-right">{e.promptTokens.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{e.completionTokens.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">{e.cacheReadTokens.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-indigo-300 font-semibold">
                            {e.totalTokens.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-400 font-semibold">
                            ${e.totalCostUsd.toFixed(6)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500">
                            {new Date(e.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
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
              <MessageCard key={msg.id} msg={msg} sessionId={sessionId} />
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
