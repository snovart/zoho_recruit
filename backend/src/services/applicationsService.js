// src/services/applicationsService.js
// Business logic for Applications: validate, normalize, and INSERT via pg Pool (no label→code mapping)

import pool from '../db/pool.js';

/**
 * Persist a new application.
 * @param {number} userId - current user id (from auth)
 * @param {object} form   - raw form fields from req.body (strings by Multer)
 * @param {object|null} file - Multer file object (req.file) or null
 * @returns {Promise<{id:number}>}
 */
export async function saveApplication(userId, form = {}, file = null) {
  if (!form || typeof form !== 'object') {
    throw new Error('No form data received');
  }

  // Required fields we expect from the frontend (already human-readable values)
  const required = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'current_address',
    'date_of_birth',
    'position_applied_for',
    'education_level',
    'years_of_experience',
    'notice_period',
    'source_of_application',
  ];
  for (const k of required) {
    const v = form[k];
    if (v === undefined || v === null || v === '') {
      throw new Error(`Missing required field: ${k}`);
    }
  }

  // Helpers
  const toNumber = (x) =>
    x === undefined || x === null || x === '' ? null : Number(x);
  const orNull = (v) => (v === '' ? null : v);

  // Skills can arrive as array / JSON string / CSV
  let skills = form.skills;
  if (typeof skills === 'string') {
    try {
      skills = JSON.parse(skills);
    } catch {
      skills = skills.includes(',')
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : (skills ? [skills] : []);
    }
  }
  if (!Array.isArray(skills)) skills = [];

  // Prefer Multer filename if file was uploaded
  const resumePath = file?.filename ?? form.resume_path ?? null;

  // Build parameter list in the exact column order
  const columns = [
    'user_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'current_address',
    'date_of_birth',
    'position_applied_for',
    'resume_path',
    'linkedin_profile',
    'education_level',
    'years_of_experience',
    'skills',
    'previous_employer',
    'current_job_title',
    'notice_period',
    'expected_salary',
    'availability_for_interview',
    'preferred_location',
    'cover_letter',
    'source_of_application',
  ];

  const values = [
    userId,
    form.first_name,
    form.last_name,
    form.email,
    form.phone,
    form.current_address,
    form.date_of_birth, // YYYY-MM-DD
    form.position_applied_for, // already human-readable per your setup
    resumePath,
    orNull(form.linkedin_profile),
    form.education_level,
    Number(form.years_of_experience),
    JSON.stringify(skills), // jsonb
    orNull(form.previous_employer),
    orNull(form.current_job_title),
    form.notice_period,
    toNumber(form.expected_salary),
    orNull(form.availability_for_interview), // timestamp string or null
    orNull(form.preferred_location),
    orNull(form.cover_letter),
    form.source_of_application,
  ];

  // Build parametrized INSERT
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `
    INSERT INTO applications
      (${columns.join(', ')})
    VALUES
      (${placeholders})
    RETURNING id
  `;

  const { rows } = await pool.query(sql, values);
  return { id: rows[0].id };
}
