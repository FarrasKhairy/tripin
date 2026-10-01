import { useState, useEffect, useCallback, useMemo } from 'react'
import budgetService from '../services/budgetService'
import expenseService from '../services/expenseService'

/**
 * Hook untuk Budget Planner.
 * Mengelola budget_items dan kalkulasi sisa budget.
 *
 * Kalkulasi (dilakukan di frontend sesuai spesifikasi):
 * - total_estimated = SUM(estimated_amount × quantity)  ← dari budget_items
 * - total_actual    = SUM(amount)                       ← dari expenses
 * - remaining       = total_budget - total_actual        ← dari trips.total_budget
 *
 * @param {string} tripId
 * @param {number} totalBudget - dari trips.total_budget
 */
export function useBudgetPlanner(tripId, totalBudget = 0) {
  const [budgetItems, setBudgetItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    setError(null)
    try {
      const data = await budgetService.getBudgetItems(tripId)
      setBudgetItems(data)
    } catch (err) {
      console.error('[useBudgetPlanner] fetch error', err)
      setError('Gagal memuat rencana anggaran.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // Kalkulasi total estimasi
  const totalEstimated = useMemo(() => budgetService.calculateTotal(budgetItems), [budgetItems])

  /**
   * Tambah item anggaran baru.
   * @param {Object} itemData - { category, name, estimated_amount, quantity, notes }
   */
  const addItem = useCallback(async (itemData) => {
    setSubmitting(true)
    try {
      const newItem = await budgetService.addBudgetItem(tripId, itemData)
      setBudgetItems((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      console.error('[useBudgetPlanner] addItem error', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [tripId])

  /**
   * Update item anggaran.
   * @param {string} id
   * @param {Object} updates
   */
  const updateItem = useCallback(async (id, updates) => {
    setSubmitting(true)
    try {
      const updated = await budgetService.updateBudgetItem(id, updates)
      setBudgetItems((prev) => prev.map((bi) => bi.id === id ? updated : bi))
      return updated
    } catch (err) {
      console.error('[useBudgetPlanner] updateItem error', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [])

  /**
   * Hapus item anggaran.
   * @param {string} id
   */
  const deleteItem = useCallback(async (id) => {
    try {
      await budgetService.deleteBudgetItem(id)
      setBudgetItems((prev) => prev.filter((bi) => bi.id !== id))
    } catch (err) {
      console.error('[useBudgetPlanner] deleteItem error', err)
      throw err
    }
  }, [])

  return {
    budgetItems,
    totalEstimated,
    totalBudget,
    loading,
    error,
    submitting,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  }
}

/**
 * Hook untuk Expense Tracker.
 * Mengelola expenses dan kalkulasi sisa dari total_budget trip.
 *
 * @param {string} tripId
 * @param {number} totalBudget - dari trips.total_budget
 */
export function useExpenseTracker(tripId, totalBudget = 0) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchExpenses = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    setError(null)
    try {
      const data = await expenseService.getExpenses(tripId)
      setExpenses(data)
    } catch (err) {
      console.error('[useExpenseTracker] fetch error', err)
      setError('Gagal memuat catatan pengeluaran.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Kalkulasi di frontend
  const totalSpent = useMemo(() => expenseService.calculateTotal(expenses), [expenses])
  const remaining = useMemo(() => totalBudget - totalSpent, [totalBudget, totalSpent])
  const spentPercentage = useMemo(
    () => expenseService.calculateSpentPercentage(totalSpent, totalBudget),
    [totalSpent, totalBudget]
  )

  /**
   * Tambah pengeluaran baru.
   * @param {Object} expenseData - { category, title, amount, expense_date, notes }
   */
  const addExpense = useCallback(async (expenseData) => {
    setSubmitting(true)
    try {
      const newExpense = await expenseService.addExpense(tripId, expenseData)
      setExpenses((prev) => [newExpense, ...prev])
      return newExpense
    } catch (err) {
      console.error('[useExpenseTracker] addExpense error', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [tripId])

  /**
   * Hapus pengeluaran.
   * @param {string} id
   */
  const deleteExpense = useCallback(async (id) => {
    try {
      await expenseService.deleteExpense(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('[useExpenseTracker] deleteExpense error', err)
      throw err
    }
  }, [])

  // Pengelompokan per kategori untuk chart
  const byCategory = useMemo(() => {
    const map = {}
    expenses.forEach((e) => {
      const cat = e.category || 'Lain-lain'
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0)
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
      }))
  }, [expenses, totalSpent])

  return {
    expenses,
    totalSpent,
    remaining,
    spentPercentage,
    byCategory,
    totalBudget,
    loading,
    error,
    submitting,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}
