// src/routes/applications.js
import { Router } from "express";
import authRequired from "../middleware/authRequired.js";     // Protect routes with JWT (sets req.user)
import { uploadResume } from "../middleware/upload.js";       // Multer config for file uploads
import {
  createApplication,
  listMyApplications,
} from "../controllers/applicationsController.js";

const router = Router();

/**
 * GET /api/applications
 * Returns applications of the currently authenticated user.
 * Requires a valid Bearer token (authRequired populates req.user).
 */
router.get("/applications", authRequired, listMyApplications);

/**
 * POST /api/applications
 * Creates a new application for the current user.
 * - Protected by JWT (authRequired)
 * - Expects multipart/form-data with the file field named "resume"
 */
router.post(
  "/applications",
  authRequired,                         // ensure req.user is set
  uploadResume.single("resume"),        // handle single file under "resume"
  createApplication
);

export default router;
