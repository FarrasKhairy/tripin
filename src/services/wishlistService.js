/**
 * wishlistService.js
 * Service untuk tabel "wishlists".
 *
 * Schema yang dikonfirmasi:
 * wishlists(id, user_id, destination_id, created_at)
 *
 * Wishlist hanya boleh diakses oleh user yang sedang login (Supabase RLS).
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const wishlistService = {
  /**
   * Ambil semua wishlist milik user.
   * @param {string} userId
   * @returns {Array} array wishlists dengan destination data join
   */
  async getWishlist(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) return []

    // Query wishlist milik user
    const { data: wlData, error: wlError } = await supabase
      .from('wishlists')
      .select('id, user_id, destination_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (wlError) throw wlError
    if (!wlData || wlData.length === 0) return []

    // Ambil destination IDs untuk query kedua
    const destIds = wlData.map((w) => w.destination_id)
    const { data: destData, error: destError } = await supabase
      .from('destinations')
      .select('id, name, slug, province, city, image_url, ticket_price, is_published')
      .in('id', destIds)
      .eq('is_published', true)
    if (destError) throw destError

    // Gabungkan
    const destMap = {}
    ;(destData || []).forEach((d) => { destMap[d.id] = d })

    return wlData
      .map((wl) => ({ ...wl, destination: destMap[wl.destination_id] || null }))
      .filter((wl) => wl.destination !== null)
  },

  /**
   * Cek apakah destinasi ada di wishlist user.
   * @param {string} userId
   * @param {string} destinationId
   * @returns {string|null} wishlist item ID jika ada, null jika tidak
   */
  async checkWishlist(userId, destinationId) {
    if (!isSupabaseConfigured || !supabase || !userId || !destinationId) return null
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .maybeSingle()
    if (error) throw error
    return data ? data.id : null
  },

  /**
   * Tambah destinasi ke wishlist.
   * @param {string} userId
   * @param {string} destinationId
   */
  async addToWishlist(userId, destinationId) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const payload = { user_id: userId, destination_id: destinationId }
    const { data, error } = await supabase
      .from('wishlists')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Hapus destinasi dari wishlist.
   * @param {string} wishlistId - ID baris wishlists
   */
  async removeFromWishlist(wishlistId) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)
    if (error) throw error
  },
}

export default wishlistService
