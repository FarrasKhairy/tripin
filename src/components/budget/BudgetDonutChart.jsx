import React from 'react'

export function BudgetDonutChart({
  data = [
    { label: 'Makan', percentage: 35, color: '#0F766E' },
    { label: 'Tiket', percentage: 18, color: '#0EA5E9' },
    { label: 'Transportasi', percentage: 36, color: '#F59E0B' },
    { label: 'Hiburan', percentage: 11, color: '#8B5CF6' },
    { label: 'Belanja', percentage: 0, color: '#EC4899' },
  ],
  size = 180,
  strokeWidth = 24,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let accumulatedPercent = 0

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-6 ${className}`}>
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            if (item.percentage <= 0) return null
            const strokeDashoffset = circumference - (item.percentage / 100) * circumference
            const rotation = (accumulatedPercent / 100) * 360
            accumulatedPercent += item.percentage

            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'stroke-dashoffset 0.6s ease',
                }}
              />
            )
          })}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-400">Total Kategori</span>
          <span className="text-base font-bold text-slate-800">{data.length}</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 w-full space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 font-medium">{item.label}</span>
            </div>
            <span className="font-semibold text-slate-800">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
