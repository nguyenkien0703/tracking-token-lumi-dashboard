import { getPool } from "./db";

const SAVAMETA_EMAIL_FILTER = `LOWER(u.email) LIKE '%@savameta.com' AND u.email NOT LIKE '%@anon.lumilink'`;

export type AdoptionSummary = {
  totalEligible: number;
  joined: number;
  notJoined: number;
  adoptionRate: number;
  active7d: number;
};

export async function getAdoptionSummary(): Promise<AdoptionSummary> {
  const pool = getPool();

  const eligibleRes = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM employee_roster`
  );
  const totalEligible = Number(eligibleRes.rows[0]?.total ?? 0);

  const joinedRes = await pool.query<{ joined: string; active7d: string }>(`
    SELECT
      COUNT(DISTINCT r.email)::int AS joined,
      COUNT(DISTINCT CASE WHEN u.last_active_at >= NOW() - INTERVAL '7 days' THEN r.email END)::int AS active7d
    FROM employee_roster r
    INNER JOIN users u ON LOWER(u.email) = LOWER(r.email)
    WHERE u.email NOT LIKE '%@anon.lumilink'
  `);
  const joined = Number(joinedRes.rows[0]?.joined ?? 0);
  const active7d = Number(joinedRes.rows[0]?.active7d ?? 0);

  return {
    totalEligible,
    joined,
    notJoined: Math.max(0, totalEligible - joined),
    adoptionRate: totalEligible > 0 ? joined / totalEligible : 0,
    active7d,
  };
}

export type JoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  user_id: number;
  display_name: string | null;
  first_seen_at: string | null;
  last_active_at: string | null;
  days_since_last_activity: number | null;
};

export async function listJoinedUsers(): Promise<JoinedUser[]> {
  const pool = getPool();
  const { rows } = await pool.query<JoinedUser>(`
    SELECT
      r.email,
      r.full_name,
      r.department,
      u."userId" AS user_id,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      u.first_seen_at::text AS first_seen_at,
      u.last_active_at::text AS last_active_at,
      CASE WHEN u.last_active_at IS NOT NULL
        THEN EXTRACT(DAY FROM (NOW() - u.last_active_at))::int
        ELSE NULL END AS days_since_last_activity
    FROM employee_roster r
    INNER JOIN users u ON LOWER(u.email) = LOWER(r.email)
    WHERE u.email NOT LIKE '%@anon.lumilink'
    ORDER BY u.last_active_at DESC NULLS LAST
  `);
  return rows;
}

export type NeverJoinedUser = {
  email: string;
  full_name: string | null;
  department: string | null;
  added_at: string;
};

export async function listNeverJoinedUsers(): Promise<NeverJoinedUser[]> {
  const pool = getPool();
  const { rows } = await pool.query<NeverJoinedUser>(`
    SELECT
      r.email,
      r.full_name,
      r.department,
      r.added_at::text
    FROM employee_roster r
    LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email)
      AND u.email NOT LIKE '%@anon.lumilink'
    WHERE u."userId" IS NULL
    ORDER BY r.added_at DESC
  `);
  return rows;
}

export type ReleaseJoiners = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  new_joiners: number;
  days_active: number;
  velocity: number;
};

export async function getJoinersByRelease(): Promise<ReleaseJoiners[]> {
  const pool = getPool();
  const { rows } = await pool.query<ReleaseJoiners>(`
    SELECT
      rel.id,
      rel.name,
      rel.start_date::text,
      rel.end_date::text,
      COUNT(DISTINCT CASE
        WHEN u.first_seen_at >= rel.start_date::timestamptz
          AND (rel.end_date IS NULL OR u.first_seen_at < (rel.end_date::date + 1)::timestamptz)
        THEN r.email
      END)::int AS new_joiners,
      GREATEST(1, EXTRACT(DAY FROM (
        COALESCE(rel.end_date::timestamptz, NOW()) - rel.start_date::timestamptz
      ))::int) AS days_active,
      0.0::float8 AS velocity
    FROM releases rel
    LEFT JOIN employee_roster r ON true
    LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email) AND u.email NOT LIKE '%@anon.lumilink'
    GROUP BY rel.id, rel.name, rel.start_date, rel.end_date
    ORDER BY rel.start_date ASC
  `);

  return rows.map((row) => ({
    ...row,
    velocity: row.days_active > 0 ? row.new_joiners / row.days_active : 0,
  }));
}

export type LifecycleBucket = "active" | "at_risk" | "dormant" | "never_joined";

export type LifecycleCounts = Record<LifecycleBucket, number>;

export async function getLifecycleCounts(): Promise<LifecycleCounts> {
  const pool = getPool();
  const { rows } = await pool.query<{ bucket: LifecycleBucket; count: string }>(`
    SELECT
      CASE
        WHEN u.last_active_at IS NULL THEN 'never_joined'
        WHEN u.last_active_at >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
        ELSE 'dormant'
      END AS bucket,
      COUNT(*)::int AS count
    FROM employee_roster r
    LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email) AND u.email NOT LIKE '%@anon.lumilink'
    GROUP BY 1
  `);

  const result: LifecycleCounts = { active: 0, at_risk: 0, dormant: 0, never_joined: 0 };
  for (const row of rows) {
    result[row.bucket] = Number(row.count);
  }
  return result;
}

export type LifecycleUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  last_active_at: string | null;
  days_since_last_activity: number | null;
  bucket: LifecycleBucket;
};

export async function listUsersInBucket(bucket: LifecycleBucket): Promise<LifecycleUser[]> {
  const pool = getPool();
  const { rows } = await pool.query<LifecycleUser>(`
    SELECT
      r.email,
      r.full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      u.last_active_at::text AS last_active_at,
      CASE WHEN u.last_active_at IS NOT NULL
        THEN EXTRACT(DAY FROM (NOW() - u.last_active_at))::int
        ELSE NULL END AS days_since_last_activity,
      CASE
        WHEN u.last_active_at IS NULL THEN 'never_joined'
        WHEN u.last_active_at >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
        ELSE 'dormant'
      END AS bucket
    FROM employee_roster r
    LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email) AND u.email NOT LIKE '%@anon.lumilink'
    WHERE (
      CASE
        WHEN u.last_active_at IS NULL THEN 'never_joined'
        WHEN u.last_active_at >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
        ELSE 'dormant'
      END
    ) = $1
    ORDER BY u.last_active_at DESC NULLS LAST
  `, [bucket]);
  return rows;
}

export { SAVAMETA_EMAIL_FILTER };

// ============================================================================
// ENGAGEMENT
// ============================================================================

export type EngagementSummary = {
  conversations: number;
  totalTurns: number;
  medianTurnsPerConvo: number;
  totalCostUsd: number;
  active7d: number;
  costPerActiveUser7d: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCacheReadTokens: number;
  cacheHitRate: number;
};

export async function getEngagementSummary(): Promise<EngagementSummary> {
  const pool = getPool();

  // Aggregate over Savameta users only (join through roster → users → history)
  const { rows } = await pool.query<{
    conversations: string;
    total_turns: string;
    total_cost: string;
    total_prompt: string;
    total_completion: string;
    total_tokens: string;
    total_cache: string;
  }>(`
    SELECT
      COUNT(DISTINCT h."sessionId") FILTER (WHERE h."sessionId" IS NOT NULL)::int AS conversations,
      COUNT(*)::int AS total_turns,
      COALESCE(SUM(h."totalCostUsd"), 0)::float8 AS total_cost,
      COALESCE(SUM(h."promptTokens"), 0)::bigint AS total_prompt,
      COALESCE(SUM(h."completionTokens"), 0)::bigint AS total_completion,
      COALESCE(SUM(h."totalTokens"), 0)::bigint AS total_tokens,
      COALESCE(SUM(h.cache_read_tokens), 0)::bigint AS total_cache
    FROM history_entries h
    INNER JOIN users u ON u."userId" = h."userId"
    INNER JOIN employee_roster r ON LOWER(r.email) = LOWER(u.email)
    WHERE u.email NOT LIKE '%@anon.lumilink'
  `);

  const r = rows[0];

  const medianRes = await pool.query<{ median: string }>(`
    SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY turns), 0)::float8 AS median
    FROM (
      SELECT COUNT(*)::int AS turns
      FROM history_entries h
      INNER JOIN users u ON u."userId" = h."userId"
      INNER JOIN employee_roster er ON LOWER(er.email) = LOWER(u.email)
      WHERE h."sessionId" IS NOT NULL AND u.email NOT LIKE '%@anon.lumilink'
      GROUP BY h."sessionId"
    ) s
  `);

  const active7dRes = await pool.query<{ active7d: string }>(`
    SELECT COUNT(DISTINCT u."userId")::int AS active7d
    FROM users u
    INNER JOIN employee_roster r ON LOWER(r.email) = LOWER(u.email)
    WHERE u.last_active_at >= NOW() - INTERVAL '7 days'
      AND u.email NOT LIKE '%@anon.lumilink'
  `);

  const totalCost = Number(r?.total_cost ?? 0);
  const active7d = Number(active7dRes.rows[0]?.active7d ?? 0);
  const totalPrompt = Number(r?.total_prompt ?? 0);
  const totalCache = Number(r?.total_cache ?? 0);

  return {
    conversations: Number(r?.conversations ?? 0),
    totalTurns: Number(r?.total_turns ?? 0),
    medianTurnsPerConvo: Number(medianRes.rows[0]?.median ?? 0),
    totalCostUsd: totalCost,
    active7d,
    costPerActiveUser7d: active7d > 0 ? totalCost / active7d : 0,
    totalPromptTokens: totalPrompt,
    totalCompletionTokens: Number(r?.total_completion ?? 0),
    totalTokens: Number(r?.total_tokens ?? 0),
    totalCacheReadTokens: totalCache,
    cacheHitRate: totalPrompt > 0 ? totalCache / totalPrompt : 0,
  };
}

export type EngagementUserRow = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  conversations: number;
  turns: number;
  total_tokens: number;
  total_cost_usd: number;
  last_active_at: string | null;
};

export async function listEngagementByUser(): Promise<EngagementUserRow[]> {
  const pool = getPool();
  const { rows } = await pool.query<EngagementUserRow>(`
    SELECT
      r.email,
      r.full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      COUNT(DISTINCT h."sessionId") FILTER (WHERE h."sessionId" IS NOT NULL)::int AS conversations,
      COUNT(h.id)::int AS turns,
      COALESCE(SUM(h."totalTokens"), 0)::bigint AS total_tokens,
      COALESCE(SUM(h."totalCostUsd"), 0)::float8 AS total_cost_usd,
      u.last_active_at::text AS last_active_at
    FROM employee_roster r
    INNER JOIN users u ON LOWER(u.email) = LOWER(r.email)
    LEFT JOIN history_entries h ON h."userId" = u."userId"
    WHERE u.email NOT LIKE '%@anon.lumilink'
    GROUP BY r.email, r.full_name, u."firstName", u."lastName", u.last_active_at
    ORDER BY total_cost_usd DESC
  `);

  return rows.map((row) => ({
    ...row,
    turns: Number(row.turns),
    conversations: Number(row.conversations),
    total_tokens: Number(row.total_tokens),
    total_cost_usd: Number(row.total_cost_usd),
  }));
}

// ============================================================================
// ACTIVITY TRENDS
// ============================================================================

export type ActivityDay = {
  day: string;
  dau: number;
  turns: number;
  new_joiners: number;
};

export async function getDailyActivity(days = 30): Promise<ActivityDay[]> {
  const pool = getPool();

  // Build day series, left-join activity, and new joiners by first_seen_at
  const { rows } = await pool.query<ActivityDay>(`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_DATE - ($1::int - 1))::timestamptz,
        CURRENT_DATE::timestamptz,
        '1 day'::interval
      )::date AS day
    ),
    daily_activity AS (
      SELECT
        h."createdAt"::date AS day,
        COUNT(DISTINCT h."userId")::int AS dau,
        COUNT(*)::int AS turns
      FROM history_entries h
      INNER JOIN users u ON u."userId" = h."userId"
      INNER JOIN employee_roster r ON LOWER(r.email) = LOWER(u.email)
      WHERE u.email NOT LIKE '%@anon.lumilink'
        AND h."createdAt"::date >= (CURRENT_DATE - ($1::int - 1))
      GROUP BY h."createdAt"::date
    ),
    daily_joiners AS (
      SELECT
        u.first_seen_at::date AS day,
        COUNT(DISTINCT u."userId")::int AS new_joiners
      FROM users u
      INNER JOIN employee_roster r ON LOWER(r.email) = LOWER(u.email)
      WHERE u.first_seen_at IS NOT NULL
        AND u.email NOT LIKE '%@anon.lumilink'
        AND u.first_seen_at::date >= (CURRENT_DATE - ($1::int - 1))
      GROUP BY u.first_seen_at::date
    )
    SELECT
      d.day::text,
      COALESCE(a.dau, 0)::int AS dau,
      COALESCE(a.turns, 0)::int AS turns,
      COALESCE(j.new_joiners, 0)::int AS new_joiners
    FROM days d
    LEFT JOIN daily_activity a ON a.day = d.day
    LEFT JOIN daily_joiners j ON j.day = d.day
    ORDER BY d.day ASC
  `, [days]);

  return rows;
}
