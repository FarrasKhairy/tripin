/**
 * tripDestinationService.js
 * Service untuk tabel "trip_destinations" (itinerary).
 *
 * Schema yang dikonfirmasi:
 * trip_destinations(id, trip_id, destination_id, visit_date, visit_order, notes, created_at)
 *
 * ⚠️  Join dengan destinations memerlukan FK trip_destinations.destination_id → destinations.id
 *     yang masih dalam validasi backend Dennis.
 *     Query join belum diimplementasikan di Supabase – gunakan dua query terpisah.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { MOCK_TRIP_DESTINATIONS } from '../data/mock/trips.js'

let _mockTripDests = [...MOCK_TRIP_DESTINATIONS]

const tripDestinationService = {
  /**
   * Ambil semua destinasi dalam trip.
   * @param {string} tripId
   */
  async getTripDestinations(tripId) {
    if (isSupabaseConfigured && supabase) {
      // ⚠️  Join mengandalkan FK yang belum dikonfirmasi.
      // Gunakan query sederhana tanpa join dulu.
      const { data, error } = await supabase
        .from('trip_destinations')
        .select('id, trip_id, destination_id, visit_date, visit_order, notes, created_at')
        .eq('trip_id', tripId)
        .order('visit_order', { ascending: true })
      if (error) throw error
      return data || []
    }
    return _mockTripDests.filter((td) => td.trip_id === tripId)
  },

  /**
   * Tambah destinasi ke trip.
   * @param {string} tripId
   * @param {string} destinationId
   * @param {Object} opts
   * @param {string|null} [opts.visit_date]
   * @param {number} [opts.visit_order]
   * @param {string|null} [opts.notes]
   */
  async addDestination(tripId, destinationId, opts = {}) {
    const payload = {
      trip_id: tripId,
      destination_id: destinationId,
      visit_date: opts.visit_date || null,
      visit_order: opts.visit_order || 1,
      notes: opts.notes || null,
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('trip_destinations')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data
    }

    const newItem = {
      id: `td-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
    }
    _mockTripDests = [..._mockTripDests, newItem]
    return newItem
  },

  async addDestinations(tripId, entries = []) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is required to save itinerary destinations.')
    if (!entries.length) return []
    const payload = entries.map((entry, index) => ({
      trip_id: tripId,
      destination_id: entry.destination_id,
      visit_date: entry.visit_date || null,
      visit_order: Number(entry.visit_order) || index + 1,
      notes: entry.notes || null,
    }))
    const { data, error } = await supabase.from('trip_destinations').insert(payload).select()
    if (error) throw error
    return data || []
  },

  async removeTripDestinations(tripId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('trip_destinations').delete().eq('trip_id', tripId)
      if (error) throw error
      return
    }
    _mockTripDests = _mockTripDests.filter((item) => item.trip_id !== tripId)
  },

  /**
   * Hapus destinasi dari trip.
   * @param {string} id - ID baris trip_destinations
   */
  async removeDestination(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('trip_destinations')
        .delete()
        .eq('id', id)
      if (error) throw error
      return
    }
    _mockTripDests = _mockTripDests.filter((td) => td.id !== id)
  },
}

export default tripDestinationService
