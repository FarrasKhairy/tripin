import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'

import { formatErrorMessage } from '../utils/errorHelper'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi.'
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid.'
    }
    if (!password) {
      newErrors.password = 'Password wajib diisi.'
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal harus 6 karakter.'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setGlobalError('')
    try {
      const result = await register(name.trim(), email.trim(), password)

      // Cek apakah Supabase memerlukan email verification
      const needsEmailConfirm = !result?.session && result?.user
      const message = needsEmailConfirm
        ? 'Registrasi berhasil. Silakan cek email kamu untuk verifikasi akun sebelum login.'
        : 'Registrasi berhasil! Silakan login untuk melanjutkan.'

      navigate('/login', {
        state: {
          registered: true,
          message,
        },
      })
    } catch (err) {
      console.error('[Register error]', err)
      setGlobalError(formatErrorMessage(err, 'Pendaftaran gagal. Periksa kembali informasi akunmu.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col justify-between py-2">
      {/* Top section: heading + error + form */}
      <div className="flex flex-col gap-3">
        {/* Headings */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buat Akun Baru ✨
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar sekarang dan mulai rencanakan liburan impianmu di Indonesia.
          </p>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div>
            <Input
              label="Nama Lengkap"
              type="text"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap kamu"
              error={errors.name}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              error={errors.email}
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
              placeholder="Minimal 8 karakter"
              error={errors.password}
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

          <div>
            <Input
              label="Konfirmasi Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              error={errors.confirmPassword}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading}
            className="mt-2"
          >
            Daftar
          </Button>
        </form>
      </div>

      {/* Bottom section: switch to login */}
      <div className="pt-4 text-center text-xs text-slate-500">
        <span>Sudah punya akun? </span>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-semibold text-[#0F766E] hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Masuk
        </button>
      </div>
    </div>
  )
}
