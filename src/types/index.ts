export interface ModelUsage {
  tokens: number;
  costUsd: number;
}

export interface UserCostSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
  modelUsage?: Record<string, ModelUsage>;
}

export interface HistoryEntry {
  id: string;
  sessionId: string;
  userId: number;
  messageId: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  langsmithRunId: string | null;
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
