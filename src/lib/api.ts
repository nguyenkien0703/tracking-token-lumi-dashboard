import { UserCostSummary, HistoryData, SessionMessagesResponse, MessageCostDetail, SessionMessageEntry, UserSessionsData, DailyEntry } from "@/types";

export interface CostComparison {
  current: UserCostSummary;
  previous: UserCostSummary;
}

// Tất cả API calls đi qua proxy — token được quản lý hoàn toàn server-side
const PROXY = "/api/proxy";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PROXY}/${path}`, { cache: "no-store" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? `API ${res.status}: request failed`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function getUserCost(
  userId: number,
  from?: string,
  to?: string
): Promise<UserCostSummary> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return apiFetch(`api/v1/normal-mode/costs/user/${userId}${qs ? `?${qs}` : ""}`);
}

export async function getUserCostComparison(
  userId: number,
  from: string,
  to: string
): Promise<CostComparison> {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const periodMs = toDate.getTime() - fromDate.getTime();
  const prevFrom = new Date(fromDate.getTime() - periodMs).toISOString().slice(0, 10);
  const prevTo = from;

  const [current, previous] = await Promise.all([
    getUserCost(userId, from, to),
    getUserCost(userId, prevFrom, prevTo),
  ]);
  return { current, previous };
}

export async function getDailyBreakdown(
  userId: number,
  from: string,
  to: string
): Promise<DailyEntry[]> {
  const data = await getHistory({ userId, from, to, limit: 500, offset: 0 });

  const byDate = new Map<string, DailyEntry>();
  for (const entry of data.entries) {
    const date = entry.createdAt.slice(0, 10);
    const existing = byDate.get(date);
    if (existing) {
      existing.totalTokens += entry.totalTokens;
      existing.totalCostUsd += entry.totalCostUsd;
      existing.requestCount += 1;
    } else {
      byDate.set(date, {
        date,
        totalTokens: entry.totalTokens,
        totalCostUsd: entry.totalCostUsd,
        requestCount: 1,
      });
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getHistory(params: {
  userId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  model?: string;
}): Promise<HistoryData> {
  const sp = new URLSearchParams();
  if (params.userId !== undefined) sp.set("userId", String(params.userId));
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  if (params.offset !== undefined) sp.set("offset", String(params.offset));
  if (params.model) sp.set("model", params.model);
  return apiFetch(`api/v1/normal-mode/costs/history?${sp.toString()}`);
}

export async function getUserSessions(
  userId: number,
  offset = 0,
  limit = 50
): Promise<UserSessionsData> {
  const sp = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiFetch(`api/v1/normal-mode/costs/user/${userId}/sessions?${sp.toString()}`);
}

export async function getSessionCost(sessionId: string): Promise<UserCostSummary> {
  return apiFetch(`api/v1/normal-mode/costs/session/${sessionId}`);
}

export async function getMessageCostDetail(
  sessionId: string,
  messageId: number
): Promise<MessageCostDetail> {
  return apiFetch(
    `api/v1/normal-mode/costs/session/${sessionId}/message/${messageId}`
  );
}

export async function getSessionMessages(
  sessionId: string,
  offset = 0,
  limit = 20,
  order: "asc" | "desc" = "asc"
): Promise<SessionMessagesResponse> {
  const sp = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    order,
  });
  const res = await fetch(
    `${PROXY}/api/v1/normal-mode/costs/session/${sessionId}/messages?${sp.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? `API ${res.status}: request failed`);
  }
  const json = await res.json();
  // API returns: { success, data: { entries: [...], total, limit, offset } }
  const payload = json.data as { entries: SessionMessagesResponse["data"]; total: number; limit: number; offset: number };
  const pagination: SessionMessagesResponse["pagination"] = {
    total: payload.total,
    limit: payload.limit,
    offset: payload.offset,
    hasNext: payload.offset + payload.limit < payload.total,
    hasPrev: payload.offset > 0,
  };
  return { data: payload.entries, pagination };
}

export function computeAlertThreshold(dailyEntries: DailyEntry[]): number | null {
  if (dailyEntries.length < 7) return null;
  const costs = dailyEntries.map((e) => e.totalCostUsd).sort((a, b) => a - b);
  const mid = Math.floor(costs.length / 2);
  const median = costs.length % 2 === 0
    ? (costs[mid - 1] + costs[mid]) / 2
    : costs[mid];
  return median * 2;
}
