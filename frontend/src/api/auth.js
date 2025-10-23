// frontend/src/api/auth.js
// Simple auth endpoints. Adapt backend URLs if they differ.

import axios from 'axios';

export const AUTH_API = {
  login:  '/api/auth/login',
  me:     '/api/auth/me',
  logout: '/api/auth/logout',
};

export async function login(email, password) {
  const { data } = await axios.post(AUTH_API.login, { email, password });
  // expected shape: { token, user }
  return data;
}

export async function fetchMe() {
  const { data } = await axios.get(AUTH_API.me);
  return data; // { user }
}

export async function logout() {
  const { data } = await axios.post(AUTH_API.logout);
  return data;
}
