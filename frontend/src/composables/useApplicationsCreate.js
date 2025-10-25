// frontend/src/composables/useApplicationsCreate.js
import { ref } from 'vue'
import { createApplication } from '@/api/applications'

/**
 * Provides a reactive composable for creating new applications.
 * Usage:
 *   const { create, loading, error, result } = useApplicationsCreate()
 *   await create(formData)
 */
export function useApplicationsCreate() {
  const loading = ref(false)
  const error = ref(null)
  const result = ref(null)

  async function create(formData) {
    loading.value = true
    error.value = null
    result.value = null
    try {
      const res = await createApplication(formData)
      result.value = res
      return res
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    create,
    loading,
    error,
    result,
  }
}
