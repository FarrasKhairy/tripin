import React, { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/navbar/Logo'
import { MobileBottomNav } from '../components/navbar/MobileBottomNav'
import { useAuth } from '../hooks/useAuth'
import {
  Home,
  Compass,
  CalendarPlus,
  Heart,
  Clock,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return
    function handleClickOutside(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const sidebarLinks = [
    { label: 'Beranda', to: '/', icon: Home, exact: true },
    { label: 'Smart Planner', to: '/plan', icon: Sparkles, badge: 'Smart' },
    { label: 'Jelajahi Destinasi', to: '/destinasi', icon: Compass },
    { label: 'Buat Trip Baru', to: '/trip/buat', icon: CalendarPlus },
    { label: 'Riwayat Trip', to: '/riwayat', icon: Clock, altTo: '/dashboard' },
    { label: 'Wishlist', to: '/wishlist', icon: Heart },
    { label: 'Profil Saya', to: '/profile', icon: User },
  ]

  // Get current contextual page breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path.startsWith('/plan')) {
      return { parent: 'Smart Planner', current: path.includes('result') ? 'Rekomendasi Rencana' : 'Rancang Perjalanan' }
    }
    if (path === '/riwayat' || path === '/dashboard') {
      return { parent: 'Dashboard', current: 'Riwayat Trip' }
    }
    if (path === '/trip/buat') {
      return { parent: 'Perjalanan', current: 'Buat Trip Baru' }
    }
    if (path === '/wishlist') {
      return { parent: 'Koleksi', current: 'Wishlist Destinasi' }
    }
    if (path === '/profile') {
      return { parent: 'Akun', current: 'Profil Saya' }
    }
    if (path.includes('/budget')) {
      return { parent: 'Detail Trip', current: 'Kalkulator Budget' }
    }
    if (path.includes('/pengeluaran')) {
      return { parent: 'Detail Trip', current: 'Tracker Pengeluaran' }
    }
    if (path.startsWith('/trip/')) {
      return { parent: 'Dashboard', current: 'Detail Perjalanan' }
    }
    return { parent: 'Tripin', current: 'Workspace' }
  }

  const breadcrumb = getBreadcrumb()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-30">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Logo />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
          </div>
          {sidebarLinks.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || (item.altTo && location.pathname === item.altTo) || (item.to !== '/' && location.pathname.startsWith(item.to))

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`
                  relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#D1FAE5]/70 text-[#0F766E] font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#0F766E] rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0F766E]' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-100/90 text-[#0F766E]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Bottom Profile Widget */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white hover:shadow-xs transition-all flex-1 min-w-0"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center text-xs font-bold ring-2 ring-slate-100">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || user?.email || 'Pengguna'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'Lihat Akun'}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            title="Keluar dari akun"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar / Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Mobile Logo & Desktop Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden flex items-center">
              <Logo />
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">{breadcrumb.parent}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800">{breadcrumb.current}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Explore Link */}
            <Link
              to="/destinasi"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Eksplor Destinasi</span>
            </Link>

            {/* Notification Button with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
                title="Notifikasi"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#14B8A6] rounded-full ring-2 ring-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900">Notifikasi</span>
                    <span className="text-[10px] text-[#0F766E] font-medium">Terbaru</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px]">Selamat datang di Tripin!</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Mulai rencanakan liburan impianmu sekarang.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center text-xs font-bold ring-1 ring-slate-200">
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[120px] truncate">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto animate-dashboard-enter">
          <Outlet />
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  )
}
