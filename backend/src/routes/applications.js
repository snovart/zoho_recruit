// src/routes/applications.js
import { Router } from "express";
import { uploadResume } from "../middleware/upload.js";
import { createApplication } from "../controllers/applicationsController.js";

const router = Router();

// multipart form: "resume" is the file field name
router.post("/applications", uploadResume.single("resume"), createApplication);

export default router;
