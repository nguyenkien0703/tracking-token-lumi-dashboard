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
  icon?: ReactNode;
  loading?: boolean;
};

const valueColorMap: Record<StatCardValueColor, string> = {
  default: "text-text-primary",
  blue:    "text-[#60A5FA]",
  green:   "text-[#34D399]",
  amber:   "text-[#FBBF24]",
  purple:  "text-[#A78BFA]",
  cyan:    "text-[#22D3EE]",
  rose:    "text-[#FB7185]",
  slate:   "text-text-secondary",
};

const chipBgMap: Record<StatCardTone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
};

function DeltaRow({ delta }: { delta: StatCardDelta }) {
  const positiveIsGood = delta.positiveIsGood ?? true;
  const abs = Math.abs(delta.value);

  if (abs < 0.5) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
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
    <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${color}`}>
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
  valueColor = "default",
  icon,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border-default rounded-xl p-3">
        <Skeleton width="60%" height={10} />
        <Skeleton width="50%" height={28} className="mt-3" />
        <Skeleton width="40%" height={12} className="mt-2" />
      </div>
    );
  }

  return (
    <div className={`bg-surface border rounded-xl p-3 ${
      tone === "warning" ? "border-warning/40" :
      tone === "danger"  ? "border-danger/40"  :
      "border-border-default"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {label}
        </p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chipBgMap[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`mt-1.5 font-mono text-xl md:text-2xl font-bold leading-none ${valueColorMap[valueColor]}`}>
        {value}
      </p>
      {delta ? (
        <DeltaRow delta={delta} />
      ) : hint ? (
        <p className="mt-1 text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
