"use client";

import { Segment, SEGMENTS, SEGMENT_LABELS } from "@/lib/segment";

type Props = {
  value: Segment;
  onChange: (next: Segment) => void;
};

export default function SegmentTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex bg-surface border border-border-default rounded-lg overflow-hidden">
      {SEGMENTS.map((seg) => {
        const active = seg === value;
        const { label, hint } = SEGMENT_LABELS[seg];
        return (
          <button
            key={seg}
            type="button"
            onClick={() => onChange(seg)}
            title={hint}
            aria-pressed={active}
            className={`px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
