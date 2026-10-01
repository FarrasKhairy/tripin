import React from 'react'

/**
 * TripStatusBadge — renders a status chip for trips.
 * Handles both display labels (Aktif, Selesai, Draf) and database values (planning, selesai).
 */
export function TripStatusBadge({ status = 'planning', className = '' }) {
  const normalized = (status || '').toLowerCase().trim()

  // Resolve display label
  const labelMap = {
    planning: 'Direncanakan',
    aktif: 'Aktif',
    direncanakan: 'Direncanakan',
    selesai: 'Selesai',
    draf: 'Draf',
  }

  const styleMap = {
    planning: 'bg-sky-50 text-sky-700 border-sky-200',
    aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    direncanakan: 'bg-sky-50 text-sky-700 border-sky-200',
    selesai: 'bg-slate-100 text-slate-600 border-slate-200',
    draf: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  const displayLabel = labelMap[normalized] || status
  const style = styleMap[normalized] || 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
        ${style} ${className}
      `}
    >
      {displayLabel}
    </span>
  )
}
