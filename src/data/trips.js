/**
 * Mock Data Perjalanan Tripin
 * CATATAN: Data ini digunakan untuk preview UI dan fallback development frontend.
 * Siap digantikan dengan query Supabase dari Dennis.
 */

export const TRIPS_DATA = [
  {
    id: '1',
    title: 'Trip Bandung 3 Hari 2 Malam',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    dateDisplay: '20 - 22 September 2026',
    personCount: 2,
    transportation: 'Mobil',
    accommodation: 'Hotel',
    status: 'Aktif',
    initialBudget: 2500000,
    estimatedBudget: 2200000,
    budgetCategories: {
      transportasi: 500000,
      penginapan: 700000,
      tiket: 200000,
      makan: 450000,
      parkir: 150000,
      lainnya: 200000,
    },
    visitedDestinations: [
      {
        id: 'kawah-putih',
        name: 'Kawah Putih',
        date: '20 Sep 2026',
        image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
        status: 'Selesai dikunjungi'
      },
      {
        id: 'dusun-bambu',
        name: 'Dusun Bambu',
        date: '21 Sep 2026',
        image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
        status: 'Rencana berikutnya'
      },
      {
        id: 'jalan-braga',
        name: 'Braga',
        date: '22 Sep 2026',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        status: 'Rencana berikutnya'
      }
    ],
    notes: 'Jangan lupa bawa jaket, kamera, dan powerbank!'
  },
  {
    id: '2',
    title: 'Bali 4 Hari 3 Malam',
    startDate: '2026-08-10',
    endDate: '2026-08-13',
    dateDisplay: '10 - 13 Agustus 2026',
    personCount: 2,
    transportation: 'Pesawat',
    accommodation: 'Resort / Hotel',
    status: 'Selesai',
    initialBudget: 3500000,
    estimatedBudget: 3200000,
    budgetCategories: {
      transportasi: 1200000,
      penginapan: 1000000,
      tiket: 300000,
      makan: 500000,
      parkir: 50000,
      lainnya: 150000,
    },
    visitedDestinations: [],
    notes: 'Sewa motor di bandara I Gusti Ngurah Rai.'
  },
  {
    id: '3',
    title: 'Yogyakarta 3 Hari 2 Malam',
    startDate: '2026-06-05',
    endDate: '2026-06-07',
    dateDisplay: '5 - 7 Juni 2026',
    personCount: 3,
    transportation: 'Kereta Api',
    accommodation: 'Hotel',
    status: 'Selesai',
    initialBudget: 2200000,
    estimatedBudget: 2150000,
    budgetCategories: {
      transportasi: 650000,
      penginapan: 700000,
      tiket: 250000,
      makan: 400000,
      parkir: 50000,
      lainnya: 100000,
    },
    visitedDestinations: [],
    notes: 'Naik kereta Taksaka dari Gambir.'
  },
  {
    id: '4',
    title: 'Bandung 3 Hari 2 Malam',
    startDate: '2026-04-12',
    endDate: '2026-04-14',
    dateDisplay: '12 - 14 April 2026',
    personCount: 2,
    transportation: 'Mobil',
    accommodation: 'Hotel',
    status: 'Selesai',
    initialBudget: 1800000,
    estimatedBudget: 1650000,
    budgetCategories: {
      transportasi: 400000,
      penginapan: 600000,
      tiket: 150000,
      makan: 350000,
      parkir: 50000,
      lainnya: 100000,
    },
    visitedDestinations: [],
    notes: 'Kulineran di daerah Riau dan Dago.'
  }
]
