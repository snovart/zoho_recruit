// frontend/src/router/index.js
// Vue Router setup with auth guard

import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ROUTE_LOGIN } from '@/constants/auth'

// Pages
import Login from '@/pages/Login.vue'
import List from '@/pages/List.vue'
import ApplicationNew from '@/pages/ApplicationNew.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    name: 'applications.list',
    component: List,
    meta: { requiresAuth: true },
  },
  {
    path: '/applications/new', // ← new route
    name: 'applications.new',
    component: ApplicationNew,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- Auth Guards ------------------------------------------------------

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return ROUTE_LOGIN
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'applications.list' }
  }

  return true
})

export default router
