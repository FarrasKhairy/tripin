import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import { PlannerWizard } from '../components/planner/PlannerWizard'
import { PlannerGeneratingLoader } from '../components/planner/PlannerGeneratingLoader'
import { PlannerResult } from '../components/planner/PlannerResult'
import tripRecommendationService from '../services/tripRecommendationService'
import { Button } from '../components/common/Button'

const SESSION_STORAGE_KEY = 'tripin_active_smart_plan'
const SESSION_INPUTS_KEY = 'tripin_smart_planner_inputs'

export function SmartPlanner() {
  const location = useLocation()
  const navigate = useNavigate()

  const [wizardInputs, setWizardInputs] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_INPUTS_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [generatedPlan, setGeneratedPlan] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [pendingPlan, setPendingPlan] = useState(null)
  const [error, setError] = useState(null)

  // Sync route path: if URL is /plan/result but no plan exists, redirect to /plan
  useEffect(() => {
    if (location.pathname === '/plan/result' && !generatedPlan && !isGenerating) {
      navigate('/plan', { replace: true })
    }
  }, [location.pathname, generatedPlan, isGenerating, navigate])

  const handleStartGenerate = async (inputs) => {
    setError(null)
    setWizardInputs(inputs)
    try {
      sessionStorage.setItem(SESSION_INPUTS_KEY, JSON.stringify(inputs))
    } catch (e) {
      console.warn('Failed to save wizard inputs to sessionStorage:', e)
    }

    setIsGenerating(true)

    try {
      // Jalankan recommendation engine
      const plan = await tripRecommendationService.generateTripRecommendation(inputs)
      setPendingPlan(plan)
    } catch (err) {
      console.error('[SmartPlanner] Gagal generate rekomendasi:', err)
      setError('Data destinasi atau kalkulasi perjalanan sedang tidak tersedia. Periksa koneksi data dan coba lagi.')
      setIsGenerating(false)
    }
  }

  // Dipanggil saat animasi loading Step 7 selesai
  const handleLoaderComplete = () => {
    if (pendingPlan) {
      setGeneratedPlan(pendingPlan)
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(pendingPlan))
      } catch (e) {
        console.warn('Failed to save plan to sessionStorage:', e)
      }
      setIsGenerating(false)
      setPendingPlan(null)
      navigate('/plan/result')
    } else {
      setIsGenerating(false)
    }
  }

  const handlePlanUpdated = (updatedPlan) => {
    setGeneratedPlan(updatedPlan)
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedPlan))
    } catch (e) {
      console.warn('Failed to update plan in sessionStorage:', e)
    }
  }

  const handleReset = () => {
    setGeneratedPlan(null)
    setPendingPlan(null)
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e)
    }
    navigate('/plan')
  }

  // Tampilkan loading screen Step 7
  if (isGenerating) {
    return <PlannerGeneratingLoader onComplete={handleLoaderComplete} />
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Trip Belum Dapat Dibuat</h3>
        <p className="text-xs sm:text-sm text-slate-500">{error}</p>
        <div className="pt-2">
          <Button variant="primary" icon={RotateCcw} onClick={handleReset}>
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // Result View
  if (location.pathname === '/plan/result' && generatedPlan) {
    return (
      <div className="py-2 sm:py-4">
        <PlannerResult
          plan={generatedPlan}
          onPlanUpdated={handlePlanUpdated}
          onReset={handleReset}
        />
      </div>
    )
  }

  // Wizard View
  return (
    <div className="py-2 sm:py-4">
      {/* Header Info */}
      <div className="max-w-3xl mx-auto mb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] text-xs font-semibold border border-teal-100/80">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Trip Recommendation & Budget Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Rancang Liburan Impianmu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Tentukan kota tujuan, durasi, budget, dan preferensimu. Engine Tripin akan otomatis meracik itinerary dan alokasi budget terbaik.
        </p>
      </div>

      <PlannerWizard
        initialValues={wizardInputs}
        onGenerate={handleStartGenerate}
        isGenerating={isGenerating}
      />
    </div>
  )
}

export default SmartPlanner
