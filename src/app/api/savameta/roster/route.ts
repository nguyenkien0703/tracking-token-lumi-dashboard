import { NextRequest, NextResponse } from "next/server";
import { getPool, initSchema } from "@/lib/db";

type RosterRow = {
  email: string;
  full_name: string | null;
  department: string | null;
  source: string | null;
  added_at: string;
  added_by: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const search = req.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

  const where = search
    ? `WHERE LOWER(email) LIKE $1 OR LOWER(COALESCE(full_name, '')) LIKE $1`
    : "";
  const params = search ? [`%${search}%`] : [];

  const { rows } = await pool.query<RosterRow>(
    `SELECT email, full_name, department, source, added_at::text, added_by
     FROM employee_roster
     ${where}
     ORDER BY email ASC`,
    params
  );

  return NextResponse.json({ data: rows, total: rows.length });
}

export async function POST(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.entries)) {
    return NextResponse.json(
      { error: "Body must be { entries: [{email, full_name?, department?}], source?: string }" },
      { status: 400 }
    );
  }

  const source: string = typeof body.source === "string" ? body.source : "manual";
  const addedBy: string = typeof body.added_by === "string" ? body.added_by : "admin";

  let added = 0;
  let updated = 0;
  const skipped: { email: string; reason: string }[] = [];

  for (const raw of body.entries) {
    const email = normalizeEmail(String(raw.email ?? ""));
    if (!email || !isValidEmail(email)) {
      skipped.push({ email, reason: "invalid_email" });
      continue;
    }

    const fullName: string | null =
      typeof raw.full_name === "string" && raw.full_name.trim() ? raw.full_name.trim() : null;
    const department: string | null =
      typeof raw.department === "string" && raw.department.trim() ? raw.department.trim() : null;

    const existing = await pool.query(
      `SELECT email FROM employee_roster WHERE email = $1`,
      [email]
    );

    await pool.query(
      `INSERT INTO employee_roster (email, full_name, department, source, added_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         full_name = COALESCE(EXCLUDED.full_name, employee_roster.full_name),
         department = COALESCE(EXCLUDED.department, employee_roster.department),
         source = EXCLUDED.source,
         added_by = EXCLUDED.added_by`,
      [email, fullName, department, source, addedBy]
    );

    if (existing.rowCount === 0) added++;
    else updated++;
  }

  return NextResponse.json({ added, updated, skipped });
}

export async function DELETE(req: NextRequest) {
  await initSchema();
  const pool = getPool();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Missing 'email' query param" }, { status: 400 });
  }

  const res = await pool.query(`DELETE FROM employee_roster WHERE email = $1`, [email]);

  return NextResponse.json({ deleted: res.rowCount ?? 0 });
}
