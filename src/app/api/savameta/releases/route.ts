import { NextRequest, NextResponse } from "next/server";
import { getPool, initSchema } from "@/lib/db";

type ReleaseRow = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

function isValidDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function GET() {
  await initSchema();
  const pool = getPool();
  const { rows } = await pool.query<ReleaseRow>(
    `SELECT id, name, start_date::text, end_date::text, notes, created_at::text
     FROM releases
     ORDER BY start_date ASC`
  );
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const body = await req.json().catch(() => null);

  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Missing 'name'" }, { status: 400 });
  }
  if (!isValidDate(body.start_date)) {
    return NextResponse.json({ error: "Invalid 'start_date' (YYYY-MM-DD required)" }, { status: 400 });
  }
  if (body.end_date != null && !isValidDate(body.end_date)) {
    return NextResponse.json({ error: "Invalid 'end_date' (YYYY-MM-DD or null)" }, { status: 400 });
  }
  if (isValidDate(body.end_date) && body.end_date < body.start_date) {
    return NextResponse.json({ error: "end_date must be >= start_date" }, { status: 400 });
  }

  try {
    const { rows } = await pool.query<ReleaseRow>(
      `INSERT INTO releases (name, start_date, end_date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, start_date::text, end_date::text, notes, created_at::text`,
      [body.name.trim(), body.start_date, body.end_date ?? null, body.notes ?? null]
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "Release name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const body = await req.json().catch(() => null);

  if (!body || typeof body.id !== "number") {
    return NextResponse.json({ error: "Missing 'id'" }, { status: 400 });
  }
  if (body.start_date != null && !isValidDate(body.start_date)) {
    return NextResponse.json({ error: "Invalid 'start_date'" }, { status: 400 });
  }
  if (body.end_date != null && !isValidDate(body.end_date)) {
    return NextResponse.json({ error: "Invalid 'end_date'" }, { status: 400 });
  }

  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (typeof body.name === "string" && body.name.trim()) {
    sets.push(`name = $${idx++}`);
    params.push(body.name.trim());
  }
  if (body.start_date != null) {
    sets.push(`start_date = $${idx++}`);
    params.push(body.start_date);
  }
  if (body.end_date !== undefined) {
    sets.push(`end_date = $${idx++}`);
    params.push(body.end_date);
  }
  if (body.notes !== undefined) {
    sets.push(`notes = $${idx++}`);
    params.push(body.notes);
  }

  if (sets.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  params.push(body.id);
  const { rows } = await pool.query<ReleaseRow>(
    `UPDATE releases SET ${sets.join(", ")}
     WHERE id = $${idx}
     RETURNING id, name, start_date::text, end_date::text, notes, created_at::text`,
    params
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Release not found" }, { status: 404 });
  }
  return NextResponse.json({ data: rows[0] });
}

export async function DELETE(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid 'id'" }, { status: 400 });
  }
  const res = await pool.query(`DELETE FROM releases WHERE id = $1`, [id]);
  return NextResponse.json({ deleted: res.rowCount ?? 0 });
}
