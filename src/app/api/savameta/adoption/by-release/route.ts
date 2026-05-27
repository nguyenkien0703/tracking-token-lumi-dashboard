import { NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { syncIfStale, hasData } from "@/lib/sync";
import { getJoinersByRelease } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  await initSchema();
  const dbEmpty = !(await hasData());
  await syncIfStale(dbEmpty);
  const data = await getJoinersByRelease();
  return NextResponse.json({ data });
}
