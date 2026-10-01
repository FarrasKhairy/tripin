import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { usePageTransition } from '../contexts/PageTransitionContext'
import { formatErrorMessage } from '../utils/errorHelper'

export function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { startTransition } = usePageTransition()

  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pesan dari redirect registrasi
  const successMessage = location.state?.message || ''

  React.useEffect(() => {
    console.log('[Login Component Mounted] ready for user action')
  }, [])

  const handleSubmit = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault()
      if (typeof e.stopPropagation === 'function') e.stopPropagation()
    }
    if (loading) return
    console.log('[Login] handleSubmit triggered! email:', emailOrUsername, '| password length:', password ? password.length : 0)

    const trimmedEmail = emailOrUsername.trim()
    if (!trimmedEmail || !password) {
      setError('Harap isi email dan kata sandi.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[Login] Calling login()...')
      await login(trimmedEmail, password)
      console.log('[Login] login() success — triggering branded transition')

      let redirectTo = location.state?.from?.pathname || '/riwayat'
      if (redirectTo === '/login' || redirectTo === '/register') {
        redirectTo = '/riwayat'
      }

      await startTransition({
        to: redirectTo,
        message: 'Menyiapkan perjalananmu...',
        submessage: 'Menghubungkan petualanganmu di Nusantara',
        minDuration: 1000,
        exitDuration: 400,
      })
    } catch (err) {
      console.error('[Login] login() error:', err)
      setError(formatErrorMessage(err, 'Email atau password salah. Silakan coba lagi.'))
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col justify-between py-1">
      {/* Top section: heading + messages + form */}
      <div className="flex flex-col gap-3">
        {/* Headings */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Selamat Datang Kembali 👋
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Masuk untuk melanjutkan perjalananmu di Tripin.
          </p>
        </div>

        {/* Success message (after register) */}
        {successMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="nama@email.com"
              disabled={loading}
              required
            />
          </div>

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded text-[#0F766E] border-slate-300 focus:ring-[#0F766E] accent-[#0F766E]"
              />
              <span>Ingat saya</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-button"
            onClick={(e) => {
              console.log('[Login] Button onClick fired directly!')
              handleSubmit(e)
            }}
            disabled={loading}
            className="w-full bg-[#0F766E] hover:bg-[#115E59] active:bg-[#0d524d] text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none relative z-30 pointer-events-auto"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>

      {/* Bottom section: switch to register */}
      <div className="pt-4 text-center text-xs text-slate-500">
        <span>Belum punya akun? </span>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="font-semibold text-[#0F766E] hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Daftar sekarang
        </button>
      </div>
    </div>
  )
}
