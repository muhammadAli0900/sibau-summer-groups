import { supabase, adminSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CoursePageClient from './CoursePageClient'

export const revalidate = 0

type Props = { params: Promise<{ id: string }> }

async function getCourseData(id: string) {
  const { data: course } = await supabase
    .from('courses')
    .select('*, programs(*)')
    .eq('id', id)
    .single()

  if (!course) return null

  const { data: siblings } = await supabase
    .from('courses')
    .select('*, programs(*)')
    .eq('title', course.title)

  const siblingIds = (siblings ?? []).map(c => c.id)
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .in('course_id', siblingIds)
    .order('created_at', { ascending: false })

  const groupIds = (groups ?? []).map(g => g.id)
  let joinCounts: Record<string, number> = {}
  if (groupIds.length > 0) {
    const { data: joins } = await supabase
      .from('join_logs')
      .select('group_id')
      .in('group_id', groupIds)
    for (const j of joins ?? []) {
      joinCounts[j.group_id] = (joinCounts[j.group_id] ?? 0) + 1
    }
  }

  const { count: interestCount } = await adminSupabase
    .from('course_interests')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', id)

  return {
    course,
    siblings: siblings ?? [],
    groups: groups ?? [],
    joinCounts,
    interestCount: interestCount ?? 0,
  }
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params
  const data = await getCourseData(id)
  if (!data) notFound()

  return <CoursePageClient {...data} />
}
