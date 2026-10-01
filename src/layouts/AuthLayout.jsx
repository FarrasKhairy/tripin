import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/navbar/Logo'
import { MapPin } from 'lucide-react'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { useAuth } from '../contexts/AuthContext'
import { usePageTransition } from '../contexts/PageTransitionContext'

export function AuthLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()
  const { isTransitioning } = usePageTransition()
  const isRegister = location.pathname === '/register'
  const [mounted, setMounted] = useState(false)

  // Enable 3D flip animation only after initial mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(timer)
  }, [])

  // ✅ Redirect jika user sudah authenticated saat membuka URL /login atau /register
  // Jika sedang dalam transisi post-login (isTransitioning), biarkan transition loader yang mengatur perpindahan
  useEffect(() => {
    if (isTransitioning) return

    console.log('[AuthLayout] isAuthenticated:', isAuthenticated, '| loading:', loading)
    if (!loading && isAuthenticated) {
      let redirectTo = location.state?.from?.pathname || '/riwayat'
      if (redirectTo === '/login' || redirectTo === '/register') {
        redirectTo = '/riwayat'
      }
      console.log('[AuthLayout] Redirecting to:', redirectTo)
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, loading, isTransitioning, navigate, location.state])

  // Tampilkan blank saat loading awal (hindari flash login jika sudah login)
  if (loading) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Side: Brand Visual & Indonesian Scenery */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-slate-900 text-white rounded-l-3xl overflow-hidden">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85"
            alt="Pura Ulun Danu Beratan Bali"
            className="absolute inset-0 w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-900/60" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#14B8A6] flex items-center justify-center text-white shadow-md">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Tripin</h1>
              </div>
            </div>
            <p className="text-sm text-slate-200 mt-4 leading-relaxed max-w-xs">
              Rencanakan Perjalananmu, Jelajahi Keindahan Indonesia
            </p>
          </div>

          {/* Bottom Brand Quote */}
          <div className="relative z-10 pt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs text-white mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Jelajah 17.000+ Pulau Nusantara</span>
            </div>
            <p className="text-2xl font-serif italic text-emerald-100 font-light">
              &ldquo;Indonesia Punya Segalanya&rdquo;
            </p>
          </div>
        </div>

        {/* Right Side: 3D Flip Card Container */}
        <div className="p-6 sm:p-10 flex flex-col justify-center relative">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-4 flex justify-center">
            <Logo />
          </div>

          {/* Top Pill Tabs for Masuk / Daftar */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-xs mx-auto w-full relative">
            <Link
              to="/login"
              className={`flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-all duration-200 ${
                !isRegister
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className={`flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-all duration-200 ${
                isRegister
                  ? 'bg-white text-[#0F766E] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </Link>
          </div>

          {/* 3D Flip Card Scene */}
          <div className="auth-scene w-full max-w-sm mx-auto">
            <div className={`auth-card ${isRegister ? 'is-flipped' : ''} ${!mounted ? 'no-transition' : ''}`}>
              {/* Front Face: Login */}
              <div
                className="auth-face auth-face-front"
                style={{
                  pointerEvents: isRegister ? 'none' : 'auto',
                  visibility: isRegister ? 'hidden' : 'visible',
                  zIndex: isRegister ? 1 : 20,
                }}
                aria-hidden={isRegister}
              >
                <Login />
              </div>

              {/* Back Face: Register */}
              <div
                className="auth-face auth-face-back"
                style={{
                  pointerEvents: !isRegister ? 'none' : 'auto',
                  visibility: !isRegister ? 'hidden' : 'visible',
                  zIndex: !isRegister ? 1 : 20,
                }}
                aria-hidden={!isRegister}
              >
                <Register />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
