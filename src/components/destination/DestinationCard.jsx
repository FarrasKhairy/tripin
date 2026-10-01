import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Bookmark } from 'lucide-react'
import { formatRupiah, formatCompactNumber } from '../../utils/formatters'

function DestinationImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={className} />
  }

  return (
    <div
      role="img"
      aria-label={'Foto ' + name + ' belum tersedia'}
      className={'flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-teal-50 text-slate-400 ' + className}
    >
      <MapPin className="w-6 h-6 text-[#0F766E]/60" />
      <span className="text-[11px] font-medium">Foto belum tersedia</span>
    </div>
  )
}

function DestinationImageCredit({ destination, className = '' }) {
  if (!destination.image_source_url) return null
  return (
    <p className={'text-[10px] leading-tight text-slate-400 ' + className}>
      Foto:{' '}
      <a href={destination.image_source_url} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">
        {destination.image_credit || 'Sumber gambar'}
      </a>
      {destination.image_license && (
        <>
          {' · '}
          <a href={destination.image_license_url || destination.image_source_url} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">
            {destination.image_license}
          </a>
        </>
      )}
    </p>
  )
}
function DestinationRating({ rating, reviewCount }) {
  const hasRating = rating !== null && rating !== undefined && rating !== ''
    && Number.isFinite(Number(rating))

  if (!hasRating) {
    return <span className="text-[11px] text-slate-400">Rating belum tersedia</span>
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="font-bold text-slate-800">{Number(rating).toFixed(1)}</span>
      {reviewCount !== null && reviewCount !== undefined && (
        <span className="text-slate-400">({formatCompactNumber(reviewCount)})</span>
      )}
    </span>
  )
}

export function DestinationCard({
  destination,
  layout = 'grid',
  isWishlisted = false,
  onToggleWishlist,
  className = '',
}) {
  const { id, name, city, province } = destination
  const image = destination.image_url || destination.image || null
  const location = destination.location || destination.address
    || [city, province].filter(Boolean).join(', ') || 'Lokasi belum tersedia'
  const category = destination.category
    || destination.categories?.map((item) => typeof item === 'string' ? item : item.name).filter(Boolean).join(' · ')
    || destination._ui?.category_names?.join(' · ')
  const price = destination.ticket_price ?? destination.price ?? null
  const rating = destination.rating ?? destination.average_rating ?? null
  const reviewCount = destination.reviewCount ?? destination.review_count ?? null
  const priceLabel = price == null
    ? 'Harga belum tersedia'
    : Number(price) === 0 ? 'Gratis' : formatRupiah(price)

  const handleWishlistClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onToggleWishlist?.(id)
  }

  if (layout === 'horizontal') {
    return (
      <article className={'group bg-white rounded-2xl border border-slate-100 shadow-xs card-hover-lift overflow-hidden flex flex-col sm:flex-row items-stretch ' + className}>
        <Link
          to={'/destinasi/' + id}
          className="relative w-full sm:w-56 md:w-64 h-48 sm:h-auto overflow-hidden shrink-0 block bg-slate-100"
        >
          <DestinationImage src={image} name={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {category && (
            <span className="sm:hidden absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#0F766E]">
              {category}
            </span>
          )}
        </Link>

        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={'/destinasi/' + id} className="block">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">{name}</h3>
                </Link>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{location}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleWishlistClick}
                className={'p-2 rounded-xl transition-all cursor-pointer ' + (isWishlisted ? 'text-[#0F766E] bg-[#D1FAE5]/60 hover:bg-[#D1FAE5]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}
                title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
                aria-label={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
              >
                <Bookmark className={'w-4 h-4 ' + (isWishlisted ? 'fill-[#0F766E]' : '')} />
              </button>
            </div>
            {category && (
              <span className="hidden sm:inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#D1FAE5]/50 text-[#0F766E]">
                {category}
              </span>
            )}
            <DestinationImageCredit destination={destination} className="mt-2" />
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
            <DestinationRating rating={rating} reviewCount={reviewCount} />
            <p className="text-sm md:text-base font-bold text-[#0F766E]">{priceLabel}</p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={'group bg-white rounded-2xl border border-slate-100 shadow-xs card-hover-lift overflow-hidden flex flex-col justify-between ' + className}>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <Link to={'/destinasi/' + id} className="block w-full h-full">
          <DestinationImage src={image} name={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </Link>
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#0F766E] shadow-xs">
            {category}
          </span>
        )}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={'absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ' + (isWishlisted ? 'bg-white text-[#0F766E] shadow-sm' : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-xs')}
          title={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
          aria-label={isWishlisted ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'}
        >
          <Bookmark className={'w-3.5 h-3.5 ' + (isWishlisted ? 'fill-[#0F766E]' : '')} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={'/destinasi/' + id}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors truncate">{name}</h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
          <DestinationImageCredit destination={destination} className="mt-1.5" />
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-50">
          <DestinationRating rating={rating} reviewCount={reviewCount} />
          <p className="text-xs font-bold text-[#0F766E] text-right">{priceLabel}</p>
        </div>
      </div>
    </article>
  )
}
