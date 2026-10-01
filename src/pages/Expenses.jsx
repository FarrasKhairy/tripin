import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Wallet,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'
import { useTripDetail, useTrips } from '../hooks/useTrip'
import { useExpenses } from '../hooks/useExpenses'
import { ExpenseForm, EXPENSE_CATEGORIES } from '../components/expense/ExpenseForm'
import { ExpenseItem } from '../components/expense/ExpenseItem'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/common/Button'
import {
  calculateExpenseTotal,
  calculateRemaining,
  calculatePercentage,
} from '../utils/calculations'
import { formatRupiah } from '../utils/formatters'
import { useToast } from '../contexts/ToastContext'

export function Expenses() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trips } = useTrips()
  const { trip, loading: tripLoading } = useTripDetail(id)
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses(id)
  const { toast } = useToast()

  const [filterCategory, setFilterCategory] = useState('Semua')
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Calculations
  const initialBudget = trip?.initialBudget || 0
  const totalSpent = useMemo(() => calculateExpenseTotal(expenses), [expenses])
  const remainingBudget = useMemo(
    () => calculateRemaining(initialBudget, totalSpent),
    [initialBudget, totalSpent]
  )
  const spentPercentage = useMemo(
    () => calculatePercentage(totalSpent, initialBudget),
    [totalSpent, initialBudget]
  )
  const isOverBudget = initialBudget > 0 && totalSpent > initialBudget

  const filteredExpenses = useMemo(() => {
    if (filterCategory === 'Semua') return expenses
    return expenses.filter(
      (e) => (e.category || '').toLowerCase() === filterCategory.toLowerCase()
    )
  }, [expenses, filterCategory])

  const handleTripChange = (e) => {
    navigate(`/trip/${e.target.value}/pengeluaran`)
  }

  const handleFormSubmit = async (formData) => {
    setSubmitting(true)
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData)
        toast.success('Pengeluaran berhasil diperbarui!')
        setEditingExpense(null)
      } else {
        await addExpense(formData)
        toast.success('Pengeluaran berhasil dicatat!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan pengeluaran.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteExpense(deleteTarget.id)
      toast.success('Pengeluaran berhasil dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menghapus pengeluaran.')
    } finally {
      setDeleting(false)
    }
  }

  if (tripLoading) {
    return <LoadingState message="Memuat tracker pengeluaran..." className="py-20" />
  }

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
      {/* Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/riwayat"
          className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-[#0F766E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          to={`/trip/${id}`}
          className="font-medium text-slate-500 hover:text-[#0F766E] transition-colors truncate max-w-[200px]"
        >
          {trip?.title || 'Trip'}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">Catatan Pengeluaran</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tracker Pengeluaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Catat setiap pengeluaran dan pantau sisa saldo untuk <strong className="text-slate-800 font-semibold">{trip?.title || 'Trip ini'}</strong>
          </p>
        </div>

        <Link
          to={`/trip/${id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline"
        >
          <span>Kembali ke Detail Trip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Over Budget Alert Banner */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800">Pengeluaran Melebihi Budget</p>
            <p className="text-rose-600 mt-0.5">
              Total pengeluaran tercatat sudah melampaui budget awal trip sebesar{' '}
              <strong className="font-semibold">{formatRupiah(totalSpent - initialBudget)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Top Card: Summary Stats & Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#0F766E]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status Keuangan Trip
            </h3>
          </div>

          {trips.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pindah trip:</span>
              <select
                value={id}
                onChange={handleTripChange}
                className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 outline-none"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 3 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Total Budget</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
              {formatRupiah(initialBudget)}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Total Terpakai</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
              {expensesLoading ? '...' : formatRupiah(totalSpent)}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-100 text-rose-700'
              : 'bg-emerald-50/70 border-emerald-100 text-[#0F766E]'
          }`}>
            <p className="text-[11px] font-medium">
              {isOverBudget ? 'Defisit Budget' : 'Sisa Saldo'}
            </p>
            <p className="text-lg sm:text-xl font-bold mt-0.5 truncate">
              {expensesLoading ? '...' : formatRupiah(Math.abs(remainingBudget))}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Persentase Terpakai</span>
            <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-[#0F766E]'}`}>
              {spentPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-500' : 'bg-[#0F766E]'
              }`}
              style={{ width: `${Math.min(100, spentPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Form (4 cols) & Transaction List (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Expense Form */}
        <div className="lg:col-span-5 space-y-4">
          <ExpenseForm
            onSubmit={handleFormSubmit}
            onCancel={editingExpense ? () => setEditingExpense(null) : null}
            initialData={editingExpense}
            loading={submitting}
          />
        </div>

        {/* Right: Transactions & Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {['Semua', ...EXPENSE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0
                  ${
                    filterCategory === cat
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          {expensesLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
              Memuat daftar pengeluaran...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
              <EmptyState
                icon={CreditCard}
                title={
                  filterCategory === 'Semua'
                    ? 'Belum ada catatan pengeluaran'
                    : `Belum ada pengeluaran kategori "${filterCategory}"`
                }
                description={
                  filterCategory === 'Semua'
                    ? 'Gunakan form di samping untuk mulai mencatat pengeluaran harian selama perjalanan.'
                    : 'Pilih kategori lain atau tambahkan pengeluaran baru untuk kategori ini.'
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={(item) => {
                    setEditingExpense(item)
                    window.scrollTo({ top: 300, behavior: 'smooth' })
                  }}
                  onDelete={(item) => setDeleteTarget(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal as requested in Requirement 11 */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Hapus Pengeluaran?"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Apakah kamu yakin ingin menghapus catatan pengeluaran{' '}
              <strong className="text-slate-800 font-semibold">
                &ldquo;{deleteTarget.title || deleteTarget.category}&rdquo;
              </strong>{' '}
              sebesar{' '}
              <strong className="text-slate-800 font-semibold">
                {formatRupiah(deleteTarget.amount)}
              </strong>
              ? Data pengeluaran yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDelete}
                loading={deleting}
              >
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
