// src/middleware/authRequired.js
// Verifies "Authorization: Bearer <jwt>" and puts { id, email, role } into req.user

import jwt from 'jsonwebtoken';

export default function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ ok: false, error: 'No token' });
  }

  const token = match[1];

  try {
    // Token must be issued the same way as in your auth routes
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Common pattern: sub = user id
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}
