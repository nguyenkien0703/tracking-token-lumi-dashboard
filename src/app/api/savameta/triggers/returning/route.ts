import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { detectReturningUsers, RETURNING_IDLE_DAYS, isSegment } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const windowParam = req.nextUrl.searchParams.get("window");
  const windowDays = Math.min(Math.max(Number(windowParam) || 1, 1), 30);

  const segmentParam = req.nextUrl.searchParams.get("segment") ?? "savameta";
  if (!isSegment(segmentParam)) {
    return NextResponse.json({ error: `Invalid segment: ${segmentParam}` }, { status: 400 });
  }

  const data = await detectReturningUsers(windowDays, segmentParam);
  return NextResponse.json({
    data,
    total: data.length,
    config: { idleThresholdDays: RETURNING_IDLE_DAYS, windowDays },
  });
}
