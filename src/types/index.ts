export interface ModelUsage {
  tokens: number;
  costUsd: number;
}

export interface UserCostSummary {
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
  modelUsage: Record<string, ModelUsage>;
}

export interface HistoryEntry {
  id: string;
  sessionId: string;
  userId: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  model: string;
  createdAt: string;
}

export interface HistoryData {
  entries: HistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface DateRange {
  from: string;
  to: string;
}
