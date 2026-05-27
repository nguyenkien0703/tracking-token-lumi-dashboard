import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { listEngagementByUser, isSegment } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const segmentParam = req.nextUrl.searchParams.get("segment") ?? "savameta";
  if (!isSegment(segmentParam)) {
    return NextResponse.json({ error: `Invalid segment: ${segmentParam}` }, { status: 400 });
  }

  const data = await listEngagementByUser(segmentParam);
  return NextResponse.json({ data, total: data.length });
}
