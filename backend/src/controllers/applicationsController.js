export const createApplication = async (req, res) => {
  try {
    // file saved by multer middleware (if provided)
    const file = req.file || null;

    // all non-file fields come in req.body (because of multer)
    const b = req.body;

    // normalize a few fields to expected types
    const years  = b.years_of_experience ? Number(b.years_of_experience) : null;
    const salary = b.expected_salary ? Number(b.expected_salary) : null;

    // skills may arrive as:
    // - single string (comma separated) OR
    // - multiple "skills" fields -> multer packs them into array
    let skills = [];
    if (Array.isArray(b.skills)) skills = b.skills;
    else if (typeof b.skills === 'string' && b.skills.trim()) {
      try {
        // Front now sends JSON.stringify([...]) — try JSON first
        const parsed = JSON.parse(b.skills);
        if (Array.isArray(parsed)) skills = parsed;
        else skills = b.skills.split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        skills = b.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Compose normalized payload we’ll later insert into DB
    const payload = {
      first_name: b.first_name,
      last_name: b.last_name,
      email: b.email,
      phone: b.phone,
      current_address: b.current_address,
      date_of_birth: b.date_of_birth,
      position_applied_for: b.position_applied_for,     // already human-readable label from FE
      resume_path: file ? file.filename : null,         // stored filename on disk
      resume_original_name: file ? file.originalname : null,
      linkedin_profile: b.linkedin_profile || null,

      education_level: b.education_level || null,       // label from FE
      years_of_experience: years,
      skills,
      previous_employer: b.previous_employer || null,
      current_job_title: b.current_job_title || null,
      notice_period: b.notice_period || null,           // label from FE
      expected_salary: salary,
      availability_for_interview: b.availability_for_interview || null,
      preferred_location: b.preferred_location || null, // label from FE
      cover_letter: b.cover_letter || null,
      source_of_application: b.source_of_application || null,
    };

    // For this step: just echo back + file info
    return res.status(201).json({
      ok: true,
      message: 'Application received (file saved). DB insert will be next step.',
      file: file
        ? {
            field: file.fieldname,
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          }
        : null,
      data: payload,
    });
  } catch (err) {
    console.error('[applications.create] error:', err);
    return res.status(400).json({ ok: false, error: err.message });
  }
};