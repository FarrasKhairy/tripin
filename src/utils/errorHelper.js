/**
 * errorHelper.js
 *
 * Utilitas format pesan error agar ramah pengguna (human-friendly)
 * dan tidak menampilkan raw error Supabase/PostgreSQL kepada pengguna.
 */

export function formatErrorMessage(err, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  if (!err) return fallback

  const raw = typeof err === 'string' ? err : err.message || err.error_description || ''
  const lower = raw.toLowerCase()

  // 1. Auth errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Email atau kata sandi salah. Silakan coba lagi.'
  }

  if (lower.includes('email not confirmed')) {
    return 'Email kamu belum diverifikasi. Silakan periksa kotak masuk emailmu.'
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already in use') ||
    lower.includes('duplicate key value') && lower.includes('email')
  ) {
    return 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akunmu.'
  }

  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Kata sandi minimal harus 6 karakter.'
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.'
  }

  // 2. Database & RLS errors
  if (lower.includes('jwt') || lower.includes('not authenticated') || lower.includes('session expired')) {
    return 'Sesi login telah berakhir. Silakan masuk kembali.'
  }

  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'Kamu tidak memiliki izin untuk melakukan tindakan ini.'
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Koneksi internet bermasalah. Periksa koneksimu dan coba lagi.'
  }

  if (lower.includes('duplicate')) {
    return 'Data ini sudah ada dalam sistem.'
  }

  // Fallback jika tidak ada pola yang cocok tapi raw ada dan pendek
  if (raw && raw.length < 80 && !raw.includes('Error:') && !raw.includes('{')) {
    return raw
  }

  return fallback
}
