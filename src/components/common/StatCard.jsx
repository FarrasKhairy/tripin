import React from 'react'

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = '',
  valueColor = 'text-slate-900',
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-5 border border-slate-100 shadow-xs
        transition-all duration-200 hover:shadow-sm ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h4 className={`text-xl md:text-2xl font-bold tracking-tight mt-1.5 ${valueColor}`}>
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[#D1FAE5]/60 text-[#0F766E] rounded-xl shrink-0 ml-3">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center text-xs text-slate-500">
          {trend}
        </div>
      )}
    </div>
  )
}
