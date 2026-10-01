import React from 'react'
import {
  Palmtree,
  Mountain,
  Trees,
  Landmark,
  UtensilsCrossed,
  Building2,
  Compass,
} from 'lucide-react'

export const CATEGORIES = [
  { id: 'Pantai', name: 'Pantai', icon: Palmtree },
  { id: 'Gunung', name: 'Gunung', icon: Mountain },
  { id: 'Alam', name: 'Alam', icon: Trees },
  { id: 'Budaya', name: 'Budaya', icon: Landmark },
  { id: 'Kuliner', name: 'Kuliner', icon: UtensilsCrossed },
  { id: 'Kota', name: 'Kota', icon: Building2 },
  { id: 'Semua', name: 'Semua', icon: Compass },
]

export function CategoryCard({ category, isSelected = false, onClick }) {
  const Icon = category.icon

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(category.name)}
      className={`
        flex flex-col items-center gap-2 group cursor-pointer transition-transform duration-200 active:scale-95
      `}
    >
      <div
        className={`
          w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-200
          ${
            isSelected
              ? 'bg-[#0F766E] text-white shadow-md scale-105'
              : 'bg-white text-[#0F766E] border border-slate-100 shadow-xs hover:border-[#14B8A6] hover:shadow'
          }
        `}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110" />
      </div>
      <span
        className={`text-xs font-medium tracking-tight text-center ${
          isSelected ? 'text-[#0F766E] font-bold' : 'text-slate-700 group-hover:text-slate-900'
        }`}
      >
        {category.name}
      </span>
    </button>
  )
}
