import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Bookmark,
  Share2,
  CalendarPlus,
  Clock,
  Car,
  CheckCircle2,
  Sparkles,
  Check,
} from 'lucide-react'
import { useDestinationDetail } from '../hooks/useDestinations'
import { useWishlist } from '../hooks/useWishlist'
import { useTrips } from '../hooks/useTrip'
import { formatRupiah, formatCompactNumber } from '../utils/formatters'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { LoadingState } from '../components/common/LoadingState'

function DestinationHeroImage({ src, name }) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} className="w-full h-full object-cover" />
      ) : (
        <div role="img" aria-label={'Foto ' + name + ' belum tersedia'} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-teal-50 text-slate-400">
          <MapPin className="w-10 h-10 text-[#0F766E]/60" />
          <span className="text-sm font-medium">Foto belum tersedia</span>
        </div>
      )}
      {src && !failed && <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />}
    </>
  )
}

export function DestinationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { destination, loading, error, refetch } = useDestinationDetail(id)
  const { wishlist, toggleWishlist } = useWishlist()
  const { trips } = useTrips()

  const [activeTab, setActiveTab] = useState('Deskripsi')
  const [tripModalOpen, setTripModalOpen] = useState(false)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [addedNotification, setAddedNotification] = useState(false)

  if (loading) {
    return <LoadingState message="Memuat detail destinasi..." className="py-20" />
  }

  if (error || !destination) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">{error ? 'Data destinasi tidak tersedia' : 'Destinasi tidak ditemukan'}</h2>
        <p className="text-sm text-slate-500 mt-2">
          {error || 'Destinasi yang kamu cari tidak ditemukan atau telah dihapus.'}
        </p>
        {error && <Button variant="outline" className="mt-6" onClick={refetch}>Coba lagi</Button>}
        <Link to="/destinasi" className="mt-6 inline-block">
          <Button variant="primary">Kembali ke Jelajah Destinasi</Button>
        </Link>
      </div>
    )
  }

  const isWishlisted = wishlist.some((item) => item.id === destination.id)
  const imageUrl = destination.image_url || destination.image || null
  const locationLabel = destination.address || [destination.city, destination.province].filter(Boolean).join(', ') || 'Lokasi belum tersedia'
  const ticketPrice = destination.ticket_price ?? destination.price ?? null
  const ticketPriceLabel = ticketPrice == null ? 'Harga belum tersedia' : Number(ticketPrice) === 0 ? 'Gratis' : formatRupiah(ticketPrice)
  const rating = destination.rating ?? destination.average_rating ?? null
  const reviewCount = destination.reviewCount ?? destination.review_count ?? null
  const categoryNames = (destination.categories || [])
    .map((item) => typeof item === 'string' ? item : item.name)
    .filter(Boolean)
  const categoryLabel = destination.category || categoryNames.join(' · ')
  const hasCoordinates = destination.latitude != null && destination.longitude != null
    && Number.isFinite(Number(destination.latitude))
    && Number.isFinite(Number(destination.longitude))
  const mapQuery = hasCoordinates
    ? String(destination.latitude) + ',' + String(destination.longitude)
    : destination.name + ' ' + locationLabel

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedNotification(true)
      setTimeout(() => setCopiedNotification(false), 2500)
    }
  }

  const handleAddToTrip = (tripId) => {
    setTripModalOpen(false)
    setAddedNotification(true)
    setTimeout(() => {
      setAddedNotification(false)
      navigate(`/trip/${tripId}`)
    }, 1200)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 space-y-6">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Tautan berhasil disalin ke clipboard!</span>
        </div>
      )}

      {addedNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F766E] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#D1FAE5]" />
          <span>Berhasil ditambahkan ke trip perjalananmu!</span>
        </div>
      )}

      {/* Top Breadcrumb / Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <span className="text-xs text-slate-400">
          Destinasi &gt; {destination.province} &gt; {destination.name}
        </span>
      </div>

      {/* Hero Image Container (Screen 4 Reference) */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden shadow-md bg-slate-100">
        <DestinationHeroImage key={destination.id} src={imageUrl} name={destination.name} />

        {/* Floating Action Icons over Hero */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
            title="Bagikan Destinasi"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist(destination.id)}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-transform active:scale-95 cursor-pointer ${
              isWishlisted
                ? 'bg-white text-[#0F766E]'
                : 'bg-white/80 hover:bg-white text-slate-700'
            }`}
            title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
          >
            <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-[#0F766E]' : ''}`} />
          </button>
        </div>

        {/* Overlay category badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-[#0F766E] shadow-sm">
            {categoryLabel || 'Kategori belum tersedia'}
          </span>
        </div>
      </div>

      {imageUrl && destination.image_source_url && (
        <p className="px-1 text-[11px] text-slate-500">
          Foto:{' '}
          <a href={destination.image_source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {destination.image_credit || 'Sumber gambar'}
          </a>
          {destination.image_license && (
            <>
              {' · '}
              <a href={destination.image_license_url || destination.image_source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {destination.image_license}
              </a>
            </>
          )}
        </p>
      )}

      {/* Header Info Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {destination.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{locationLabel}</span>
            </p>

            <div className="flex items-center gap-3 mt-3">
              {rating !== null && rating !== undefined && rating !== '' && Number.isFinite(Number(rating)) ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold">{Number(rating).toFixed(1)}</span>
                  {reviewCount != null && <span className="text-slate-400">({formatCompactNumber(reviewCount)} ulasan)</span>}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Rating belum tersedia</span>
              )}
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="text-left sm:text-right flex flex-col sm:items-end justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Harga Tiket Masuk</p>
              <h3 className="text-2xl font-black text-[#0F766E]">
                {ticketPriceLabel}
                <span className="text-xs font-normal text-slate-400 ml-1">/ orang</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={isWishlisted ? 'secondary' : 'outline'}
                size="md"
                icon={Bookmark}
                onClick={() => toggleWishlist(destination.id)}
              >
                {isWishlisted ? 'Tersimpan' : 'Simpan'}
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={CalendarPlus}
                onClick={() => setTripModalOpen(true)}
              >
                Tambah ke Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 mt-6 border-b border-slate-100 overflow-x-auto custom-scrollbar pb-px">
          {['Deskripsi', '+ Info', 'Lokasi', 'Ulasan'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                pb-3 px-2 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer
                ${
                  activeTab === tab
                    ? 'text-[#0F766E] border-b-2 border-[#0F766E]'
                    : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="pt-6">
          {activeTab === 'Deskripsi' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Tentang Destinasi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {destination.description || 'Deskripsi belum tersedia.'}
                </p>
              </div>

              {/* Quick Info Grid (Screen 4 Reference) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-[#0F766E] text-xs font-semibold mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Jam Buka</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{destination.opening_hours || destination.openingHours || 'Jam buka belum tersedia'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-[#0F766E] text-xs font-semibold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Durasi Kunjungan</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{destination.visitDuration || 'Belum tersedia'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-[#0F766E] text-xs font-semibold mb-1">
                    <Car className="w-4 h-4" />
                    <span>Estimasi Transportasi</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{destination.transportEstimate || 'Belum tersedia'}</p>
                </div>
              </div>

              {/* Facilities */}
              {destination.facilities && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Fasilitas Tersedia
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {destination.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-xs font-medium text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === '+ Info' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Tips Perjalanan & Informasi Penting
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Periksa jam operasional dan ketersediaan tiket sebelum berkunjung.</li>
                <li>Pastikan informasi akses dan fasilitas langsung kepada pengelola destinasi.</li>
                <li>Ikuti aturan setempat dan jaga kebersihan area wisata.</li>
              </ul>
            </div>
          )}

          {activeTab === 'Lokasi' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Peta & Rute Akses
              </h3>
              <div className="w-full h-64 rounded-2xl bg-slate-100 flex flex-col items-center justify-center p-6 text-center border border-slate-200">
                <MapPin className="w-8 h-8 text-[#0F766E] mb-2" />
                <p className="text-xs font-bold text-slate-800">{locationLabel}</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  {hasCoordinates ? 'Koordinat: ' + destination.latitude + ', ' + destination.longitude : 'Koordinat belum tersedia untuk destinasi ini.'}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4"
                >
                  <Button variant="outline" size="sm">Buka di Google Maps</Button>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'Ulasan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Ulasan Wisatawan ({destination.reviews?.length || 0})
                </h3>
              </div>

              {destination.reviews && destination.reviews.length > 0 ? (
                <div className="space-y-3">
                  {destination.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{rev.author}</h4>
                            <p className="text-[10px] text-slate-400">{rev.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada ulasan untuk destinasi ini.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah ke Trip */}
      <Modal
        isOpen={tripModalOpen}
        onClose={() => setTripModalOpen(false)}
        title="Tambahkan ke Trip"
        subtitle={`Pilih perjalanan untuk menambahkan ${destination.name}`}
      >
        <div className="space-y-3">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => handleAddToTrip(trip.id)}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-[#D1FAE5]/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E]">
                  {trip.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{trip.dateDisplay}</p>
              </div>
              <span className="text-xs font-semibold text-[#0F766E] group-hover:translate-x-1 transition-transform">
                Pilih &rarr;
              </span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link to="/trip/buat" onClick={() => setTripModalOpen(false)}>
              <Button variant="secondary" size="sm" fullWidth>
                + Buat Trip Baru
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}
