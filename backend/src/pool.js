// backend/src/pool.js
// ------------------------------------------------------------
// Knex connection factory (PostgreSQL)
// Reads DB settings from .env and exports a single Knex instance.
// ------------------------------------------------------------

import knex from "knex";
import dotenv from "dotenv";

// Load env vars before reading process.env
dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "postgres",
  },
  pool: { min: 0, max: 10 },
  // Optional: enable if you want SQL logs in dev
  // debug: process.env.NODE_ENV !== "production",
});

export default db;
