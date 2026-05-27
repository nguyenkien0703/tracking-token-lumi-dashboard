"use client";

import Link from "next/link";
import { UserSessionEntry } from "@/types";
import { format, parseISO } from "date-fns";

interface Props {
  entries: UserSessionEntry[];
  total: number;
  limit: number;
  offset: number;
  userId: number;
  onPageChange: (offset: number) => void;
}

function shortModelName(model: string): string {
  // "z-ai/glm-5-turbo" → "glm-5-turbo"
  const slash = model.lastIndexOf("/");
  return slash >= 0 ? model.slice(slash + 1) : model;
}

function ModelCell({ models }: { models?: string[] }) {
  if (!models?.length) {
    return <span style={{ color: "#334155" }}>—</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-start" }}>
      {models.map((m) => (
        <span
          key={m}
          title={m}
          style={{
            display: "inline-block",
            fontSize: 10,
            fontFamily: "'SF Mono', ui-monospace, monospace",
            color: "#94A3B8",
            background: "rgba(148,163,184,0.08)",
            border: "1px solid rgba(148,163,184,0.15)",
            padding: "2px 6px",
            borderRadius: 4,
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          {shortModelName(m)}
        </span>
      ))}
    </div>
  );
}

function calcBurnRate(
  totalTokens: number,
  firstTrackedAt: string,
  lastTrackedAt: string
): string {
  if (!firstTrackedAt || !lastTrackedAt || firstTrackedAt === lastTrackedAt) return "—";
  const hours = (new Date(lastTrackedAt).getTime() - new Date(firstTrackedAt).getTime()) / 3_600_000;
  if (hours < 0.01) return "—";
  const rate = totalTokens / hours;
  if (rate >= 1_000_000) return `${(rate / 1_000_000).toFixed(1)}M/hr`;
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(1)}k/hr`;
  return `${Math.round(rate)}/hr`;
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em",
  color: "#475569", fontWeight: 600,
  borderBottom: "1px solid #1E293B",
  whiteSpace: "nowrap",
  textAlign: "right",
};

const tdBase: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid rgba(30,41,59,0.6)",
  fontSize: 12,
  fontFamily: "'SF Mono', ui-monospace, monospace",
  textAlign: "right",
  color: "#94A3B8",
};

function Badge({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 8, background: bg, color, padding: "1px 4px",
      borderRadius: 3, fontWeight: 700, marginLeft: 4, verticalAlign: "middle",
      letterSpacing: "0.04em", border: `1px solid ${border}`,
    }}>
      {text}
    </span>
  );
}

export default function SessionTable({ entries, total, limit, offset, userId, onPageChange }: Props) {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #252D4A" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              <th style={{ ...thStyle, width: 32, textAlign: "center" }}>#</th>
              <th style={{ ...thStyle, textAlign: "left", minWidth: 180 }}>Title</th>
              <th style={{ ...thStyle, textAlign: "left", minWidth: 110 }}>
                Models
                <Badge text="NEW" color="#60A5FA" bg="rgba(59,130,246,0.2)" border="rgba(59,130,246,0.3)" />
              </th>
              <th style={thStyle}>
                Turns
                <Badge text="RENAMED" color="#6EE7B7" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.2)" />
              </th>
              <th style={thStyle}>
                Input Tokens
                <Badge text="RENAMED" color="#6EE7B7" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.2)" />
              </th>
              <th style={thStyle}>
                Output Tokens
                <Badge text="RENAMED" color="#6EE7B7" bg="rgba(16,185,129,0.15)" border="rgba(16,185,129,0.2)" />
              </th>
              <th style={thStyle}>
                Cache Write
                <Badge text="BE PENDING" color="#475569" bg="rgba(100,116,139,0.15)" border="#252D4A" />
              </th>
              <th style={thStyle}>
                Cache Hit
                <Badge text="BE PENDING" color="#475569" bg="rgba(100,116,139,0.15)" border="#252D4A" />
              </th>
              <th style={thStyle}>
                Saving ($)
                <Badge text="BE PENDING" color="#475569" bg="rgba(100,116,139,0.15)" border="#252D4A" />
              </th>
              <th style={thStyle}>
                Burn Rate
                <Badge text="NEW" color="#60A5FA" bg="rgba(59,130,246,0.2)" border="rgba(59,130,246,0.3)" />
              </th>
              <th style={thStyle}>Cost</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={12} style={{ ...tdBase, textAlign: "center", padding: "40px 10px", color: "#475569" }}>
                  No sessions found
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr key={e.sessionId} style={{ background: "transparent" }}
                className="hover:bg-white/[0.02] transition-colors">
                <td style={{ ...tdBase, textAlign: "center", color: "#475569", fontSize: 11 }}>
                  {offset + i + 1}
                </td>
                <td style={{ ...tdBase, textAlign: "left", fontFamily: "inherit" }}>
                  <Link
                    href={`/sessions/${e.sessionId}?userId=${userId}`}
                    style={{ color: "#818CF8", fontWeight: 500, fontSize: 12, display: "block", textDecoration: "none" }}
                    className="hover:underline"
                    title={e.title ?? e.sessionId}
                  >
                    {e.title || <span style={{ color: "#475569", fontStyle: "italic" }}>Untitled</span>}
                  </Link>
                  <span style={{ color: "#334155", fontSize: 10, fontFamily: "'SF Mono', ui-monospace, monospace" }}>
                    {e.sessionId.slice(0, 12)}…
                  </span>
                </td>
                <td style={{ ...tdBase, textAlign: "left", fontFamily: "inherit", verticalAlign: "top" }}>
                  <ModelCell models={e.models} />
                </td>
                <td style={{ ...tdBase, color: "#FBBF24", fontWeight: 600 }}>
                  {e.requestCount}
                </td>
                <td style={{ ...tdBase, color: "#60A5FA" }}>
                  {e.totalPromptTokens.toLocaleString()}
                </td>
                <td style={{ ...tdBase, color: "#94A3B8" }}>
                  {e.totalCompletionTokens.toLocaleString()}
                </td>
                <td style={{ ...tdBase, color: "#334155" }}>
                  {(e.cacheWriteTokens ?? 0).toLocaleString()}
                </td>
                <td style={{ ...tdBase, color: "#334155" }}>
                  {(e.cacheHitTokens ?? 0).toLocaleString()}
                </td>
                <td style={{ ...tdBase, color: "#334155" }}>
                  ${(e.cacheSavingUsd ?? 0).toFixed(4)}
                </td>
                <td style={{ ...tdBase, color: "#A78BFA", fontSize: 11 }}>
                  {calcBurnRate(e.totalTokens, e.firstTrackedAt, e.lastTrackedAt)}
                </td>
                <td style={{ ...tdBase, color: "#34D399", fontWeight: 600 }}>
                  ${e.totalCostUsd.toFixed(4)}
                </td>
                <td style={{ ...tdBase, textAlign: "left", fontFamily: "inherit", color: "#475569" }}>
                  {e.sessionCreatedAt ? format(parseISO(e.sessionCreatedAt), "MM/dd HH:mm") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#475569" }}>
          <span style={{ fontSize: 11 }}>
            {offset + 1}–{Math.min(offset + limit, total)} of {total.toLocaleString()} sessions
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              disabled={page === 1}
              onClick={() => onPageChange(Math.max(0, offset - limit))}
              style={{ padding: "4px 10px", borderRadius: 5, background: "#1B2240", border: "1px solid #252D4A", color: "#94A3B8", fontSize: 11, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 11 }}>Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(offset + limit)}
              style={{ padding: "4px 10px", borderRadius: 5, background: "#1B2240", border: "1px solid #252D4A", color: "#94A3B8", fontSize: 11, cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {total > 0 && totalPages <= 1 && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#334155", textAlign: "right" }}>
          Showing {entries.length} of {total} sessions
        </div>
      )}
    </div>
  );
}
