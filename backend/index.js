// index.js
// Base Express server for Zoho Recruit backend

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Base route for health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Zoho Recruit backend is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
