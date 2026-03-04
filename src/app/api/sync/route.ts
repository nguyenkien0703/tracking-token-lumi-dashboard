import { NextResponse } from "next/server";
import { getSyncState, forceSync } from "@/lib/sync";

/** GET /api/sync — return current sync status */
export async function GET() {
  const state = await getSyncState();
  return NextResponse.json(state);
}

/** POST /api/sync — trigger a full sync and wait for completion */
export async function POST() {
  try {
    await forceSync();
    const state = await getSyncState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
