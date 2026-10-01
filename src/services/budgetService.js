/**
 * budgetService.js
 * Service untuk tabel "budget_items".
 *
 * Schema yang dikonfirmasi:
 * budget_items(id, trip_id, category, name, estimated_amount, quantity, notes,
 *              created_at, updated_at)
 *
 * ⚠️  PENTING: Gunakan "estimated_amount" BUKAN "amount".
 * Total per item = estimated_amount × quantity
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { MOCK_BUDGET_ITEMS } from '../data/mock/trips.js'

let _mockBudgetItems = [...MOCK_BUDGET_ITEMS]

export const BUDGET_CATEGORIES = [
  'Transportasi',
  'Penginapan',
  'Tiket Wisata',
  'Makan',
  'Parkir / Tol',
  'Hiburan',
  'Belanja',
  'Lain-lain',
]

const budgetService = {
  /**
   * Ambil semua budget items untuk trip tertentu.
   * @param {string} tripId
   */
  async getBudgetItems(tripId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budget_items')
        .select('id, trip_id, category, name, estimated_amount, quantity, notes, created_at, updated_at')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    }
    return _mockBudgetItems.filter((bi) => bi.trip_id === tripId)
  },

  /**
   * Tambah budget item baru.
   *
   * @param {string} tripId
   * @param {Object} itemData
   * @param {string} itemData.category
   * @param {string} itemData.name
   * @param {number} itemData.estimated_amount   - BUKAN amount
   * @param {number} [itemData.quantity]
   * @param {string|null} [itemData.notes]
   */
  async addBudgetItem(tripId, itemData) {
    const payload = {
      trip_id: tripId,
      category: itemData.category,
      name: itemData.name,
      estimated_amount: Number(itemData.estimated_amount) || 0,
      quantity: Number(itemData.quantity) || 1,
      notes: itemData.notes || null,
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budget_items')
        .insert([payload])
        .select()
        .single()
      if (error) throw error
      return data
    }

    const newItem = {
      id: `bi-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    _mockBudgetItems = [..._mockBudgetItems, newItem]
    return newItem
  },

  async addBudgetItems(tripId, items = []) {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is required to save trip budget items.')
    if (!items.length) return []
    const payload = items.map((item) => ({
      trip_id: tripId,
      category: item.category,
      name: item.name,
      estimated_amount: Number(item.estimated_amount) || 0,
      quantity: Number(item.quantity) || 1,
      notes: item.notes || null,
    }))
    const { data, error } = await supabase.from('budget_items').insert(payload).select()
    if (error) throw error
    return data || []
  },

  async deleteBudgetItemsForTrip(tripId) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('budget_items').delete().eq('trip_id', tripId)
      if (error) throw error
      return
    }
    _mockBudgetItems = _mockBudgetItems.filter((item) => item.trip_id !== tripId)
  },

  /**
   * Update budget item.
   * @param {string} id
   * @param {Object} updates
   */
  async updateBudgetItem(id, updates) {
    const allowed = {}
    if (updates.category !== undefined) allowed.category = updates.category
    if (updates.name !== undefined) allowed.name = updates.name
    if (updates.estimated_amount !== undefined) allowed.estimated_amount = Number(updates.estimated_amount)
    if (updates.quantity !== undefined) allowed.quantity = Number(updates.quantity)
    if (updates.notes !== undefined) allowed.notes = updates.notes

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budget_items')
        .update(allowed)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }

    _mockBudgetItems = _mockBudgetItems.map((bi) =>
      bi.id === id ? { ...bi, ...allowed } : bi
    )
    return _mockBudgetItems.find((bi) => bi.id === id)
  },

  /**
   * Hapus budget item.
   * @param {string} id
   */
  async deleteBudgetItem(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id)
      if (error) throw error
      return
    }
    _mockBudgetItems = _mockBudgetItems.filter((bi) => bi.id !== id)
  },

  /**
   * Hitung total estimated budget dari array budget items.
   * total = sum(estimated_amount × quantity)
   *
   * @param {Array} items - array budget_items
   * @returns {number}
   */
  calculateTotal(items = []) {
    return items.reduce((sum, item) => {
      return sum + (Number(item.estimated_amount) || 0) * (Number(item.quantity) || 1)
    }, 0)
  },
}

export default budgetService
