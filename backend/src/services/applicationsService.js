// src/services/applicationsService.js
import pool from '../db/pool.js';

/**
 * Insert a new application row (Pool.query version).
 * Casts skills to jsonb explicitly to avoid JSON syntax errors.
 *
 * @param {number} userId
 * @param {object} payload
 * @param {object|null} file
 * @returns {Promise<{id:number}>}
 */
export async function saveApplication(userId, payload, file) {
  // Ensure skills is an array before stringify
  const safeSkills = Array.isArray(payload.skills) ? payload.skills : [];

  // Prefer Multer's stored filename if present
  const resumePath = file?.filename ? file.filename : payload.resume_path || '';

  const sql = `
    INSERT INTO applications (
      user_id,
      first_name,
      last_name,
      email,
      phone,
      current_address,
      date_of_birth,
      position_applied_for,
      resume_path,
      linkedin_profile,
      education_level,
      years_of_experience,
      skills,
      previous_employer,
      current_job_title,
      notice_period,
      expected_salary,
      availability_for_interview,
      preferred_location,
      cover_letter,
      source_of_application,
      created_at,
      updated_at
    )
    VALUES (
      $1,  $2,  $3,  $4,  $5,
      $6,  $7,  $8,  $9,  $10,
      $11, $12, $13::jsonb, $14, $15,
      $16, $17, $18, $19, $20,
      $21, NOW(), NOW()
    )
    RETURNING id
  `;

  const params = [
    userId,                             // $1
    payload.first_name || '',           // $2
    payload.last_name || '',            // $3
    payload.email || '',                // $4
    payload.phone || '',                // $5
    payload.current_address || '',      // $6
    payload.date_of_birth || '',        // $7
    payload.position_applied_for || '', // $8
    resumePath,                         // $9
    payload.linkedin_profile ?? null,   // $10
    payload.education_level || '',      // $11
    payload.years_of_experience ?? 0,   // $12
    JSON.stringify(safeSkills),         // $13 (cast to jsonb in SQL)
    payload.previous_employer ?? null,  // $14
    payload.current_job_title ?? null,  // $15
    payload.notice_period || '',        // $16
    payload.expected_salary ?? null,    // $17
    payload.availability_for_interview ?? null, // $18
    payload.preferred_location ?? null, // $19
    payload.cover_letter ?? null,       // $20
    payload.source_of_application || '',// $21
  ];

  const { rows } = await pool.query(sql, params);
  return rows[0];
}

/**
 * Fetch applications of a user with optional pagination/sorting.
 * Sorting is a "col:dir" string, e.g., "created_at:desc". Only allowed columns/dirs are used.
 *
 * @param {number} userId
 * @param {object} [opts]
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=20]
 * @param {string} [opts.sort='created_at:desc']
 * @returns {Promise<Array>}
 */
export async function getApplicationsByUser(
  userId,
  { page = 1, limit = 20, sort = 'created_at:desc' } = {}
) {
  // Whitelist sort to prevent SQL injection
  const [rawCol, rawDir] = String(sort).split(':');
  const ALLOWED_COLS = new Set([
    'created_at',
    'updated_at',
    'first_name',
    'last_name',
    'position_applied_for',
    'expected_salary',
  ]);
  const col = ALLOWED_COLS.has(rawCol) ? rawCol : 'created_at';
  const dir = String(rawDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const text = `
    SELECT *
    FROM applications
    WHERE user_id = $1
    ORDER BY ${col} ${dir}
    LIMIT $2 OFFSET $3
  `;
  const { rows } = await pool.query(text, [userId, safeLimit, offset]);
  return rows;
}

/**
 * Count total applications for a given user.
 *
 * @param {number} userId
 * @returns {Promise<number>}
 */
export async function countApplicationsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM applications WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.total ?? 0;
}
