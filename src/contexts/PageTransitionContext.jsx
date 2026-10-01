import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageTransitionLoader } from '../components/ui/PageTransitionLoader'

const PageTransitionContext = createContext(null)

/**
 * PageTransitionProvider
 *
 * Mengelola state transisi halaman global agar loader dapat bertahan
 * saat navigasi route berlangsung dan fade-out secara smooth di atas halaman tujuan.
 */
export function PageTransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [message, setMessage] = useState('Menyiapkan perjalananmu...')
  const [submessage, setSubmessage] = useState('Menghubungkan petualanganmu di Nusantara')
  const navigate = useNavigate()
  const lockRef = useRef(false)

  /**
   * Memulai transisi halaman dengan branded loader.
   *
   * @param {Object} options
   * @param {string} options.to - Path route tujuan (misal: '/riwayat')
   * @param {string} options.message - Pesan utama loader
   * @param {string} options.submessage - Sub-pesan loader
   * @param {number} options.minDuration - Durasi minimal loader tampil dalam ms (default 1000ms)
   * @param {number} options.exitDuration - Durasi fade out loader dalam ms (default 400ms)
   * @param {Function} options.prepareAction - Operasi asinkron yang ingin diselesaikan sebelum exit
   */
  const startTransition = useCallback(
    async ({
      to = '/riwayat',
      message: customMessage = 'Menyiapkan perjalananmu...',
      submessage: customSub = 'Menghubungkan petualanganmu di Nusantara',
      minDuration = 1000,
      exitDuration = 400,
      prepareAction = null,
    } = {}) => {
      if (lockRef.current) return
      lockRef.current = true

      setMessage(customMessage)
      setSubmessage(customSub)
      setIsTransitioning(true)
      setIsExiting(false)

      const startTime = Date.now()

      // 1. Eksekusi data preparation jika ada (misal fetch initial data)
      if (typeof prepareAction === 'function') {
        try {
          await prepareAction()
        } catch (err) {
          console.warn('[PageTransition] prepareAction non-fatal error:', err)
        }
      }

      // 2. Jaga durasi visual minimal agar transisi terasa terencana & nyaman (800-1200ms)
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minDuration - elapsed)
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      // 3. Navigasi ke halaman tujuan saat layar masih tertutup loader
      if (to) {
        navigate(to, { replace: true, state: { animatedEntrance: true } })
      }

      // Beri sedikit jeda mikro (60ms) agar DOM route tujuan terpasang
      await new Promise((resolve) => setTimeout(resolve, 60))

      // 4. Mulai fade-out exit transition loader (350-400ms)
      setIsExiting(true)

      // 5. Tunggu animasi exit selesai sebelum unmount loader
      await new Promise((resolve) => setTimeout(resolve, exitDuration))

      setIsTransitioning(false)
      setIsExiting(false)
      lockRef.current = false
    },
    [navigate]
  )

  const value = {
    isTransitioning,
    isExiting,
    startTransition,
  }

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      {/* Global Transition Overlay */}
      {isTransitioning && (
        <PageTransitionLoader
          isVisible={isTransitioning}
          isExiting={isExiting}
          message={message}
          submessage={submessage}
        />
      )}
    </PageTransitionContext.Provider>
  )
}

/** Hook untuk mengakses page transition */
export function usePageTransition() {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) {
    throw new Error('usePageTransition harus digunakan di dalam PageTransitionProvider')
  }
  return ctx
}
