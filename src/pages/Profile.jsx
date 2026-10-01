import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Camera,
  LogOut,
  Save,
  CheckCircle2,
  Briefcase,
  Heart,
  Compass,
  Link as LinkIcon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTrips } from '../hooks/useTrip'
import { useWishlist } from '../hooks/useWishlist'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Modal } from '../components/common/Modal'
import { useToast } from '../contexts/ToastContext'
import { formatErrorMessage } from '../utils/errorHelper'

export function Profile() {
  const { user, profile, logout, updateProfile } = useAuth()
  const { trips } = useTrips()
  const { wishlist } = useWishlist(user?.id)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form state - diinisialisasi dari data Supabase yang sebenarnya
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)

  // Sync form state ketika data profile dari Supabase berubah
  useEffect(() => {
    setName(profile?.full_name || user?.name || '')
    setAvatarUrl(profile?.avatar_url || user?.avatar || '')
  }, [profile, user])

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      await updateProfile({ name: name.trim(), avatar: avatarUrl.trim() || null })
      toast.success('Profil berhasil diperbarui!')
    } catch (err) {
      console.error('[Profile.handleSave] error:', err)
      const errText = formatErrorMessage(err, 'Gagal menyimpan profil.')
      setSaveError(errText)
      toast.error(errText)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false)
    await logout()
    navigate('/login')
  }

  // Nama tampilan: ambil dari profile (DB) → user metadata → email prefix → fallback
  const displayName = profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Traveler'
  const displayEmail = user?.email || ''
  const displayAvatar = avatarUrl || profile?.avatar_url || user?.avatar || null

  // Inisial avatar
  const initials = (displayName[0] || 'T').toUpperCase()

  // Hitung tahun bergabung dari user.created_at
  const joinYear = user?.created_at
    ? new Date(user.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
      {/* Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kelola informasi akun dan preferensi perjalanan liburanmu di Tripin
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-[#D1FAE5]/60 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] text-[#0F766E] flex items-center justify-center text-3xl font-bold ring-4 ring-[#D1FAE5]/60 shadow-md">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#0F766E] text-white shadow-md hover:bg-[#115E59] transition-transform active:scale-95 cursor-pointer"
            title="Ganti foto avatar"
            aria-label="Ganti foto avatar"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{displayName}</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayEmail}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              onClick={() => setLogoutModalOpen(true)}
            >
              Keluar Akun
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-[#D1FAE5]/60 px-3 py-1 rounded-full border border-emerald-100">
              Member Traveler Sejak {joinYear}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Real data from Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D1FAE5] text-[#0F766E] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Trip Tersimpan</span>
            <h4 className="text-xl font-bold text-slate-900">{trips.length} Rencana Perjalanan</h4>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Wishlist Tersimpan</span>
            <h4 className="text-xl font-bold text-slate-900">{wishlist.length} Destinasi Impian</h4>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Informasi Akun
        </h3>

        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />
            <Input
              label="Alamat Email (Dari Akun Supabase)"
              type="email"
              value={displayEmail}
              icon={Mail}
              disabled
              className="opacity-70 cursor-not-allowed bg-slate-50"
            />
          </div>

          <div>
            <Input
              label="URL Foto Avatar (Opsional)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              icon={LinkIcon}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              icon={Save}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>

      {/* Modal Logout Confirmation */}
      {logoutModalOpen && (
        <Modal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          title="Keluar dari Akun?"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Apakah kamu yakin ingin keluar dari akun <strong className="text-slate-800">{displayName}</strong>? Kamu harus masuk kembali untuk mengakses dashboard tripmu.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setLogoutModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmLogout}
              >
                Keluar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Quick Avatar Chooser */}
      {avatarModalOpen && (
        <Modal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          title="Ubah Foto Profil Avatar"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Masukkan tautan URL foto langsung atau pilih salah satu avatar default di bawah:
            </p>

            <Input
              label="URL Gambar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Pilihan Cepat:</p>
              <div className="flex items-center gap-3">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                ].map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-transparent hover:ring-[#0F766E] transition-all cursor-pointer"
                  >
                    <img src={url} alt={`Avatar option ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setAvatarModalOpen(false)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setAvatarModalOpen(false)}
              >
                Gunakan Foto Ini
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
