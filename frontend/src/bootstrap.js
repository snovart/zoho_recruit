// frontend/src/bootstrap.js
// ------------------------------------------------------------
// Axios global setup for the SPA
//  - Base URL from env (VITE_API_BASE_URL)
//  - Default headers
//  - Restore token from storage on boot
//  - Global 401 handler (clears auth and redirects to /login)
// ------------------------------------------------------------

import axios from 'axios';
import { LS_AUTH_TOKEN, LS_AUTH_USER, AUTH_HEADER } from '@/constants/auth';

window.axios = axios;

// Default header
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Optional base URL from .env (e.g., VITE_API_BASE_URL="http://localhost:5000")
if (import.meta.env?.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

// Restore token from storage (localStorage first, then sessionStorage)
const storedToken =
  localStorage.getItem(LS_AUTH_TOKEN) ?? sessionStorage.getItem(LS_AUTH_TOKEN);

if (storedToken) {
  axios.defaults.headers.common[AUTH_HEADER] = `Bearer ${storedToken}`;
}

// Global 401 handler: clear auth and redirect to /login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // remove token/user from both storages
      localStorage.removeItem(LS_AUTH_TOKEN);
      localStorage.removeItem(LS_AUTH_USER);
      sessionStorage.removeItem(LS_AUTH_TOKEN);
      sessionStorage.removeItem(LS_AUTH_USER);

      // drop header
      delete axios.defaults.headers.common[AUTH_HEADER];

      // redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
