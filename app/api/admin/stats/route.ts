import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase'

export async function GET() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

  const [groupsRes, joinsRes, todayRes, weekRes, logsRes] = await Promise.all([
    adminSupabase.from('groups').select('id', { count: 'exact', head: true }),
    adminSupabase.from('join_logs').select('id', { count: 'exact', head: true }),
    adminSupabase.from('join_logs').select('id', { count: 'exact', head: true }).gte('joined_at', startOfDay),
    adminSupabase.from('join_logs').select('id', { count: 'exact', head: true }).gte('joined_at', startOfWeek),
    adminSupabase.from('join_logs').select('group_id, group_name'),
  ])

  const groupCounts: Record<string, { name: string; count: number }> = {}
  for (const log of logsRes.data ?? []) {
    if (!groupCounts[log.group_id]) groupCounts[log.group_id] = { name: log.group_name, count: 0 }
    groupCounts[log.group_id].count++
  }
  const sorted = Object.values(groupCounts).sort((a, b) => b.count - a.count)
  const mostJoined = sorted[0] ? { group_name: sorted[0].name, count: sorted[0].count } : null

  return NextResponse.json({
    stats: {
      totalGroups: groupsRes.count ?? 0,
      totalJoins: joinsRes.count ?? 0,
      joinsToday: todayRes.count ?? 0,
      joinsThisWeek: weekRes.count ?? 0,
      mostJoined,
    },
  })
}
