// frontend/src/composables/useApplicationsList.js
// ------------------------------------------------------------
// Composable to load current user's applications list with
// pagination, optional search and sorting.
// Keeps the API layer thin (see @/api/applications.js).
// ------------------------------------------------------------

import { ref, computed, onMounted } from 'vue'
import { getMyApplications } from '@/api/applications'

// Simple debounce helper (per-instance)
function useDebounce () {
  let t = null
  return (fn, ms = 400) => {
    clearTimeout(t)
    t = setTimeout(fn, ms)
  }
}

/**
 * Usage:
 * const { items, loading, error, page, limit, total, pageCount, search, sort, load, setPage, setSearch, refresh } = useApplicationsList()
 */
export function useApplicationsList (initial = {}) {
  // ---- state ------------------------------------------------
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(initial.page ?? 1)
  const limit = ref(initial.limit ?? 20)
  const total = ref(0)

  // free-form search and "field:dir" sort (e.g., "created_at:desc")
  const search = ref(initial.search ?? '')
  const sort = ref(initial.sort ?? 'created_at:desc')

  const pageCount = computed(() =>
    total.value > 0 ? Math.max(1, Math.ceil(total.value / limit.value)) : 1
  )

  const canPrev = computed(() => page.value > 1)
  const canNext = computed(() => page.value < pageCount.value)

  // ---- internal ---------------------------------------------
  const debouncer = useDebounce()

  async function load () {
    loading.value = true
    error.value = null
    try {
      const data = await getMyApplications({
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
        sort: sort.value || undefined,
      })

      // Expected shape: { ok, items, page, limit, total }
      items.value = data.items ?? []
      total.value = Number(data.total ?? 0)
      // Trust server page/limit if returned
      if (data.page) page.value = data.page
      if (data.limit) limit.value = data.limit
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Public helpers
  function refresh () {
    // no debounce on explicit refresh
    return load()
  }

  function setPage (p) {
    const next = Math.max(1, Number(p) || 1)
    if (next !== page.value) {
      page.value = next
      load()
    }
  }

  function setLimit (l) {
    const next = Math.max(1, Number(l) || 20)
    if (next !== limit.value) {
      limit.value = next
      page.value = 1 // reset to first page
      load()
    }
  }

  function setSearch (q) {
    // debounce search; reset to first page when query changes
    search.value = q ?? ''
    page.value = 1
    debouncer(load, 400)
  }

  function setSort (s) {
    sort.value = s ?? ''
    page.value = 1
    load()
  }

  function nextPage () {
    if (canNext.value) setPage(page.value + 1)
  }

  function prevPage () {
    if (canPrev.value) setPage(page.value - 1)
  }

  onMounted(load)

  return {
    // state
    items,
    loading,
    error,
    page,
    limit,
    total,
    pageCount,
    search,
    sort,
    canPrev,
    canNext,
    // actions
    load,
    refresh,
    setPage,
    setLimit,
    setSearch,
    setSort,
    nextPage,
    prevPage,
  }
}
