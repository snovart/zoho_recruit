// frontend/src/api/applications.js
// CRUD calls for applications

import axios from 'axios'

export function createApplication(payload) {
  // expects normalized snake_case keys as assembled in ApplicationNew.vue
  return axios.post('/api/applications', payload).then(r => r.data)
}

/**
 * Get applications of the current authenticated user.
 * The backend is expected to read user id from the auth token.
 *
 * @param {Object} [opts]
 * @param {number} [opts.page=1]     - Page number (1-based)
 * @param {number} [opts.limit=20]   - Page size
 * @param {string} [opts.search]     - Optional search string
 * @param {string} [opts.sort]       - Optional sort field (e.g. "created_at:desc")
 * @returns {Promise<Object>}        - Server response JSON
 *
 * Expected server shape (example):
 * {
 *   ok: true,
 *   items: [
 *     { id, position_applied_for, created_at, status, ... },
 *   ],
 *   page: 1,
 *   limit: 20,
 *   total: 37
 * }
 */
export async function getMyApplications (opts = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    sort,
  } = opts

  const params = { page, limit }
  if (search) params.search = search
  if (sort) params.sort = sort

  const { data } = await axios.get('/api/applications', { params })
  return data
}