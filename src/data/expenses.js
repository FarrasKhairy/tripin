/**
 * Mock Data Pengeluaran Tripin
 * CATATAN: Data ini digunakan untuk preview UI dan fallback development frontend.
 * Siap digantikan dengan query Supabase dari Dennis.
 */

export const EXPENSES_DATA = [
  {
    id: 'exp-1',
    tripId: '1',
    category: 'Makan',
    amount: 75000,
    description: 'Makan siang nasi liwet',
    date: '2026-09-20',
    time: '12:30',
    title: 'Makan'
  },
  {
    id: 'exp-2',
    tripId: '1',
    category: 'Tiket Wisata',
    amount: 100000,
    description: 'Tiket masuk Kawah Putih 2 orang + ontang-anting',
    date: '2026-09-20',
    time: '10:15',
    title: 'Tiket Kawah Putih'
  },
  {
    id: 'exp-3',
    tripId: '1',
    category: 'Transportasi',
    amount: 200000,
    description: 'Bensin Pertamax tol Cipularang',
    date: '2026-09-19',
    time: '18:45',
    title: 'Bensin'
  },
  {
    id: 'exp-4',
    tripId: '1',
    category: 'Makan',
    amount: 35000,
    description: 'Kopi susu di rest area km 72',
    date: '2026-09-19',
    time: '16:20',
    title: 'Kopi'
  },
  {
    id: 'exp-5',
    tripId: '1',
    category: 'Belanja',
    amount: 150000,
    description: 'Oleh-oleh peuyeum & keripik tempe',
    date: '2026-09-19',
    time: '14:10',
    title: 'Oleh-oleh'
  }
]
