// backend/src/services/zohoRecruit.js
import dotenv from 'dotenv';
dotenv.config();

/**
 * Minimal Zoho Recruit API helper.
 * - getAccessToken(): exchanges refresh_token for a short-lived access token
 * - createCandidate(): creates a Candidate record
 */

const ACCOUNTS_BASE = 'https://accounts.zoho.eu';
const RECRUIT_BASE  = 'https://www.zohoapis.eu/recruit/v2';

async function getAccessToken() {
  const {
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN,
  } = process.env;

  const res = await fetch(`${ACCOUNTS_BASE}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

/**
 * Creates a Candidate in Zoho Recruit.
 * @param {object} candidatePayload - object with fields matching Zoho schema
 * @returns {Promise<object>} Zoho API response
 */
export async function createCandidate(candidatePayload) {
  const token = await getAccessToken();

  const res = await fetch(`${RECRUIT_BASE}/Candidates`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [candidatePayload] }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Zoho create candidate error: ${JSON.stringify(json)}`);
  }
  return json;
}

export { getAccessToken };
