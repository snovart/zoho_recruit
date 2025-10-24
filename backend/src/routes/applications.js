// src/routes/applications.js
import { Router } from 'express';
import { uploadResume } from '../middleware/upload.js';
import { createApplication } from '../controllers/applicationsController.js';

const router = Router();

// POST /api/applications  (multipart/form-data)
router.post('/', uploadResume, createApplication);

export default router;
