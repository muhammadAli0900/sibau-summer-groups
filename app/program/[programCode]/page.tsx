import { supabase, adminSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProgramPageClient from './ProgramPageClient'

export const revalidate = 0

type Props = { params: Promise<{ programCode: string }> }

async function getProgramData(code: string) {
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('code', code)
    .single()

  if (!program) return null

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('program_id', program.id)
    .order('semester_number', { ascending: true, nullsFirst: false })
    .order('code')

  const courseIds = (courses ?? []).map(c => c.id)

  let groupCounts: Record<string, number> = {}
  let interestCounts: Record<string, number> = {}

  if (courseIds.length > 0) {
    const [groupsRes, interestsRes] = await Promise.all([
      supabase.from('groups').select('course_id').in('course_id', courseIds),
      adminSupabase.from('course_interests').select('course_id').in('course_id', courseIds),
    ])
    for (const g of groupsRes.data ?? []) {
      groupCounts[g.course_id] = (groupCounts[g.course_id] ?? 0) + 1
    }
    for (const i of interestsRes.data ?? []) {
      interestCounts[i.course_id] = (interestCounts[i.course_id] ?? 0) + 1
    }
  }

  return { program, courses: courses ?? [], groupCounts, interestCounts }
}

export default async function ProgramPage({ params }: Props) {
  const { programCode } = await params
  const data = await getProgramData(programCode)
  if (!data) notFound()

  return <ProgramPageClient {...data} />
}

export async function generateStaticParams() {
  const { data } = await supabase.from('programs').select('code')
  return (data ?? []).map(p => ({ programCode: p.code }))
}
