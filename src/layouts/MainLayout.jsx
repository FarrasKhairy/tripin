import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/navbar/Navbar'
import { MobileBottomNav } from '../components/navbar/MobileBottomNav'
import { Footer } from '../components/navbar/Footer'
import { Modal } from '../components/common/Modal'
import { MapPin, Compass, ShieldCheck, Sparkles } from 'lucide-react'

export function MainLayout() {
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar onOpenAbout={() => setAboutOpen(true)} />
      
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Modal Tentang Tripin */}
      <Modal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="Tentang Tripin"
        subtitle="Rencanakan Perjalananmu, Jelajahi Keindahan Indonesia"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Tripin</strong> adalah platform travel planning modern yang dirancang khusus untuk mempermudah siapa saja mengeksplorasi ribuan surga tersembunyi di Indonesia.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Compass className="w-5 h-5 text-[#0F766E] mb-1.5" />
              <h5 className="font-semibold text-slate-900 text-xs">Eksplorasi Destinasi</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Informasi tiket, jam buka, dan ulasan terpercaya.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Sparkles className="w-5 h-5 text-[#0F766E] mb-1.5" />
              <h5 className="font-semibold text-slate-900 text-xs">Budget Akurat</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Kalkulasi biaya per orang otomatis dan transparan.</p>
            </div>
          </div>
          <div className="p-3 bg-[#D1FAE5]/60 rounded-xl text-[#0F766E] text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Siap terintegrasi dengan backend modern Supabase.</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
