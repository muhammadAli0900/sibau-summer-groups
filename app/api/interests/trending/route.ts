import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: interests } = await adminSupabase
      .from('course_interests')
      .select('course_id')

    if (!interests?.length) return NextResponse.json({ courses: [] })

    const counts: Record<string, number> = {}
    for (const i of interests) {
      if (i.course_id) counts[i.course_id] = (counts[i.course_id] ?? 0) + 1
    }

    const top8 = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)

    if (!top8.length) return NextResponse.json({ courses: [] })

    const topIds = top8.map(([id]) => id)

    const [coursesRes, groupsRes] = await Promise.all([
      adminSupabase.from('courses').select('id, code, title, programs(id, name, code, color)').in('id', topIds),
      adminSupabase.from('groups').select('course_id').in('course_id', topIds),
    ])

    const groupCounts: Record<string, number> = {}
    for (const g of groupsRes.data ?? []) {
      groupCounts[g.course_id] = (groupCounts[g.course_id] ?? 0) + 1
    }

    const result = top8.map(([courseId, count]) => {
      const course = coursesRes.data?.find(c => c.id === courseId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prog: any = Array.isArray(course?.programs) ? course!.programs[0] : course?.programs
      return {
        course_id: courseId,
        title: course?.title ?? '',
        code: course?.code ?? '',
        program_name: prog?.name ?? '',
        program_color: prog?.color ?? '#c9a96e',
        program_code: prog?.code ?? '',
        interest_count: count,
        group_count: groupCounts[courseId] ?? 0,
      }
    }).filter(c => c.title)

    return NextResponse.json({ courses: result })
  } catch {
    return NextResponse.json({ courses: [] })
  }
}
