import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../common/Button'
import { Select } from '../common/Select'

export function DestinationFilter({
  filters,
  categories = [],
  provinces = [],
  onChange,
  onApply,
  onReset,
  className = '',
}) {
  const handleCategoryToggle = (category) => {
    const current = filters.category === category ? 'Semua' : category
    onChange({ category: current })
  }

  return (
    <div className={'bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6 ' + className}>
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Jelajahi Destinasi</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Temukan destinasi yang tersedia di basis data Tripin.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Provinsi</label>
        <Select
          value={filters.province || ''}
          onChange={(event) => onChange({ province: event.target.value === 'Semua Provinsi' ? '' : event.target.value })}
          options={[
            { value: 'Semua Provinsi', label: 'Semua Provinsi' },
            ...provinces.map((province) => ({ value: province, label: province })),
          ]}
          placeholder="Pilih provinsi"
        />
        {!provinces.length && <p className="text-[11px] text-slate-400 mt-1">Daftar provinsi belum tersedia.</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Kategori</label>
        {categories.length ? (
          <div className="space-y-2">
            {categories.map((category) => {
              const name = category.name
              return (
                <label key={category.id || category.slug || name} className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer hover:text-slate-900 select-none py-0.5">
                  <input
                    type="checkbox"
                    checked={filters.category === name}
                    onChange={() => handleCategoryToggle(name)}
                    className="w-4 h-4 rounded text-[#0F766E] border-slate-300 focus:ring-[#0F766E] accent-[#0F766E]"
                  />
                  <span>{name}</span>
                </label>
              )
            })}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">Kategori destinasi belum tersedia.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Budget (per orang)</label>
        <Select
          value={filters.budget || ''}
          onChange={(event) => onChange({ budget: event.target.value === 'Semua budget' ? '' : event.target.value })}
          options={[
            { value: 'Semua budget', label: 'Semua budget' },
            { value: '< Rp100.000', label: '< Rp100.000' },
            { value: 'Rp100.000 - Rp500.000', label: 'Rp100.000 - Rp500.000' },
            { value: 'Rp500.000 - Rp1.000.000', label: 'Rp500.000 - Rp1.000.000' },
            { value: '> Rp1.000.000', label: '> Rp1.000.000' },
          ]}
          placeholder="Semua budget"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <Button onClick={onApply} fullWidth variant="primary" size="md">Terapkan Filter</Button>
        <button type="button" onClick={onReset} className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
