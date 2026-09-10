import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || ''
export const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}

export async function requireUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no está configurado')
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase no está configurado')
  return supabase.auth.signUp({ email, password })
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}
