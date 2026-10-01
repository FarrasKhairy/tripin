/**
 * travelRecommendationConfig.js
 * Konfigurasi terpusat untuk Smart Trip Recommendation & Budget Engine.
 * 
 * Gaya perjalanan, pilihan preferensi, dan preset input yang dipakai oleh planner.
 */

export const TRAVEL_STYLES = {
  HEMAT: 'hemat',
  BALANCED: 'balanced',
  COMFORT: 'comfort',
}

export const TRAVEL_STYLE_META = {
  [TRAVEL_STYLES.HEMAT]: {
    id: 'hemat',
    name: 'Hemat',
    tagline: 'Backpacker & Budget-Friendly',
    description: 'Fokus pengalaman dengan pengeluaran minimum.',
    color: '#0F766E',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [TRAVEL_STYLES.BALANCED]: {
    id: 'balanced',
    name: 'Balanced',
    tagline: 'Pilihan Seimbang',
    description: 'Seimbang antara kenyamanan dan budget.',
    color: '#0284C7',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [TRAVEL_STYLES.COMFORT]: {
    id: 'comfort',
    name: 'Comfort',
    tagline: 'Kenyamanan Ekstra',
    description: 'Lebih nyaman dengan budget yang lebih fleksibel.',
    color: '#7C3AED',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
}

/**
 * Pemetaan preferensi user ke kata kunci kategori dan deskripsi destinasi
 */
export const PREFERENCE_MAPPINGS = {
  Nature: {
    label: 'Alam',
    categories: ['Alam', 'Gunung', 'Pantai'],
    keywords: ['alam', 'gunung', 'danau', 'kawah', 'hutan', 'curug', 'pantai', 'bukit'],
    icon: 'Trees',
  },
  Culture: {
    label: 'Budaya',
    categories: ['Budaya', 'Sejarah'],
    keywords: ['budaya', 'candi', 'kraton', 'keraton', 'adat', 'desa wisata', 'seni', 'tradisional'],
    icon: 'Landmark',
  },
  Food: {
    label: 'Kuliner',
    categories: ['Kuliner'],
    keywords: ['kuliner', 'makanan', 'jajanan', 'kafe', 'gudeg', 'kopi', 'pasar'],
    icon: 'Utensils',
  },
  Adventure: {
    label: 'Petualangan',
    categories: ['Petualangan', 'Alam', 'Gunung'],
    keywords: ['petualangan', 'rafting', 'snorkeling', 'diving', 'trekking', 'jeep'],
    icon: 'Compass',
  },
  Relaxation: {
    label: 'Pantai & Santai',
    categories: ['Pantai', 'Alam'],
    keywords: ['pantai', 'sunset', 'resort', 'santai', 'laut', 'pasir'],
    icon: 'Palmtree',
  },
  Shopping: {
    label: 'Belanja & Kota',
    categories: ['Kota', 'Budaya', 'Kuliner'],
    keywords: ['belanja', 'batik', 'oleh-oleh', 'kota', 'pasar'],
    icon: 'ShoppingBag',
  },
  History: {
    label: 'Sejarah',
    categories: ['Sejarah', 'Budaya'],
    keywords: ['sejarah', 'candi', 'museum', 'monumen', 'peninggalan', 'kolonial'],
    icon: 'BookOpen',
  },
}

export const BUDGET_PRESETS = [
  { label: 'Rp 2 Juta', value: 2000000 },
  { label: 'Rp 3 Juta', value: 3000000 },
  { label: 'Rp 5 Juta', value: 5000000 },
  { label: 'Rp 10 Juta', value: 10000000 },
]
