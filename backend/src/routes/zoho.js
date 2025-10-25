// src/routes/zoho.js
import { Router } from 'express';
import { oauthCallback } from '../controllers/zohoController.js';

const router = Router();

// GET /zoho/oauth/callback?code=...
router.get('/zoho/oauth/callback', oauthCallback);

export default router;
