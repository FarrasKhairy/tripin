import React from 'react'
import {
  UtensilsCrossed,
  Ticket,
  Car,
  ShoppingBag,
  Hotel,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react'
import { formatRupiah, formatDate } from '../../utils/formatters'

export function ExpenseItem({ expense, onEdit, onDelete }) {
  const { id, category, amount, notes, expense_date, date, title } = expense
  const displayDate = expense_date || date

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'makan':
      case 'kuliner':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
      case 'tiket wisata':
      case 'tiket':
        return <Ticket className="w-4 h-4 text-sky-600" />
      case 'transportasi':
        return <Car className="w-4 h-4 text-amber-600" />
      case 'penginapan':
        return <Hotel className="w-4 h-4 text-indigo-600" />
      case 'belanja':
      case 'oleh-oleh':
        return <ShoppingBag className="w-4 h-4 text-pink-600" />
      default:
        return <Sparkles className="w-4 h-4 text-[#0F766E]" />
    }
  }

  const getCategoryBg = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'makan':
      case 'kuliner':
        return 'bg-emerald-50'
      case 'tiket wisata':
      case 'tiket':
        return 'bg-sky-50'
      case 'transportasi':
        return 'bg-amber-50'
      case 'penginapan':
        return 'bg-indigo-50'
      case 'belanja':
      case 'oleh-oleh':
        return 'bg-pink-50'
      default:
        return 'bg-[#D1FAE5]/60'
    }
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-100 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getCategoryBg(category)}`}>
          {getCategoryIcon(category)}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            {title || category}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {displayDate ? formatDate(displayDate, 'short') : 'Hari ini'}
            {notes && (
              <span className="text-slate-500 ml-1.5 italic">({notes})</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-xs sm:text-sm font-bold text-slate-800">
          {formatRupiah(amount)}
        </span>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="p-1.5 text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
              title="Edit pengeluaran"
              aria-label="Edit pengeluaran"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus pengeluaran"
              aria-label="Hapus pengeluaran"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
