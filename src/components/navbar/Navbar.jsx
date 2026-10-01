import React, { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, Bell, User, Heart, Compass, Briefcase, CalendarPlus } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '../../hooks/useAuth'

export function Navbar({ onOpenAbout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/destinasi?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { name: 'Beranda', to: '/' },
    { name: 'Destinasi', to: '/destinasi' },
    { name: 'Smart Plan', to: '/plan' },
    { name: 'Trip Saya', to: '/riwayat' },
    { name: 'Wishlist', to: '/wishlist' },
  ]


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo />
          </div>

          {/* Search bar (Center, Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-4 items-center relative"
          >
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi, kota, atau provinsi..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs md:text-sm rounded-full border border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to)

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-[#0F766E] font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </NavLink>
              )
            })}
            <button
              type="button"
              onClick={() => onOpenAbout && onOpenAbout()}
              className="text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              Tentang
            </button>
          </nav>

          {/* Right Action: Auth / Profile */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center text-xs font-bold ring-1 ring-slate-200">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                    navigate('/login')
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                  title="Keluar dari akun"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-all active:scale-95"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-200">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute left-3.5 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F766E]"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/trip/buat"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#0F766E] hover:bg-[#D1FAE5]/40 rounded-lg flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              Buat Trip Baru
            </Link>
            <Link
              to="/riwayat"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Riwayat Perjalanan
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Profil Saya
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center text-xs font-bold ring-1 ring-slate-200">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{user.name || user.email}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await logout()
                    navigate('/login')
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#0F766E] rounded-xl"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

