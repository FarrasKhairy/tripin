import { useState, useEffect, useCallback } from 'react'
import expenseService from '../services/expenseService'

/**
 * useExpenses.js
 * Hook untuk mengelola pengeluaran berdasarkan trip_id.
 * Menggunakan expenseService (Supabase-only, tanpa mock fallback).
 */
export function useExpenses(tripId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!tripId) {
      setExpenses([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await expenseService.getExpenses(tripId)
      setExpenses(data)
    } catch (err) {
      console.error('[useExpenses] fetch error:', err)
      setError('Gagal memuat pengeluaran.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (expenseData) => {
    const newItem = await expenseService.addExpense(tripId, expenseData)
    setExpenses((prev) => [newItem, ...prev])
    return newItem
  }

  const updateExpense = async (id, expenseData) => {
    const updated = await expenseService.updateExpense(id, expenseData)
    setExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)))
    return updated
  }

  const deleteExpense = async (id) => {
    await expenseService.deleteExpense(id)
    setExpenses((prev) => prev.filter((item) => item.id !== id))
  }

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses }
}
