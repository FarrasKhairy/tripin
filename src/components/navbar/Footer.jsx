import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { Heart, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-16 md:pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <Logo />
            <p className="text-xs text-slate-500 leading-relaxed">
              Rencanakan Perjalananmu, Jelajahi Keindahan Indonesia. Temukan tempat wisata terbaik, kelola budget akurat, dan catat pengeluaran.
            </p>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D1FAE5]/60 text-[#0F766E] text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Indonesia Punya Segalanya</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Jelajahi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/destinasi" className="hover:text-[#0F766E] transition-colors">
                  Semua Destinasi
                </Link>
              </li>
              <li>
                <Link to="/destinasi?category=Pantai" className="hover:text-[#0F766E] transition-colors">
                  Wisata Pantai
                </Link>
              </li>
              <li>
                <Link to="/destinasi?category=Gunung" className="hover:text-[#0F766E] transition-colors">
                  Wisata Gunung
                </Link>
              </li>
              <li>
                <Link to="/destinasi?category=Budaya" className="hover:text-[#0F766E] transition-colors">
                  Wisata Budaya & Candi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Fitur Perjalanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/trip/buat" className="hover:text-[#0F766E] transition-colors">
                  Buat Trip Baru
                </Link>
              </li>
              <li>
                <Link to="/riwayat" className="hover:text-[#0F766E] transition-colors">
                  Riwayat & Pengeluaran Trip
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#0F766E] transition-colors">
                  Destinasi Wishlist
                </Link>
              </li>
            </ul>

          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Tentang Tripin
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Aplikasi travel planning terintegrasi untuk wisatawan nusantara dan mancanegara yang menjelajah Indonesia.
            </p>
            <div className="text-[11px] text-slate-400">
              Dikembangkan dengan penuh dedikasi untuk pariwisata Indonesia.
            </div>
          </div>
        </div>

        <p className="mb-6 text-[10px] leading-relaxed text-slate-400">
          Data awal destinasi: <a href="https://audiala.com" target="_blank" rel="noopener noreferrer" className="underline">Data by Audiala</a> (CC BY 4.0), dengan identitas dan koordinat dari <a href="https://www.wikidata.org/wiki/Wikidata:Copyright" target="_blank" rel="noopener noreferrer" className="underline">Wikidata</a> (CC0). Kredit dan lisensi foto tercantum pada kartu dan detail destinasi.
        </p>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Tripin. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Indonesia
          </p>
        </div>
      </div>
    </footer>
  )
}
