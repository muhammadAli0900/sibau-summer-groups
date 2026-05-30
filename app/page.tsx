export const revalidate = 0

import { supabase, adminSupabase } from '@/lib/supabase'
import HeroSearch from '@/components/HeroSearch'
import ProgramCards from '@/components/ProgramCards'
import StatsSection from '@/components/StatsSection'
import HowItWorks from '@/components/HowItWorks'
import TrendingCourses, { TrendingCourse } from '@/components/TrendingCourses'

async function getStats() {
  const [groupsRes, coursesRes, joinsRes] = await Promise.all([
    supabase.from('groups').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('join_logs').select('id', { count: 'exact', head: true }),
  ])
  return {
    groups: groupsRes.count ?? 0,
    courses: coursesRes.count ?? 0,
    joins: joinsRes.count ?? 0,
  }
}

async function getPrograms() {
  const { data: programs } = await supabase.from('programs').select('*').order('name')
  if (!programs?.length) return []
  const { data: courseRows } = await supabase.from('courses').select('program_id')
  const counts: Record<string, number> = {}
  for (const c of courseRows ?? []) {
    counts[c.program_id] = (counts[c.program_id] ?? 0) + 1
  }
  return programs.map(p => ({ ...p, course_count: counts[p.id] ?? 0 }))
}

async function getTrendingCourses(): Promise<TrendingCourse[]> {
  const { data: interests } = await adminSupabase
    .from('course_interests')
    .select('course_id')

  if (!interests?.length) return []

  const counts: Record<string, number> = {}
  for (const i of interests) {
    if (i.course_id) counts[i.course_id] = (counts[i.course_id] ?? 0) + 1
  }

  const top8 = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  if (!top8.length) return []

  const topIds = top8.map(([id]) => id)

  const [coursesRes, groupsRes] = await Promise.all([
    supabase.from('courses').select('id, code, title, programs(id, name, code, color)').in('id', topIds),
    supabase.from('groups').select('course_id').in('course_id', topIds),
  ])

  const groupCounts: Record<string, number> = {}
  for (const g of groupsRes.data ?? []) {
    groupCounts[g.course_id] = (groupCounts[g.course_id] ?? 0) + 1
  }

  return top8.map(([courseId, count]) => {
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
}

export default async function HomePage() {
  const [stats, programs, trending] = await Promise.all([
    getStats(),
    getPrograms(),
    getTrendingCourses(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#1a1410' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{
              backgroundColor: 'rgba(201,169,110,0.08)',
              border: '1px solid rgba(201,169,110,0.2)',
              color: '#c9a96e',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c9a96e' }} />
            Sukkur IBA University &mdash; Summer 2026
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold mb-4 leading-tight tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
          >
            Find Your Summer Course Group
          </h1>
          <p
            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
          >
            Students repeating or improving a course need at least 5 classmates to register for a summer course. Search your course, join the WhatsApp group, coordinate together.
          </p>
          <HeroSearch />
        </div>
      </section>

      <StatsSection stats={stats} />

      {/* Trending Courses (only shown if there are interests) */}
      <TrendingCourses courses={trending} />

      <HowItWorks />

      {/* Programs */}
      <section id="programs" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
          >
            Browse by Program
          </h2>
          <p className="text-sm mb-10" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
            Select your program to find course groups
          </p>
          <ProgramCards programs={programs} />
        </div>
      </section>
    </div>
  )
}
