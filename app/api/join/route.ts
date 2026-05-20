import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { group_id, course_id, program_code, course_title, group_name, platform } = body

    if (!group_id || !course_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') ?? null

    const { error } = await adminSupabase.from('join_logs').insert({
      group_id,
      course_id,
      program_code: program_code ?? '',
      course_title: course_title ?? '',
      group_name: group_name ?? '',
      platform: platform ?? 'WhatsApp',
      user_agent: userAgent,
    })

    if (error) {
      console.error('[POST /api/join] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/join] Unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
