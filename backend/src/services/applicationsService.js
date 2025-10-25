// backend/src/services/applicationsService.js
import path from 'node:path';
import pool from '../db/pool.js';
import { createCandidate, uploadCandidateAttachment } from './zohoRecruitService.js';

/**
 * Insert a new application row.
 * Also triggers Zoho Recruit sync (best-effort) after DB insert.
 */
export async function saveApplication(userId, payload, file) {
  const safeSkills = Array.isArray(payload.skills) ? payload.skills : [];
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
    JSON.stringify(safeSkills),         // $13
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
  const inserted = rows[0]; // { id }

  // -----------------------------
  // Best-effort Zoho sync (do not throw)
  // -----------------------------
  try {
    const zohoId = await createCandidate(payload);

    if (resumePath) {
      const abs = path.resolve(process.cwd(), 'uploads', 'resumes', resumePath);
      await uploadCandidateAttachment(zohoId, abs);
    }
  } catch (e) {
    console.error('[Zoho sync] createCandidate/upload failed:', e.message);
  }

  return inserted;
}

/**
 * Fetch applications for a user with pagination and sorting.
 */
export async function getApplicationsByUser(
  userId,
  { page = 1, limit = 20, sort = 'created_at:desc' } = {}
) {
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
  const safePage  = Math.max(1, Number(page) || 1);
  const offset    = (safePage - 1) * safeLimit;

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
 * Count total applications for a user.
 */
export async function countApplicationsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM applications WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.total ?? 0;
}
