/**
 * AuthContext.jsx
 * React Context untuk state autentikasi Tripin.
 * Menggunakan Supabase Auth onAuthStateChange sebagai sumber kebenaran.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import authService from '../services/authService'
import profileService from '../services/profileService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }
    try {
      const prof = await profileService.getProfile(userId)
      setProfile(prof)
      return prof
    } catch {
      setProfile(null)
      return null
    }
  }, [])

  const isRegisteringRef = React.useRef(false)

  // Load session dari Supabase saat pertama mount
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        const currentSession = await authService.getSession()
        if (isMounted) {
          setSession(currentSession)
          if (currentSession?.user?.id) {
            await fetchProfile(currentSession.user.id)
          }
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err)
        if (isMounted) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    // Listen auth changes
    const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return
      // Jika sedang dalam proses register, cegah auto-login ke dashboard
      if (isRegisteringRef.current) {
        return
      }

      setSession(newSession)

      if (newSession?.user?.id) {
        await fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [fetchProfile])

  /**
   * User object gabungan dari Supabase Auth User + Profile database
   */
  const user = useMemo(() => {
    if (!session?.user) return null
    return {
      ...session.user,
      name:
        profile?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'Traveler',
      email: session.user.email,
      avatar: profile?.avatar_url || null,
    }
  }, [session, profile])

  /** Apakah sedang authenticated */
  const isAuthenticated = Boolean(session?.user)

  /** Login dengan email + password */
  async function login(email, password) {
    const result = await authService.login(email, password)
    if (result.session) {
      setSession(result.session)
      if (result.user?.id) {
        fetchProfile(result.user.id).catch(console.error)
      }
    }
    return result
  }

  /**
   * Register email + password.
   * Simpan profil ke tabel profiles setelah pendaftaran.
   * JANGAN auto-login: user diarahkan ke login secara manual.
   */
  async function register(fullName, email, password) {
    isRegisteringRef.current = true
    try {
      const result = await authService.register(fullName, email, password)

      // Cek apakah user sudah terdaftar sebelumnya (Supabase returns empty identities)
      if (result?.user?.identities && result.user.identities.length === 0) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk ke akunmu.')
      }

      // Jika user berhasil dibuat, coba upsert ke tabel profiles
      if (result?.user?.id) {
        try {
          await profileService.upsertProfile({
            id: result.user.id,
            full_name: fullName,
            avatar_url: null,
          })
        } catch (profileErr) {
          console.warn('[AuthContext.register] profile upsert pending confirmation/RLS:', profileErr)
        }
      }

      // Pastikan tidak ada active session setelah pendaftaran (hindari auto-login)
      if (result?.session) {
        try {
          await authService.logout()
        } catch {
          // ignore
        }
      }
      setSession(null)
      setProfile(null)

      return result
    } finally {
      setTimeout(() => {
        isRegisteringRef.current = false
      }, 600)
    }
  }

  /** Logout */
  async function logout() {
    await authService.logout()
    setSession(null)
    setProfile(null)
  }

  /** Update profil user */
  async function updateProfile(updates) {
    if (!session?.user?.id) throw new Error('User belum login')
    const updated = await profileService.updateProfile(session.user.id, {
      full_name: updates.name !== undefined ? updates.name : updates.full_name,
      avatar_url: updates.avatar !== undefined ? updates.avatar : updates.avatar_url,
    })
    setProfile(updated)
    return updated
  }

  /** Refresh profile dari database */
  async function refreshProfile() {
    if (!session?.user?.id) return null
    return fetchProfile(session.user.id)
  }

  /** Refresh user/session */
  async function refreshUser() {
    try {
      const currentSession = await authService.getSession()
      setSession(currentSession)
      if (currentSession?.user?.id) {
        await fetchProfile(currentSession.user.id)
      }
    } catch {
      // ignore
    }
  }

  const value = {
    user,
    profile,
    session,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook untuk mengakses auth context */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}

