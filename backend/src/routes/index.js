// src/routes/index.js
import { Router } from "express";
import { getHealth, getHealthDb } from "../controllers/healthController.js";
import applicationsRouter from "./applications.js"; // wire applications endpoints

const router = Router();

// health checks
router.get("/health", getHealth);
router.get("/health/db", getHealthDb);

// applications (multipart + save)
router.use(applicationsRouter); // exposes POST /applications

export default router;
