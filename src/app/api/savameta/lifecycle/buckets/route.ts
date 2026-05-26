import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import {
  getLifecycleCounts,
  listUsersInBucket,
  LifecycleBucket,
  isSegment,
} from "@/lib/savameta-queries";

const VALID_BUCKETS: LifecycleBucket[] = ["active", "at_risk", "dormant", "never_joined"];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const segmentParam = req.nextUrl.searchParams.get("segment") ?? "savameta";
  if (!isSegment(segmentParam)) {
    return NextResponse.json({ error: `Invalid segment: ${segmentParam}` }, { status: 400 });
  }

  const bucket = req.nextUrl.searchParams.get("bucket") as LifecycleBucket | null;

  if (bucket) {
    if (!VALID_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: `Invalid bucket: ${bucket}` }, { status: 400 });
    }
    const users = await listUsersInBucket(bucket, segmentParam);
    return NextResponse.json({ data: users, total: users.length });
  }

  const counts = await getLifecycleCounts(segmentParam);
  return NextResponse.json({ data: counts });
}
