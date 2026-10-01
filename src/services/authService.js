/**
 * authService.js
 * Service untuk Supabase Auth (Email + Password).
 * Menggunakan: supabase.auth.signUp, signInWithPassword, signOut, onAuthStateChange
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const authService = {
  /**
   * Mendapatkan session saat ini.
   * supabase.auth.getSession()
   */
  async getSession() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /**
   * Mendapatkan user saat ini.
   * supabase.auth.getUser()
   */
  async getUser() {
    if (!isSupabaseConfigured || !supabase) {
      return null
    }
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  },

  /**
   * Register dengan email + password.
   * @param {string} fullName
   * @param {string} email
   * @param {string} password
   */
  async register(fullName, email, password) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Login dengan email + password.
   */
  async login(email, password) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  /**
   * Logout.
   */
  async logout() {
    if (!isSupabaseConfigured || !supabase) {
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Auth state change listener.
   * Kembalikan unsubscribe function.
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) {
      return () => {}
    }
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
    return () => data.subscription.unsubscribe()
  },
}

export default authService

