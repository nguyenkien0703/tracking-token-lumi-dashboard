"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import DateRangePicker from "@/components/DateRangePicker";
import UserSearch from "@/components/UserSearch";
import { DateRange } from "@/types";

interface TopUser {
  rank: number;
  userId: number;
  email: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  requestCount: number;
}

const REFRESH_INTERVAL = 60; // 1 minute in seconds

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [sortBy, setSortBy] = useState<"cost" | "tokens">("cost");
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const scanRef = useRef<() => Promise<void>>(async () => {});
  const mountedRef = useRef(false);

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsers([]);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 90));
    }, 300);

    try {
      const sp = new URLSearchParams({ sortBy });
      if (dateRange.from) sp.set("from", dateRange.from);
      if (dateRange.to) sp.set("to", dateRange.to);
      const res = await fetch(`/api/admin/top-users?${sp}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      setUsers(json.data?.users ?? []);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }, [dateRange, sortBy]);

  // Keep ref updated so timer always calls latest scan
  useEffect(() => { scanRef.current = scan; }, [scan]);

  // Initial load
  useEffect(() => {
    scan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters change (skip initial mount)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    scan();
  }, [sortBy, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer — auto-refresh every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          scanRef.current();
          return REFRESH_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCost = users.reduce((s, u) => s + u.totalCostUsd, 0);
  const totalTokens = users.reduce((s, u) => s + u.totalTokens, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Top 100 users by usage
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* User search */}
        <UserSearch />

        {/* Sort toggle */}
        <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs">
          <button
            onClick={() => setSortBy("cost")}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === "cost"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            By Cost
          </button>
          <button
            onClick={() => setSortBy("tokens")}
            className={`px-3 py-1.5 transition-colors ${
              sortBy === "tokens"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            By Tokens
          </button>
        </div>

        {/* Refresh controls */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {!loading && (
            <span className="text-slate-300 text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5">
              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Next refresh in{" "}
              <span className={`font-mono font-semibold ${countdown <= 30 ? "text-amber-400" : "text-slate-200"}`}>
                {formatCountdown(countdown)}
              </span>
            </span>
          )}

          <button
            onClick={() => { scan(); setCountdown(REFRESH_INTERVAL); }}
            disabled={loading}
            className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary stats */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Active Users</p>
            <p className="text-2xl font-bold text-indigo-400">{users.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Tokens</p>
            <p className="text-2xl font-bold text-indigo-400">{totalTokens.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-emerald-400">${totalCost.toFixed(4)}</p>
            <p className="text-slate-500 text-xs mt-0.5">USD</p>
          </div>
        </div>
      )}

      {/* Top users table */}
      <div>
        <h2 className="text-slate-200 font-semibold mb-3">
          Top Users — sorted by {sortBy === "cost" ? "Total Cost" : "Total Tokens"}
          {users.length > 0 && (
            <span className="ml-2 text-slate-500 font-normal text-sm">
              ({users.length} users)
            </span>
          )}
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10 text-center">Rank</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 text-right">Total Tokens</th>
                <th className="px-4 py-3 text-right">Prompt</th>
                <th className="px-4 py-3 text-right">Completion</th>
                <th className="px-4 py-3 text-right">Requests</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Avg / Request</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    No usage data found
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const displayName =
                  [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                  u.userName ||
                  u.email ||
                  `#${u.userId}`;
                const initials =
                  u.firstName?.[0] ?? u.lastName?.[0] ?? u.userName?.[0] ?? "#";

                return (
                  <tr key={u.userId} className="bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {u.rank === 1 ? (
                        <span className="text-amber-400 font-bold">🥇</span>
                      ) : u.rank === 2 ? (
                        <span className="text-slate-400 font-bold">🥈</span>
                      ) : u.rank === 3 ? (
                        <span className="text-amber-700 font-bold">🥉</span>
                      ) : (
                        <span className="text-slate-500 text-xs">{u.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/users/${u.userId}`} className="flex items-center gap-2.5 group">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-300">
                            {initials.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-medium group-hover:text-indigo-300 transition-colors truncate">
                            {displayName}
                          </p>
                          {u.email && u.email !== displayName && (
                            <p className="text-slate-500 text-xs truncate">{u.email}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-indigo-300">
                      {u.totalTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {u.totalPromptTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {u.totalCompletionTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {u.requestCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                      ${u.totalCostUsd.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {u.requestCount > 0
                        ? Math.round(u.totalTokens / u.requestCount).toLocaleString()
                        : "—"}{" "}
                      tok
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
