import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Compass, Clock, Sparkles, User } from 'lucide-react'

export function MobileBottomNav() {
  const location = useLocation()

  const navItems = [
    { label: 'Beranda', to: '/', icon: Home, exact: true },
    { label: 'Destinasi', to: '/destinasi', icon: Compass },
    { label: 'Smart Plan', to: '/plan', icon: Sparkles },
    { label: 'Trip Saya', to: '/riwayat', icon: Clock, altTo: '/dashboard' },
    { label: 'Profil', to: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname === item.to || (item.altTo && location.pathname === item.altTo) || (item.to !== '/' && location.pathname.startsWith(item.to))

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`
                flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 rounded-xl transition-all duration-150 active:scale-95
                ${
                  isActive
                    ? 'text-[#0F766E] font-semibold'
                    : 'text-slate-400 hover:text-slate-600 font-normal'
                }
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0F766E] rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
