import { getPool } from "./db";
import type { Segment } from "@/lib/segment";

export type { Segment };
export { SEGMENTS, isSegment } from "@/lib/segment";

// SQL fragment matching `u.email` against the segment.
// "all" excludes nothing. "savameta" = @savameta.com. "external" = signed-in but not savameta.
// "anonymous" = @anon.lumilink (no login).
function segmentEmailClause(segment: Segment, alias = "u"): string {
  switch (segment) {
    case "savameta":
      return `LOWER(${alias}.email) LIKE '%@savameta.com'`;
    case "external":
      return `${alias}.email IS NOT NULL
        AND ${alias}.email NOT LIKE '%@anon.lumilink'
        AND LOWER(${alias}.email) NOT LIKE '%@savameta.com'`;
    case "anonymous":
      return `${alias}.email LIKE '%@anon.lumilink'`;
    case "all":
    default:
      return "TRUE";
  }
}

const SAVAMETA_EMAIL_FILTER = `LOWER(u.email) LIKE '%@savameta.com' AND u.email NOT LIKE '%@anon.lumilink'`;
export { SAVAMETA_EMAIL_FILTER };

// "Daily Active 7/7d" = user has ≥1 history entry on each of the last 7 calendar days.
// createdAt is stored as ISO-8601 text, so we cast to timestamptz before bucketing by UTC date.
export async function countDailyActiveUsers7d(segment: Segment = "savameta"): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query<{ count: string }>(`
    SELECT COUNT(*)::int AS count FROM (
      SELECT u."userId"
      FROM history_entries h
      INNER JOIN users u ON u."userId" = h."userId"
      WHERE h."createdAt"::timestamptz >= NOW() - INTERVAL '7 days'
        AND (${segmentEmailClause(segment)})
      GROUP BY u."userId"
      HAVING COUNT(DISTINCT (h."createdAt"::timestamptz AT TIME ZONE 'UTC')::date) = 7
    ) s
  `);
  return Number(rows[0]?.count ?? 0);
}

// ============================================================================
// ADOPTION — Savameta-only by design (HR metric: roster vs joined)
// ============================================================================

export type AdoptionSummary = {
  totalEligible: number;
  joined: number;
  notJoined: number;
  adoptionRate: number;
  dailyActive7d: number;
};

export async function getAdoptionSummary(): Promise<AdoptionSummary> {
  const pool = getPool();

  const eligibleRes = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM employee_roster`
  );
  const totalEligible = Number(eligibleRes.rows[0]?.total ?? 0);

  const joinedRes = await pool.query<{ joined: string }>(`
    SELECT COUNT(DISTINCT r.email)::int AS joined
    FROM employee_roster r
    INNER JOIN users u ON LOWER(u.email) = LOWER(r.email)
    WHERE u.email NOT LIKE '%@anon.lumilink'
  `);
  const joined = Number(joinedRes.rows[0]?.joined ?? 0);
  const dailyActive7d = await countDailyActiveUsers7d("savameta");

  return {
    totalEligible,
    joined,
    notJoined: Math.max(0, totalEligible - joined),
    adoptionRate: totalEligible > 0 ? joined / totalEligible : 0,
    dailyActive7d,
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

// ============================================================================
// LIFECYCLE — supports all segments
// ============================================================================

export type LifecycleBucket = "active" | "at_risk" | "dormant" | "never_joined";

export type LifecycleCounts = Record<LifecycleBucket, number>;

// For Savameta we still bucket against the *roster* (so a roster employee that hasn't logged in
// shows up as "never_joined"). For other segments, "never_joined" is meaningless — there's no
// universe to count against — so the bucket will always be 0.
export async function getLifecycleCounts(segment: Segment = "savameta"): Promise<LifecycleCounts> {
  const pool = getPool();

  if (segment === "savameta") {
    const { rows } = await pool.query<{ bucket: LifecycleBucket; count: string }>(`
      SELECT
        CASE
          WHEN u.last_active_at IS NULL THEN 'never_joined'
          WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
          WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
          ELSE 'dormant'
        END AS bucket,
        COUNT(*)::int AS count
      FROM employee_roster r
      LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email) AND u.email NOT LIKE '%@anon.lumilink'
      GROUP BY 1
    `);
    const result: LifecycleCounts = { active: 0, at_risk: 0, dormant: 0, never_joined: 0 };
    for (const row of rows) result[row.bucket] = Number(row.count);
    return result;
  }

  // external / anonymous / all → bucket users themselves (no roster)
  const { rows } = await pool.query<{ bucket: LifecycleBucket; count: string }>(`
    SELECT
      CASE
        WHEN u.last_active_at IS NULL THEN 'never_joined'
        WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
        ELSE 'dormant'
      END AS bucket,
      COUNT(*)::int AS count
    FROM users u
    WHERE ${segmentEmailClause(segment)}
    GROUP BY 1
  `);
  const result: LifecycleCounts = { active: 0, at_risk: 0, dormant: 0, never_joined: 0 };
  for (const row of rows) result[row.bucket] = Number(row.count);
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

export async function listUsersInBucket(
  bucket: LifecycleBucket,
  segment: Segment = "savameta",
): Promise<LifecycleUser[]> {
  const pool = getPool();

  if (segment === "savameta") {
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
          WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
          WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
          ELSE 'dormant'
        END AS bucket
      FROM employee_roster r
      LEFT JOIN users u ON LOWER(u.email) = LOWER(r.email) AND u.email NOT LIKE '%@anon.lumilink'
      WHERE (
        CASE
          WHEN u.last_active_at IS NULL THEN 'never_joined'
          WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
          WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
          ELSE 'dormant'
        END
      ) = $1
      ORDER BY u.last_active_at DESC NULLS LAST
    `, [bucket]);
    return rows;
  }

  // external / anonymous / all
  const { rows } = await pool.query<LifecycleUser>(`
    SELECT
      u.email,
      NULL::text AS full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      u.last_active_at::text AS last_active_at,
      CASE WHEN u.last_active_at IS NOT NULL
        THEN EXTRACT(DAY FROM (NOW() - u.last_active_at))::int
        ELSE NULL END AS days_since_last_activity,
      CASE
        WHEN u.last_active_at IS NULL THEN 'never_joined'
        WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
        ELSE 'dormant'
      END AS bucket
    FROM users u
    WHERE ${segmentEmailClause(segment)}
      AND (
        CASE
          WHEN u.last_active_at IS NULL THEN 'never_joined'
          WHEN u.last_active_at >= NOW() - INTERVAL '3 days' THEN 'active'
          WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'at_risk'
          ELSE 'dormant'
        END
      ) = $1
    ORDER BY u.last_active_at DESC NULLS LAST
  `, [bucket]);
  return rows;
}

