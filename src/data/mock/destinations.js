/**
 * Mock Destinations Data
 * Hanya untuk development preview UI.
 * CATATAN: Data ini bersifat SEMENTARA.
 * Semua field disesuaikan dengan schema Supabase "destinations" yang sudah dikonfirmasi.
 * Saat Supabase dikonfigurasi, data ini tidak akan digunakan.
 */

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Pantai', slug: 'pantai', description: 'Wisata pantai dan laut' },
  { id: 'cat-2', name: 'Gunung', slug: 'gunung', description: 'Wisata alam pegunungan' },
  { id: 'cat-3', name: 'Alam', slug: 'alam', description: 'Wisata alam terbuka' },
  { id: 'cat-4', name: 'Budaya', slug: 'budaya', description: 'Wisata budaya dan heritage' },
  { id: 'cat-5', name: 'Kuliner', slug: 'kuliner', description: 'Wisata kuliner dan gastronomi' },
  { id: 'cat-6', name: 'Kota', slug: 'kota', description: 'Wisata perkotaan dan urban' },
]

/**
 * Field mapping sesuai tabel "destinations":
 * id, name, slug, province, city, description, image_url, ticket_price,
 * latitude, longitude, opening_hours, address, is_published
 */
export const MOCK_DESTINATIONS = [
  {
    id: 'dst-1',
    name: 'Kawah Putih',
    slug: 'kawah-putih',
    province: 'Jawa Barat',
    city: 'Bandung',
    description:
      'Kawah Putih adalah danau kawah dengan air berwarna kebiruan yang indah di ketinggian 2.430 mdpl. Terbentuk dari letusan Gunung Patuha, tempat ini menawarkan panorama alam yang misterius dan menakjubkan dengan kabut tipis yang menyelimuti kawasan kawah.',
    image_url:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 25000,
    latitude: -7.166,
    longitude: 107.402,
    opening_hours: '07.00 – 17.00 WIB',
    address: 'Jl. Raya Ciwidey–Patengan, Ciwidey, Bandung, Jawa Barat',
    is_published: true,
    // Non-schema helper (UI only – tidak ada di database)
    _ui: {
      rating: 4.7,
      review_count: 8400,
      category_names: ['Alam'],
      facilities: ['Area Parkir', 'Mushola', 'Toilet', 'Spot Ponton', 'Warung'],
    },
  },
  {
    id: 'dst-2',
    name: 'Pantai Kuta',
    slug: 'pantai-kuta',
    province: 'Bali',
    city: 'Badung',
    description:
      'Pantai berpasir putih legendaris di pesisir selatan Bali yang terkenal dengan ombak berselancar yang bersahabat, sunset spektakuler, dan suasana yang ramai.',
    image_url:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 0,
    latitude: -8.718,
    longitude: 115.168,
    opening_hours: '24 Jam',
    address: 'Kuta, Badung, Bali',
    is_published: true,
    _ui: {
      rating: 4.6,
      review_count: 12300,
      category_names: ['Pantai'],
      facilities: ['Sewa Papan Selancar', 'Kafe Tepi Pantai', 'Area Parkir'],
    },
  },
  {
    id: 'dst-3',
    name: 'Candi Borobudur',
    slug: 'candi-borobudur',
    province: 'Jawa Tengah',
    city: 'Magelang',
    description:
      'Candi Buddha terbesar di dunia yang dibangun pada abad ke-9, masuk dalam Situs Warisan Dunia UNESCO. Memiliki 2.672 panel relief dan 504 arca Buddha.',
    image_url:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 50000,
    latitude: -7.608,
    longitude: 110.204,
    opening_hours: '06.30 – 16.30 WIB',
    address: 'Jl. Badrawati, Kw. Candi Borobudur, Magelang, Jawa Tengah',
    is_published: true,
    _ui: {
      rating: 4.8,
      review_count: 15200,
      category_names: ['Budaya'],
      facilities: ['Museum', 'Pemandu Wisata', 'Taman', 'Golf Cart'],
    },
  },
  {
    id: 'dst-4',
    name: 'Raja Ampat',
    slug: 'raja-ampat',
    province: 'Papua Barat',
    city: 'Raja Ampat',
    description:
      'Gugusan pulau eksotis dengan keanekaragaman hayati bawah laut terkaya di bumi. Surga bagi penyelam dunia dengan air sebening kristal dan terumbu karang spektakuler.',
    image_url:
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 1500000,
    latitude: -0.498,
    longitude: 130.326,
    opening_hours: '06.00 – 18.00 WIT',
    address: 'Raja Ampat, Papua Barat',
    is_published: true,
    _ui: {
      rating: 4.9,
      review_count: 6700,
      category_names: ['Pantai', 'Alam'],
      facilities: ['Resort Terapung', 'Diving Center', 'Pemandu Lokal'],
    },
  },
  {
    id: 'dst-5',
    name: 'Labuan Bajo',
    slug: 'labuan-bajo',
    province: 'Nusa Tenggara Timur',
    city: 'Manggarai Barat',
    description:
      'Gerbang menuju Taman Nasional Komodo dengan pulau-pulau vulkanik dramatis, Pulau Padar, Pink Beach, dan habitat asli satwa purba Komodo.',
    image_url:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 150000,
    latitude: -8.451,
    longitude: 119.891,
    opening_hours: '06.00 – 17.30 WITA',
    address: 'Labuan Bajo, Manggarai Barat, NTT',
    is_published: true,
    _ui: {
      rating: 4.8,
      review_count: 7800,
      category_names: ['Alam', 'Pantai'],
      facilities: ['Kapal Phinisi', 'Trekking Guide', 'Snorkeling Gear'],
    },
  },
  {
    id: 'dst-6',
    name: 'Gunung Bromo',
    slug: 'gunung-bromo',
    province: 'Jawa Timur',
    city: 'Probolinggo',
    description:
      'Gunung berapi aktif ikonik dengan kaldera pasir luas, sunrise emas di Penanjakan, kawah berasap, dan lansekap lautan pasir yang tak terlupakan.',
    image_url:
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 35000,
    latitude: -7.942,
    longitude: 112.953,
    opening_hours: '24 Jam (Sunrise tour 03.00)',
    address: 'Taman Nasional Bromo Tengger Semeru, Jawa Timur',
    is_published: true,
    _ui: {
      rating: 4.7,
      review_count: 9100,
      category_names: ['Gunung', 'Alam'],
      facilities: ['Sewa Jeep', 'Sewa Kuda', 'Warung Kopi', 'Toilet'],
    },
  },
  {
    id: 'dst-7',
    name: 'Danau Toba',
    slug: 'danau-toba',
    province: 'Sumatera Utara',
    city: 'Samosir',
    description:
      'Danau vulkanik terbesar di Asia Tenggara yang mengelilingi Pulau Samosir. Kaya budaya Batak dan pemandangan pegunungan yang memesona.',
    image_url:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 20000,
    latitude: 2.602,
    longitude: 98.787,
    opening_hours: '24 Jam',
    address: 'Pulau Samosir, Sumatera Utara',
    is_published: true,
    _ui: {
      rating: 4.6,
      review_count: 6200,
      category_names: ['Alam'],
      facilities: ['Kapal Feri', 'Museum Batak', 'Hotel Tepi Danau'],
    },
  },
  {
    id: 'dst-8',
    name: 'Malioboro & Kraton Yogyakarta',
    slug: 'malioboro-yogyakarta',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    description:
      'Jantung kebudayaan Jawa yang memadukan kehangatan sejarah Kraton Kasultanan, gemerlap Jalan Malioboro, sajian gudeg otentik, dan pertunjukan seni tradisional.',
    image_url:
      'https://images.unsplash.com/photo-1596402184209-92d9c13fc545?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 25000,
    latitude: -7.798,
    longitude: 110.366,
    opening_hours: '08.00 – 22.00 WIB',
    address: 'Jl. Malioboro, Kota Yogyakarta, DI Yogyakarta',
    is_published: true,
    _ui: {
      rating: 4.7,
      review_count: 10200,
      category_names: ['Budaya', 'Kota'],
      facilities: ['Andong Tradisional', 'Pusat Batik', 'Pusat Informasi Turis'],
    },
  },
  {
    id: 'dst-9',
    name: 'Tana Toraja',
    slug: 'tana-toraja',
    province: 'Sulawesi Selatan',
    city: 'Tana Toraja',
    description:
      'Kawasan budaya unik dengan rumah adat Tongkonan beratap perahu, upacara pemakaman adat Rambu Solo yang megah, dan kuburan tebing batu Lemo.',
    image_url:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 40000,
    latitude: -3.031,
    longitude: 119.893,
    opening_hours: '08.00 – 17.00 WITA',
    address: 'Rantepao, Tana Toraja, Sulawesi Selatan',
    is_published: true,
    _ui: {
      rating: 4.6,
      review_count: 5300,
      category_names: ['Budaya'],
      facilities: ['Desa Wisata', 'Homestay Tradisional', 'Pemandu Adat'],
    },
  },
  {
    id: 'dst-10',
    name: 'Jalan Braga Bandung',
    slug: 'jalan-braga-bandung',
    province: 'Jawa Barat',
    city: 'Bandung',
    description:
      'Jalan bersejarah bergaya art deco Eropa tempo dulu dengan kafe-kafe hipster, kedai kopi legendaris, galeri seni pinggir jalan, dan aneka jajanan Sunda.',
    image_url:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    ticket_price: 0,
    latitude: -6.917,
    longitude: 107.608,
    opening_hours: '08.00 – 23.00 WIB',
    address: 'Jl. Braga, Sumur Bandung, Kota Bandung, Jawa Barat',
    is_published: true,
    _ui: {
      rating: 4.7,
      review_count: 14100,
      category_names: ['Kuliner', 'Kota'],
      facilities: ['Kafe & Resto', 'Spot Foto', 'Pedestrian Luas'],
    },
  },
]

/** Peta relasi category (mock hanya untuk preview filter UI) */
export const MOCK_DESTINATION_CATEGORIES = MOCK_DESTINATIONS.map((d) => ({
  destination_id: d.id,
  category_names: d._ui.category_names,
}))
