// src/services/applicationsService.js
// Business-logic for Applications: DB inserts/selects via Knex.

import { db } from "../db/knex.js";

/**
 * Insert a new application row.
 * NOTE: This function expects enum "codes" that match your migration:
 *   position_applied_for, education_level, notice_period, preferred_location, source_of_application
 *   (e.g. 'software_engineer', 'new_york', ...)
 * Any label→code mapping we will handle in the controller on the next step.
 *
 * @param {number} userId - owner (FK to users.id)
 * @param {object} data  - normalized payload ready for DB columns
 * @returns {Promise<{id:number, created_at:string}>}
 */
export async function insertApplication(userId, data) {
  const row = {
    user_id: userId,

    // Step 1
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    current_address: data.current_address,
    date_of_birth: data.date_of_birth,
    position_applied_for: data.position_applied_for, // enum code
    resume_path: data.resume_path,                   // saved file path
    linkedin_profile: data.linkedin_profile ?? null,

    // Step 2
    education_level: data.education_level,          // enum code
    years_of_experience: data.years_of_experience,
    skills: data.skills ?? [],                       // jsonb
    previous_employer: data.previous_employer ?? null,
    current_job_title: data.current_job_title ?? null,
    notice_period: data.notice_period,               // enum code
    expected_salary: data.expected_salary ?? null,
    availability_for_interview: data.availability_for_interview ?? null,
    preferred_location: data.preferred_location ?? null, // enum code or null
    cover_letter: data.cover_letter ?? null,
    source_of_application: data.source_of_application,   // enum code
  };

  // PostgreSQL returns rows; MySQL returns inserted id differently.
  // Using RETURNING for Postgres; for MySQL you can read insertId from result[0].
  const [inserted] = await db("applications")
    .insert(row)
    .returning(["id", "created_at"]);

  // For MySQL fallback (no RETURNING)
  return inserted ?? { id: await lastInsertId(), created_at: null };
}

/**
 * Fallback helper for MySQL (only if RETURNING is not supported).
 * You can remove this if you use Postgres.
 */
async function lastInsertId() {
  const [{ id }] = await db("applications")
    .select("id")
    .orderBy("id", "desc")
    .limit(1);
  return id;
}
