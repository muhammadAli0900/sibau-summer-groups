import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      course_id,
      group_name,
      platform,
      invite_link,
      added_by,
      is_manual,
      course_name_manual,
      manual_course_code,
      manual_program_id,
      manual_semester_number,
    } = body

    if (!group_name || !platform || !invite_link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!invite_link.startsWith('https://chat.whatsapp.com/') && !invite_link.startsWith('https://t.me/')) {
      return NextResponse.json(
        { error: 'Invite link must start with https://chat.whatsapp.com/ or https://t.me/' },
        { status: 400 }
      )
    }

    if (!is_manual && !course_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let resolvedCourseId: string = course_id

    if (is_manual && course_name_manual?.trim()) {
      const trimmedTitle = course_name_manual.trim()
      let existingCourseId: string | null = null

      // Check if a course with this name already exists under the selected program
      if (manual_program_id) {
        const { data: existing } = await adminSupabase
          .from('courses')
          .select('id')
          .eq('program_id', manual_program_id)
          .ilike('title', trimmedTitle)
          .maybeSingle()
        if (existing) existingCourseId = existing.id
      }

      if (!existingCourseId) {
        const { data: newCourse, error: courseError } = await adminSupabase
          .from('courses')
          .insert({
            program_id: manual_program_id || null,
            code: manual_course_code?.trim() || 'OTHER',
            title: trimmedTitle,
            semester_number: manual_semester_number ? parseInt(manual_semester_number) : null,
            credit_hours: '3',
          })
          .select('id')
          .single()

        if (courseError) {
          console.error('[POST /api/groups] Course creation error:', courseError)
          return NextResponse.json({ error: courseError.message }, { status: 500 })
        }
        existingCourseId = newCourse?.id ?? null
      }

      if (!existingCourseId) {
        return NextResponse.json({ error: 'Could not resolve course' }, { status: 500 })
      }
      resolvedCourseId = existingCourseId
    }

    if (!resolvedCourseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from('groups')
      .insert({
        course_id: resolvedCourseId,
        group_name,
        platform,
        invite_link,
        added_by: added_by || null,
        is_manual: is_manual || false,
        course_name_manual: course_name_manual || null,
      })
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
