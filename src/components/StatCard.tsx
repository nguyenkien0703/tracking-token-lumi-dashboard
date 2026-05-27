import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import Skeleton from "./Skeleton";

export type StatCardTone = "default" | "success" | "warning" | "danger";

export type StatCardDelta = {
  value: number; // signed percentage e.g. -3.2
  label?: string; // e.g. "vs last week"
  positiveIsGood?: boolean; // default true; set false for cost/error metrics
};

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  delta?: StatCardDelta;
  tone?: StatCardTone;
  icon?: ReactNode;
  loading?: boolean;
};

const chipBgMap: Record<StatCardTone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

function DeltaRow({ delta }: { delta: StatCardDelta }) {
  const positiveIsGood = delta.positiveIsGood ?? true;
  const abs = Math.abs(delta.value);

  if (abs < 0.5) {
    return (
      <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
        <Minus className="w-3 h-3" />
        <span>stable{delta.label ? ` ${delta.label}` : ""}</span>
      </p>
    );
  }

  const isUp = delta.value > 0;
  const isGood = isUp === positiveIsGood;
  const color = isGood ? "text-success" : "text-danger";
  const Arrow = isUp ? ArrowUp : ArrowDown;

  return (
    <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${color}`}>
      <Arrow className="w-3 h-3" />
      <span>{Math.abs(delta.value).toFixed(1)}%</span>
      {delta.label && <span className="text-text-muted font-normal">{delta.label}</span>}
    </p>
  );
}

export default function StatCard({
  label,
  value,
  hint,
  delta,
  tone = "default",
  icon,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border-default rounded-xl p-4">
        <Skeleton width="60%" height={10} />
        <Skeleton width="50%" height={28} className="mt-3" />
        <Skeleton width="40%" height={12} className="mt-2" />
      </div>
    );
  }

  return (
    <div className={`bg-surface border rounded-xl p-4 ${
      tone === "warning" ? "border-warning/40" :
      tone === "danger"  ? "border-danger/40"  :
      "border-border-default"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">
          {label}
        </p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chipBgMap[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 font-mono text-2xl md:text-3xl font-semibold text-text-primary leading-none">
        {value}
      </p>
      {delta ? (
        <DeltaRow delta={delta} />
      ) : hint ? (
        <p className="mt-2 text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
