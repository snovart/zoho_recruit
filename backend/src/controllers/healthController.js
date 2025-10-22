// src/controllers/healthController.js
import { checkDb } from "../db/pool.js";

export const getHealth = (req, res) => {
  res.json({ status: "ok", message: "Zoho Recruit backend is running" });
};

export const getHealthDb = async (req, res) => {
  try {
    const ok = await checkDb();
    res.json({ status: ok ? "ok" : "fail" });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err.message });
  }
};
