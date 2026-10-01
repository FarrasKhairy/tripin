import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react'
import { DestinationFilter } from '../components/destination/DestinationFilter'
import { DestinationCard } from '../components/destination/DestinationCard'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingState } from '../components/common/LoadingState'
import { useDestinations } from '../hooks/useDestinations'
import { useWishlist } from '../hooks/useWishlist'

export function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'Semua'
  const initialSearch = searchParams.get('search') || ''
  const initialProvince = searchParams.get('province') || ''

  const { destinations, categories, provinces, loading, error, metadataError, filters, updateFilters, resetFilters, refetch } = useDestinations({
    category: initialCategory,
    search: initialSearch,
    province: initialProvince,
    budget: '',
    sortBy: 'Nama A-Z',
  })

  const { wishlist, toggleWishlist } = useWishlist()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(initialSearch)

  // Sync URL params
  useEffect(() => {
    const q = searchParams.get('search')
    const c = searchParams.get('category')
    const p = searchParams.get('province')
    if (q !== null && q !== filters.search) {
      updateFilters({ search: q })
      setSearchInput(q)
    }
    if (c !== null && c !== filters.category) {
      updateFilters({ category: c })
    }
    if (p !== null && p !== filters.province) {
      updateFilters({ province: p })
    }
  }, [searchParams])

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, updateFilters])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateFilters({ search: searchInput })
  }

  const isWishlisted = (id) => wishlist.some((item) => item.id === id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-dashboard-enter">
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex items-center justify-between mb-4 gap-3">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0F766E]" />
          <span>Filter Destinasi</span>
        </button>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="bg-transparent outline-none cursor-pointer"
          >
            <option value="Nama A-Z">Nama A–Z</option>

            <option value="Harga terendah">Harga terendah</option>
            <option value="Harga tertinggi">Harga tertinggi</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-8">
        {/* Desktop Sidebar Filter (Screen 3 Reference) */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-20">
          <DestinationFilter
            filters={filters} categories={categories} provinces={provinces}
            onChange={updateFilters}
            onApply={() => {}}
            onReset={resetFilters}
          />
        </aside>

        {/* Mobile Filter Modal / Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Filter Destinasi</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <DestinationFilter
                filters={filters} categories={categories} provinces={provinces}
                onChange={updateFilters}
                onApply={() => setMobileFilterOpen(false)}
                onReset={() => {
                  resetFilters()
                  setMobileFilterOpen(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Search bar & Sorting Header */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari destinasi, kota, atau provinsi..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F766E] focus:bg-white text-slate-800 transition-all"
              />
            </form>

            {/* Results Count & Desktop Sort */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-xs">
              <span className="font-semibold text-slate-600">
                <strong className="text-slate-900">{destinations.length}</strong> Destinasi ditemukan
              </span>

              <div className="hidden sm:flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 bg-white">
                <span className="text-slate-400 text-[11px]">Urutkan:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="bg-transparent font-medium outline-none cursor-pointer text-xs text-slate-800"
                >
                  <option value="Nama A-Z">Nama A–Z</option>

                  <option value="Harga terendah">Harga terendah</option>
                  <option value="Harga tertinggi">Harga tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {metadataError && (
            <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{metadataError}</p>
          )}

          {/* Destination List (Horizontal Cards) with Skeleton Loading */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 animate-pulse">
                  <div className="w-full md:w-60 h-44 bg-slate-200/70 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-5 bg-slate-200/70 rounded w-1/3" />
                    <div className="h-3 bg-slate-200/60 rounded w-1/4" />
                    <div className="h-3 bg-slate-200/50 rounded w-full" />
                    <div className="h-3 bg-slate-200/50 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Data destinasi tidak tersedia"
              description={error}
              actionLabel="Coba lagi"
              onAction={refetch}
            />
          ) : destinations.length === 0 ? (
            <EmptyState
              title="Destinasi tidak ditemukan"
              description="Tidak ada destinasi yang cocok dengan filter atau kata kunci pencarianmu. Coba ganti filter atau reset pencarian."
              actionLabel="Reset Filter"
              onAction={resetFilters}
            />
          ) : (
            <div className="space-y-4">
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  layout="horizontal"
                  isWishlisted={isWishlisted(dest.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
