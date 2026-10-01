import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Compass, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useWishlist } from '../hooks/useWishlist'
import { DestinationCard } from '../components/destination/DestinationCard'
import { EmptyState } from '../components/common/EmptyState'
import { DestinationCardSkeleton } from '../components/common/Skeleton'
import { useToast } from '../contexts/ToastContext'

export function Wishlist() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { wishlist, loading, toggleWishlist } = useWishlist(user?.id)
  const { toast } = useToast()

  const handleToggle = async (destinationId, destination) => {
    try {
      const res = await toggleWishlist(destinationId, destination)
      if (res?.added === false) {
        toast.info('Destinasi dihapus dari wishlist.')
      } else {
        toast.success('Destinasi ditambahkan ke wishlist!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memperbarui wishlist.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Koleksi Favorit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Wishlist Destinasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar tempat wisata impian yang siap kamu kunjungi di petualangan berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#0F766E] border border-emerald-100 shadow-xs">
            {wishlist.length} Destinasi Disimpan
          </span>
        </div>
      </div>

      {/* Content Grid with Skeleton or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <DestinationCardSkeleton key={n} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
          <EmptyState
            icon={Heart}
            title="Wishlist kamu masih kosong"
            description="Simpan destinasi yang ingin kamu kunjungi agar mudah ditemukan nanti. Tekan tombol bookmark pada destinasi untuk menyimpannya."
            actionLabel="Jelajahi Destinasi"
            onAction={() => navigate('/destinasi')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlist.map((item) => (
            <div key={item.id} className="transition-all duration-300 card-hover-lift">
              <DestinationCard
                destination={item.destination}
                layout="grid"
                isWishlisted={true}
                onToggleWishlist={() => handleToggle(item.destination_id, item.destination)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
