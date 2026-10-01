import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, ArrowRight, Trash2, Calculator, CreditCard } from 'lucide-react'
import { formatRupiah } from '../../utils/formatters'
import { TripStatusBadge } from './TripStatusBadge'

// Deterministic color-based gradient images per trip, rotates from set of beautiful Indonesian photo URLs
const TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=500&q=80', // Lombok
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500&q=80', // Bali
  'https://images.unsplash.com/photo-1596402184209-92d9c13fc545?auto=format&fit=crop&w=500&q=80', // Raja Ampat
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=500&q=80', // Borobudur
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=500&q=80', // Komodo
  'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=500&q=80', // Flores
]

function getTripImage(id) {
  if (!id) return TRIP_IMAGES[0]
  // Use last char of UUID for deterministic image selection
  const charCode = id.charCodeAt(id.length - 1) || 0
  return TRIP_IMAGES[charCode % TRIP_IMAGES.length]
}

export function TripCard({ trip, onDelete, className = '' }) {
  const {
    id,
    title,
    dateDisplay,
    startDate,
    endDate,
    personCount,
    estimatedBudget,
    initialBudget,
    status,
  } = trip

  const image = getTripImage(id)

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-xs card-hover-lift
        overflow-hidden flex flex-col sm:flex-row items-stretch group
        ${className}
      `}
    >
      {/* Trip Thumbnail */}
      <div className="sm:w-48 md:w-52 h-36 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        {/* Mobile status badge */}
        <div className="sm:hidden absolute top-3 left-3">
          <TripStatusBadge status={status} />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 truncate">{title}</h3>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {dateDisplay || `${startDate} - ${endDate}`}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {personCount} orang
                </span>
              </div>
            </div>
            {/* Desktop status + delete */}
            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <TripStatusBadge status={status} />
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(trip)
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Hapus trip"
                  aria-label="Hapus trip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50 gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400">Total Estimasi Budget</p>
            <p className="text-sm md:text-base font-bold text-[#0F766E] truncate">
              {formatRupiah(estimatedBudget || initialBudget || 0)}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile delete */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(trip)
                }}
                className="sm:hidden p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                title="Hapus trip"
                aria-label="Hapus trip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <Link
              to={`/trip/${id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
