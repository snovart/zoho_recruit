// src/controllers/healthController.js
// Healthcheck controller

export const getHealth = (req, res) => {
  res.json({ status: "ok", message: "Zoho Recruit backend is running" });
};
