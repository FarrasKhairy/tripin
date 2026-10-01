import { useState, useEffect, useCallback } from 'react'
import destinationService from '../services/destinationService'

const EMPTY_FILTERS = {
  search: '',
  province: '',
  category: 'Semua',
  budget: '',
  sortBy: 'Nama A-Z',
}

export function useDestinations(initialFilters = {}) {
  const [destinations, setDestinations] = useState([])
  const [categories, setCategories] = useState([])
  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(true)
  const [metadataLoading, setMetadataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metadataError, setMetadataError] = useState(null)
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters })

  useEffect(() => {
    let mounted = true
    Promise.allSettled([
      destinationService.getCategories(),
      destinationService.getProvinces(),
    ]).then(([categoryResult, provinceResult]) => {
      if (!mounted) return
      if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value)
      else setMetadataError('Gagal memuat kategori destinasi.')
      if (provinceResult.status === 'fulfilled') setProvinces(provinceResult.value)
      else setMetadataError('Gagal memuat daftar provinsi.')
      setMetadataLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const fetchDestinations = useCallback(async (activeFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await destinationService.getDestinations(activeFilters)
      setDestinations(data || [])
    } catch (err) {
      console.error('[useDestinations]', err)
      setDestinations([])
      setError('Data destinasi sedang tidak tersedia. Coba muat ulang beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDestinations(filters)
  }, [filters, fetchDestinations])

  const updateFilters = useCallback((newFilters) => {
    setFilters((previous) => ({ ...previous, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS })
  }, [])

  return {
    destinations,
    categories,
    provinces,
    loading,
    metadataLoading,
    metadataError,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: () => fetchDestinations(filters),
  }
}

/**
 * Hook for destination detail by id or slug.
 */
export function useDestinationDetail(idOrSlug) {
  const [destination, setDestination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true
    setDestination(null)
    setLoading(true)
    setError(null)

    if (!idOrSlug) {
      setLoading(false)
      return () => { mounted = false }
    }

    destinationService
      .getDestinationByIdOrSlug(idOrSlug)
      .then((data) => {
        if (!mounted) return
        if (!data) setError('Destinasi tidak ditemukan.')
        else setDestination(data)
      })
      .catch((err) => {
        console.error('[useDestinationDetail]', err)
        if (mounted) setError('Data destinasi sedang tidak tersedia. Coba muat ulang beberapa saat lagi.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [idOrSlug, reloadKey])

  return { destination, loading, error, refetch: () => setReloadKey((key) => key + 1) }
}
