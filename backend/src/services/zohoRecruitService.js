// backend/src/services/zohoRecruitService.js
// Zoho Recruit API client (EU-ready)
// - refreshes access_token using refresh_token
// - calls Recruit v2 endpoints with required headers (Authorization + orgId)
// - verbose error messages for easier debugging

import fs from 'node:fs';
import path from 'node:path';

const REGION = process.env.ZOHO_REGION || 'eu';
const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ORG_ID = process.env.ZOHO_ORG_ID; // e.g. 2010XXXXXXXX

const TOKEN_URL = `https://accounts.zoho.${REGION}/oauth/v2/token`;
const API_BASE  = `https://recruit.zoho.${REGION}/recruit/v2`;

let cached = { token: null, exp: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (cached.token && now < cached.exp - 60_000) return cached.token;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`[Zoho] token refresh failed ${res.status}: ${text}`);
  }

  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`[Zoho] token refresh returned non-JSON: ${text.slice(0,400)}`); }

  if (!json.access_token) {
    throw new Error(`[Zoho] token refresh missing access_token: ${text}`);
  }

  cached.token = json.access_token;
  cached.exp   = now + (Number(json.expires_in || 3600) * 1000);
  return cached.token;
}

async function zohoRequest(method, pathUrl, { headers = {}, json, body } = {}) {
  const token = await getAccessToken();
  const url   = `${API_BASE}${pathUrl}`;

  const finalHeaders = {
    Authorization: `Zoho-oauthtoken ${token}`,
    orgId: ORG_ID,
    ...headers,
  };

  const opts = { method, headers: finalHeaders };
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(json);
  } else if (body !== undefined) {
    opts.body = body; // FormData or stream
  }

  const res = await fetch(url, opts);
  const resText = await res.text();

  if (!res.ok) {
    throw new Error(
      `[Zoho] ${method} ${pathUrl} failed ${res.status} ${res.statusText}: ${resText.slice(0,500)}`
    );
  }

  try { return JSON.parse(resText); }
  catch { return resText; } // some endpoints can return empty body
}

/**
 * Create a Candidate in Zoho Recruit.
 * Returns created record id (string).
 */
export async function createCandidate(candidate) {
  const payload = {
    data: [
      {
        // Last_Name is mandatory in Zoho Recruit
        Last_Name: candidate.last_name || candidate.first_name || 'Unknown',
        First_Name: candidate.first_name || '',
        Email: candidate.email || undefined,
        Mobile: candidate.phone || undefined,
        City: candidate.preferred_location || undefined,
        Source: candidate.source_of_application || undefined,
        Description: candidate.cover_letter || undefined,
      },
    ],
    trigger: ['workflow'],
  };

  const resp = await zohoRequest('POST', '/Candidates', { json: payload });
  const id = resp?.data?.[0]?.details?.id;
  if (!id) {
    throw new Error(`[Zoho] createCandidate: unexpected response: ${JSON.stringify(resp).slice(0,500)}`);
  }
  return id;
}

/**
 * Upload an attachment (resume) to Candidate.
 * If file path is missing or file does not exist, this is a no-op.
 */
export async function uploadCandidateAttachment(candidateId, absFilePath) {
  if (!absFilePath || !fs.existsSync(absFilePath)) return;

  const form = new FormData(); // Node 18+: global FormData
  form.append('file', fs.createReadStream(absFilePath));

  await zohoRequest('POST', `/Candidates/${candidateId}/Attachments`, {
    body: form,
    headers: {}, // Authorization and orgId are set in zohoRequest
  });
}
