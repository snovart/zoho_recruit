// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js";
import zohoRouter from "./src/routes/zoho.js";

// NEW: imports for uploads static and applications router
import path from "path";
import applicationsRouter from "./src/routes/applications.js"; // Applications (multipart/form-data)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------
// Static for uploaded files (helpful for manual checks)
// Files saved into backend/uploads/** will be available at /uploads/**
// e.g. http://localhost:3000/uploads/resumes/<filename>
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"))
);
// ---------------------------------------------

// ==============================
// Mount API routers
// ==============================

// Auth endpoints (login, logout, me)
app.use("/api/auth", authRouter);

// Other API routes
app.use("/api", apiRouter);

app.use(zohoRouter);

// Applications API (handles multipart forms with resume file)
app.use("/api/applications", applicationsRouter);

// ==============================
// Start the server
// ==============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
