export const revalidate = 0

import { supabase } from '@/lib/supabase'
import HeroSearch from '@/components/HeroSearch'
import ProgramCards from '@/components/ProgramCards'
import StatsSection from '@/components/StatsSection'
import HowItWorks from '@/components/HowItWorks'

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

export default async function HomePage() {
  const [stats, programs] = await Promise.all([getStats(), getPrograms()])

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 px-4 hero-gradient-anim">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Sukkur IBA University &mdash; Summer 2026
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Find Your Summer
            <span className="text-blue-400"> Course Group</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Students repeating or improving a course need at least 5 classmates to register for a summer course. Find your course, join the WhatsApp group, and coordinate together.
          </p>
          <HeroSearch />
        </div>
      </section>

      <StatsSection stats={stats} />
      <HowItWorks />

      {/* Programs */}
      <section id="programs" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}
          >
            Browse by Program
          </h2>
          <p className="text-slate-500 text-sm mb-10">Select your program to find course groups</p>
          <ProgramCards programs={programs} />
        </div>
      </section>
    </div>
  )
}
