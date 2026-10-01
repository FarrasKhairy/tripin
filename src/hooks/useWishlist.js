import { useState, useEffect, useCallback } from 'react'
import wishlistService from '../services/wishlistService'
import { useAuth } from './useAuth'

/**
 * Hook untuk mengelola wishlist user.
 * @param {string} [passedUserId]
 */
export function useWishlist(passedUserId) {
  const { user } = useAuth()
  const userId = passedUserId || user?.id
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await wishlistService.getWishlist(userId)
      setWishlist(data)
    } catch (err) {
      console.error('[useWishlist] fetch error', err)
      setError('Gagal memuat wishlist.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  /**
   * Toggle wishlist (tambah jika belum ada, hapus jika ada).
   * Kembalikan { added: boolean }.
   */
  const toggleWishlist = useCallback(async (destinationId, destination) => {
    if (!userId) throw new Error('User belum login')
    try {
      const existingId = await wishlistService.checkWishlist(userId, destinationId)

      if (existingId) {
        await wishlistService.removeFromWishlist(existingId)
        setWishlist((prev) => prev.filter((w) => w.destination_id !== destinationId))
        return { added: false }
      } else {
        const newWl = await wishlistService.addToWishlist(userId, destinationId)
        setWishlist((prev) => [{ ...newWl, destination }, ...prev])
        return { added: true }
      }
    } catch (err) {
      console.error('[useWishlist] toggleWishlist error', err)
      throw err
    }
  }, [userId])

  /**
   * Cek apakah sebuah destinasi ada di wishlist.
   * @param {string} destinationId
   * @returns {boolean}
   */
  const isInWishlist = useCallback(
    (destinationId) => wishlist.some((w) => w.destination_id === destinationId),
    [wishlist]
  )

  return { wishlist, loading, error, toggleWishlist, isInWishlist, refetch: fetchWishlist }
}