// ============================================================================
// ENGAGEMENT — supports all segments
// ============================================================================

export type EngagementSummary = {
  conversations: number;
  totalTurns: number;
  medianTurnsPerConvo: number;
  totalCostUsd: number;
  dailyActive7d: number;
  costPerDailyActiveUser7d: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCacheReadTokens: number;
  cacheHitRate: number;
};

export async function getEngagementSummary(segment: Segment = "savameta"): Promise<EngagementSummary> {
  const pool = getPool();

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
    WHERE ${segmentEmailClause(segment)}
  `);

  const r = rows[0];

  const medianRes = await pool.query<{ median: string }>(`
    SELECT COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY turns), 0)::float8 AS median
    FROM (
      SELECT COUNT(*)::int AS turns
      FROM history_entries h
      INNER JOIN users u ON u."userId" = h."userId"
      WHERE h."sessionId" IS NOT NULL AND (${segmentEmailClause(segment)})
      GROUP BY h."sessionId"
    ) s
  `);

  const dailyActive7d = await countDailyActiveUsers7d(segment);

  const totalCost = Number(r?.total_cost ?? 0);
  const totalPrompt = Number(r?.total_prompt ?? 0);
  const totalCache = Number(r?.total_cache ?? 0);

  return {
    conversations: Number(r?.conversations ?? 0),
    totalTurns: Number(r?.total_turns ?? 0),
    medianTurnsPerConvo: Number(medianRes.rows[0]?.median ?? 0),
    totalCostUsd: totalCost,
    dailyActive7d,
    costPerDailyActiveUser7d: dailyActive7d > 0 ? totalCost / dailyActive7d : 0,
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

export async function listEngagementByUser(segment: Segment = "savameta"): Promise<EngagementUserRow[]> {
  const pool = getPool();

  // For savameta we attach roster's full_name; for others there's no roster.
  if (segment === "savameta") {
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

  const { rows } = await pool.query<EngagementUserRow>(`
    SELECT
      u.email,
      NULL::text AS full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      COUNT(DISTINCT h."sessionId") FILTER (WHERE h."sessionId" IS NOT NULL)::int AS conversations,
      COUNT(h.id)::int AS turns,
      COALESCE(SUM(h."totalTokens"), 0)::bigint AS total_tokens,
      COALESCE(SUM(h."totalCostUsd"), 0)::float8 AS total_cost_usd,
      u.last_active_at::text AS last_active_at
    FROM users u
    LEFT JOIN history_entries h ON h."userId" = u."userId"
    WHERE ${segmentEmailClause(segment)}
    GROUP BY u.email, u."firstName", u."lastName", u.last_active_at
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
// ACTIVITY TRENDS — supports all segments
// ============================================================================

export type ActivityDay = {
  day: string;
  dau: number;
  turns: number;
  new_joiners: number;
};

export async function getDailyActivity(days = 30, segment: Segment = "savameta"): Promise<ActivityDay[]> {
  const pool = getPool();

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
      WHERE (${segmentEmailClause(segment)})
        AND h."createdAt"::date >= (CURRENT_DATE - ($1::int - 1))
      GROUP BY h."createdAt"::date
    ),
    daily_joiners AS (
      SELECT
        u.first_seen_at::date AS day,
        COUNT(DISTINCT u."userId")::int AS new_joiners
      FROM users u
      WHERE u.first_seen_at IS NOT NULL
        AND (${segmentEmailClause(segment)})
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

// ============================================================================
// TRIGGERS — supports all segments
// ============================================================================

export const RETURNING_IDLE_DAYS = 7;
export const FIRST_VALUE_TURN_THRESHOLD = 5;

export type ReturningUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  returned_at: string;
  previous_active_at: string;
  idle_days: number;
};

