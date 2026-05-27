"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionCost, getSessionMessages, getUserSessions } from "@/lib/api";
import { UserCostSummary, SessionMessageEntry, SessionMessagesPagination } from "@/types";
import StatCard from "@/components/StatCard";
import TurnTokenChart from "@/components/TurnTokenChart";
import TurnTable from "@/components/TurnTable";
import { usePageSetup } from "@/lib/use-page-setup";

const PAGE_LIMIT = 20;
const ORDER: "asc" | "desc" = "desc";

function shortModelName(model: string): string {
  const slash = model.lastIndexOf("/");
  return slash >= 0 ? model.slice(slash + 1) : model;
}

function calcBurnRate(totalTokens: number, first: string, last: string): string {
  if (!first || !last || first === last) return "—";
  const hours = (new Date(last).getTime() - new Date(first).getTime()) / 3_600_000;
  if (hours < 0.01) return "—";
  const rate = totalTokens / hours;
  if (rate >= 1_000_000) return `${(rate / 1_000_000).toFixed(1)}M/hr`;
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(1)}k/hr`;
  return `${Math.round(rate)}/hr`;
}

export default function SessionDetailPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const searchParams = useSearchParams();
  const fromUserId = searchParams.get("userId");
  const shortId = sessionId.length > 20 ? `${sessionId.slice(0, 16)}…` : sessionId;

  usePageSetup([
    { label: "Overview", href: "/" },
    ...(fromUserId ? [{ label: `User #${fromUserId}`, href: `/users/${fromUserId}` }] : []),
    { label: shortId },
  ]);

  const [data, setData] = useState<UserCostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allEntries, setAllEntries] = useState<SessionMessageEntry[]>([]);
  const [entries, setEntries] = useState<SessionMessageEntry[]>([]);
  const [pagination, setPagination] = useState<SessionMessagesPagination | null>(null);
  const [offset, setOffset] = useState(0);
  const [msgLoading, setMsgLoading] = useState(true);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [sessionModels, setSessionModels] = useState<string[]>([]);

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
          setEntries(data);
          setPagination(pagination);
        })
        .catch((err) =>
          setMsgError(err instanceof Error ? err.message : "Failed to load messages")
        )
        .finally(() => setMsgLoading(false));
    },
    [sessionId]
  );

  // Load full chart-friendly dataset (sorted asc) — independent of paginated turn table
  useEffect(() => {
    getSessionMessages(sessionId, 0, 500, "asc")
      .then(({ data }) => setAllEntries(data))
      .catch(() => null);
  }, [sessionId]);

  // Pull session-level models from /sessions endpoint (BE per-turn `models` is still empty).
  // Falls back gracefully when userId is missing (e.g. user lands on session URL directly).
  useEffect(() => {
    if (!fromUserId) return;
    const uid = parseInt(fromUserId);
    if (Number.isNaN(uid)) return;
    getUserSessions(uid, 0, 200)
      .then((d) => {
        const match = d.entries.find((s) => s.sessionId === sessionId);
        if (match?.models?.length) setSessionModels(match.models);
      })
      .catch(() => null);
  }, [sessionId, fromUserId]);

  useEffect(() => {
    loadMessages(0);
  }, [loadMessages]);

  const goToOffset = (off: number) => {
    setOffset(off);
    loadMessages(off);
  };

  // Aggregate models + tokens + cost across all turns for breakdown card.
  // Per-turn `models` is the source of truth; if BE hasn't populated it yet,
  // fall back to session-level models (from /sessions list). Last resort: "unknown".
  const modelBreakdown = useMemo(() => {
    const fallback = sessionModels.length ? sessionModels : ["unknown"];
    const map = new Map<string, { tokens: number; cost: number; turns: number }>();
    for (const e of allEntries) {
      const models = e.models?.length ? e.models : fallback;
      for (const m of models) {
        const cur = map.get(m) ?? { tokens: 0, cost: 0, turns: 0 };
        cur.tokens += Math.round(e.totalTokens / models.length);
        cur.cost += e.totalCostUsd / models.length;
        cur.turns += 1;
        map.set(m, cur);
      }
    }
    return Array.from(map.entries())
      .map(([model, v]) => ({ model, ...v }))
      .sort((a, b) => b.cost - a.cost);
  }, [allEntries, sessionModels]);

  const burnRate = useMemo(() => {
    if (allEntries.length < 2) return "—";
    const sorted = [...allEntries].sort(
      (a, b) => new Date(a.messageCreatedAt).getTime() - new Date(b.messageCreatedAt).getTime()
    );
    const first = sorted[0].messageCreatedAt;
    const last = sorted[sorted.length - 1].messageCreatedAt;
    const totalTokens = sorted.reduce((acc, e) => acc + e.totalTokens, 0);
    return calcBurnRate(totalTokens, first, last);
  }, [allEntries]);

  const totalModelCost = modelBreakdown.reduce((acc, m) => acc + m.cost, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "white" }}>
            S
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Session Detail</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, fontFamily: "'SF Mono', ui-monospace, monospace" }}>{sessionId}</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, padding: "10px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Token Metrics */}
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3B82F6", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        Token Metrics
        <span style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total Tokens" value={data ? data.totalTokens.toLocaleString() : "—"} loading={loading} valueColor="blue" />
        <StatCard label="Input Tokens" value={data ? data.totalPromptTokens.toLocaleString() : "—"} loading={loading} valueColor="slate" />
        <StatCard label="Output Tokens" value={data ? data.totalCompletionTokens.toLocaleString() : "—"} loading={loading} valueColor="slate" />
        <StatCard label="Total Cost" value={data ? `$${data.totalCostUsd.toFixed(4)}` : "—"} hint="USD" loading={loading} valueColor="green" />
      </div>

      {/* Activity */}
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3B82F6", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        Activity &amp; Cache
        <span style={{ flex: 1, height: 1, background: "rgba(59,130,246,0.2)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Turns"
          value={data ? data.requestCount.toLocaleString() : "—"}
          loading={loading}
          valueColor="amber"
        />
        <StatCard
          label="Avg Cost / Turn"
          value={data && data.requestCount > 0 ? `$${(data.totalCostUsd / data.requestCount).toFixed(4)}` : "—"}
          loading={loading}
          valueColor="green"
          hint={data && data.requestCount > 0 ? `= $${data.totalCostUsd.toFixed(4)} / ${data.requestCount} turns` : undefined}
        />
        <StatCard
          label="Burn Rate"
          value={burnRate}
          loading={msgLoading && allEntries.length === 0}
          valueColor="purple"
          badge={{ text: "new", variant: "new" }}
        />
        <StatCard
          label="Cache Saving"
          value="$0.00"
          loading={loading}
          valueColor="cyan"
          badge={{ text: "BE pending", variant: "pending" }}
          hint="Waiting for BE data"
        />
      </div>

      {/* Chart */}
      <div style={{ background: "#141A2E", border: "1px solid #252D4A", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 12 }}>
          Token Usage Over Turn
        </div>
        {allEntries.length === 0 ? (
          <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }} className="animate-pulse">
            Loading chart...
          </div>
        ) : (
          <TurnTokenChart entries={allEntries} />
        )}
      </div>

      {/* Models Breakdown */}
      <div style={{ background: "#141A2E", border: "1px solid #252D4A", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Models Used</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(100,116,139,0.15)", color: "#475569", border: "1px solid #252D4A", letterSpacing: "0.04em" }}>BE PENDING</span>
          <span style={{ fontSize: 11, color: "#64748B", marginLeft: 4 }}>
            ({modelBreakdown.length} {modelBreakdown.length === 1 ? "model" : "models"})
          </span>
        </div>
        {modelBreakdown.length === 0 ? (
          <div style={{ fontSize: 12, color: "#475569" }}>—</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {modelBreakdown.map((m) => {
              const pct = totalModelCost > 0 ? (m.cost / totalModelCost) * 100 : 0;
              return (
                <div key={m.model}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span
                      title={m.model}
                      style={{
                        fontSize: 11,
                        fontFamily: "'SF Mono', ui-monospace, monospace",
                        color: "#94A3B8",
                        background: "rgba(148,163,184,0.08)",
                        border: "1px solid rgba(148,163,184,0.15)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {shortModelName(m.model)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, fontFamily: "'SF Mono', ui-monospace, monospace" }}>
                      <span style={{ color: "#64748B" }}>
                        {m.turns} {m.turns === 1 ? "turn" : "turns"}
                      </span>
                      <span style={{ color: "#60A5FA" }}>
                        {m.tokens.toLocaleString()} tokens
                      </span>
                      <span style={{ color: "#34D399", fontWeight: 600 }}>
                        ${m.cost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 4, background: "rgba(148,163,184,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #3B82F6, #6366F1)", borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Turn Messages */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>Turn Messages</span>
          {pagination && (
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 400, marginLeft: 6 }}>
              ({pagination.total} total)
            </span>
          )}
          {msgLoading && (
            <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }} className="animate-pulse">Loading...</span>
          )}
        </div>

        {msgError && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, padding: "10px 16px", borderRadius: 8, marginBottom: 12 }}>
            {msgError}
          </div>
        )}

        {pagination ? (
          <TurnTable
            entries={entries.map((e) => ({
              ...e,
              models: e.models?.length ? e.models : sessionModels,
            }))}
            total={pagination.total}
            limit={PAGE_LIMIT}
            offset={offset}
            onPageChange={goToOffset}
          />
        ) : (
          <div style={{ background: "#141A2E", border: "1px solid #252D4A", borderRadius: 10, height: 96, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }} className="animate-pulse">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
