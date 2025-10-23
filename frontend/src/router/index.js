// frontend/src/router/index.js
// Vue Router with a global auth guard.

import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { ROUTE_LOGIN, ROUTE_APPS } from '@/constants/auth';

// Lazy pages
const LoginPage = () => import('@/pages/Login.vue');
const ApplicationsListPage = () => import('@/pages/ApplicationsList.vue');

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true, title: 'Login' },
  },
  {
    path: '/',
    redirect: { name: 'applications.list' },
  },
  {
    path: '/applications',
    name: 'applications.list',
    component: ApplicationsListPage,
    meta: { title: 'My Applications' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard: redirect based on auth state
router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();

  // если неавторизован и роут не публичный — на /login
  if (!to.meta.public && !isAuthenticated.value) {
    return ROUTE_LOGIN;
  }
  // если уже авторизован и идём на /login — на список заявок
  if (to.name === 'login' && isAuthenticated.value) {
    return ROUTE_APPS;
  }
  return true;
});

export default router;
