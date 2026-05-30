import { NextRequest, NextResponse } from 'next/server'
import { supabase, adminSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('course_id')
  if (!courseId) return NextResponse.json({ count: 0 })

  const { count } = await supabase
    .from('course_interests')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', courseId)

  return NextResponse.json({ count: count ?? 0 })
}

export async function POST(request: NextRequest) {
  try {
    const { course_id, cms_id, course_name_manual } = await request.json()

    if (!cms_id?.trim()) {
      return NextResponse.json(
        { error: 'cms_id_required', message: 'Please enter your CMS ID' },
        { status: 400 }
      )
    }

    if (!course_id && !course_name_manual) {
      return NextResponse.json({ error: 'course_required', message: 'Course is required' }, { status: 400 })
    }

    const { data: existing } = await adminSupabase
      .from('course_interests')
      .select('id')
      .eq('course_id', course_id)
      .eq('cms_id', cms_id.trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'already_registered', message: 'You have already registered interest for this course' },
        { status: 409 }
      )
    }

    const { error } = await adminSupabase.from('course_interests').insert({
      course_id: course_id ?? null,
      cms_id: cms_id.trim(),
      course_name_manual: course_name_manual ?? null,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'already_registered', message: 'You have already registered interest for this course' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { count } = await adminSupabase
      .from('course_interests')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', course_id)

    return NextResponse.json({ success: true, count: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
