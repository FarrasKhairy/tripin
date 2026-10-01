/**
 * formatters.js
 * Utility functions untuk format data di Tripin.
 */

/**
 * Format angka ke format mata uang Rupiah.
 * @param {number} amount
 * @param {Object} options
 * @param {boolean} options.compact - tampilkan format singkat (rb/jt/M)
 * @returns {string}
 */
export function formatRupiah(amount, { compact = false } = {}) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0'

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000)
        .toFixed(1)
        .replace(/\.0$/, '')} M`
    }

    if (Math.abs(amount) >= 1_000_000) {
      return `Rp ${(amount / 1_000_000)
        .toFixed(1)
        .replace(/\.0$/, '')} jt`
    }

    if (Math.abs(amount) >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)} rb`
    }
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format angka ke format singkat tanpa simbol mata uang.
 * Contoh: 1500 -> 1.5K, 1500000 -> 1.5M
 * @param {number} number
 * @returns {string}
 */
export function formatCompactNumber(number) {
  if (typeof number !== 'number' || isNaN(number)) return '0'

  const absNumber = Math.abs(number)

  if (absNumber >= 1_000_000_000) {
    return `${(number / 1_000_000_000)
      .toFixed(1)
      .replace(/\.0$/, '')}B`
  }

  if (absNumber >= 1_000_000) {
    return `${(number / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, '')}M`
  }

  if (absNumber >= 1000) {
    return `${(number / 1000)
      .toFixed(1)
      .replace(/\.0$/, '')}K`
  }

  return number.toString()
}

/**
 * Format tanggal ke format lokal Indonesia.
 * @param {string|Date} date
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '-'

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    }).format(new Date(date))
  } catch {
    return String(date)
  }
}

/**
 * Format tanggal ke format pendek (20 Sep 2026).
 */
export function formatDateShort(date) {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Hitung durasi trip dalam hari.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {number}
 */
export function getTripDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start

  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * Format durasi trip ke label teks.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {string}
 */
export function formatTripDuration(startDate, endDate) {
  const days = getTripDuration(startDate, endDate)
  const nights = Math.max(0, days - 1)

  if (days === 0) return '1 Hari'
  if (nights === 0) return `${days} Hari`

  return `${days} Hari ${nights} Malam`
}

/**
 * Mendapatkan label status trip.
 * @param {string} status
 */
export function getTripStatusLabel(status) {
  const labels = {
    planning: 'Direncanakan',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }

  return labels[status] || status
}

/**
 * Mendapatkan warna badge status trip (Tailwind class).
 */
export function getTripStatusColor(status) {
  const colors = {
    planning: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  }

  return colors[status] || 'bg-slate-100 text-slate-600'
}

/**
 * Mendapatkan inisial dari nama lengkap.
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Truncate teks jika terlalu panjang.
 */
export function truncate(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text

  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Warna per kategori pengeluaran/budget.
 */
export const CATEGORY_COLORS = {
  Transportasi: 'bg-blue-100 text-blue-700 border-blue-200',
  Penginapan: 'bg-purple-100 text-purple-700 border-purple-200',
  'Tiket Wisata': 'bg-amber-100 text-amber-700 border-amber-200',
  Makan: 'bg-orange-100 text-orange-700 border-orange-200',
  'Parkir / Tol': 'bg-slate-100 text-slate-700 border-slate-200',
  Hiburan: 'bg-pink-100 text-pink-700 border-pink-200',
  Belanja: 'bg-rose-100 text-rose-700 border-rose-200',
  'Lain-lain': 'bg-gray-100 text-gray-700 border-gray-200',
}

/**
 * Chart bar fill colors.
 */
export const CATEGORY_CHART_COLORS = {
  Transportasi: '#3b82f6',
  Penginapan: '#a855f7',
  'Tiket Wisata': '#f59e0b',
  Makan: '#f97316',
  'Parkir / Tol': '#64748b',
  Hiburan: '#ec4899',
  Belanja: '#f43f5e',
  'Lain-lain': '#6b7280',
}