/**
 * tripService.js
 * Service untuk tabel "trips".
 *
 * Schema yang dikonfirmasi:
 * trips(id, user_id, title, start_date, end_date, travelers_count,
 *       transport_type, total_budget, status, notes, created_at, updated_at)
 *
 * Status yang diketahui saat ini: "planning", "selesai"
 * ⚠️  Hanya gunakan status yang ada di enum trip_status Supabase.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

function normalizeTrip(trip) {
  if (!trip) return null
  return {
    ...trip,
    startDate: trip.start_date,
    endDate: trip.end_date,
    dateDisplay:
      trip.start_date && trip.end_date ? `${trip.start_date} - ${trip.end_date}` : '-',
    personCount: Number(trip.travelers_count) || 1,
    initialBudget: Number(trip.total_budget) || 0,
    transportation: trip.transport_type || 'Mobil',
  }
}

const tripService = {
  /**
   * Ambil semua trip milik user yang sedang login.
   * @param {string} userId
   */
  async getTrips(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return []
    }
    const { data, error } = await supabase
      .from('trips')
      .select('id, user_id, title, start_date, end_date, travelers_count, transport_type, total_budget, status, notes, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[tripService.getTrips] error:', error)
      throw error
    }
    return (data || []).map(normalizeTrip)
  },

  /**
   * Ambil satu trip berdasarkan ID.
   * @param {string} tripId
   * @param {string} [userId]
   */
  async getTripById(tripId, userId) {
    if (!isSupabaseConfigured || !supabase || !tripId) {
      return null
    }
    let query = supabase
      .from('trips')
      .select('id, user_id, title, start_date, end_date, travelers_count, transport_type, total_budget, status, notes, created_at, updated_at')
      .eq('id', tripId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.maybeSingle()
    if (error) {
      console.error('[tripService.getTripById] error:', error)
      throw error
    }
    return normalizeTrip(data)
  },

  /**
   * Buat trip baru.
   * user_id berasal dari session Supabase Auth.
   */
  async createTrip(userId, tripData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    if (!userId) {
      throw new Error('User harus login untuk membuat trip.')
    }

    const payload = {
      user_id: userId,
      title: tripData.title,
      start_date: tripData.startDate || tripData.start_date,
      end_date: tripData.endDate || tripData.end_date,
      travelers_count: Number(tripData.personCount || tripData.travelers_count) || 1,
      transport_type: tripData.transportation || tripData.transport_type || null,
      total_budget: Number(tripData.initialBudget || tripData.total_budget) || 0,
      status: 'planning',
      notes: tripData.notes || null,
    }

    const { data, error } = await supabase
      .from('trips')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('[tripService.createTrip] error:', error)
      throw error
    }
    return normalizeTrip(data)
  },

  /**
   * Update total_budget pada trip.
   */
  async updateTotalBudget(tripId, totalBudget) {
    if (!isSupabaseConfigured || !supabase || !tripId) {
      return null
    }
    const { data, error } = await supabase
      .from('trips')
      .update({ total_budget: Number(totalBudget) || 0 })
      .eq('id', tripId)
      .select()
      .single()

    if (error) {
      console.error('[tripService.updateTotalBudget] error:', error)
      throw error
    }
    return normalizeTrip(data)
  },

  /**
   * Update budget categories / total.
   */
  async updateTripBudget(tripId, budgetCategories, totalEstimated) {
    return this.updateTotalBudget(tripId, totalEstimated)
  },

  /**
   * Update notes trip.
   */
  async updateNotes(tripId, notes) {
    if (!isSupabaseConfigured || !supabase || !tripId) {
      return null
    }
    const { data, error } = await supabase
      .from('trips')
      .update({ notes })
      .eq('id', tripId)
      .select()
      .single()

    if (error) {
      console.error('[tripService.updateNotes] error:', error)
      throw error
    }
    return normalizeTrip(data)
  },

  /**
   * Hapus trip berdasarkan ID.
   * @param {string} tripId
   */
  async deleteTrip(tripId) {
    if (!isSupabaseConfigured || !supabase || !tripId) {
      throw new Error('Konfigurasi Supabase tidak ditemukan.')
    }
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)

    if (error) {
      console.error('[tripService.deleteTrip] error:', error)
      throw error
    }
    return true
  },

  /**
   * Update status trip.
   * @param {string} tripId
   * @param {string} status - salah satu dari: 'planning' | 'selesai'
   */
  async updateStatus(tripId, status) {
    if (!isSupabaseConfigured || !supabase || !tripId) {
      return null
    }
    const { data, error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId)
      .select()
      .single()

    if (error) {
      console.error('[tripService.updateStatus] error:', error)
      throw error
    }
    return normalizeTrip(data)
  },
}

export default tripService

