import { NextResponse } from 'next/server'
import { adminSupabase, supabase } from '@/lib/supabase'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET'
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const urlValid = /^https?:\/\//i.test(url)

  if (!urlValid) {
    return NextResponse.json({
      ok: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL is not a valid HTTP/HTTPS URL.',
      hint: 'It should look like https://abcdefghijk.supabase.co — get it from Supabase Dashboard → Settings → API → Project URL',
      url,
      hasAnonKey,
      hasServiceKey,
    })
  }

  // Use actual SELECT (not HEAD) to reliably detect missing tables
  const [progRes, courseRes, groupRes, logRes] = await Promise.all([
    supabase.from('programs').select('code').limit(1),
    supabase.from('courses').select('id').limit(1),
    adminSupabase.from('groups').select('id').limit(1),
    adminSupabase.from('join_logs').select('id').limit(1),
  ])

  const tablesOk = !progRes.error && !courseRes.error && !groupRes.error && !logRes.error

  return NextResponse.json({
    ok: tablesOk,
    url,
    hasAnonKey,
    hasServiceKey,
    tables: {
      programs: progRes.error ? `ERROR: ${progRes.error.message}` : 'OK',
      courses: courseRes.error ? `ERROR: ${courseRes.error.message}` : 'OK',
      groups: groupRes.error ? `ERROR: ${groupRes.error.message}` : 'OK',
      join_logs: logRes.error ? `ERROR: ${logRes.error.message}` : 'OK',
    },
  })
}