/**
 * A user "returned" if they had a gap of >= 7 days between two activities
 * AND the recent activity falls within the last `windowDays` days.
 * If a user returned multiple times in the window, we surface the most recent.
 */
export async function detectReturningUsers(
  windowDays: number,
  segment: Segment = "savameta",
): Promise<ReturningUser[]> {
  const pool = getPool();
  // Roster join only applies to savameta. For other segments we read full_name as NULL.
  const rosterJoin = segment === "savameta"
    ? `INNER JOIN employee_roster er ON LOWER(er.email) = LOWER(u.email)`
    : `LEFT JOIN employee_roster er ON FALSE`;
  const emailExpr = segment === "savameta" ? `er.email` : `u.email`;
  const fullNameExpr = segment === "savameta" ? `er.full_name` : `NULL::text`;

  const { rows } = await pool.query<ReturningUser>(`
    WITH activity AS (
      SELECT
        h."userId",
        h."createdAt"::timestamptz AS ts,
        LAG(h."createdAt"::timestamptz) OVER (PARTITION BY h."userId" ORDER BY h."createdAt") AS prev_ts
      FROM history_entries h
      WHERE h."userId" IS NOT NULL
    ),
    returns AS (
      SELECT
        a."userId",
        a.ts AS returned_at,
        a.prev_ts AS previous_active_at,
        EXTRACT(EPOCH FROM (a.ts - a.prev_ts)) / 86400.0 AS idle_days
      FROM activity a
      WHERE a.prev_ts IS NOT NULL
        AND a.ts - a.prev_ts >= INTERVAL '${RETURNING_IDLE_DAYS} days'
        AND a.ts >= NOW() - ($1::int * INTERVAL '1 day')
    ),
    latest AS (
      SELECT DISTINCT ON (r."userId")
        r."userId",
        r.returned_at,
        r.previous_active_at,
        r.idle_days
      FROM returns r
      ORDER BY r."userId", r.returned_at DESC
    )
    SELECT
      ${emailExpr} AS email,
      ${fullNameExpr} AS full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      l.returned_at::text,
      l.previous_active_at::text,
      ROUND(l.idle_days::numeric, 1)::float8 AS idle_days
    FROM latest l
    INNER JOIN users u ON u."userId" = l."userId"
    ${rosterJoin}
    WHERE ${segmentEmailClause(segment)}
    ORDER BY l.returned_at DESC
  `, [windowDays]);

  return rows;
}

export type FirstValueUser = {
  email: string;
  full_name: string | null;
  display_name: string | null;
  first_value_at: string;
  session_id: string;
  turns_at_value: number;
};

/**
 * "First value" = the moment a user's session crossed FIRST_VALUE_TURN_THRESHOLD turns.
 * We report each user's earliest such moment.
 */
export async function detectFirstValueUsers(segment: Segment = "savameta"): Promise<FirstValueUser[]> {
  const pool = getPool();
  const rosterJoin = segment === "savameta"
    ? `INNER JOIN employee_roster er ON LOWER(er.email) = LOWER(u.email)`
    : `LEFT JOIN employee_roster er ON FALSE`;
  const emailExpr = segment === "savameta" ? `er.email` : `u.email`;
  const fullNameExpr = segment === "savameta" ? `er.full_name` : `NULL::text`;

  const { rows } = await pool.query<FirstValueUser>(`
    WITH ranked AS (
      SELECT
        h."userId",
        h."sessionId",
        h."createdAt"::timestamptz AS ts,
        ROW_NUMBER() OVER (PARTITION BY h."userId", h."sessionId" ORDER BY h."createdAt") AS turn_no
      FROM history_entries h
      WHERE h."userId" IS NOT NULL AND h."sessionId" IS NOT NULL
    ),
    threshold_hits AS (
      SELECT "userId", "sessionId", ts, turn_no
      FROM ranked
      WHERE turn_no = $1
    ),
    first_per_user AS (
      SELECT DISTINCT ON ("userId")
        "userId", "sessionId", ts, turn_no
      FROM threshold_hits
      ORDER BY "userId", ts ASC
    )
    SELECT
      ${emailExpr} AS email,
      ${fullNameExpr} AS full_name,
      NULLIF(TRIM(COALESCE(u."firstName",'') || ' ' || COALESCE(u."lastName",'')), '') AS display_name,
      f.ts::text AS first_value_at,
      f."sessionId" AS session_id,
      f.turn_no::int AS turns_at_value
    FROM first_per_user f
    INNER JOIN users u ON u."userId" = f."userId"
    ${rosterJoin}
    WHERE ${segmentEmailClause(segment)}
    ORDER BY f.ts DESC
  `, [FIRST_VALUE_TURN_THRESHOLD]);

  return rows;
}
