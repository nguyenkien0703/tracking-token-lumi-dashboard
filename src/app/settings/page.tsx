"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface TokenStatus {
  status: "ok" | "error" | "loading";
  hasToken?: boolean;
  expiresAt?: string;
  expiresInMinutes?: number;
  userId?: number;
  role?: string;
  message?: string;
}

function ExpiryBadge({ minutes }: { minutes: number }) {
  if (minutes < 0) return <span className="text-danger text-xs font-medium">Expired</span>;
  if (minutes < 60) return <span className="text-warning text-xs font-medium">{minutes}m remaining</span>;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return <span className="text-success text-xs font-medium">{hours}h remaining</span>;
  const days = Math.floor(hours / 24);
  return <span className="text-success text-xs font-medium">{days}d remaining</span>;
}

export default function SettingsPage() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({ status: "loading" });
  const [forceRefreshing, setForceRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    setTokenStatus({ status: "loading" });
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setTokenStatus(data);
    } catch {
      setTokenStatus({ status: "error", message: "Cannot reach dashboard server" });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleForceRefresh = async () => {
    setForceRefreshing(true);
    try {
      const res = await fetch("/api/auth/status", { method: "POST" });
      const data = await res.json();
      setTokenStatus(data);
    } catch {
      setTokenStatus({ status: "error", message: "Force refresh failed" });
    } finally {
      setForceRefreshing(false);
    }
  };

  const isOk = tokenStatus.status === "ok" && tokenStatus.hasToken;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<SettingsIcon className="w-5 h-5" />}
        title="Settings"
        subtitle="Token được tự động quản lý — không cần thao tác thủ công."
      />

      {/* Token Status Card */}
      <div className="bg-surface border border-border-default rounded-[10px] p-6 max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary font-semibold text-sm">Admin Token</h2>
          <div className="flex items-center gap-2">
            {tokenStatus.status === "loading" ? (
              <span className="inline-block w-2 h-2 rounded-full bg-text-muted animate-pulse" />
            ) : isOk ? (
              <span className="inline-block w-2 h-2 rounded-full bg-success" />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-danger" />
            )}
            <span className="text-text-secondary text-xs">
              {tokenStatus.status === "loading"
                ? "Checking..."
                : isOk
                ? "Active"
                : "Error"}
            </span>
          </div>
        </div>

        {isOk && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border-default">
              <span className="text-text-secondary">Role</span>
              <span className="bg-primary/10 text-primary text-xs font-mono px-2 py-0.5 rounded">
                {tokenStatus.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-default">
              <span className="text-text-secondary">User ID</span>
              <span className="text-text-primary font-mono">#{tokenStatus.userId}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-default">
              <span className="text-text-secondary">Expires at</span>
              <span className="text-text-secondary text-xs">
                {tokenStatus.expiresAt
                  ? new Date(tokenStatus.expiresAt).toLocaleString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Time remaining</span>
              {tokenStatus.expiresInMinutes !== undefined && (
                <ExpiryBadge minutes={tokenStatus.expiresInMinutes} />
              )}
            </div>
          </div>
        )}

        {tokenStatus.status === "error" && (
          <div className="bg-danger/10 border border-danger/40 rounded-lg px-4 py-3 text-sm text-danger">
            {tokenStatus.message}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleForceRefresh}
            disabled={forceRefreshing || tokenStatus.status === "loading"}
            className="text-sm px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {forceRefreshing ? "Refreshing..." : "Force Refresh Token"}
          </button>
          <button
            onClick={fetchStatus}
            disabled={tokenStatus.status === "loading"}
            className="text-sm px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border-default disabled:opacity-50 text-text-secondary transition-colors"
          >
            Reload Status
          </button>
        </div>
      </div>

      {/* Config Info */}
      <div className="bg-surface/60 border border-border-default rounded-[10px] p-5 max-w-lg">
        <h2 className="text-text-primary font-semibold text-sm mb-3">Configuration</h2>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex gap-3">
            <span className="text-text-muted w-36 shrink-0">API_BASE_URL</span>
            <span className="text-text-secondary break-all">
              {process.env.NEXT_PUBLIC_DISPLAY_API_URL ?? "(server-side only)"}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-text-muted w-36 shrink-0">ADMIN_EMAIL</span>
            <span className="text-text-secondary">(server-side only)</span>
          </div>
          <div className="flex gap-3">
            <span className="text-text-muted w-36 shrink-0">Auto-refresh</span>
            <span className="text-success">Enabled (5 min before expiry)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
