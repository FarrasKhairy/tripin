/**
 * Common shared components for Tripin
 * Loading, Error, Empty states
 */
import React from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

/** Spinner besar di tengah layar */
export function LoadingState({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  )
}

/** Spinner kecil inline */
export function InlineLoader({ size = 5 }) {
  return <Loader2 className={`w-${size} h-${size} animate-spin text-teal-500`} />
}

/** Error state dengan tombol retry */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-700">Terjadi Kesalahan</p>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  )
}

/** Empty state dengan ikon dan pesan */
export function EmptyState({ icon: Icon = Inbox, title, subtitle, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {subtitle && (
          <p className="text-slate-400 text-sm mt-1 max-w-sm">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}
