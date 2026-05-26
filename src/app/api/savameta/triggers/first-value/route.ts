import { NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { detectFirstValueUsers, FIRST_VALUE_TURN_THRESHOLD } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);

  const data = await detectFirstValueUsers();
  return NextResponse.json({
    data,
    total: data.length,
    config: { turnThreshold: FIRST_VALUE_TURN_THRESHOLD },
  });
}
