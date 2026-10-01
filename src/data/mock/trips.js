/**
 * Mock Trips & Related Data
 * Hanya untuk development preview UI.
 * CATATAN: Data ini bersifat SEMENTARA.
 * Field disesuaikan dengan schema Supabase yang sudah dikonfirmasi.
 *
 * trips: id, user_id, title, start_date, end_date, travelers_count,
 *        transport_type, total_budget, status, notes
 *
 * budget_items: id, trip_id, category, name, estimated_amount, quantity, notes
 *
 * expenses: id, trip_id, category, title, amount, expense_date, notes
 *
 * trip_destinations: id, trip_id, destination_id, visit_date, visit_order, notes
 */

export const MOCK_TRIPS = [
  {
    id: 'trip-1',
    user_id: 'user-mock-1',
    title: 'Trip Bandung 3 Hari 2 Malam',
    start_date: '2026-09-20',
    end_date: '2026-09-22',
    travelers_count: 2,
    transport_type: 'Mobil',
    total_budget: 2500000,
    status: 'planning',
    notes: 'Jangan lupa bawa jaket, kamera, dan powerbank!',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
    // Helper display (bukan kolom database)
    _ui: { accommodation: 'Hotel' },
  },
  {
    id: 'trip-2',
    user_id: 'user-mock-1',
    title: 'Bali 4 Hari 3 Malam',
    start_date: '2026-08-10',
    end_date: '2026-08-13',
    travelers_count: 2,
    transport_type: 'Pesawat',
    total_budget: 3500000,
    status: 'planning',
    notes: 'Sewa motor di Ngurah Rai.',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-01T10:00:00Z',
    _ui: { accommodation: 'Resort' },
  },
  {
    id: 'trip-3',
    user_id: 'user-mock-1',
    title: 'Yogyakarta 3 Hari 2 Malam',
    start_date: '2026-06-05',
    end_date: '2026-06-07',
    travelers_count: 3,
    transport_type: 'Kereta Api',
    total_budget: 2200000,
    status: 'planning',
    notes: 'Naik Taksaka dari Gambir.',
    created_at: '2026-05-25T08:00:00Z',
    updated_at: '2026-05-25T08:00:00Z',
    _ui: { accommodation: 'Hotel' },
  },
]

/**
 * budget_items – gunakan estimated_amount (BUKAN amount)
 */
export const MOCK_BUDGET_ITEMS = [
  {
    id: 'bi-1',
    trip_id: 'trip-1',
    category: 'Transportasi',
    name: 'Bensin + Tol PP',
    estimated_amount: 500000,
    quantity: 1,
    notes: 'Jakarta – Bandung via Cipularang',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'bi-2',
    trip_id: 'trip-1',
    category: 'Penginapan',
    name: 'Hotel Bintang 3 Bandung',
    estimated_amount: 350000,
    quantity: 2,
    notes: '2 malam × Rp350.000/malam',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'bi-3',
    trip_id: 'trip-1',
    category: 'Tiket Wisata',
    name: 'Tiket Kawah Putih + Ontang-anting',
    estimated_amount: 100000,
    quantity: 2,
    notes: '2 orang',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'bi-4',
    trip_id: 'trip-1',
    category: 'Makan',
    name: 'Makan harian (3 hari)',
    estimated_amount: 150000,
    quantity: 3,
    notes: 'Estimasi per hari 2 orang',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'bi-5',
    trip_id: 'trip-1',
    category: 'Parkir / Tol',
    name: 'Parkir area wisata',
    estimated_amount: 50000,
    quantity: 3,
    notes: 'Estimasi per destinasi',
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'bi-6',
    trip_id: 'trip-1',
    category: 'Lain-lain',
    name: 'Oleh-oleh & Lainnya',
    estimated_amount: 200000,
    quantity: 1,
    notes: null,
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
  },
]

/**
 * expenses – gunakan: title, amount, expense_date, notes
 * BUKAN: name, price, date, description
 */
