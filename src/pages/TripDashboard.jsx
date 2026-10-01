import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  Calculator,
  CreditCard,
  MapPin,
  CheckCircle2,
  StickyNote,
  Compass,
  ArrowLeft,
  Car,
  Hotel,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCheck,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import { useTripDetail } from '../hooks/useTrip'
import { useExpenses } from '../hooks/useExpenses'
import tripDestinationService from '../services/tripDestinationService'
import destinationService from '../services/destinationService'
import tripService from '../services/tripService'
import { BudgetDonutChart } from '../components/budget/BudgetDonutChart'
import { Button } from '../components/common/Button'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { TripStatusBadge } from '../components/trip/TripStatusBadge'
import { calculateExpenseTotal, calculateRemaining } from '../utils/calculations'
import { formatRupiah } from '../utils/formatters'
import { useToast } from '../contexts/ToastContext'

export function TripDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { trip, loading: tripLoading, error: tripError, refetch: refetchTrip } = useTripDetail(id)
  const { expenses, loading: expensesLoading } = useExpenses(id)
  const { toast } = useToast()

  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [destinations, setDestinations] = useState([])
  const [loadingDestinations, setLoadingDestinations] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Sync notes when trip loads
  useEffect(() => {
    if (trip?.notes !== undefined) {
      setNotes(trip.notes || '')
    }
  }, [trip?.notes])

  // Load itinerary destinations for this trip (with destination name lookup)
  useEffect(() => {
    async function loadTripDests() {
      if (!id) return
      setLoadingDestinations(true)
      try {
        const data = await tripDestinationService.getTripDestinations(id)
        const rawDests = data || []
        
        // Enrich with destination names via lookup if destination_id exists
        if (rawDests.length > 0) {
          try {
            const allDestinations = await destinationService.getDestinations()
            const destMap = new Map(allDestinations.map(d => [d.id, d]))
            const enriched = rawDests.map(td => {
              const destDetail = destMap.get(td.destination_id)
              return {
                ...td,
                destinationName: destDetail?.name || td.notes || `Destinasi #${td.visit_order || ''}`,
                destinationCity: destDetail?.city || '',
                destinationImage: destDetail?.image_url || '',
                destinationTicket: destDetail?.ticket_price,
              }
            })
            setDestinations(enriched)
          } catch {
            // Fallback: just show raw data without enrichment
            setDestinations(rawDests)
          }
        } else {
          setDestinations([])
        }
      } catch (err) {
        console.error('[TripDashboard] loadTripDestinations error:', err)
      } finally {
        setLoadingDestinations(false)
      }
    }
    loadTripDests()
  }, [id])

  const initialBudget = trip?.initialBudget || 0
  const totalSpent = useMemo(() => calculateExpenseTotal(expenses), [expenses])
  const remainingBudget = useMemo(
    () => calculateRemaining(initialBudget, totalSpent),
    [initialBudget, totalSpent]
  )

  // Calculate duration in days and nights
  const durationText = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return null
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diffTime = end.getTime() - start.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    if (days <= 0) return '1 Hari'
    const nights = Math.max(0, days - 1)
    return nights > 0 ? `${days} Hari ${nights} Malam` : `${days} Hari`
  }, [trip?.startDate, trip?.endDate])

  // Budget progress percentage (capped at 100% for progress bar display)
  const isOverBudget = initialBudget > 0 && totalSpent > initialBudget
  const budgetProgressPercent = initialBudget > 0
    ? Math.round((totalSpent / initialBudget) * 100)
    : 0
  const displayProgressWidth = Math.min(100, budgetProgressPercent)

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await tripService.updateNotes(id, notes.trim())
      toast.success('Catatan perjalanan berhasil disimpan!')
      setEditingNotes(false)
      refetchTrip()
    } catch (err) {
      console.error(err)
      toast.error('Gagal menyimpan catatan.')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!trip) return
    const newStatus = trip.status?.toLowerCase() === 'selesai' ? 'planning' : 'selesai'
    setUpdatingStatus(true)
    try {
      await tripService.updateStatus(id, newStatus)
      toast.success(
        newStatus === 'selesai'
          ? 'Trip berhasil ditandai sebagai Selesai! 🎉'
          : 'Trip diaktifkan kembali ke status Perencanaan.'
      )
      refetchTrip()
    } catch (err) {
      console.error('[TripDashboard] updateStatus error:', err)
      toast.error('Gagal memperbarui status trip.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Category breakdown for donut chart
  const chartData = useMemo(() => {
    if (!expenses.length) return []

    const catTotals = {
      Makan: 0,
      Tiket: 0,
      Transportasi: 0,
      Hiburan: 0,
      Belanja: 0,
    }

    expenses.forEach((e) => {
      const c = e.category || 'Lain-lain'
      if (c.toLowerCase().includes('makan')) catTotals.Makan += Number(e.amount)
      else if (c.toLowerCase().includes('tiket')) catTotals.Tiket += Number(e.amount)
      else if (c.toLowerCase().includes('transportasi')) catTotals.Transportasi += Number(e.amount)
      else if (c.toLowerCase().includes('hiburan')) catTotals.Hiburan += Number(e.amount)
      else if (c.toLowerCase().includes('belanja')) catTotals.Belanja += Number(e.amount)
      else catTotals.Hiburan += Number(e.amount)
    })

    const total = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1

    return [
      { label: 'Makan', percentage: Math.round((catTotals.Makan / total) * 100), color: '#0F766E' },
      { label: 'Tiket', percentage: Math.round((catTotals.Tiket / total) * 100), color: '#0EA5E9' },
      { label: 'Transportasi', percentage: Math.round((catTotals.Transportasi / total) * 100), color: '#F59E0B' },
      { label: 'Hiburan', percentage: Math.round((catTotals.Hiburan / total) * 100), color: '#8B5CF6' },
      { label: 'Belanja', percentage: Math.round((catTotals.Belanja / total) * 100), color: '#EC4899' },
    ]
  }, [expenses])

  if (tripLoading) {
    return <LoadingState message="Memuat detail trip..." className="py-20" />
  }

  if (tripError || !trip) {
    return (
      <div className="max-w-2xl mx-auto py-20 animate-dashboard-enter">
        <EmptyState
          icon={Compass}
          title="Trip Tidak Ditemukan"
          description="Trip ini tidak ditemukan atau kamu belum memiliki akses ke data perjalanan ini."
          actionLabel="Kembali ke Dashboard"
          onAction={() => navigate('/riwayat')}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
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
        <span className="font-semibold text-slate-800 truncate">{trip.title}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <TripStatusBadge status={trip.status} />
            {durationText && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3 text-[#0F766E]" />
                {durationText}
              </span>
            )}
            {trip.transportation && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <Car className="w-3 h-3 text-[#0F766E]" />
                {trip.transportation}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {trip.dateDisplay || `${trip.startDate || ''} - ${trip.endDate || ''}`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {trip.personCount || 1} Traveler
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          <Link to={`/trip/${id}/budget`}>
            <Button variant="outline" size="sm" icon={Calculator}>
              Kalkulator Budget
            </Button>
          </Link>
          <Link to={`/trip/${id}/pengeluaran`}>
            <Button variant="primary" size="sm" icon={CreditCard}>
              Catat Pengeluaran
            </Button>
          </Link>
          {/* Mark as selesai / reactivate */}
          <Button
            variant={trip.status?.toLowerCase() === 'selesai' ? 'outline' : 'secondary'}
            size="sm"
            icon={trip.status?.toLowerCase() === 'selesai' ? RotateCcw : CheckCheck}
            loading={updatingStatus}
            onClick={handleToggleStatus}
            className={
              trip.status?.toLowerCase() === 'selesai'
                ? 'text-slate-600 border-slate-300'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }
          >
            {trip.status?.toLowerCase() === 'selesai' ? 'Aktifkan Kembali' : 'Tandai Selesai'}
          </Button>
        </div>
      </div>

      {/* Over Budget Warning Banner if actual spending exceeds budget */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800">Perhatian: Pengeluaran Telah Melebihi Budget!</p>
            <p className="text-rose-600 mt-0.5">
              Total pengeluaran tercatat ({formatRupiah(totalSpent)}) melebihi budget yang dialokasikan ({formatRupiah(initialBudget)}) sebesar{' '}
              <strong className="font-semibold">{formatRupiah(totalSpent - initialBudget)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Top Section Grid: Budget & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Budget Summary & Visual Progress */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ringkasan Biaya Perjalanan
              </h3>
              <Link
                to={`/trip/${id}/budget`}
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Atur Budget &rarr;
              </Link>
            </div>

            {/* Visual Budget Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Progress Pengeluaran</span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-[#0F766E]'}`}>
                  {budgetProgressPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  }`}
                  style={{ width: `${displayProgressWidth}%` }}
                />
              </div>
            </div>

            {/* 3 Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <span className="text-[11px] font-medium text-slate-400 block">Total Budget</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block truncate">
                  {formatRupiah(initialBudget)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <span className="text-[11px] font-medium text-slate-400 block">Terpakai</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate">
                  {expensesLoading ? '...' : formatRupiah(totalSpent)}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-left ${
                isOverBudget
                  ? 'bg-rose-50/70 border-rose-100 text-rose-700'
                  : 'bg-emerald-50/70 border-emerald-100 text-[#0F766E]'
              }`}>
                <span className="text-[11px] font-medium block">
                  {isOverBudget ? 'Defisit' : 'Sisa Saldo'}
                </span>
                <span className="text-xs sm:text-sm font-bold mt-0.5 block truncate">
                  {expensesLoading ? '...' : formatRupiah(Math.abs(remainingBudget))}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{expenses.length} transaksi pengeluaran tercatat</span>
            <Link
              to={`/trip/${id}/pengeluaran`}
              className="font-semibold text-[#0F766E] hover:underline"
            >
              + Catat Transaksi
            </Link>
          </div>
        </div>

        {/* Right Card: Donut Chart "Pengeluaran per Kategori" */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pengeluaran per Kategori
            </h3>
            <Link
              to={`/trip/${id}/pengeluaran`}
              className="text-xs font-semibold text-[#0F766E] hover:underline"
            >
              Kelola Tracker &rarr;
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            {expensesLoading ? (
              <p className="text-xs text-slate-400">Memuat rincian...</p>
            ) : chartData.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-medium text-slate-600">Belum ada pengeluaran dicatat</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                  Mulai catat transaksi pengeluaran selama perjalanan liburanmu.
                </p>
                <Link
                  to={`/trip/${id}/pengeluaran`}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59] transition-colors"
                >
                  + Catat Pengeluaran
                </Link>
              </div>
            ) : (
              <BudgetDonutChart data={chartData} size={170} strokeWidth={22} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section Grid: Destinasi Kunjungan & Catatan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bottom Left: Destinasi Kunjungan */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Destinasi & Itinerary Kunjungan
            </h3>
            <Link
              to="/destinasi"
              className="text-xs font-semibold text-[#0F766E] hover:underline"
            >
              + Jelajahi Destinasi
            </Link>
          </div>

          {loadingDestinations ? (
            <div className="space-y-3 py-4">
              <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
              <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            </div>
          ) : destinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Compass className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Belum ada destinasi tersimpan</p>
              <p className="text-xs text-slate-400 mt-1 text-center max-w-xs leading-relaxed">
                Tambahkan tempat wisata favorit ke trip ini untuk merencanakan rute liburan yang sempurna.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/destinasi')}
              >
                Eksplor Destinasi Wisata
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {destinations.map((d, index) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Destination image thumbnail if available */}
                    {d.destinationImage ? (
                      <img
                        src={d.destinationImage}
                        alt={d.destinationName}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] font-bold text-sm flex items-center justify-center shrink-0 border border-teal-100">
                        {index + 1}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {d.destinationName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {d.destinationCity && (
                          <span className="text-[10px] text-[#0F766E] font-medium flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {d.destinationCity}
                          </span>
                        )}
                        {d.visit_date && (
                          <span className="text-[10px] text-slate-400">📅 {d.visit_date}</span>
                        )}
                        {d.destinationTicket !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            {Number(d.destinationTicket) === 0 ? '🎫 Gratis' : `🎫 Rp${Number(d.destinationTicket).toLocaleString('id-ID')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Link to destination detail page */}
                  {d.destination_id && (
                    <Link
                      to={`/destinasi/${d.destination_id}`}
                      className="text-[#0F766E] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Lihat detail destinasi"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Right: Catatan Perjalanan */}
        <div className="lg:col-span-4 bg-[#FEFCE8] border border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-600" />
                <span>Catatan Perjalanan</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (editingNotes) {
                    handleSaveNotes()
                  } else {
                    setEditingNotes(true)
                  }
                }}
                disabled={savingNotes}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                {savingNotes ? 'Menyimpan...' : editingNotes ? 'Simpan' : 'Edit'}
              </button>
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full text-xs text-amber-950 bg-amber-50/80 border border-amber-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Tambahkan catatan penting perjalananmu di sini..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNotes(false)}
                    className="text-[11px] text-amber-700 px-2 py-1"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="text-[11px] font-semibold bg-amber-600 text-white px-3 py-1 rounded-lg"
                  >
                    {savingNotes ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-900 leading-relaxed italic">
                {notes ? `"${notes}"` : 'Belum ada catatan. Klik Edit untuk menambahkan nomor darurat, informasi tiket, atau rencana packing.'}
              </p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-amber-200/60 text-[11px] text-amber-700 flex items-center justify-between">
            <span>Tersimpan di Supabase</span>
            <span className="font-medium">Tripin Notes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
