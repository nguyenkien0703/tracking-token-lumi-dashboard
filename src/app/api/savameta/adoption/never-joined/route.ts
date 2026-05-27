import { NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { listNeverJoinedUsers } from "@/lib/savameta-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  await initSchema();
  const users = await listNeverJoinedUsers();
  return NextResponse.json({ data: users, total: users.length });
}
