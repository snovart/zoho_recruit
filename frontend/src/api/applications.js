// frontend/src/api/applications.js
// CRUD calls for applications

import axios from 'axios'

export function createApplication(payload) {
  // expects normalized snake_case keys as assembled in ApplicationNew.vue
  return axios.post('/api/applications', payload).then(r => r.data)
}

// (на будущее)
// export function fetchMyApplications() { return axios.get('/api/applications').then(r => r.data) }
// export function fetchApplication(id) { return axios.get(`/api/applications/${id}`).then(r => r.data) }
