import React from 'react'
import { Sparkles } from 'lucide-react'

/**
 * PageTransitionLoader.jsx
 *
 * Full-screen branded transition loading experience untuk Tripin.
 * Mengikuti 100% design system dan color palette Tripin:
 * - Surface background: #F8FAFC
 * - Primary color: #0F766E (Deep Teal)
 * - Secondary color: #14B8A6 (Teal)
 * - Accent color: #D1FAE5 (Soft Mint)
 * - Text color: #0F172A (Slate 900) & #64748B (Slate 500)
 * - Card: Pure white with soft elevation (border-slate-100, shadow-xl)
 */
export function PageTransitionLoader({
  isVisible = true,
  isExiting = false,
  message = 'Menyiapkan perjalananmu...',
  submessage = 'Menghubungkan petualanganmu di Nusantara',
  className = '',
}) {
  if (!isVisible && !isExiting) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#F8FAFC] text-slate-900 transition-opacity duration-400 ease-out select-none p-4 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      } ${className}`}
    >
      {/* 1. Ambient Background Glows matching Tripin Theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle 540px at 50% 45%, rgba(209, 250, 229, 0.7) 0%, rgba(240, 253, 250, 0.4) 45%, #F8FAFC 85%)',
        }}
      />
      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(rgba(15, 118, 110, 0.12) 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Main Center Elevation Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl shadow-slate-200/60 rounded-3xl p-8 sm:p-9 text-center animate-tripin-logo">
        {/* Pulsing Brand Halo Behind Logo */}
        <div className="relative flex items-center justify-center mb-3">
          <div
            className="absolute w-20 h-20 rounded-full bg-[#D1FAE5] blur-xl animate-tripin-glow"
            aria-hidden="true"
          />
          {/* Tripin Pin/Compass Badge */}
          <div className="relative w-14 h-14 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white shadow-lg shadow-teal-900/15 ring-4 ring-[#D1FAE5]">
            <svg
              className="w-7 h-7 fill-current drop-shadow-xs"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
          </div>
        </div>

        {/* TRIPIN Brand Typography */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Tripin
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Rencanakan Perjalananmu, Jelajahi Indonesia
        </p>

        {/* 3. Animated Travel Route Indicator */}
        <div className="w-60 mt-6 mb-5 flex flex-col items-center gap-3">
          {/* Route path with travel gliding marker */}
          <div className="relative w-full h-8 flex items-center justify-between px-2">
            {/* Origin Node */}
            <div
              className="w-3 h-3 rounded-full bg-[#0F766E] ring-4 ring-[#D1FAE5] shadow-xs shadow-teal-500/30 z-10"
              title="Keberangkatan"
            />

            {/* Connecting Track (Dashed line) */}
            <div className="absolute left-5 right-5 h-[2px] top-1/2 -translate-y-1/2 overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="1"
                  x2="100%"
                  y2="1"
                  stroke="#14B8A6"
                  strokeOpacity="0.4"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-route-dash"
                />
              </svg>
            </div>

            {/* Gliding Travel Marker */}
            <div className="absolute top-1/2 left-0 right-0 h-0 pointer-events-none">
              <div className="relative w-full">
                <div className="absolute top-0 animate-plane-glide -translate-y-1/2">
                  <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-md shadow-teal-900/25 ring-2 ring-white">
                    {/* Airplane Icon */}
                    <svg
                      className="w-3.5 h-3.5 fill-current transform rotate-45"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Node */}
            <div
              className="w-3 h-3 rounded-full bg-[#14B8A6] ring-4 ring-[#D1FAE5] shadow-xs shadow-emerald-500/30 z-10"
              title="Destinasi Tujuan"
            />
          </div>

          {/* Glowing Slim Progress Bar */}
          <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#0F766E] rounded-full animate-progress-wave shadow-sm shadow-teal-500/30" />
          </div>
        </div>

        {/* 4. Dynamic Loading Message */}
        <div className="animate-tripin-text flex flex-col items-center">
          <p className="text-sm font-semibold text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            <span>{message}</span>
            <span className="inline-flex tracking-widest text-[#0F766E] animate-pulse font-bold">
              ...
            </span>
          </p>

          {/* Submessage Badge styled with Tripin pill component */}
          {submessage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0F766E] text-xs font-medium border border-emerald-100 shadow-xs mt-2.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0F766E]" />
              <span className="truncate max-w-[240px]">{submessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
