import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { detectReturningUsers, RETURNING_IDLE_DAYS } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const windowParam = req.nextUrl.searchParams.get("window");
  const windowDays = Math.min(Math.max(Number(windowParam) || 1, 1), 30);

  const data = await detectReturningUsers(windowDays);
  return NextResponse.json({
    data,
    total: data.length,
    config: { idleThresholdDays: RETURNING_IDLE_DAYS, windowDays },
  });
}
