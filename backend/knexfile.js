// Load env vars
import dotenv from "dotenv";
dotenv.config();

/**
 * Knex configuration (ESM).
 * This config sets default directories for migrations and seeds.
 * CLI commands like `npx knex migrate:make xxx` and `npx knex seed:make yyy`
 * will place files into ./src/db/migrations and ./src/db/seeds respectively.
 *
 * Ensure your project uses "type": "module" in package.json (ESM).
 * Knex v3+ supports ESM knexfile with `export default`.
 */

/** @type { import("knex").Knex.Config } */
export default {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: "./src/db/migrations",
    tableName: "knex_migrations",
    extension: "js", // force .js for ESM projects
  },
  seeds: {
    directory: "./src/db/seeds",
    extension: "js",
  },
};
