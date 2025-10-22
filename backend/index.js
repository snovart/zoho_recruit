// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRouter from "./src/routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// mount API router
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
