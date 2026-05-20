import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await adminSupabase
    .from('join_logs')
    .select('*')
    .order('joined_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ logs: [], error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}
