// backend/src/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import knex from "../pool.js"; // your configured Knex instance

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Create a signed JWT for a given user id and role. */
function signToken(user) {
  const payload = { sub: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Remove sensitive fields before returning a user to client. */
function toPublicUser(user) {
  if (!user) return null;
  const {
    password_hash, // strip
    ...safe
  } = user;
  return safe;
}

/** Extract bearer token from Authorization header. */
function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/** Auth middleware: verify JWT and attach req.auth { userId, role }. */
export function authRequired(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = { userId: decoded.sub, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token, user }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await knex("users").where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.is_active === false) {
      return res.status(403).json({ message: "User is deactivated" });
    }

    // Compare password
    const ok = await bcrypt.compare(String(password), String(user.password_hash || ""));
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Issue token
    const token = signToken(user);
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal error" });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Response: { user }
 */
router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await knex("users").where({ id: req.auth.userId }).first();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Internal error" });
  }
});

/**
 * POST /api/auth/logout
 * Stateless JWT logout (client should just drop the token).
 * Response: { ok: true }
 */
router.post("/logout", (req, res) => {
  return res.json({ ok: true });
});

export default router;
