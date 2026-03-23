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

export interface UserSessionEntry {
  sessionId: string;
  chatSessionDbId: number;
  title: string | null;
  status: string;
  sessionCreatedAt: string;
  sessionUpdatedAt: string;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
  firstTrackedAt: string;
  lastTrackedAt: string;
}

export interface UserSessionsData {
  entries: UserSessionEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessageCost {
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

export interface TurnMessage {
  id: number;
  publicId: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  taskId: number | null;
  createdAt: string;
  costs: MessageCost[];
}

export interface SessionMessageEntry {
  messageId: number;
  isUnmapped: boolean;
  messagePublicId: string | null;
  role: string | null;
  messageCreatedAt: string;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  requestCount: number;
  firstTrackedAt: string;
  lastTrackedAt: string;
}

export interface SessionMessagesPagination {
  limit: number;
  offset: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SessionMessagesResponse {
  data: SessionMessageEntry[];
  pagination: SessionMessagesPagination;
}

export interface MessageCostEntry {
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

export interface MessageCostSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requestCount: number;
}

export interface MessageCostDetail {
  message: {
    sessionId: string;
    messageId: number;
    messagePublicId: string | null;
    role: string;
    messageCreatedAt: string;
  };
  summary: MessageCostSummary;
  entries: MessageCostEntry[];
}
