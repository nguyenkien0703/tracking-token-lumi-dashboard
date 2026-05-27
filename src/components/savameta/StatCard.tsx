type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-indigo-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export default function StatCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
