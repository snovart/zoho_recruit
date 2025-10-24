// src/controllers/applicationsController.js
import { saveApplication } from '../services/applicationsService.js';

/**
 * POST /api/applications
 * Multer уже отработал:
 *  - req.file  -> файл резюме (если прислан)
 *  - req.body  -> ВСЕ текстовые поля формы (строки)
 */
export const createApplication = async (req, res) => {
  try {
    // replace with real user from auth middleware when ready
    const userId = req.user?.id ?? 1;

    // Multer puts all form fields as strings in req.body
    const form = req.body || {};
    const file = req.file || null;

    // Coerce/normalize a few fields so DB insert won’t choke
    const payload = { ...form };

    // years_of_experience, expected_salary → numbers (if present)
    if (payload.years_of_experience !== undefined && payload.years_of_experience !== '') {
      payload.years_of_experience = Number(payload.years_of_experience);
    }
    if (payload.expected_salary !== undefined && payload.expected_salary !== '') {
      payload.expected_salary = Number(payload.expected_salary);
    }

    // skills can arrive as JSON string or as a single value
    if (typeof payload.skills === 'string') {
      try {
        payload.skills = JSON.parse(payload.skills);
      } catch {
        // fallback: comma-separated or single value -> array
        payload.skills = payload.skills.includes(',')
          ? payload.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [payload.skills];
      }
    }
    if (!Array.isArray(payload.skills)) {
      payload.skills = [];
    }

    // empty string -> null for nullable fields
    if (payload.availability_for_interview === '') payload.availability_for_interview = null;
    if (payload.previous_employer === '') payload.previous_employer = null;
    if (payload.current_job_title === '') payload.current_job_title = null;
    if (payload.cover_letter === '') payload.cover_letter = null;
    if (payload.linkedin_profile === '') payload.linkedin_profile = null;

    // If we got a file from Multer, prefer its stored filename as resume_path
    if (file && file.filename) {
      payload.resume_path = file.filename;
    }

    // Hand off to service (no mapping here; we pass what frontend sent)
    const inserted = await saveApplication(userId, payload, file);

    res.status(201).json({
      ok: true,
      id: inserted.id,
      message: 'Application saved',
    });
  } catch (err) {
    console.error('[createApplication] error:', err);
    res.status(500).send(err?.message || 'Internal Server Error');
  }
};
