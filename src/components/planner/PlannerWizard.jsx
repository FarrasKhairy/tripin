import React, { useState, useEffect, useMemo } from 'react'
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  CheckCircle2,
  TreePine,
  Landmark,
  Utensils,
  Flame,
  Palmtree,
  ShoppingBag,
  BookOpen,
  Info,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react'
import destinationService from '../../services/destinationService'
import {
  TRAVEL_STYLES,
  TRAVEL_STYLE_META,
  PREFERENCE_MAPPINGS,
  BUDGET_PRESETS,
} from '../../services/travelRecommendationConfig'
import { calculateTripDuration } from '../../services/tripRecommendationService'
import { formatRupiah } from '../../utils/formatters'
import { Button } from '../common/Button'

const PREF_ICONS = {
  Nature: TreePine,
  Culture: Landmark,
  Food: Utensils,
  Adventure: Flame,
  Relaxation: Palmtree,
  Shopping: ShoppingBag,
  History: BookOpen,
}

export function PlannerWizard({ initialValues, onGenerate, isGenerating }) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Destination
  const [destinationSearch, setDestinationSearch] = useState('')
  const [selectedDestination, setSelectedDestination] = useState(initialValues?.destination || null)
  const [destinationsList, setDestinationsList] = useState([])
  const [loadingDestinations, setLoadingDestinations] = useState(true)
  const [destinationLoadError, setDestinationLoadError] = useState(false)
  const [destinationReloadCount, setDestinationReloadCount] = useState(0)

  // Step 2: Duration
  const [startDate, setStartDate] = useState(() => {
    if (initialValues?.startDate) return initialValues.startDate
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    if (initialValues?.endDate) return initialValues.endDate
    const d = new Date()
    d.setDate(d.getDate() + 10)
    return d.toISOString().split('T')[0]
  })

  // Step 3: Travelers
  const [travelers, setTravelers] = useState(initialValues?.travelers || 2)

  // Step 4: Budget
  const [budget, setBudget] = useState(initialValues?.budget || 4000000)

  // Step 5: Travel Style
  const [travelStyle, setTravelStyle] = useState(initialValues?.travelStyle || TRAVEL_STYLES.BALANCED)

  // Step 6: Preferences
  const [preferences, setPreferences] = useState(initialValues?.preferences || ['Culture', 'Food'])

  // Search published Supabase destinations in bounded pages; do not load the full destination table.
  useEffect(() => {
    let isMounted = true
    setLoadingDestinations(true)
    setDestinationLoadError(false)
    const timer = window.setTimeout(async () => {
      try {
        const data = await destinationService.searchPlannerDestinations(destinationSearch, 50)
        if (isMounted) setDestinationsList(data || [])
      } catch (err) {
        console.error('[PlannerWizard] Destination search failed:', err)
        if (isMounted) {
          setDestinationsList([])
          setDestinationLoadError(true)
        }
      } finally {
        if (isMounted) setLoadingDestinations(false)
      }
    }, destinationSearch ? 250 : 0)

    return () => {
      isMounted = false
      window.clearTimeout(timer)
    }
  }, [destinationSearch, destinationReloadCount])
  // Calculate duration days and nights
  const duration = useMemo(() => {
    return calculateTripDuration(startDate, endDate)
  }, [startDate, endDate])

  // Extract unique popular destination areas/cities from real destination records
  const popularHubs = useMemo(() => {
    const hubs = []
    const seen = new Set()
    destinationsList.forEach((d) => {
      const cityOrProv = d.city || d.province
      if (cityOrProv && !seen.has(cityOrProv.toLowerCase())) {
        seen.add(cityOrProv.toLowerCase())
        hubs.push({
          name: cityOrProv,
          province: d.province,
          sampleDest: d,
        })
      }
    })
    return hubs
  }, [destinationsList])

  // Filtered destinations list for search
  const filteredDestinations = useMemo(() => {
    if (!destinationSearch.trim()) return destinationsList
    const q = destinationSearch.toLowerCase().trim()
    return destinationsList.filter((d) => {
      const name = (d.name || '').toLowerCase()
      const city = (d.city || '').toLowerCase()
      const prov = (d.province || '').toLowerCase()
      const desc = (d.description || '').toLowerCase()
      return (
        name.includes(q) ||
        city.includes(q) ||
        prov.includes(q) ||
        desc.includes(q) ||
        (q === 'jogja' && (city.includes('yogyakarta') || prov.includes('yogyakarta')))
      )
    })
  }, [destinationsList, destinationSearch])

  // Validation
  const isDateValid = useMemo(() => {
    if (!startDate || !endDate) return false
    return new Date(endDate) >= new Date(startDate)
  }, [startDate, endDate])

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(selectedDestination)
      case 2:
        return isDateValid && duration.days >= 1
      case 3:
        return travelers >= 1
      case 4:
        return budget > 0
      case 5:
        return Boolean(travelStyle)
      case 6:
        return true // Preferences are optional
      default:
        return true
    }
  }, [currentStep, selectedDestination, isDateValid, duration, travelers, budget, travelStyle])

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Step 7: Trigger generation
      onGenerate({
        destination: selectedDestination,
        startDate,
        endDate,
        travelers: Number(travelers),
        budget: Number(budget),
        travelStyle,
        preferences,
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const togglePreference = (prefKey) => {
    setPreferences((prev) =>
      prev.includes(prefKey) ? prev.filter((p) => p !== prefKey) : [...prev, prefKey]
    )
  }

  const stepsMeta = [
    { number: 1, title: 'Destinasi' },
    { number: 2, title: 'Durasi' },
    { number: 3, title: 'Traveler' },
    { number: 4, title: 'Budget' },
    { number: 5, title: 'Style' },
    { number: 6, title: 'Preferensi' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Step Progress Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-[#0F766E] text-xs font-bold flex items-center justify-center">
              {currentStep}
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Langkah {currentStep} dari 6: {stepsMeta[currentStep - 1].title}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {Math.round((currentStep / 6) * 100)}% Selesai
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Step indicator bubbles for desktop */}
        <div className="hidden sm:grid grid-cols-6 gap-2 mt-3 pt-2 border-t border-slate-50 text-center">
          {stepsMeta.map((s) => {
            const isCompleted = s.number < currentStep
            const isCurrent = s.number === currentStep
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => isCompleted && setCurrentStep(s.number)}
                disabled={!isCompleted}
                className={`text-[11px] font-medium transition-colors py-1 truncate cursor-pointer ${
                  isCurrent
                    ? 'text-[#0F766E] font-bold'
                    : isCompleted
                    ? 'text-slate-600 hover:text-[#0F766E]'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                {isCompleted ? '✓ ' : ''}{s.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        {/* ==================================================== */}
        {/* STEP 1: DESTINATION */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Pilih Tujuan Perjalanan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Mau pergi ke mana?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Kasih tahu tujuanmu, biar Tripin yang bantu menyusun perjalanannya.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                placeholder="Cari nama destinasi, kota, atau provinsi..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
              {destinationSearch && (
                <button
                  type="button"
                  onClick={() => setDestinationSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Popular Area Chips */}
            {popularHubs.length > 0 && !destinationSearch && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Area yang tersedia
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularHubs.map((hub) => {
                    const isSelected =
                      selectedDestination?.city?.toLowerCase() === hub.name.toLowerCase() ||
                      selectedDestination?.province?.toLowerCase() === hub.name.toLowerCase()
                    return (
                      <button
                        key={hub.name}
                        type="button"
                        onClick={() => {
                          setSelectedDestination(hub.sampleDest)
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F766E] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{hub.name}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Destinations List / Results */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {destinationSearch ? 'Hasil Pencarian Destinasi' : 'Pilih Destinasi Utama'}
              </span>

              {destinationLoadError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center space-y-2">
                  <p className="text-xs font-bold text-rose-800">Data destinasi sedang tidak tersedia.</p>
                  <p className="text-[11px] text-rose-700">Periksa koneksi data lalu coba muat ulang.</p>
                  <button type="button" onClick={() => setDestinationReloadCount((count) => count + 1)} className="text-xs font-bold text-rose-800 underline">Coba lagi</button>
                </div>
              ) : loadingDestinations ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : filteredDestinations.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Destinasi tidak ditemukan</p>
                  <p className="text-[11px] text-slate-400">
                    Coba kata kunci lain untuk nama destinasi, kota, atau provinsi.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredDestinations.map((dest) => {
                    const isSelected = selectedDestination?.id === dest.id
                    return (
                      <div
                        key={dest.id}
                        onClick={() => setSelectedDestination(dest)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center relative ${
                          isSelected
                            ? 'bg-teal-50/60 border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-teal-200 hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 relative">
                          {dest.image_url ? (
                            <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" />
                          ) : (
                            <div role="img" aria-label={`Gambar ${dest.name} belum tersedia`} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-200">
                              <MapPin className="w-6 h-6 text-teal-700/50" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {dest.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-[#0F766E]" />
                            <span>{dest.city || dest.province}</span>
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                            {dest.ticket_price == null || dest.ticket_price === '' ? 'Harga belum tersedia' : Number(dest.ticket_price) > 0 ? formatRupiah(Number(dest.ticket_price)) : 'Gratis'}
                          </span>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedDestination && (
              <div className="p-3 bg-teal-50/80 border border-teal-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-teal-900 font-medium">
                  Tujuan terpilih: <strong>{selectedDestination.name}</strong> ({selectedDestination.city || selectedDestination.province})
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: TRIP DURATION */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tentukan Tanggal & Durasi</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Kapan kamu berencana berangkat?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Pilih tanggal mulai dan tanggal selesai liburanmu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Tanggal Berangkat
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Tanggal Pulang
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Validation & Duration Display */}
            {!isDateValid ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>Tanggal pulang tidak boleh sebelum tanggal berangkat.</span>
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider block">
                    Kalkulasi Durasi Perjalanan
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                    {duration.days} Hari {duration.nights} Malam
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} –{' '}
                    {new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {duration.days}D
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: TRAVELERS */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Jumlah Rombongan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Berapa orang yang ikut bepergian?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Estimasi akomodasi (kamar) dan porsi konsumsi akan disesuaikan otomatis.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50 rounded-3xl border border-slate-200/70 flex flex-col items-center justify-center space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Jumlah Traveler
              </span>

              {/* Counter Controls [-] N [+] */}
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                  disabled={travelers <= 1}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="text-center min-w-[80px]">
                  <span className="text-4xl font-black text-slate-900">{travelers}</span>
                  <span className="text-xs text-slate-500 block font-medium">Orang</span>
                </div>

                <button
                  type="button"
                  onClick={() => setTravelers((prev) => prev + 1)}
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-lg transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Traveler Description */}
              <div className="text-center text-xs text-slate-500 max-w-sm pt-2">
                {travelers === 1 && 'Solo traveling — lebih leluasa dan fleksibel!'}
                {travelers === 2 && 'Perjalanan berdua (pasangan atau sahabat) — hemat biaya kamar!'}
                {travelers >= 3 && travelers <= 5 && 'Liburan grup kecil / keluarga — sewa kendaraan lokal sangat hemat!'}
                {travelers > 5 && 'Rombongan besar — Tripin akan mengoptimalkan efisiensi akomodasi & transportasi!'}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: BUDGET */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Alokasi Keuangan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Berapa budget perjalananmu?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Tripin akan menyusun itinerary cerdas agar pengeluaran tetap berada dalam batas ini.
              </p>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Total Budget (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="500000"
                  step="100000"
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Terbaca: <strong>{formatRupiah(Number(budget))}</strong>
              </p>
            </div>

            {/* Budget Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilihan Cepat (Preset)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBudget(preset.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      budget === preset.value
                        ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {budget < 1000000 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>Budget di bawah Rp 1 Juta disarankan untuk perjalanan singkat (1-2 hari) dengan travel style Hemat.</span>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: TRAVEL STYLE */}
        {/* ==================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gaya & Karakter Perjalanan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Pilih Travel Style kamu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Gaya perjalanan memengaruhi alokasi hotel, konsumsi, dan moda transportasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(TRAVEL_STYLES).map((styleKey) => {
                const meta = TRAVEL_STYLE_META[styleKey]
                const isSelected = travelStyle === styleKey
                return (
                  <div
                    key={styleKey}
                    onClick={() => setTravelStyle(styleKey)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                      isSelected
                        ? 'bg-teal-50/50 border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${meta.badgeClass}`}>
                          {meta.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#0F766E] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {meta.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {meta.tagline}
                      </p>
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {meta.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                      {styleKey === TRAVEL_STYLES.HEMAT && '🏨 Guesthouse / Hostel • 🍲 Warung Lokal • 🛵 Motor'}
                      {styleKey === TRAVEL_STYLES.BALANCED && '🏨 Hotel Bintang 3 • ☕ Kafe & Resto • 🚗 Mobil / Ojol'}
                      {styleKey === TRAVEL_STYLES.COMFORT && '🏨 Hotel Bintang 4+ • 🍽️ Fine Dining • ✈️ Eksekutif'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 6: PREFERENCES */}
        {/* ==================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preferensi Opsional</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Apa yang paling ingin kamu nikmati?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Pilih satu atau beberapa tema aktivitas wisata favoritmu (opsional).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(PREFERENCE_MAPPINGS).map(([key, config]) => {
                const IconComponent = PREF_ICONS[key] || Sparkles
                const isSelected = preferences.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePreference(key)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border-[#0F766E] ring-2 ring-[#0F766E]/20 text-[#0F766E] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{config.label}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {config.keywords.slice(0, 2).join(', ')}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#0F766E] stroke-[3] shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Summary preview before generate */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Ringkasan Parameter:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
                <span>📍 Tujuan: <strong>{selectedDestination?.city || selectedDestination?.name}</strong></span>
                <span>📅 Durasi: <strong>{duration.days}D{duration.nights}N</strong></span>
                <span>👥 Traveler: <strong>{travelers} org</strong></span>
                <span>💰 Budget: <strong>{formatRupiah(budget)}</strong></span>
                <span>✨ Gaya: <strong className="capitalize">{travelStyle}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={handleBack}
              disabled={isGenerating}
            >
              Sebelumnya
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canProceed || isGenerating}
              className="ml-auto"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed || isGenerating}
              loading={isGenerating}
              className="ml-auto bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] shadow-md px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>✨ Buatkan Trip Saya</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
