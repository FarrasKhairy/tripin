import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Sparkles, Wallet, Calendar, Zap } from 'lucide-react'
import { CATEGORIES, CategoryCard } from '../components/destination/CategoryCard'
import { DestinationCard } from '../components/destination/DestinationCard'
import { useDestinations } from '../hooks/useDestinations'
import { useWishlist } from '../hooks/useWishlist'

export function Home() {
  const navigate = useNavigate()
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const { destinations, loading, error, refetch } = useDestinations()
  const { wishlist, toggleWishlist } = useWishlist()

  const handleHeroSearch = (e) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      navigate(`/destinasi?search=${encodeURIComponent(searchLocation.trim())}`)
    } else {
      navigate('/destinasi')
    }
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    if (cat === 'Semua') {
      navigate('/destinasi')
    } else {
      navigate(`/destinasi?category=${encodeURIComponent(cat)}`)
    }
  }

  const availableDestinations = destinations.slice(0, 8)
  const isWishlisted = (id) => wishlist.some((item) => item.id === id)

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden shadow-lg min-h-[440px] md:min-h-[500px] flex items-center justify-center">
          {/* Hero Background Image */}
          <img
            src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=85"
            alt="Keindahan Alam Indonesia"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/30" />

          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-2xl px-4 py-12 flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
              Perencanaan perjalanan untuk Indonesia
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Jelajahi Destinasi <br className="hidden sm:inline" />
              Indah di Indonesia
            </h1>

            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-xl">
              Temukan tempat wisata terbaik, rencanakan perjalanan, kelola budget, dan buat pengalaman tak terlupakan bersama Tripin.
            </p>

            {/* Floating Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 w-full max-w-lg bg-white p-2 rounded-2xl md:rounded-full shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-white/20"
            >
              <div className="flex-1 flex items-center pl-4 pr-2 w-full">
                <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Pilih provinsi, kota, atau nama wisata..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-full shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Cari</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Categories Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4 pt-2 gap-4 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="shrink-0">
              <CategoryCard
                category={cat}
                isSelected={selectedCategory === cat.name}
                onClick={handleCategorySelect}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Destinasi dari Supabase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Destinasi yang tersedia
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Katalog destinasi yang dimuat dari database Tripin.
            </p>
          </div>
          <Link
            to="/destinasi"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-[#0F766E] hover:text-[#115E59] transition-colors"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div role="status" aria-label="Memuat destinasi" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-4/3 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center">
            <p className="text-sm text-rose-700">{error}</p>
            <button type="button" onClick={refetch} className="mt-3 text-sm font-semibold text-[#0F766E] hover:underline">
              Coba lagi
            </button>
          </div>
        ) : availableDestinations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="font-semibold text-slate-800">Belum ada destinasi yang dipublikasikan.</p>
            <p className="mt-1 text-sm text-slate-500">Coba jelajahi lagi nanti setelah data tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {availableDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                isWishlisted={isWishlisted(destination.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3.5 Smart Planner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 md:p-10 shadow-lg">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5"></div>
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-semibold mb-4 border border-white/20">
                <Zap className="w-3.5 h-3.5" />
                Smart Trip Recommendation & Budget Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Bingung Mau Liburan Kemana? <br className="hidden sm:inline" />
                <span className="text-teal-200">Biarkan Tripin yang Merencanakan.</span>
              </h2>
              <p className="mt-3 text-sm text-teal-50/90 leading-relaxed max-w-lg">
                Masukkan tujuan, durasi, budget, dan preferensimu. Engine Tripin akan otomatis menyusun itinerary harian, rekomendasi destinasi, dan alokasi budget yang transparan.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {['Rekomendasi Destinasi', 'Alokasi Budget', 'Itinerary Harian', 'Simpan ke Trip'].map((feat) => (
                  <span key={feat} className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/20">
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
              <Link
                to="/plan"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#0F766E] font-extrabold text-sm rounded-2xl shadow-md hover:bg-teal-50 hover:shadow-lg transition-all active:scale-[0.98] border border-white/80"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai Smart Planner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-teal-100/80 text-[11px] font-medium">
                100% gratis · Tidak perlu data kartu kredit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Tripin Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
              Kemudahan Tripin
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Satu Aplikasi untuk Segala Kebutuhan Travel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Perencanaan Rapi</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Tentukan jadwal, durasi hari, akomodasi, dan rute destinasi dalam satu itinerary yang mudah diatur.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Kalkulator Budget Akurat</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Hitung estimasi transportasi, hotel, tiket, dan konsumsi hingga pembagian biaya per orang secara otomatis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Expense Tracker Real-Time</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Catat setiap rupiah pengeluaran selama perjalanan dan pantau sisa budget agar liburan tetap aman dan nyaman.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
