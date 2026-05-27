import { Loader2, RefreshCw } from "lucide-react";

type Props = {
  onClick: () => void;
  loading?: boolean;
  label?: string;
};

export default function RefreshButton({ onClick, loading = false, label = "Refresh" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? `Refreshing ${label}` : `Refresh ${label}`}
      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors flex items-center gap-1.5"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}
