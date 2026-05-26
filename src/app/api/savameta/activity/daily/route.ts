import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { getDailyActivity } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const daysParam = req.nextUrl.searchParams.get("days");
  const days = Math.min(Math.max(Number(daysParam) || 30, 1), 365);

  const data = await getDailyActivity(days);
  return NextResponse.json({ data, days });
}
