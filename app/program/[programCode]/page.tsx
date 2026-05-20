import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProgramPageClient from './ProgramPageClient'

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

  // Get group counts
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

  return { program, courses: courses ?? [], groupCounts }
}

export default async function ProgramPage({ params }: Props) {
  const { programCode } = await params
  const data = await getProgramData(programCode.toUpperCase())
  if (!data) notFound()

  return <ProgramPageClient {...data} />
}

export async function generateStaticParams() {
  const { data } = await supabase.from('programs').select('code')
  return (data ?? []).map(p => ({ programCode: p.code }))
}
