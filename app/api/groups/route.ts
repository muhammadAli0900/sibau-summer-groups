import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { course_id, group_name, platform, invite_link, added_by } = body

    if (!course_id || !group_name || !platform || !invite_link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!invite_link.startsWith('https://chat.whatsapp.com/') && !invite_link.startsWith('https://t.me/')) {
      return NextResponse.json(
        { error: 'Invite link must start with https://chat.whatsapp.com/ or https://t.me/' },
        { status: 400 }
      )
    }

    const { data, error } = await adminSupabase
      .from('groups')
      .insert({ course_id, group_name, platform, invite_link, added_by: added_by || null })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/groups] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ group: data })
  } catch (err) {
    console.error('[POST /api/groups] Unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
