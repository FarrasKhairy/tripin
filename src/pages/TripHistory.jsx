import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  Clock,
  Sparkles,
  Compass,
  Heart,
  CreditCard,
  MapPin,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTrips } from '../hooks/useTrip'
import { useWishlist } from '../hooks/useWishlist'
import { useDestinations } from '../hooks/useDestinations'
import { TripCard } from '../components/trip/TripCard'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { StatCardSkeleton, TripCardSkeleton } from '../components/common/Skeleton'
import { Modal } from '../components/common/Modal'
import { formatRupiah } from '../utils/formatters'
import { useToast } from '../contexts/ToastContext'
import tripService from '../services/tripService'

function DestinationThumbnail({ destination, className = '' }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = destination.image_url || destination.imageUrl || destination.image || null
  if (imageUrl && !failed) {
    return <img src={imageUrl} alt={destination.name || 'Destinasi'} className={className} loading="lazy" onError={() => setFailed(true)} />
  }
  return (
    <div role="img" aria-label={'Foto ' + (destination.name || 'destinasi') + ' belum tersedia'} className={'flex items-center justify-center bg-slate-100 text-[#0F766E] ' + className}>
      <Compass className="w-5 h-5 opacity-60" />
    </div>
  )
}

export function TripHistory() {
  const { user } = useAuth()
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useTrips()
  const { wishlist, loading: wishlistLoading } = useWishlist()
  const { destinations, loading: destsLoading, error: destsError } = useDestinations({ sortBy: 'Nama A-Z' })
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const travelerName = user?.name || user?.email?.split('@')[0] || 'Traveler'

  // Summary counts calculated from real user trips
  const totalTrips = trips.length
  const activeTrips = trips.filter(
    (t) => t.status?.toLowerCase() === 'aktif' || t.status?.toLowerCase() === 'direncanakan' || t.status?.toLowerCase() === 'planning'
  )
  const completedTrips = trips.filter(
    (t) => t.status?.toLowerCase() === 'selesai'
  )

  const totalBudgetAllocated = useMemo(() => {
    return trips.reduce((sum, t) => sum + (Number(t.initialBudget || t.total_budget) || 0), 0)
  }, [trips])

  // Featured upcoming trip (the earliest planned or active trip)
  const upcomingTrip = activeTrips[0] || null

  const filteredTrips = trips.filter((t) => {
    if (filterStatus === 'Semua') return true
    if (filterStatus === 'Aktif') {
      const s = t.status?.toLowerCase()
      return s === 'aktif' || s === 'direncanakan' || s === 'planning'
    }
    return t.status?.toLowerCase() === filterStatus.toLowerCase()
  })

  const handleQuickExpense = () => {
    if (upcomingTrip) {
      navigate(`/trip/${upcomingTrip.id}/pengeluaran`)
    } else if (trips.length > 0) {
      navigate(`/trip/${trips[0].id}/pengeluaran`)
    } else {
      toast.info('Buat trip terlebih dahulu sebelum mencatat pengeluaran.')
      navigate('/trip/buat')
    }
  }

  const handleDeleteTrip = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await tripService.deleteTrip(deleteTarget.id)
      toast.success(`Trip "${deleteTarget.title}" berhasil dihapus.`)
      setDeleteTarget(null)
      refetchTrips()
    } catch (err) {
      console.error('[TripHistory] deleteTrip error:', err)
      toast.error('Gagal menghapus trip. Silakan coba lagi.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
      {/* 1. Greeting & Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0F766E] text-xs font-semibold mb-2.5 border border-emerald-100/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dashboard Perjalanan Tripin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Halo, {travelerName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Rencanakan petualanganmu, atur estimasi budget, dan jelajahi beragam destinasi di Indonesia.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <Link to="/plan">
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] shadow-sm"
            >
              ✨ Plan My Trip
            </Button>
          </Link>
          <Link to="/trip/buat">
            <Button variant="outline" size="md" icon={CalendarPlus}>
              Buat Manual
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/plan"
          className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50/60 rounded-2xl border border-teal-200/80 hover:border-[#0F766E] hover:shadow-xs transition-all flex items-center gap-3 group relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 block truncate">Plan My Trip</span>
            </div>
            <span className="text-[11px] text-[#0F766E] font-medium block truncate">Smart Engine</span>
          </div>
        </Link>

        <Link
          to="/trip/buat"
          className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate">Rencanakan Trip</span>
            <span className="text-[11px] text-slate-400 block truncate">Buat jadwal baru</span>
          </div>
        </Link>

        <Link
          to="/destinasi"
          className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate">Cari Destinasi</span>
            <span className="text-[11px] text-slate-400 block truncate">Wisata Nusantara</span>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xs transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate">Wishlist Saya</span>
            <span className="text-[11px] text-slate-400 block truncate">{wishlist.length} Disimpan</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleQuickExpense}
          className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-xs transition-all flex items-center gap-3 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate">Catat Pengeluaran</span>
            <span className="text-[11px] text-slate-400 block truncate">Pantau pengeluaran</span>
          </div>
        </button>
      </div>

      {/* 3. Summary Stats Row */}
      {tripsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trip</p>
              <span className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalTrips}</p>
            <p className="text-[10px] text-slate-400">Perjalanan tercatat</p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-semibold text-[#0F766E] uppercase tracking-wider">Trip Aktif</p>
              <span className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F766E]">{activeTrips.length}</p>
            <p className="text-[10px] text-teal-600">Perjalanan berjalan</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip Selesai</p>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-700">{completedTrips.length}</p>
            <p className="text-[10px] text-slate-400">Perjalanan selesai</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Budget</p>
              <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              </span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-800 mt-1 truncate">
              {formatRupiah(totalBudgetAllocated)}
            </p>
            <p className="text-[10px] text-slate-400">Total alokasi anggaran</p>
          </div>
        </div>
      )}

      {/* 4. Upcoming Trip Spotlight (if any active trip exists) */}
      {upcomingTrip && (
        <div className="bg-gradient-to-br from-teal-900 via-[#0F766E] to-[#115E59] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-teal-100">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>Rencana Perjalanan Mendatang</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {upcomingTrip.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100/90 pt-1">
                <span>{upcomingTrip.dateDisplay || `${upcomingTrip.startDate || ''} - ${upcomingTrip.endDate || ''}`}</span>
                <span>•</span>
                <span>{upcomingTrip.personCount || 1} Traveler</span>
                <span>•</span>
                <span>{upcomingTrip.transportation || 'Transport'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={`/trip/${upcomingTrip.id}`}>
                <Button variant="secondary" size="sm" className="bg-white text-[#0F766E] hover:bg-slate-50">
                  Lihat Detail Trip
                </Button>
              </Link>
              <Link to={`/trip/${upcomingTrip.id}/pengeluaran`}>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  Catat Biaya
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Content: Trip List + Sidebar Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trip List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              {['Semua', 'Aktif', 'Selesai'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer
                    ${
                      filterStatus === status
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }
                  `}
                >
                  {status}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              {filteredTrips.length} Trip
            </span>
          </div>

          {/* Trips Content */}
          {tripsLoading ? (
            <div className="space-y-3">
              <TripCardSkeleton />
              <TripCardSkeleton />
              <TripCardSkeleton />
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
              <EmptyState
                icon={Sparkles}
                title={
                  filterStatus === 'Semua'
                    ? 'Belum punya perjalanan?'
                    : `Tidak ada trip dengan status "${filterStatus}"`
                }
                description={
                  filterStatus === 'Semua'
                    ? 'Biarkan Tripin membantu merencanakannya. Atur destinasi, tanggal, budget, dan preferensi untuk rekomendasi instan.'
                    : 'Ubah filter atau buat trip baru untuk mulai mengatur itinerary perjalanan.'
                }
                actionLabel={filterStatus === 'Semua' ? '✨ Plan My Trip' : 'Buat Trip Baru'}
                onAction={() => navigate(filterStatus === 'Semua' ? '/plan' : '/trip/buat')}
              />
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Wishlist & Recommendation Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Wishlist Preview Widget */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Wishlist Saya
                </h3>
              </div>
              <Link
                to="/wishlist"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            {wishlistLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-5 text-slate-400 space-y-2">
                <p className="text-xs font-medium text-slate-600">Wishlist masih kosong</p>
                <p className="text-[11px] text-slate-400">
                  Simpan destinasi yang ingin kamu kunjungi agar mudah direncanakan.
                </p>
                <Link
                  to="/destinasi"
                  className="inline-block mt-1 text-xs font-semibold text-[#0F766E] hover:underline"
                >
                  + Jelajahi Destinasi
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wishlist.slice(0, 3).map((item) => {
                  const dest = item.destination || {}
                  return (
                    <Link
                      key={item.id}
                      to={`/destinasi/${dest.id || item.destination_id}`}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors group"
                    >
                      <DestinationThumbnail
                        destination={dest}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0F766E] transition-colors">
                          {dest.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{dest.city || dest.province || 'Indonesia'}</span>
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Destination Recommendation Widget */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Rekomendasi Wisata
                </h3>
              </div>
              <Link
                to="/destinasi"
                className="text-xs font-semibold text-[#0F766E] hover:underline"
              >
                Eksplor &rarr;
              </Link>
            </div>

            {destsLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                <div className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
              </div>
            ) : destsError ? (
              <p role="alert" className="py-3 text-xs text-rose-600">Data destinasi sedang tidak tersedia.</p>
            ) : destinations.length === 0 ? (
              <p className="py-3 text-xs text-slate-400">Belum ada destinasi yang dipublikasikan.</p>
            ) : (
              <div className="space-y-2.5">
                {destinations.slice(0, 3).map((dest) => (
                  <Link
                    key={dest.id}
                    to={`/destinasi/${dest.id}`}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <DestinationThumbnail
                      destination={dest}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0F766E] transition-colors">
                        {dest.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{dest.city || dest.province}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Trip Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleting && setDeleteTarget(null)}
          title="Hapus Trip?"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Apakah kamu yakin ingin menghapus trip{' '}
              <strong className="text-slate-800 font-semibold">
                &ldquo;{deleteTarget.title}&rdquo;
              </strong>? Semua data pengeluaran dan detail trip akan terhapus secara permanen dan tidak dapat dikembalikan.
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
                onClick={handleDeleteTrip}
                loading={deleting}
                icon={Trash2}
              >
                Hapus Trip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
