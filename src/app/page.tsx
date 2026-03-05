"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DateRangePicker from "@/components/DateRangePicker";
import { DateRange } from "@/types";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  userName: string;
}

interface TopUser {
  userId: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  requestCount: number;
  info: UserInfo | null;
}

const SYNC_INTERVAL = 5 * 60; // 5 minutes in seconds

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatUpdatedTime(lastSyncAt: string | null): string {
  if (!lastSyncAt) return "";
  return new Date(lastSyncAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function OverviewPage() {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });

  const [users, setUsers] = useState<TopUser[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("idle");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(SYNC_INTERVAL);
  const scanRef = useRef<() => Promise<void>>(async () => {});

  const scan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsers([]);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 90));
    }, 300);

    try {
      const sp = new URLSearchParams();
      if (dateRange.from) sp.set("from", dateRange.from);
      if (dateRange.to) sp.set("to", dateRange.to);
      const res = await fetch(`/api/users/top?${sp}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotalRecords(data.totalRecords ?? 0);
      setLastSyncAt(data.lastSyncAt ?? null);
      setSyncStatus(data.syncStatus ?? "idle");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  }, [dateRange]);

  const handleRefresh = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
      setSyncing(false);
      return;
    }
    setSyncing(false);
    await scan();
    setCountdown(SYNC_INTERVAL);
  }, [scan]);

  // Keep ref updated so timer always calls latest scan
  useEffect(() => { scanRef.current = scan; }, [scan]);

  useEffect(() => {
    scan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer — auto-scan every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          scanRef.current();
          return SYNC_INTERVAL;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userIdInput.trim());
    if (!isNaN(id) && id > 0) router.push(`/users/${id}`);
  };

  const totalCost = users.reduce((s, u) => s + u.totalCostUsd, 0);
  const totalTokens = users.reduce((s, u) => s + u.totalTokens, 0);
  const isBusy = loading || syncing;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
            Top users by token usage
            {totalRecords > 0 && !loading && (
              <span className="text-slate-500">
                — from {totalRecords.toLocaleString()} total records
                {lastSyncAt && (
                  <> · updated {formatUpdatedTime(lastSyncAt)}</>
                )}
              </span>
            )}
            {syncStatus === "syncing" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                <span className="inline-block w-2 h-2 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                Syncing...
              </span>
            )}
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* User search */}
        <form onSubmit={handleUserSearch} className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            placeholder="Jump to User ID..."
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!userIdInput}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            View →
          </button>
        </form>

        {/* Sync status bar */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {lastSyncAt && !loading && (
            <span className="text-slate-400 text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap">
              Updated {formatUpdatedTime(lastSyncAt)}
            </span>
          )}

          {!syncing && (
            <span className="text-slate-300 text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5">
              {loading ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next refresh in{" "}
                  <span className={`font-mono font-semibold ${countdown <= 30 ? "text-amber-400" : "text-slate-200"}`}>
                    {formatCountdown(countdown)}
                  </span>
                </>
              )}
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={isBusy}
            className="text-sm px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {syncing ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-sync hint */}
      <p className="text-slate-600 text-xs -mt-3">
        Auto-syncs every 5 minutes
      </p>

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
        <div className="grid grid-cols-3 gap-4">
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
          Top Users by Token Usage
          {users.length > 0 && (
            <span className="ml-2 text-slate-500 font-normal text-sm">
              ({users.length} active users)
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
              {users.map((u, i) => (
                <tr key={u.userId} className="bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 py-3 text-center">
                    {i === 0 ? (
                      <span className="text-amber-400 font-bold">🥇</span>
                    ) : i === 1 ? (
                      <span className="text-slate-400 font-bold">🥈</span>
                    ) : i === 2 ? (
                      <span className="text-amber-700 font-bold">🥉</span>
                    ) : (
                      <span className="text-slate-500 text-xs">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${u.userId}`} className="flex items-center gap-2.5 group">
                      {u.info?.avatarUrl ? (
                        <img
                          src={u.info.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-300">
                          {u.info ? (u.info.firstName?.[0] ?? u.info.lastName?.[0] ?? "#") : "#"}
                        </div>
                      )}
                      <div className="min-w-0">
                        {u.info ? (
                          <>
                            <p className="text-slate-200 text-sm font-medium group-hover:text-indigo-300 transition-colors truncate">
                              {[u.info.firstName, u.info.lastName].filter(Boolean).join(" ") || `#${u.userId}`}
                            </p>
                            <p className="text-slate-500 text-xs truncate">{u.info.email}</p>
                          </>
                        ) : (
                          <p className="text-indigo-400 group-hover:text-indigo-300 font-medium">
                            #{u.userId}
                          </p>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
