/**
 * profileService.js
 * Service untuk tabel "profiles".
 *
 * Schema yang dikonfirmasi:
 * profiles(id, full_name, avatar_url, created_at, updated_at)
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const profileService = {
  /**
   * Ambil profil berdasarkan user ID.
   * @param {string} userId
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured || !supabase || !userId) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.error('[profileService.getProfile] error:', error)
      throw error
    }
    return data
  },

  /**
   * Buat atau update profil user (misal saat registrasi).
   * @param {{ id: string, full_name?: string, avatar_url?: string }} profileData
   */
  async upsertProfile(profileData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client belum dikonfigurasi.')
    }
    const payload = {
      id: profileData.id,
      full_name: profileData.full_name || null,
      avatar_url: profileData.avatar_url || null,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()
    if (error) {
      console.error('[profileService.upsertProfile] error:', error)
      throw error
    }
    return data
  },

  /**
   * Update profil.
   * Hanya boleh mengupdate field yang ada di schema: full_name, avatar_url.
   * updated_at diurus oleh Supabase.
   *
   * @param {string} userId
   * @param {{ full_name?: string, avatar_url?: string }} updates
   */
  async updateProfile(userId, updates) {
    if (!isSupabaseConfigured || !supabase || !userId) {
      throw new Error('Supabase client belum dikonfigurasi atau userId tidak valid.')
    }
    const allowed = {}
    if (updates.full_name !== undefined) allowed.full_name = updates.full_name
    if (updates.avatar_url !== undefined) allowed.avatar_url = updates.avatar_url
    allowed.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(allowed)
      .eq('id', userId)
      .select()
      .single()
    if (error) {
      console.error('[profileService.updateProfile] error:', error)
      throw error
    }
    return data
  },
}

export default profileService
