import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function GET() {
  const { data: groups, error } = await adminSupabase
    .from('groups')
    .select(`
      id, group_name, platform, invite_link, created_at,
      courses (title, programs (code))
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ groups: [], error: error.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (groups ?? []).map((g: any) => {
    const course = Array.isArray(g.courses) ? g.courses[0] : g.courses
    const prog = course
      ? (Array.isArray(course.programs) ? course.programs[0] : course.programs)
      : null
    return {
      id: g.id,
      group_name: g.group_name,
      platform: g.platform,
      invite_link: g.invite_link,
      created_at: g.created_at,
      course_title: course?.title ?? null,
      program_code: prog?.code ?? null,
    }
  })

  return NextResponse.json({ groups: result })
}
