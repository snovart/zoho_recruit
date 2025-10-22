// src/routes/index.js
import { Router } from "express";
import { getHealth, getHealthDb } from "../controllers/healthController.js";

const router = Router();

router.get("/health", getHealth);
router.get("/health/db", getHealthDb); // DB ping

export default router;
