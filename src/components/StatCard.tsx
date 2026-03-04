interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "indigo" | "emerald" | "amber" | "red";
}

const accentMap = {
  indigo: "text-indigo-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

export default function StatCard({ label, value, sub, accent = "indigo" }: StatCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentMap[accent]}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}
