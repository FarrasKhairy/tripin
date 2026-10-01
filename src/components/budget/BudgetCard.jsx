import React from 'react'
import { Calculator, Users } from 'lucide-react'
import { formatRupiah } from '../../utils/formatters'

export function BudgetCard({
  total = 0,
  perPerson = 0,
  personCount = 1,
  className = '',
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-6 border border-slate-100 shadow-xs
        flex flex-col sm:flex-row items-center justify-between gap-6 ${className}
      `}
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center shrink-0">
          <Calculator className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">Total Estimasi</span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F766E]">
            {formatRupiah(total)}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
        <div>
          <span className="text-xs font-medium text-slate-500">Per orang</span>
          <p className="text-lg sm:text-xl font-bold text-slate-800">
            {formatRupiah(perPerson)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-500">Jumlah Orang</span>
          <p className="text-sm font-semibold text-slate-700 flex items-center justify-end gap-1 mt-0.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{personCount} orang</span>
          </p>
        </div>
      </div>
    </div>
  )
}
