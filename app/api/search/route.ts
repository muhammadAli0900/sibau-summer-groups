import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id, code, title, semester_number, credit_hours,
      programs (id, code, name, color)
    `)
    .or(`title.ilike.%${q}%,code.ilike.%${q}%`)
    .limit(30)

  if (error) return NextResponse.json({ results: [] }, { status: 500 })

  // Get group counts for each course
  const courseIds = (courses ?? []).map(c => c.id)
  let groupCounts: Record<string, number> = {}
  if (courseIds.length > 0) {
    const { data: groups } = await supabase
      .from('groups')
      .select('course_id')
      .in('course_id', courseIds)
    for (const g of groups ?? []) {
      groupCounts[g.course_id] = (groupCounts[g.course_id] ?? 0) + 1
    }
  }

  const results = (courses ?? []).map(c => {
    const prog = Array.isArray(c.programs) ? c.programs[0] : c.programs
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      semester_number: c.semester_number,
      credit_hours: c.credit_hours,
      group_count: groupCounts[c.id] ?? 0,
      program_code: prog?.code ?? '',
      program_name: prog?.name ?? '',
      program_color: prog?.color ?? '#3b82f6',
    }
  })

  return NextResponse.json({ results })
}
