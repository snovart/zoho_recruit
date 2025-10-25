// src/routes/index.js
import { Router } from "express";
import { getHealth, getHealthDb } from "../controllers/healthController.js";
import applicationsRouter from "./applications.js";
import { fetchCandidateFields } from '../controllers/zohoRecruitController.js'

const router = Router();

// health checks
router.get("/health", getHealth);
router.get("/health/db", getHealthDb);

// applications (multipart + save)
router.use(applicationsRouter); // exposes POST /applications

router.get('/zoho/recruit/fields', fetchCandidateFields)

export default router;
