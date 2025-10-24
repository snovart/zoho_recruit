// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRouter from "./src/routes/index.js";
import authRouter from "./src/routes/auth.js"; // Auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==============================
// Mount API routers
// ==============================

// Auth endpoints (login, logout, me)
app.use("/api/auth", authRouter);

// Other API routes
app.use("/api", apiRouter);

// ==============================
// Start the server
// ==============================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
