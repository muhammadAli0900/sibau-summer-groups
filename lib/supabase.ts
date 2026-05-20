import { createClient, SupabaseClient } from '@supabase/supabase-js'

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false
  return /^https?:\/\//i.test(url)
}

// Public (anon) client — used for reads in server components and all client-side code
let _client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!isValidUrl(url) || !key) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  _client = createClient(url!, key)
  return _client
}

// Admin (service_role) client — used in API routes only, bypasses RLS
let _adminClient: SupabaseClient | null = null
function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  // Fall back to anon key if service key not available
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!isValidUrl(url) || !key) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  _adminClient = createClient(url!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _adminClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getClient()[prop as keyof SupabaseClient]
  },
})

export const adminSupabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getAdminClient()[prop as keyof SupabaseClient]
  },
})

export type Program = {
  id: string
  code: string
  name: string
  color: string
  created_at: string
  course_count?: number
}

export type Course = {
  id: string
  program_id: string
  code: string
  title: string
  semester_number: number | null
  credit_hours: string
  created_at: string
  programs?: Program
}

export type Group = {
  id: string
  course_id: string
  group_name: string
  platform: string
  invite_link: string
  added_by: string | null
  created_at: string
  join_count?: number
}

export type JoinLog = {
  id: string
  group_id: string
  course_id: string
  program_code: string
  course_title: string
  group_name: string
  platform: string
  joined_at: string
  user_agent: string | null
}
