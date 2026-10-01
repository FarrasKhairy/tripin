import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Calendar, Users, Car, ArrowLeft, ArrowRight } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Button } from '../components/common/Button'
import tripService from '../services/tripService'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'
import { formatErrorMessage } from '../utils/errorHelper'

export function CreateTrip() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [personCount, setPersonCount] = useState('1')
  const [transportation, setTransportation] = useState('Mobil')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')

  const validate = () => {
    const errs = {}
    if (!title.trim()) {
      errs.title = 'Nama trip wajib diisi.'
    }
    if (!startDate) {
      errs.startDate = 'Tanggal mulai wajib diisi.'
    }
    if (!endDate) {
      errs.endDate = 'Tanggal selesai wajib diisi.'
    }
    if (startDate && endDate && startDate > endDate) {
      errs.endDate = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
    }
    if (Number(personCount) < 1) {
      errs.personCount = 'Jumlah traveler minimal 1 orang.'
    }
    const cleanBudget = Number(budget.toString().replace(/[^0-9]/g, ''))
    if (budget && cleanBudget < 0) {
      errs.budget = 'Budget tidak boleh bernilai negatif.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleBudgetChange = (val) => {
    const numeric = val.replace(/[^0-9]/g, '')
    setBudget(numeric ? new Intl.NumberFormat('id-ID').format(numeric) : '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setGlobalError('')

    const numericBudget = Number(budget.replace(/[^0-9]/g, '')) || 0

    try {
      const newTrip = await tripService.createTrip(user?.id, {
        title: title.trim(),
        startDate,
        endDate,
        personCount: Number(personCount) || 1,
        transportation,
        initialBudget: numericBudget,
        notes: notes.trim() || null,
      })

      toast.success('Trip berhasil dibuat!')
      navigate(`/trip/${newTrip.id}`)
    } catch (err) {
      console.error('[CreateTrip error]', err)
      setGlobalError(formatErrorMessage(err, 'Gagal membuat trip baru. Silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-4 space-y-6 animate-dashboard-enter">
      {/* Contextual Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/riwayat"
          className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-[#0F766E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">Rencanakan Trip Baru</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Buat Trip Baru ✨
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rencanakan jadwal perjalanan, jumlah traveler, transportasi, dan alokasi budget liburanmu.
        </p>
      </div>

      {globalError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
          {globalError}
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
          {/* Nama Trip */}
          <div>
            <Input
              label="Nama Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Liburan Eksplor Bali 4 Hari"
              error={errors.title}
              required
            />
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jadwal Perjalanan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tanggal Mulai"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={Calendar}
                error={errors.startDate}
                required
              />
              <Input
                label="Tanggal Selesai"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={Calendar}
                error={errors.endDate}
                required
              />
            </div>
          </div>

          {/* Jumlah Traveler & Transportasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Jumlah Traveler"
              icon={Users}
              value={personCount}
              onChange={(e) => setPersonCount(e.target.value)}
              options={[
                { value: '1', label: '1 Orang (Solo)' },
                { value: '2', label: '2 Orang (Duo)' },
                { value: '3', label: '3 Orang' },
                { value: '4', label: '4 Orang' },
                { value: '5', label: '5 Orang' },
                { value: '6', label: '6+ Orang (Rombongan)' },
              ]}
              required
            />

            <Select
              label="Moda Transportasi"
              icon={Car}
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
              options={[
                { value: 'Mobil', label: 'Mobil Pribadi / Rental' },
                { value: 'Pesawat', label: 'Pesawat Terbang' },
                { value: 'Kereta Api', label: 'Kereta Api' },
                { value: 'Motor', label: 'Sepeda Motor' },
                { value: 'Bus', label: 'Bus / Travel' },
                { value: 'Kapal Laut', label: 'Kapal Laut / Feri' },
              ]}
              required
            />
          </div>

          {/* Alokasi Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Estimasi Budget (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={budget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-800 rounded-xl border border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all"
              />
            </div>
            {errors.budget && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.budget}</p>
            )}
          </div>

          {/* Catatan Perjalanan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan / Hal yang Ingin Dilakukan (Opsional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan packing, tempat makan yang wajib dikunjungi, atau rencana cadangan..."
              className="w-full p-3 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/riwayat">
              <Button type="button" variant="outline" size="md">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Simpan & Buka Detail Trip
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
