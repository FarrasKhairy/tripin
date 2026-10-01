import React from 'react'
import { Compass } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon = Compass,
  title = 'Belum ada data',
  description = 'Data belum tersedia saat ini. Silakan coba eksplorasi destinasi atau buat trip baru.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 md:p-12
        bg-white rounded-2xl border border-slate-100 shadow-xs ${className}
      `}
    >
      <div className="w-16 h-16 rounded-full bg-[#D1FAE5]/60 text-[#0F766E] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-1.5">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
