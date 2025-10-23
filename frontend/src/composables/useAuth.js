// frontend/src/composables/useAuth.js
// Centralized auth state + helpers. Uses axios that we expose in bootstrap.js.

import { ref, computed } from 'vue';
import axios from 'axios';
import { LS_AUTH_TOKEN, LS_AUTH_USER, AUTH_HEADER } from '@/constants/auth';

// bootstrap from localStorage on first import
const token = ref(localStorage.getItem(LS_AUTH_TOKEN) || '');
const user  = ref(JSON.parse(localStorage.getItem(LS_AUTH_USER) || 'null'));

// if we already have a token (page refresh), set axios header
if (token.value) {
  axios.defaults.headers.common[AUTH_HEADER] = `Bearer ${token.value}`;
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(token.value));

  // Save token/user to memory + localStorage + axios header
  function setAuth(newToken, newUser = null) {
    token.value = newToken || '';
    user.value  = newUser;

    if (token.value) {
      localStorage.setItem(LS_AUTH_TOKEN, token.value);
      axios.defaults.headers.common[AUTH_HEADER] = `Bearer ${token.value}`;
    }
    if (user.value) {
      localStorage.setItem(LS_AUTH_USER, JSON.stringify(user.value));
    }
  }

  // Full logout cleanup
  function clearAuth() {
    token.value = '';
    user.value  = null;

    localStorage.removeItem(LS_AUTH_TOKEN);
    localStorage.removeItem(LS_AUTH_USER);
    delete axios.defaults.headers.common[AUTH_HEADER];
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
}
