"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSessionCost } from "@/lib/api";
import { UserCostSummary } from "@/types";
import StatCard from "@/components/StatCard";
import ModelBarChart from "@/components/ModelBarChart";

export default function SessionDetailPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const searchParams = useSearchParams();
  const fromUserId = searchParams.get("userId");








  
  const [data, setData] = useState<UserCostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessionCost(sessionId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load session"))
      .finally(() => setLoading(false));
  }, [sessionId]);

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
    </div>
  );
}
