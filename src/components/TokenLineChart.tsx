"use client";

import { DailyEntry } from "@/types";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface Props {
  entries: DailyEntry[];
}

function formatTokens(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}k`;
  return String(val);
}

function niceCeil(val: number, steps = 4): number {
  if (val <= 0) return steps;
  const step = val / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(step)));
  const norm = step / mag;
  const niceStep = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return niceStep * mag * steps;
}

const VB_W = 700;
const VB_H = 120;
const BASELINE = 119;

export default function TokenLineChart({ entries }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>
        No data
      </div>
    );
  }

  const maxTokens = niceCeil(Math.max(...entries.map((e) => e.totalTokens), 1));
  const maxCost = niceCeil(Math.max(...entries.map((e) => e.totalCostUsd), 0.01));

  const n = entries.length;
  const xOf = (i: number) => (n === 1 ? VB_W / 2 : (i / (n - 1)) * VB_W);
  const yTokens = (v: number) => BASELINE - (v / maxTokens) * BASELINE;
  const yCost = (v: number) => BASELINE - (v / maxCost) * BASELINE;

  const tokenPoints = entries.map((e, i) => `${xOf(i).toFixed(1)},${yTokens(e.totalTokens).toFixed(1)}`);
  const costPoints = entries.map((e, i) => `${xOf(i).toFixed(1)},${yCost(e.totalCostUsd).toFixed(1)}`);

  const areaPoints = [
    `0,${BASELINE}`,
    ...tokenPoints,
    `${xOf(n - 1).toFixed(1)},${BASELINE}`,
  ].join(" ");

  const tokenAxisLabels = [4, 3, 2, 1, 0].map((i) => formatTokens((maxTokens / 4) * i));
  const costAxisLabels = [4, 3, 2, 1, 0].map((i) => `$${((maxCost / 4) * i).toFixed(2)}`);

  const xLabels = (() => {
    if (n <= 8) return entries.map((e) => format(parseISO(e.date), "MM/dd"));
    const step = Math.ceil(n / 8);
    return entries.filter((_, i) => i % step === 0 || i === n - 1).map((e) => format(parseISO(e.date), "MM/dd"));
  })();

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748B" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
          Total Tokens (left axis)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748B" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
          Cost USD (right axis)
        </div>
      </div>

      {/* Chart with dual Y-axis */}
      <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
        {/* Left Y-axis: Tokens */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 8px 20px 0", textAlign: "right", flexShrink: 0, width: 54 }}>
          {tokenAxisLabels.map((label, i) => (
            <span key={i} style={{ fontSize: 10, color: "#475569", fontFamily: "ui-monospace, monospace" }}>{label}</span>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, position: "relative", height: 140 }}>
          <svg width="100%" height="120" style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            {/* horizontal grid */}
            {[0, 30, 60, 90].map((y) => (
              <line key={y} x1="0" y1={y} x2={VB_W} y2={y} stroke="#1E293B" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1="0" y1={BASELINE} x2={VB_W} y2={BASELINE} stroke="#252D4A" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {/* vertical grid */}
            {[100, 200, 300, 400, 500, 600].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2={BASELINE} stroke="#1E293B" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            ))}

            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Token area + line */}
            <polygon points={areaPoints} fill="url(#blueGrad)" />
            <polyline
              points={tokenPoints.join(" ")}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {entries.map((e, i) => (
              <circle key={`t-${i}`} cx={xOf(i)} cy={yTokens(e.totalTokens)} r="3" fill="#3B82F6" />
            ))}

            {/* Cost line (dashed green) */}
            <polyline
              points={costPoints.join(" ")}
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4,2"
              strokeLinejoin="round"
              opacity="0.85"
              vectorEffect="non-scaling-stroke"
            />
            {entries.map((e, i) => (
              <circle key={`c-${i}`} cx={xOf(i)} cy={yCost(e.totalCostUsd)} r="2.5" fill="#10B981" opacity="0.85" />
            ))}

            {/* Hover guide line */}
            {hoveredIndex !== null && (
              <line
                x1={xOf(hoveredIndex)}
                y1={0}
                x2={xOf(hoveredIndex)}
                y2={BASELINE}
                stroke="#64748B"
                strokeWidth="1"
                strokeDasharray="3,3"
                vectorEffect="non-scaling-stroke"
                opacity="0.6"
              />
            )}

            {/* Invisible hit-area circles for hover */}
            {entries.map((e, i) => (
              <circle
                key={`hit-${i}`}
                cx={xOf(i)}
                cy={(yTokens(e.totalTokens) + yCost(e.totalCostUsd)) / 2}
                r="14"
                fill="transparent"
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (() => {
            const e = entries[hoveredIndex];
            const leftPct = n === 1 ? 50 : (hoveredIndex / (n - 1)) * 100;
            const isRightHalf = leftPct > 60;
            return (
              <div
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: 4,
                  transform: isRightHalf ? "translateX(-100%) translateX(-8px)" : "translateX(8px)",
                  background: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  padding: "8px 10px",
                  fontSize: 11,
                  color: "#E2E8F0",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4, color: "#F1F5F9" }}>
                  {format(parseISO(e.date), "MM/dd")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />
                  <span style={{ color: "#94A3B8" }}>Tokens:</span>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>{e.totalTokens.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                  <span style={{ color: "#94A3B8" }}>Cost:</span>
                  <span style={{ fontFamily: "ui-monospace, monospace" }}>${e.totalCostUsd.toFixed(4)}</span>
                </div>
              </div>
            );
          })()}

          {/* X-axis labels */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569" }}>
            {xLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        {/* Right Y-axis: Cost USD */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 0 20px 8px", textAlign: "left", flexShrink: 0, width: 52 }}>
          {costAxisLabels.map((label, i) => (
            <span key={i} style={{ fontSize: 10, color: "#10B981", fontFamily: "ui-monospace, monospace", opacity: 0.7 }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
