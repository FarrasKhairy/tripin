import { useState, useEffect, useCallback } from 'react'
import tripService from '../services/tripService'
import { useAuth } from './useAuth'

export function useTrips(passedUserId) {
  const { user } = useAuth()
  const userId = passedUserId || user?.id
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTrips = useCallback(async () => {
    if (!userId) {
      setTrips([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await tripService.getTrips(userId)
      setTrips(data)
    } catch (err) {
      console.error('[useTrips] error:', err)
      setError('Gagal memuat riwayat trip.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return { trips, loading, error, refetch: fetchTrips }
}

export function useTripDetail(id) {
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTrip = useCallback(async () => {
    if (!id) {
      setTrip(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await tripService.getTripById(id, user?.id)
      if (!data) {
        setError('Trip tidak ditemukan.')
      } else {
        setTrip(data)
      }
    } catch (err) {
      console.error('[useTripDetail] error:', err)
      setError('Gagal memuat detail trip.')
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    fetchTrip()
  }, [fetchTrip])

  const updateBudget = async (budgetCategories, totalEstimated) => {
    const updated = await tripService.updateTripBudget(id, budgetCategories, totalEstimated)
    setTrip(updated)
    return updated
  }

  return { trip, loading, error, updateBudget, refetch: fetchTrip }
}

