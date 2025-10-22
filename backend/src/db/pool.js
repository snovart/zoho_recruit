// src/db/pool.js
// PostgreSQL connection pool

import dotenv from "dotenv";
dotenv.config(); // ensure env is loaded before reading process.env

import pkg from "pg";
const { Pool } = pkg;


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ""),
  database: process.env.DB_NAME,
});

export async function checkDb() {
  const { rows } = await pool.query("SELECT 1 as ok");
  return rows[0]?.ok === 1;
}

export default pool;
