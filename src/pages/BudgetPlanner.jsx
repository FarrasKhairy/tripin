import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Car,
  Hotel,
  Ticket,
  UtensilsCrossed,
  ParkingCircle,
  HelpCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Compass,
} from 'lucide-react'
import { useTripDetail } from '../hooks/useTrip'
import { useExpenses } from '../hooks/useExpenses'
import { Button } from '../components/common/Button'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { calculateBudgetTotal, calculatePerPerson, calculateExpenseTotal, calculateRemaining } from '../utils/calculations'
import { formatRupiah } from '../utils/formatters'
import { useToast } from '../contexts/ToastContext'

export function BudgetPlanner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trip, loading: tripLoading, updateBudget } = useTripDetail(id)
  const { expenses, loading: expensesLoading } = useExpenses(id)
  const { toast } = useToast()

  const [categories, setCategories] = useState({
    transportasi: 0,
    penginapan: 0,
    tiket: 0,
    makan: 0,
    parkir: 0,
    lainnya: 0,
  })

  const [saving, setSaving] = useState(false)

  // Initialize from trip's existing total_budget or breakdown
  useEffect(() => {
    if (trip) {
      if (trip.budgetCategories) {
        setCategories(trip.budgetCategories)
      } else if (trip.initialBudget && !categories.transportasi && !categories.penginapan) {
        // If trip already has a total_budget from CreateTrip but no breakdown yet
        setCategories((prev) => ({
          ...prev,
          lainnya: trip.initialBudget,
        }))
      }
    }
  }, [trip])

  const personCount = trip?.personCount || 1

  // Dynamic React calculation
  const total = useMemo(() => calculateBudgetTotal(categories), [categories])
  const perPerson = useMemo(() => calculatePerPerson(total, personCount), [total, personCount])
  const actualExpense = useMemo(() => calculateExpenseTotal(expenses), [expenses])
  const remainingBudget = useMemo(() => calculateRemaining(total, actualExpense), [total, actualExpense])
  const isOverBudget = total > 0 && actualExpense > total

  const handleCategoryChange = (key, value) => {
    const numeric = Number(value.replace(/[^0-9]/g, '')) || 0
    setCategories((prev) => ({
      ...prev,
      [key]: numeric,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateBudget(categories, total)
      toast.success('Estimasi budget berhasil disimpan ke Trip!')
      setTimeout(() => {
        navigate(`/trip/${id}`)
      }, 800)
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan estimasi budget.')
    } finally {
      setSaving(false)
    }
  }

  if (tripLoading) {
    return <LoadingState message="Memuat kalkulator budget..." className="py-20" />
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto py-20 animate-dashboard-enter">
        <EmptyState
          icon={Compass}
          title="Trip Tidak Ditemukan"
          description="Trip ini tidak ditemukan atau kamu belum memiliki akses ke perencana budget ini."
          actionLabel="Kembali ke Dashboard"
          onAction={() => navigate('/riwayat')}
        />
      </div>
    )
  }

  const categoryItems = [
    { key: 'transportasi', label: 'Transportasi', icon: Car, placeholder: 'Tiket pesawat, bensin, rental' },
    { key: 'penginapan', label: 'Penginapan', icon: Hotel, placeholder: 'Hotel, villa, homestay' },
    { key: 'tiket', label: 'Tiket Wisata', icon: Ticket, placeholder: 'Tiket masuk destinasi & atraksi' },
    { key: 'makan', label: 'Makan & Kuliner', icon: UtensilsCrossed, placeholder: 'Kuliner, sarapan, makan malam' },
    { key: 'parkir', label: 'Parkir / Retribusi', icon: ParkingCircle, placeholder: 'Biaya tol & retribusi parkir' },
    { key: 'lainnya', label: 'Lain-lain / Darurat', icon: HelpCircle, placeholder: 'Oleh-oleh, dana darurat, tips' },
  ]

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
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
          {trip.title}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">Kalkulator Budget</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kalkulator Budget
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hitung rincian estimasi biaya perjalanan untuk <strong className="text-slate-800 font-semibold">{trip.title}</strong>
          </p>
        </div>

        <Link
          to={`/trip/${id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline shrink-0"
        >
          <span>Detail Trip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Over Budget Warning Banner as requested in Requirement 12 */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800">Pengeluaranmu sudah melebihi budget.</p>
            <p className="text-rose-600 mt-0.5">
              Realisasi pengeluaran ({formatRupiah(actualExpense)}) lebih besar dari estimasi budget yang kamu atur ({formatRupiah(total)}) sebesar{' '}
              <strong className="font-semibold">{formatRupiah(actualExpense - total)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 3 Summary Cards: Estimated Budget, Actual Expense, Remaining Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Estimated Budget</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block truncate">
            {formatRupiah(total)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {formatRupiah(perPerson)} / orang
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-medium text-slate-400 block">Actual Expense</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block truncate">
            {expensesLoading ? '...' : formatRupiah(actualExpense)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {expenses.length} transaksi tercatat
          </span>
        </div>

        <div className={`p-5 rounded-2xl border shadow-xs ${
          isOverBudget
            ? 'bg-rose-50/70 border-rose-100 text-rose-700'
            : 'bg-emerald-50/70 border-emerald-100 text-[#0F766E]'
        }`}>
          <span className="text-xs font-medium block">
            {isOverBudget ? 'Defisit' : 'Remaining Budget'}
          </span>
          <span className="text-xl sm:text-2xl font-bold mt-1 block truncate">
            {expensesLoading ? '...' : formatRupiah(Math.abs(remainingBudget))}
          </span>
          <span className="text-[11px] mt-0.5 block">
            {isOverBudget ? 'Melebihi estimasi' : 'Sisa anggaran aman'}
          </span>
        </div>
      </div>

      {/* Breakdown Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Rincian Estimasi Biaya
          </h3>
          <span className="text-xs text-slate-400 font-normal">
            Masukkan rincian kebutuhan per pos
          </span>
        </div>

        <div className="space-y-3.5">
          {categoryItems.map((item) => {
            const Icon = item.icon
            const rawVal = categories[item.key] || ''
            const displayVal = rawVal ? new Intl.NumberFormat('id-ID').format(rawVal) : ''

            return (
              <div
                key={item.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 rounded-2xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0F766E]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-slate-400">{item.placeholder}</p>
                  </div>
                </div>

                <div className="relative w-full sm:w-52">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={displayVal}
                    onChange={(e) => handleCategoryChange(item.key, e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none text-right transition-all"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Total & Action Button */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Estimasi:</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#0F766E]">
              {formatRupiah(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/trip/${id}`}>
              <Button type="button" variant="outline" size="md">
                Batal
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              variant="primary"
              size="md"
              loading={saving}
              icon={Save}
            >
              Simpan ke Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
