// frontend/src/constants/auth.js
// Keys & small helpers for auth state kept in localStorage.

export const LS_AUTH_TOKEN = 'zr:auth:token';
export const LS_AUTH_USER  = 'zr:auth:user';

export const AUTH_HEADER   = 'Authorization';

// Route names we’ll use in guards / redirects
export const ROUTE_LOGIN = { name: 'login' };
export const ROUTE_APPS  = { name: 'applications.list' };
