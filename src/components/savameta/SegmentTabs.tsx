export type Segment = "all" | "savameta" | "external" | "anonymous";

const TABS: Array<{ value: Segment; label: string; hint: string }> = [
  { value: "all", label: "All", hint: "all signed-in + anonymous" },
  { value: "savameta", label: "Savameta", hint: "@savameta.com" },
  { value: "external", label: "External", hint: "personal email" },
  { value: "anonymous", label: "Anonymous", hint: "no login" },
];

type Props = {
  value: Segment;
  onChange: (next: Segment) => void;
};

export default function SegmentTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex bg-slate-800 border border-slate-700 rounded overflow-hidden">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            title={tab.hint}
            className={`px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
