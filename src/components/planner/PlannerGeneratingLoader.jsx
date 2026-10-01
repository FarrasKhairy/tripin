import React, { useState, useEffect } from 'react'
import { Sparkles, Compass, MapPin, Calculator, Calendar } from 'lucide-react'

const LOADING_STEPS = [
  { text: 'Menyiapkan perjalananmu...', icon: Compass },
  { text: 'Menghitung alokasi budget...', icon: Calculator },
  { text: 'Mencari destinasi terbaik...', icon: MapPin },
  { text: 'Menyusun itinerary harian...', icon: Calendar },
  { text: 'Menyesuaikan dengan budget...', icon: Calculator },
  { text: 'Finishing your trip...', icon: Sparkles },
]

export function PlannerGeneratingLoader({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1
        }
        clearInterval(stepInterval)
        // Give a moment at final step then complete
        setTimeout(() => {
          if (onComplete) onComplete()
        }, 600)
        return prev
      })
    }, 500)

    return () => clearInterval(stepInterval)
  }, [onComplete])

  const currentStep = LOADING_STEPS[currentStepIndex]
  const CurrentIcon = currentStep.icon
  const progressPercent = Math.round(((currentStepIndex + 1) / LOADING_STEPS.length) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 text-center space-y-6 animate-scaleUp">
        {/* Animated Brand Emblem */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-3xl bg-teal-100 animate-ping opacity-30" />
          {/* Middle rotating border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] animate-pulse flex items-center justify-center shadow-lg">
            <CurrentIcon className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Copy Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tripin Smart Engine</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight transition-all duration-200">
            {currentStep.text}
          </h3>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Menganalisis destinasi, harga tiket, dan rute terbaik untuk perjalananmu.
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Menyusun Rencana</span>
            <span>{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
