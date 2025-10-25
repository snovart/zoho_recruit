// src/services/zohoAuth.js
import dotenv from 'dotenv';
dotenv.config();

/**
 * Exchange authorization code for access/refresh tokens.
 */
export async function exchangeAuthCode(code) {
  const {
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_REDIRECT_URI,
    ZOHO_ACCOUNTS_DOMAIN = 'https://accounts.zoho.eu',
  } = process.env;

  const url = `${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: ZOHO_REDIRECT_URI,
    code,
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || 'Zoho token exchange failed');
  }
  return data; // { access_token, refresh_token, expires_in, ... }
}

/**
 * Get a fresh access_token using a refresh_token.
 */
export async function refreshAccessToken(refreshToken) {
  const {
    ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET,
    ZOHO_ACCOUNTS_DOMAIN = 'https://accounts.zoho.eu',
  } = process.env;

  const url = `${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || 'Zoho refresh failed');
  }
  return data; // { access_token, expires_in, ... }
}