export const MOCK_EXPENSES = [
  {
    id: 'exp-1',
    trip_id: 'trip-1',
    category: 'Makan',
    title: 'Nasi Liwet Bu Yati',
    amount: 75000,
    expense_date: '2026-09-20',
    notes: 'Makan siang setelah Kawah Putih',
    created_at: '2026-09-20T12:30:00Z',
    updated_at: '2026-09-20T12:30:00Z',
  },
  {
    id: 'exp-2',
    trip_id: 'trip-1',
    category: 'Tiket Wisata',
    title: 'Tiket Kawah Putih',
    amount: 100000,
    expense_date: '2026-09-20',
    notes: '2 orang + ontang-anting',
    created_at: '2026-09-20T10:15:00Z',
    updated_at: '2026-09-20T10:15:00Z',
  },
  {
    id: 'exp-3',
    trip_id: 'trip-1',
    category: 'Transportasi',
    title: 'Bensin + Tol Cipularang',
    amount: 200000,
    expense_date: '2026-09-19',
    notes: 'Jakarta ke Bandung PP',
    created_at: '2026-09-19T18:45:00Z',
    updated_at: '2026-09-19T18:45:00Z',
  },
  {
    id: 'exp-4',
    trip_id: 'trip-1',
    category: 'Makan',
    title: 'Kopi Susu Jahe',
    amount: 35000,
    expense_date: '2026-09-19',
    notes: 'Rest area km 72',
    created_at: '2026-09-19T16:20:00Z',
    updated_at: '2026-09-19T16:20:00Z',
  },
  {
    id: 'exp-5',
    trip_id: 'trip-1',
    category: 'Belanja',
    title: 'Oleh-oleh Peuyeum & Keripik',
    amount: 150000,
    expense_date: '2026-09-19',
    notes: null,
    created_at: '2026-09-19T14:10:00Z',
    updated_at: '2026-09-19T14:10:00Z',
  },
]

/**
 * trip_destinations
 */
export const MOCK_TRIP_DESTINATIONS = [
  {
    id: 'td-1',
    trip_id: 'trip-1',
    destination_id: 'dst-1',
    visit_date: '2026-09-20',
    visit_order: 1,
    notes: 'Berangkat pagi pukul 06.00 WIB',
    created_at: '2026-09-15T10:00:00Z',
    // UI helper
    _destination: {
      name: 'Kawah Putih',
      image_url:
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
      city: 'Bandung',
    },
  },
  {
    id: 'td-2',
    trip_id: 'trip-1',
    destination_id: 'dst-10',
    visit_date: '2026-09-21',
    visit_order: 2,
    notes: null,
    created_at: '2026-09-15T10:00:00Z',
    _destination: {
      name: 'Jalan Braga',
      image_url:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      city: 'Bandung',
    },
  },
  {
    id: 'td-3',
    trip_id: 'trip-1',
    destination_id: 'dst-6',
    visit_date: '2026-09-22',
    visit_order: 3,
    notes: null,
    created_at: '2026-09-15T10:00:00Z',
    _destination: {
      name: 'Gunung Bromo',
      image_url:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
      city: 'Probolinggo',
    },
  },
]

/** Wishlist entries (mock) */
export const MOCK_WISHLISTS = [
  { id: 'wl-1', user_id: 'user-mock-1', destination_id: 'dst-1', created_at: '2026-09-01T10:00:00Z' },
  { id: 'wl-2', user_id: 'user-mock-1', destination_id: 'dst-4', created_at: '2026-09-02T10:00:00Z' },
  { id: 'wl-3', user_id: 'user-mock-1', destination_id: 'dst-5', created_at: '2026-09-03T10:00:00Z' },
  { id: 'wl-4', user_id: 'user-mock-1', destination_id: 'dst-6', created_at: '2026-09-04T10:00:00Z' },
  { id: 'wl-5', user_id: 'user-mock-1', destination_id: 'dst-9', created_at: '2026-09-05T10:00:00Z' },
]

/** Profile mock */
export const MOCK_PROFILE = {
  id: 'user-mock-1',
  full_name: 'Dennis Farras',
  avatar_url:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-09-15T10:00:00Z',
  // Extra UI fields (tidak di schema profiles – simpan di local state saja)
  _ui: {
    email: 'dennis.farras@tripin.id',
    city: 'Jakarta Selatan',
    phone: '+62 812-3456-7890',
    bio: 'Pecinta keindahan alam Nusantara, penikmat kopi tubruk, dan penjelajah puncak gunung.',
  },
}
