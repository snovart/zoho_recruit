// frontend/src/composables/useAuth.js
// Centralized auth state + helpers (Composition API)

import { ref, computed } from 'vue';
import axios from 'axios';
import { login as apiLogin, logout as apiLogout, fetchMe } from '@/api/auth';
import {
  LS_AUTH_TOKEN,
  LS_AUTH_USER,
  AUTH_HEADER,
} from '@/constants/auth';

// --- storage helpers -------------------------------------------------

function readStored(key) {
  // prefer long-lived (localStorage), fallback to session-only
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function writeStored(key, value, remember) {
  const target = remember ? localStorage : sessionStorage;
  const other  = remember ? sessionStorage : localStorage;
  target.setItem(key, value);
  // keep only one copy
  other.removeItem(key);
}

function clearStored(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

// --- state ------------------------------------------------------------

const token = ref(readStored(LS_AUTH_TOKEN) || '');
const user  = ref(null);

// set axios header from stored token on first import
if (token.value) {
  axios.defaults.headers.common[AUTH_HEADER] = `Bearer ${token.value}`;
  const raw = readStored(LS_AUTH_USER);
  if (raw) {
    try { user.value = JSON.parse(raw); } catch { user.value = null; }
  }
}

const loading = ref(false);
const error   = ref(null);
const isAuthenticated = computed(() => Boolean(token.value));

// --- actions ----------------------------------------------------------

/**
 * Sign in and persist token/user.
 * @param {string} email
 * @param {string} password
 * @param {boolean} remember  // true -> localStorage, false -> sessionStorage
 */
async function signIn(email, password, remember = false) {
  loading.value = true;
  error.value   = null;
  try {
    const { token: tk, user: u } = await apiLogin(email, password);

    // token in memory
    token.value = tk;
    user.value  = u;

    // set header for following requests
    axios.defaults.headers.common[AUTH_HEADER] = `Bearer ${tk}`;

    // persist
    writeStored(LS_AUTH_TOKEN, tk, remember);
    writeStored(LS_AUTH_USER, JSON.stringify(u), remember);

    return { ok: true };
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Auth failed';
    error.value = msg;
    return { ok: false, error: msg };
  } finally {
    loading.value = false;
  }
}

/**
 * Refresh user data from backend
 */
async function refreshMe() {
  try {
    const { user: u } = await fetchMe();
    user.value = u;

    // keep user in the same storage where the token is
    const remembered = localStorage.getItem(LS_AUTH_TOKEN) !== null;
    writeStored(LS_AUTH_USER, JSON.stringify(u), remembered);
  } catch {
    // ignore
  }
}

/**
 * Sign out and clear storage
 */
async function signOut() {
  try { await apiLogout(); } catch (_) {/* ignore network errors on logout */ }

  token.value = '';
  user.value  = null;

  clearStored(LS_AUTH_TOKEN);
  clearStored(LS_AUTH_USER);

  delete axios.defaults.headers.common[AUTH_HEADER];
}

export function useAuth() {
  return {
    // state
    token,
    user,
    isAuthenticated,
    loading,
    error,
    // actions
    signIn,
    signOut,
    refreshMe,
  };
}
