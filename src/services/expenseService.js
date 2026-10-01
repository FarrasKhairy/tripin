/**
 * expenseService.js
 * Service untuk tabel "expenses".
 *
 * Schema yang dikonfirmasi:
 * expenses(id, trip_id, category, title, amount, expense_date, notes,
 *          created_at, updated_at)
 *
 * ⚠️  PENTING:
 * - Gunakan "title" BUKAN "name"
 * - Gunakan "amount" BUKAN "estimated_amount"
 * - Gunakan "expense_date" BUKAN "date"
 * - Gunakan "notes" BUKAN "description"
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const EXPENSE_CATEGORIES = [
  'Makan',
  'Tiket Wisata',
  'Transportasi',
  'Penginapan',
  'Hiburan',
  'Belanja',
  'Lain-lain',
]

const expenseService = {
  /**
   * Ambil semua pengeluaran untuk trip tertentu.
   * @param {string} tripId
   */
  async getExpenses(tripId) {
    if (!isSupabaseConfigured || !supabase || !tripId) return []
    const { data, error } = await supabase
      .from('expenses')
      .select('id, trip_id, category, title, amount, expense_date, notes, created_at, updated_at')
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  /**
   * Tambah pengeluaran baru.
   *
   * @param {string} tripId
   * @param {Object} expenseData
   * @param {string} expenseData.category
   * @param {string} expenseData.title        - BUKAN name
   * @param {number} expenseData.amount       - BUKAN estimated_amount
   * @param {string} expenseData.expense_date - format YYYY-MM-DD, BUKAN date
   * @param {string|null} [expenseData.notes] - BUKAN description
   */
  async addExpense(tripId, expenseData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const payload = {
      trip_id: tripId,
      category: expenseData.category,
      title: expenseData.title,
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || null,
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Hapus pengeluaran.
   * @param {string} id
   */
  async deleteExpense(id) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  /**
   * Update pengeluaran yang sudah ada.
   * @param {string} id
   * @param {Object} expenseData
   */
  async updateExpense(id, expenseData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const payload = {}
    if (expenseData.category) payload.category = expenseData.category
    if (expenseData.title) payload.title = expenseData.title
    if (expenseData.amount !== undefined) payload.amount = Number(expenseData.amount) || 0
    if (expenseData.expense_date) payload.expense_date = expenseData.expense_date
    if (expenseData.notes !== undefined) payload.notes = expenseData.notes

    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /**
   * Hitung total pengeluaran dari array expenses.
   * remaining_budget = trips.total_budget - totalExpenses  (dihitung di frontend)
   *
   * @param {Array} expenses
   * @returns {number}
   */
  calculateTotal(expenses = []) {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  },

  /**
   * Hitung persentase terpakai dari total budget.
   * Aman terhadap division-by-zero.
   *
   * @param {number} totalExpenses
   * @param {number} totalBudget
   * @returns {number} 0-100
   */
  calculateSpentPercentage(totalExpenses, totalBudget) {
    if (!totalBudget || totalBudget <= 0) return 0
    return Math.min(100, Math.round((totalExpenses / totalBudget) * 100))
  },
}

export default expenseService
