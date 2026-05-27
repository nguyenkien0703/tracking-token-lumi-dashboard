import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import Skeleton from "./Skeleton";

export type StatCardTone = "default" | "success" | "warning" | "danger";
export type StatCardValueColor = "default" | "blue" | "green" | "amber" | "purple" | "cyan" | "rose" | "slate";

export type StatCardDelta = {
  value: number;
  label?: string;
  positiveIsGood?: boolean;
};

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  delta?: StatCardDelta;
  tone?: StatCardTone;
  valueColor?: StatCardValueColor;
  badge?: { text: string; variant: "renamed" | "new" | "pending" };
  icon?: ReactNode;
  loading?: boolean;
  grouped?: boolean;
};

const valueColorMap: Record<StatCardValueColor, string> = {
  default: "#F1F5F9",
  blue:    "#60A5FA",
  green:   "#34D399",
  amber:   "#FBBF24",
  purple:  "#A78BFA",
  cyan:    "#22D3EE",
  rose:    "#FB7185",
  slate:   "#94A3B8",
};

const badgeStyle: Record<"renamed" | "new" | "pending", React.CSSProperties> = {
  renamed: { background: "rgba(16,185,129,0.1)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.2)" },
  new:     { background: "rgba(59,130,246,0.15)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" },
  pending: { background: "rgba(100,116,139,0.15)", color: "#475569", border: "1px solid #252D4A" },
};

function Badge({ text, variant }: { text: string; variant: "renamed" | "new" | "pending" }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 6px", borderRadius: 4,
      fontSize: 10, fontWeight: 600, marginLeft: 4, verticalAlign: "middle",
      ...badgeStyle[variant],
    }}>
      {text}
    </span>
  );
}

function DeltaRow({ delta }: { delta: StatCardDelta }) {
  const positiveIsGood = delta.positiveIsGood ?? true;
  const abs = Math.abs(delta.value);

  if (abs < 0.5) {
    return (
      <p style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#475569" }}>
        <Minus style={{ width: 10, height: 10 }} />
        <span>stable{delta.label ? ` ${delta.label}` : ""}</span>
      </p>
    );
  }

  const isUp = delta.value > 0;
  const isGood = isUp === positiveIsGood;
  const color = isGood ? "#10B981" : "#EF4444";
  const Arrow = isUp ? ArrowUp : ArrowDown;

  return (
    <p style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 500, color }}>
      <Arrow style={{ width: 10, height: 10 }} />
      <span>{Math.abs(delta.value).toFixed(1)}%</span>
      {delta.label && <span style={{ color: "#475569", fontWeight: 400 }}>{delta.label}</span>}
    </p>
  );
}

export default function StatCard({
  label,
  value,
  hint,
  delta,
  tone = "default",
  valueColor = "default",
  badge,
  icon,
  loading = false,
}: StatCardProps) {
  const borderColor =
    tone === "warning" ? "rgba(245,158,11,0.4)" :
    tone === "danger"  ? "rgba(239,68,68,0.4)"  :
    "#252D4A";

  if (loading) {
    return (
      <div style={{ background: "#141A2E", border: `1px solid ${borderColor}`, borderRadius: 10, padding: "14px 16px" }}>
        <Skeleton width="60%" height={9} />
        <Skeleton width="50%" height={22} className="mt-2" />
        <Skeleton width="40%" height={10} className="mt-1.5" />
      </div>
    );
  }

  return (
    <div style={{ background: "#141A2E", border: `1px solid ${borderColor}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600, lineHeight: 1 }}>
          {label}
          {badge && <Badge text={badge.text} variant={badge.variant} />}
        </p>
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "'SF Mono', ui-monospace, monospace", lineHeight: 1, color: valueColorMap[valueColor] }}>
        {value}
      </p>
      {delta ? (
        <DeltaRow delta={delta} />
      ) : hint ? (
        <p style={{ fontSize: 11, color: "#475569", marginTop: 5 }}>{hint}</p>
      ) : null}
    </div>
  );
}
