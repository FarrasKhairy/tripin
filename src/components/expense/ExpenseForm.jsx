import React, { useState, useEffect } from 'react'
import { Select } from '../common/Select'
import { Button } from '../common/Button'

export const EXPENSE_CATEGORIES = [
  'Makan',
  'Tiket Wisata',
  'Transportasi',
  'Penginapan',
  'Hiburan',
  'Belanja',
  'Lain-lain',
]

export function ExpenseForm({
  onSubmit,
  onCancel,
  initialData = null,
  loading = false,
  className = '',
}) {
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '')
      setTitle(initialData.title || '')
      setAmount(initialData.amount ? new Intl.NumberFormat('id-ID').format(initialData.amount) : '')
      setExpenseDate(initialData.expense_date || initialData.date || new Date().toISOString().split('T')[0])
      setNotes(initialData.notes || initialData.description || '')
    } else {
      setCategory('')
      setTitle('')
      setAmount('')
      setExpenseDate(new Date().toISOString().split('T')[0])
      setNotes('')
    }
  }, [initialData])

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setAmount('')
      return
    }
    setAmount(new Intl.NumberFormat('id-ID').format(raw))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!category) {
      setError('Pilih kategori pengeluaran.')
      return
    }
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ''))
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Masukkan nominal pengeluaran yang valid.')
      return
    }

    setError('')
    onSubmit({
      category,
      title: title.trim() || category,
      amount: parsedAmount,
      expense_date: expenseDate,
      notes: notes.trim() || null,
    })

    if (!initialData) {
      setCategory('')
      setTitle('')
      setAmount('')
      setNotes('')
    }
  }

  const isEditing = Boolean(initialData)

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {isEditing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Batal
          </button>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Kategori <span className="text-rose-500">*</span>
        </label>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          placeholder="Pilih kategori"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Nama Pengeluaran / Judul
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Tiket Masuk Candi, Makan Siang..."
          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Nominal (Rp) <span className="text-rose-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-xs font-bold text-slate-400 pointer-events-none">
            Rp
          </span>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal Pengeluaran
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Catatan Tambahan
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan struk/lokasi"
            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white text-slate-800 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Batal
          </Button>
        )}
        <Button
          type="submit"
          fullWidth={!onCancel}
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          {isEditing ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
        </Button>
      </div>
    </form>
  )
}
