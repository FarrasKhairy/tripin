import React from 'react'

/**
 * Skeleton base component
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton khusus untuk DestinationCard
 */
export function DestinationCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs flex flex-col gap-3 animate-pulse">
      <div className="w-full h-48 bg-slate-200/70 rounded-2xl" />
      <div className="p-2 space-y-2">
        <div className="h-4 bg-slate-200/70 rounded-md w-3/4" />
        <div className="h-3 bg-slate-200/60 rounded-md w-1/2" />
        <div className="pt-2 flex items-center justify-between">
          <div className="h-4 bg-slate-200/70 rounded-md w-1/3" />
          <div className="h-7 w-7 bg-slate-200/70 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton khusus untuk TripCard
 */
export function TripCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 bg-slate-200/70 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200/70 rounded-md w-1/3" />
          <div className="h-3 bg-slate-200/60 rounded-md w-1/2" />
        </div>
      </div>
      <div className="h-8 w-24 bg-slate-200/70 rounded-xl shrink-0 hidden sm:block" />
    </div>
  )
}

/**
 * Skeleton untuk Ringkasan Statistik
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs animate-pulse space-y-2">
      <div className="h-3 bg-slate-200/60 rounded w-16" />
      <div className="h-6 bg-slate-200/70 rounded w-24" />
    </div>
  )
}
