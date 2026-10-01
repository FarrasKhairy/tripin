import React from 'react'

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  height = 'h-3.5',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  // Color dynamics: Teal normally, amber when > 75%, rose when >= 100%
  let barColor = 'bg-[#0F766E]'
  if (percentage >= 100) {
    barColor = 'bg-rose-500'
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500'
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="ml-auto font-medium text-slate-600">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
