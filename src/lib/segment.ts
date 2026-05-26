export type Segment = "all" | "savameta" | "external" | "anonymous";

export const SEGMENTS: Segment[] = ["all", "savameta", "external", "anonymous"];

export function isSegment(v: unknown): v is Segment {
  return typeof v === "string" && (SEGMENTS as string[]).includes(v);
}

export const SEGMENT_LABELS: Record<Segment, { label: string; hint: string }> = {
  all: { label: "All", hint: "all signed-in + anonymous" },
  savameta: { label: "Savameta", hint: "@savameta.com" },
  external: { label: "External", hint: "personal email, non-anon" },
  anonymous: { label: "Anonymous", hint: "no login" },
};
