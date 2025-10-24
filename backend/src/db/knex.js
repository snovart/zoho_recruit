// src/db/knex.js
// Centralized Knex instance used by services.
// Picks config by NODE_ENV (development by default).

import knex from "knex";
import knexConfig from "../../knexfile.js";

const env = process.env.NODE_ENV || "development";
export const db = knex(knexConfig[env]);
