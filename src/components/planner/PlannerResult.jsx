import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Car,
  Hotel,
  Utensils,
  Ticket,
  ShieldCheck,
  Edit3,
  RotateCcw,
  Save,
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plane,
  X,
  Plus,
  Trash2,
  Navigation,
  Compass,
  Route,
  RefreshCw,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react'
import { formatRupiah } from '../../utils/formatters'
import { TRAVEL_STYLES, TRAVEL_STYLE_META } from '../../services/travelRecommendationConfig'
import tripRecommendationService from '../../services/tripRecommendationService'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../contexts/ToastContext'
import DestinationMap from './DestinationMap'

const CATEGORY_ICONS = {
  Transportasi: Plane,
  Penginapan: Hotel,
  Makan: Utensils,
  'Tiket Wisata': Ticket,
  'Transport Lokal': Car,
  'Lain-lain': ShieldCheck,
}

const CATEGORY_COLORS = {
  Transportasi: '#0284C7',   // Sky
  Penginapan: '#7C3AED',     // Purple
  Makan: '#EA580C',          // Orange
  'Tiket Wisata': '#0F766E',  // Teal
  'Transport Lokal': '#D97706', // Amber
  'Lain-lain': '#64748B',    // Slate
}

export function PlannerResult({ plan, onPlanUpdated, onReset }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [activeDayTab, setActiveDayTab] = useState(1)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [showCustomizeModal, setShowCustomizeModal] = useState(false)
  const [savingTrip, setSavingTrip] = useState(false)
  const [reoptimizingRoute, setReoptimizingRoute] = useState(false)
  const [isMobileMapExpanded, setIsMobileMapExpanded] = useState(false)

  // Customization local state
  const [customBudget, setCustomBudget] = useState(plan.userBudget)
  const [customStyle, setCustomStyle] = useState(plan.summary.travelStyle)
  const [customDestinations, setCustomDestinations] = useState(plan.recommendations)
  const [customDayAssignments, setCustomDayAssignments] = useState(() => Object.fromEntries(
    (plan.itinerary || []).flatMap((day) => (day.destinations || []).map((destination) => [destination.id, day.dayNumber])),
  ))
  const [candidateSearch, setCandidateSearch] = useState('')

  const {
    summary,
    budgetBreakdown = [],
    totalEstimatedCost = 0,
    userBudget = 0,
    remainingBudget = 0,
    insight = {},
    recommendations = [],
    candidateDestinations = [],
    plannerNotices = [],
    estimatedCostNotice = '',
    itinerary = [],
    routeSummary = {},
  } = plan

  const styleMeta = TRAVEL_STYLE_META[summary.travelStyle] || TRAVEL_STYLE_META[TRAVEL_STYLES.BALANCED]

  // Persentase penggunaan budget
  const budgetUsagePercent = userBudget > 0 ? Math.round((totalEstimatedCost / userBudget) * 100) : 100
  const isOverBudget = remainingBudget < 0

  // Cari destinasi untuk peta berdasarkan activeDayTab ('all' atau dayNumber)
  const activeDay = useMemo(() => {
    if (activeDayTab === 'all') return null
    return itinerary.find((d) => d.dayNumber === activeDayTab) || null
  }, [activeDayTab, itinerary])

  const mapDestinations = useMemo(() => {
    if (activeDayTab === 'all') {
      return recommendations
    }
    if (activeDay?.destinations && activeDay.destinations.length > 0) {
      return activeDay.destinations
    }
    // Fallback: ekstrak dari items bertipe isDestination
    if (activeDay?.items) {
      return activeDay.items
        .filter((i) => i.isDestination)
        .map((i) => ({
          id: i.destinationId,
          name: i.title,
          latitude: i.latitude,
          longitude: i.longitude,
          ticket_price: i.ticketPrice,
          image_url: i.image,
          area: { areaName: i.areaName },
          distanceKm: i.distanceKm,
        }))
    }
    return recommendations
  }, [activeDayTab, activeDay, recommendations])

  // Handle Save Trip to Supabase
  const handleSaveTrip = async () => {
    if (!user) {
      toast.info('Silakan login terlebih dahulu untuk menyimpan perjalanan.')
      navigate('/login')
      return
    }

    setSavingTrip(true)
    try {
      const createdTrip = await tripRecommendationService.saveSmartTrip(user.id, plan)
      toast.success(`Trip "${createdTrip.title}" berhasil disimpan ke riwayat!`)
      navigate(`/trip/${createdTrip.id}`)
    } catch (err) {
      console.error('[PlannerResult] Gagal menyimpan trip:', err)
      toast.error(err.message || 'Gagal menyimpan rencana perjalanan. Silakan coba lagi.')
    } finally {
      setSavingTrip(false)
    }
  }

  // Handle Regenerate Route (Nearest Neighbor re-optimization only)
  const handleRegenerateRoute = () => {
    setReoptimizingRoute(true)
    setTimeout(() => {
      try {
        const reoptimized = tripRecommendationService.reoptimizeRoute(plan)
        onPlanUpdated(reoptimized)
        toast.success('Urutan rute berhasil dioptimalkan ulang!')
      } catch (err) {
        console.error('[PlannerResult] Gagal mengoptimalkan rute:', err)
        toast.error('Gagal mengoptimalkan rute: ' + (err.message || 'Terjadi kesalahan'))
      } finally {
        setReoptimizingRoute(false)
      }
    }, 350)
  }

  // Handle Recalculate from Customize Modal
  const handleApplyCustomization = () => {
    const updatedPlan = tripRecommendationService.recalculateBudget(plan, {
      budget: Number(customBudget),
      travelStyle: customStyle,
      destinations: customDestinations,
      dayAssignments: customDayAssignments,
    })
    onPlanUpdated(updatedPlan)
    setShowCustomizeModal(false)
    toast.success('Rencana berhasil diperbarui dan dikalkulasi ulang!')
  }

  const handleRemoveDestination = (id) => {
    setCustomDestinations((prev) => prev.filter((d) => d.id !== id))
    setCustomDayAssignments((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleAddDestination = (destinationId) => {
    const destination = candidateDestinations.find((item) => String(item.id) === String(destinationId))
    if (!destination || customDestinations.some((item) => item.id === destination.id)) return
    if (customDestinations.length >= itinerary.length * 2) {
      toast.info('Setiap hari dibatasi maksimal dua destinasi. Hapus atau pindahkan destinasi sebelum menambah lagi.')
      return
    }
    const targetDay = itinerary.find((day) => customDestinations.filter((item) => Number(customDayAssignments[item.id] || 1) === day.dayNumber).length < 2)?.dayNumber || 1
    setCustomDestinations((prev) => [...prev, destination])
    setCustomDayAssignments((prev) => ({ ...prev, [destination.id]: targetDay }))
  }

  const handleMoveDestination = (destinationId, targetDay) => {
    const currentDay = Number(customDayAssignments[destinationId] || 1)
    const assignedCount = customDestinations.filter((item) => item.id !== destinationId && Number(customDayAssignments[item.id] || 1) === targetDay).length
    if (assignedCount >= 2 && currentDay !== targetDay) {
      toast.info('Setiap hari dibatasi maksimal dua destinasi.')
      return
    }
    setCustomDayAssignments((previous) => ({ ...previous, [destinationId]: targetDay }))
  }

  // Hitung total jarak rute keseluruhan jika belum tersedia di routeSummary
  const totalRouteKm = useMemo(() => {
    if (routeSummary.totalDistanceKm != null) return routeSummary.totalDistanceKm
    return itinerary.reduce((acc, d) => acc + (d.totalDistanceKm || 0), 0)
  }, [routeSummary, itinerary])

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* 1. Header Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold border border-teal-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your Tripin Plan</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styleMeta.badgeClass}`}>
                {styleMeta.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Eksplorasi {summary.destinationName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{summary.durationLabel}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{summary.travelers} Traveler</span>
              </span>
              <span>•</span>
              <span>
                {new Date(summary.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} -{' '}
                {new Date(summary.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={Edit3}
              onClick={() => {
                setCustomBudget(userBudget)
                setCustomStyle(summary.travelStyle)
                setCustomDestinations(recommendations)
                setCandidateSearch('')
                setCustomDayAssignments(Object.fromEntries(itinerary.flatMap((day) => (day.destinations || []).map((destination) => [destination.id, day.dayNumber]))))
                setShowCustomizeModal(true)
              }}
            >
              Sesuaikan
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              icon={RotateCcw}
              onClick={onReset}
              title="Buat ulang seluruh rencana perjalanan"
            >
              Regenerate Plan
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Save}
              loading={savingTrip}
              onClick={handleSaveTrip}
              disabled={!recommendations.length}
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] shadow-sm"
            >
              Gunakan Rencana Ini
            </Button>
          </div>
        </div>

        {/* 2. Budget KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Budget Perjalanan
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {formatRupiah(userBudget)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Batas alokasi awal yang kamu tentukan
            </p>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimasi Pengeluaran
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-[#0F766E] mt-1">
              {formatRupiah(totalEstimatedCost)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {budgetUsagePercent}% dari total budget
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isOverBudget
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              {isOverBudget ? 'Defisit Budget' : 'Sisa Cadangan Budget'}
            </span>
            <p className="text-xl sm:text-2xl font-extrabold mt-1">
              {formatRupiah(Math.abs(remainingBudget))}
            </p>
            <p className="text-[11px] mt-0.5 opacity-80">
              {isOverBudget
                ? 'Melebihi budget awal yang dialokasikan'
                : 'Dana aman untuk kuliner / tak terduga'}
            </p>
          </div>
        </div>
      </div>

      {(plannerNotices.length > 0 || estimatedCostNotice) && (
        <div className="space-y-2">
          {plannerNotices.map((notice) => (
            <p key={notice} role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{notice}</p>
          ))}
          {estimatedCostNotice && <p className="text-[11px] text-slate-500">{estimatedCostNotice}</p>}
        </div>
      )}

      {/* 2. SMART ROUTE SUMMARY CARD (Requirement 14 & 15) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" />
                <span>Smart Route Optimizer V1</span>
              </span>
              <span className="text-xs text-slate-400">Nearest Neighbor</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Rute Perjalanan Teroptimasi
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {routeSummary.optimizationNotice || 'Destinasi dikelompokkan berdasarkan kedekatan lokasi.'}
            </p>

            {routeSummary.startingPointNotice && (
              <p className="text-[11px] text-teal-300/90 font-medium flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{routeSummary.startingPointNotice}</span>
              </p>
            )}
          </div>

          {/* Key Metrics & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="px-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Total Jarak Geografis
                </span>
                <span className="text-lg sm:text-xl font-black text-teal-300">
                  {totalRouteKm > 0 ? `${totalRouteKm} km` : '—'}
                </span>
              </div>
              <div className="px-2 border-x border-white/10">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Destinasi
                </span>
                <span className="text-lg sm:text-xl font-black text-white">
                  {routeSummary.totalDestinationsCount || recommendations.length}
                </span>
              </div>
              <div className="px-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Klaster
                </span>
                <span className="text-lg sm:text-xl font-black text-white">
                  {routeSummary.totalAreasCount ?? 0} Area
                </span>
              </div>
            </div>

            {/* Regenerate Route Button */}
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={RefreshCw}
              loading={reoptimizingRoute}
              onClick={handleRegenerateRoute}
              className="bg-teal-500/20 text-teal-200 border-teal-400/30 hover:bg-teal-500/30 hover:text-white cursor-pointer"
              title="Optimalkan ulang urutan rute perjalanan tanpa mengubah destinasi pilihan"
            >
              Regenerate Route
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Tripin Insight Section */}
      <div
        className={`p-5 rounded-3xl border flex items-start gap-3.5 shadow-xs ${
          insight.type === 'tight'
            ? 'bg-amber-50/90 border-amber-200 text-amber-900'
            : insight.type === 'surplus'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : 'bg-teal-50/90 border-teal-200 text-teal-900'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            insight.type === 'tight'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {insight.type === 'tight' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tripin Insight
            </span>
            <span className="font-extrabold text-sm text-slate-900">{insight.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{insight.message}</p>
          {insight.adjustmentTip && (
            <p className="text-xs font-medium text-slate-500 pt-0.5">
              💡 {insight.adjustmentTip}
            </p>
          )}
          {insight.alternatives && (insight.alternatives.removeOptions?.length > 0 || insight.alternatives.freeOptions?.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {insight.alternatives.removeOptions?.slice(0, 2).map((option) => (
                <button key={`remove-${option.destinationId}`} type="button" className="rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-900" onClick={() => onPlanUpdated(tripRecommendationService.recalculateBudget(plan, { destinations: recommendations.filter((destination) => destination.id !== option.destinationId) }))}>
                  Hapus {option.name} (hemat {formatRupiah(option.savings)})
                </button>
              ))}
              {insight.alternatives.freeOptions?.slice(0, 2).map((option) => (
                <button key={`add-${option.destinationId}`} type="button" className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900" onClick={() => {
                  const candidate = candidateDestinations.find((destination) => destination.id === option.destinationId)
                  if (candidate) onPlanUpdated(tripRecommendationService.recalculateBudget(plan, { destinations: [...recommendations, candidate] }))
                }}>
                  Tambah {option.name} (gratis)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Budget Breakdown Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Rincian Alokasi Budget
            </h3>
            <p className="text-xs text-slate-500">
              Kalkulasi estimasi per pos pengeluaran berdasarkan gaya perjalanan {styleMeta.name}.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Total: {formatRupiah(totalEstimatedCost)}
          </span>
        </div>

        {/* Visual Progress Stacked Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {budgetBreakdown.map((item) => {
              const color = CATEGORY_COLORS[item.category] || '#94A3B8'
              return (
                <div
                  key={item.id}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                  }}
                  title={`${item.category}: ${formatRupiah(item.amount)} (${item.percentage}%)`}
                  className="h-full transition-all duration-300 hover:opacity-85"
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-slate-600">
            {budgetBreakdown.map((item) => {
              const color = CATEGORY_COLORS[item.category] || '#94A3B8'
              return (
                <div key={item.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{item.category}</span>
                  <span className="text-slate-400 font-bold">{item.percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Breakdown Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {budgetBreakdown.map((item) => {
            const IconComponent = CATEGORY_ICONS[item.category] || ShieldCheck
            const color = CATEGORY_COLORS[item.category] || '#0F766E'
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs"
                      style={{ backgroundColor: color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.category}</h4>
                      <span className="text-[10px] text-slate-400">{item.percentage}% Alokasi</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatRupiah(item.amount)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100/80 pt-2">
                  {item.notes}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Recommended Destinations (Cards with Map-Sync click) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] text-[10px] font-bold mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Recommended for You</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Destinasi Pilihan yang Dipersonalisasi
            </h3>
            <p className="text-xs text-slate-500">
              Dipilih oleh engine berdasarkan preferensi ({summary.preferences?.join(', ') || 'Umum'}) dan kedekatan geografis. Klik kartu untuk meninjau di peta.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {recommendations.length} Destinasi
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">Tidak ada destinasi terbit yang ditemukan di area ini. Coba pilih kota lain atau periksa kembali data destinasi.</div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((dest, idx) => {
            const ticket = dest.ticket_price == null || dest.ticket_price === '' ? null : Number(dest.ticket_price)
            const isSelected = selectedDestination?.id === dest.id
            return (
              <div
                key={dest.id || idx}
                onClick={() => setSelectedDestination(dest)}
                className={`bg-white rounded-2xl border transition-all flex flex-col group cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[#0F766E] shadow-md ring-2 ring-teal-200'
                    : 'border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200'
                }`}
              >
                {/* Photo & Badge */}
                <div className="h-44 bg-slate-200 relative overflow-hidden">
                  {dest.image_url ? (
                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div role="img" aria-label={`Gambar ${dest.name} belum tersedia`} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-200">
                      <MapPin className="w-10 h-10 text-teal-700/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  
                  {/* Area & Region Tag */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0F766E]" />
                    <span>{dest.area?.areaName || dest.city}</span>
                  </span>

                  {/* Ticket Badge */}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-xs font-bold text-white shadow-xs">
                    {ticket == null ? 'Harga belum tersedia' : ticket > 0 ? formatRupiah(ticket) : 'Tiket Gratis'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0F766E] transition-colors truncate">
                      {dest.name}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-[#0F766E]">
                        <span>📍 {dest.area?.areaName || dest.city}</span>
                      </span>
                      {dest.distanceKm != null && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          ~{dest.distanceKm} km geografis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Reason */}
                  <div className="p-3 bg-teal-50/80 border border-teal-100/70 rounded-xl text-[11px] text-teal-900 leading-relaxed space-y-1">
                    <span className="font-bold text-[#0F766E] block">Tripin memilih destinasi ini karena:</span>
                    <p className="text-slate-700">{dest.recommendationReason}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* 6. MAP VIEW + SMART ITINERARY TIMELINE (Requirements 2, 10, 11, 12, 22) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] text-[10px] font-bold mb-1">
              <MapIcon className="w-3 h-3" />
              <span>Map & Itinerary Sync</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Rute & Jadwal Perjalanan Harian
            </h3>
            <p className="text-xs text-slate-500">
              Sinkronisasi peta dan rute teratur (2–3 tempat per hari dalam satu koridor terdekat).
            </p>
          </div>

          {/* Day Selector Tabs with "Semua Hari" option */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveDayTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeDayTab === 'all'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Semua Hari
            </button>

            {itinerary.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveDayTab(day.dayNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeDayTab === day.dayNumber
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                Hari {day.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Map View (Collapsible on Mobile, Requirement 22) */}
        <div className="block lg:hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Peta Rute ({activeDayTab === 'all' ? 'Seluruh Trip' : `Hari ${activeDayTab}`})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMapExpanded((prev) => !prev)}
              className="text-xs text-[#0F766E] font-bold hover:underline cursor-pointer"
            >
              {isMobileMapExpanded ? 'Tutup Peta' : 'Buka Peta'}
            </button>
          </div>

          {isMobileMapExpanded && (
            <div className="animate-fadeIn">
              <DestinationMap
                destinations={mapDestinations}
                selectedDestination={selectedDestination}
                onDestinationSelect={(d) => setSelectedDestination(d)}
                dayFilter={activeDayTab}
                height="320px"
              />
            </div>
          )}
        </div>

        {/* Desktop Split View: LEFT (Itinerary Cards) & RIGHT (Sticky Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Itinerary Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {itinerary.map((day) => {
              // Jika filter bukan 'all' dan bukan hari ini, sembunyikan
              if (activeDayTab !== 'all' && activeDayTab !== day.dayNumber) {
                return null
              }

              return (
                <div key={day.dayNumber} className="space-y-4 p-5 bg-slate-50/70 rounded-3xl border border-slate-100 animate-fadeIn">
                  {/* Day Header Info */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider block">
                        {day.dateFormatted}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                        Hari {day.dayNumber}: {day.theme}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.totalDistanceKm != null && day.totalDistanceKm > 0 && (
                        <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          <span>~{day.totalDistanceKm} km</span>
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                        {day.items.length} Agenda
                      </span>
                    </div>
                  </div>

                  {/* Timeline Items with Distance Segments */}
                  <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {day.items.map((item, idx) => {
                      const isDestSelected = selectedDestination?.id === item.destinationId
                      return (
                        <React.Fragment key={idx}>
                          <div
                            onClick={() => {
                              if (item.isDestination) {
                                const matchingDest = recommendations.find((d) => d.id === item.destinationId) || item
                                setSelectedDestination(matchingDest)
                              }
                            }}
                            className={`relative group ${item.isDestination ? 'cursor-pointer' : ''}`}
                          >
                            {/* Timeline Dot */}
                            <div
                              className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs transition-all ${
                                item.isDestination
                                  ? isDestSelected
                                    ? 'bg-[#0F766E] text-white ring-4 ring-teal-300 scale-110'
                                    : 'bg-[#0F766E] text-white ring-2 ring-teal-200'
                                  : 'bg-slate-300 text-slate-700'
                              }`}
                            >
                              {item.isDestination ? '📍' : '•'}
                            </div>

                            {/* Timeline Card */}
                            <div
                              className={`rounded-2xl p-4 transition-all space-y-2 border ${
                                isDestSelected
                                  ? 'bg-white border-[#0F766E] shadow-md ring-2 ring-teal-200'
                                  : 'bg-white hover:border-slate-300 border-slate-100 shadow-xs'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                                    {item.time} waktu setempat
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {item.category}
                                  </span>
                                  {item.areaName && (
                                    <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5" />
                                      <span>{item.areaName}</span>
                                    </span>
                                  )}
                                </div>

                                {item.ticketPrice !== undefined && (
                                  <span className="text-xs font-extrabold text-teal-800">
                                    {item.ticketPrice == null || item.ticketPrice === '' ? 'Harga belum tersedia' : Number(item.ticketPrice) > 0 ? formatRupiah(Number(item.ticketPrice)) : 'Gratis'}
                                  </span>
                                )}
                              </div>

                              <h5 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                                {item.title}
                              </h5>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.notes}
                              </p>

                              {item.openingHours && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>Jam operasional: {item.openingHours}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Distance between destinations (Requirement 10 & 13) */}
                          {item.distanceToNextKm != null && item.distanceToNextKm > 0 && (
                            <div className="flex items-center gap-2.5 pl-2 py-1 my-1">
                              <span className="text-teal-600 font-extrabold text-sm ml-1.5 sm:ml-2.5">↓</span>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50/90 border border-teal-100 text-[#0F766E] text-[11px] font-bold shadow-xs">
                                <Navigation className="w-3 h-3 text-[#0F766E]" />
                                <span>{item.distanceToNextKm} km (jarak geografis)</span>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>

                  {/* Day Footer Summary */}
                  {day.totalDistanceKm != null && day.totalDistanceKm > 0 && (
                    <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Total jarak geografis rute hari ini:</span>
                      <strong className="text-slate-900">~{day.totalDistanceKm} km</strong>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Sticky DestinationMap on Desktop (Requirement 22) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24 space-y-4">
            <DestinationMap
              destinations={mapDestinations}
              selectedDestination={selectedDestination}
              onDestinationSelect={(d) => setSelectedDestination(d)}
              dayFilter={activeDayTab}
              height="480px"
            />

            {/* Selected destination quick card under map */}
            {selectedDestination && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Destinasi Terpilih di Peta
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDestination(null)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  {selectedDestination.name}
                </h5>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 text-[#0F766E] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedDestination.area?.areaName || selectedDestination.city}</span>
                  </span>
                  {selectedDestination.distanceKm != null && (
                    <span className="font-bold text-slate-700">~{selectedDestination.distanceKm} km geografis</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Bottom Sticky Bar for Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Sudah Cocok dengan Rencana Ini?
          </span>
          <p className="text-sm font-extrabold text-slate-900">
            Simpan langsung ke akunmu atau sesuaikan rincian kapan saja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={Edit3}
            onClick={() => {
              setCustomBudget(userBudget)
              setCustomStyle(summary.travelStyle)
              setCustomDestinations(recommendations)
              setShowCustomizeModal(true)
            }}
          >
            Sesuaikan
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            icon={Save}
            loading={savingTrip}
            onClick={handleSaveTrip}
            disabled={!recommendations.length}
            className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] shadow-md px-6"
          >
            Gunakan Rencana Ini
          </Button>
        </div>
      </div>

      {/* Modal Customize */}
      <Modal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        title="Sesuaikan Rencana Perjalanan"
      >
        <div className="space-y-5 py-2">
          {/* Change Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Ubah Total Budget (IDR)
            </label>
            <input
              type="number"
              step="100000"
              value={customBudget}
              onChange={(e) => setCustomBudget(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
            <span className="text-[11px] text-slate-500 font-medium">
              Terbaca: <strong>{formatRupiah(Number(customBudget))}</strong>
            </span>
          </div>

          {/* Change Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Gaya Perjalanan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(TRAVEL_STYLES).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCustomStyle(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    customStyle === s
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add another destination from the same local candidate set */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">Tambah destinasi di area terpilih</label>
            <input value={candidateSearch} onChange={(event) => setCandidateSearch(event.target.value)} placeholder="Cari destinasi atau kota..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700" />
            <select defaultValue="" onChange={(event) => { handleAddDestination(event.target.value); event.target.value = '' }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
              <option value="">Pilih destinasi lokal...</option>
              {candidateDestinations.filter((destination) => !customDestinations.some((selected) => selected.id === destination.id) && `${destination.name} ${destination.city || ''} ${destination.province || ''}`.toLocaleLowerCase('id-ID').includes(candidateSearch.toLocaleLowerCase('id-ID'))).slice(0, 150).map((destination) => (
                <option key={destination.id} value={destination.id}>{destination.name} — {destination.city || destination.province || 'Area terdekat'}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Daftar dibatasi ke destinasi terbit yang lolos konteks area perjalanan.</p>
          </div>

          {/* Remove destination */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Destinasi Terpilih ({customDestinations.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {customDestinations.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate mr-2">{d.name}</span>
                  <select aria-label={`Hari untuk ${d.name}`} value={customDayAssignments[d.id] || 1} onChange={(event) => handleMoveDestination(d.id, Number(event.target.value))} className="mr-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px]">
                    {itinerary.map((day) => <option key={day.dayNumber} value={day.dayNumber}>Hari {day.dayNumber}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(d.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    title="Hapus destinasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomizeModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyCustomization}
            >
              Kalkulasi Ulang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PlannerResult
