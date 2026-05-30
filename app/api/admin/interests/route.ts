import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: raw } = await adminSupabase
      .from('course_interests')
      .select('id, course_id, cms_id, course_name_manual, created_at, courses(title, code, programs(name, code))')
      .order('created_at', { ascending: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interests = (raw ?? []).map((i: any) => ({
      id: i.id,
      course_id: i.course_id,
      course_title: i.courses?.title ?? i.course_name_manual ?? 'Manual Entry',
      course_code: i.courses?.code ?? '',
      program_name: i.courses?.programs?.name ?? '—',
      program_code: i.courses?.programs?.code ?? '—',
      cms_id: i.cms_id,
      created_at: i.created_at,
    }))

    const total = interests.length

    const courseCounts: Record<string, { count: number; title: string; program_code: string }> = {}
    for (const i of interests) {
      if (!i.course_id) continue
      if (!courseCounts[i.course_id]) {
        courseCounts[i.course_id] = { count: 0, title: i.course_title, program_code: i.program_code }
      }
      courseCounts[i.course_id].count++
    }

    const highInterestIds = Object.entries(courseCounts)
      .filter(([, { count }]) => count >= 5)
      .map(([id]) => id)

    let actionNeeded: { course_id: string; title: string; program_code: string; interest_count: number }[] = []
    if (highInterestIds.length > 0) {
      const { data: groups } = await adminSupabase
        .from('groups')
        .select('course_id')
        .in('course_id', highInterestIds)
      const withGroups = new Set((groups ?? []).map(g => g.course_id))
      actionNeeded = highInterestIds
        .filter(id => !withGroups.has(id))
        .map(id => ({
          course_id: id,
          title: courseCounts[id].title,
          program_code: courseCounts[id].program_code,
          interest_count: courseCounts[id].count,
        }))
    }

    const sortedCourses = Object.entries(courseCounts).sort(([, a], [, b]) => b.count - a.count)
    const mostInterested = sortedCourses[0]

    return NextResponse.json({
      interests,
      stats: {
        total,
        actionNeeded,
        mostInterested: mostInterested
          ? { title: mostInterested[1].title, count: mostInterested[1].count }
          : null,
      },
    })
  } catch (err) {
    console.error('[GET /api/admin/interests]', err)
    return NextResponse.json({ interests: [], stats: { total: 0, actionNeeded: [], mostInterested: null } })
  }
}
