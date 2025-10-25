// src/controllers/applicationsController.js
import {
  saveApplication,
  getApplicationsByUser,
  countApplicationsByUser,
} from '../services/applicationsService.js';

/**
 * POST /api/applications
 * Multer has already parsed:
 *  - req.file  -> uploaded resume file (if any)
 *  - req.body  -> all text fields as strings
 */
export const createApplication = async (req, res) => {
  try {
    const userId = req.user?.id ?? 1; // dev fallback

    const form = req.body || {};
    const file = req.file || null;

    // Coerce some fields
    const payload = { ...form };

    if (payload.years_of_experience !== undefined && payload.years_of_experience !== '') {
      payload.years_of_experience = Number(payload.years_of_experience);
    }
    if (payload.expected_salary !== undefined && payload.expected_salary !== '') {
      payload.expected_salary = Number(payload.expected_salary);
    }

    // Normalize skills: JSON string → array
    if (typeof payload.skills === 'string') {
      try {
        payload.skills = JSON.parse(payload.skills);
      } catch {
        payload.skills = payload.skills.includes(',')
          ? payload.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [payload.skills];
      }
    }
    if (!Array.isArray(payload.skills)) payload.skills = [];

    // Empty strings → null for nullable fields
    if (payload.availability_for_interview === '') payload.availability_for_interview = null;
    if (payload.previous_employer === '') payload.previous_employer = null;
    if (payload.current_job_title === '') payload.current_job_title = null;
    if (payload.cover_letter === '') payload.cover_letter = null;
    if (payload.linkedin_profile === '') payload.linkedin_profile = null;

    // Persist
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

/**
 * GET /api/applications
 * Returns current user's applications with pagination meta.
 */
export const listMyApplications = async (req, res) => {
  try {
    const userId = req.user?.id ?? 1; // dev fallback

    const pageNum = Math.max(1, Number(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
    const sort = req.query.sort || 'created_at:desc';

    const items = await getApplicationsByUser(userId, {
      page: pageNum,
      limit: limitNum,
      sort,
    });

    const total = await countApplicationsByUser(userId);

    res.json({
      ok: true,
      items,
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err) {
    console.error('[listMyApplications] error:', err);
    res
      .status(500)
      .json({ ok: false, message: err?.message || 'Internal Server Error' });
  }
};
