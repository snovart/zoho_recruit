// src/routes/index.js
// Root API router

import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";

const router = Router();

// GET /api/health
router.get("/health", getHealth);

// here later: router.use('/applications', applicationsRouter)

export default router;
