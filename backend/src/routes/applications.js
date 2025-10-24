// src/routes/applications.js
import { Router } from "express";
import authRequired from "../middleware/authRequired.js";   // <-- protect route
import { uploadResume } from "../middleware/upload.js";
import { createApplication } from "../controllers/applicationsController.js";

const router = Router();

/**
 * POST /api/applications
 * Protected: requires valid Bearer JWT.
 * Multer handles multipart form; "resume" is the file field name.
 */
router.post(
  "/applications",
  authRequired,                    // <-- ensure req.user is set
  uploadResume.single("resume"),
  createApplication
);

export default router;
