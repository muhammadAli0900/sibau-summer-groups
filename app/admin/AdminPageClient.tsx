'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, LogOut, Trash2, Download, RefreshCw, Users, MessageCircle, TrendingUp, Calendar } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

type JoinLog = {
  id: string
  course_title: string
  program_code: string
  group_name: string
  platform: string
  joined_at: string
  user_agent: string | null
}

type Group = {
  id: string
  group_name: string
  platform: string
  invite_link: string
  created_at: string
  course_title?: string
  program_code?: string
}

type Stats = {
  totalGroups: number
  totalJoins: number
  joinsToday: number
  joinsThisWeek: number
  mostJoined: { group_name: string; count: number } | null
}

export default function AdminPageClient() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'joins' | 'groups'>('overview')
  const [joinLogs, setJoinLogs] = useState<JoinLog[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('admin_auth')
      if (saved === 'true') setAuthed(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HINT ?? ''
    // Check via API to keep password server-side
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(r => r.json()).then(data => {
      if (data.ok) {
        sessionStorage.setItem('admin_auth', 'true')
        setAuthed(true)
        setAuthError('')
      } else {
        setAuthError('Incorrect password')
      }
    }).catch(() => setAuthError('Error checking password'))
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [joinsRes, groupsRes, statsRes] = await Promise.all([
        fetch('/api/admin/joins'),
        fetch('/api/admin/groups-list'),
        fetch('/api/admin/stats'),
      ])
      const [joinsData, groupsData, statsData] = await Promise.all([
        joinsRes.json(), groupsRes.json(), statsRes.json()
      ])
      setJoinLogs(joinsData.logs ?? [])
      setGroups(groupsData.groups ?? [])
      setStats(statsData.stats ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed, loadData])

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this group?')) return
    const res = await fetch(`/api/admin/groups?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setGroups(prev => prev.filter(g => g.id !== id))
      showToast('Group deleted', 'success')
    } else {
      showToast('Failed to delete group', 'error')
    }
  }

  const exportCSV = () => {
    const headers = ['Course', 'Program', 'Group', 'Platform', 'Joined At', 'User Agent']
    const rows = joinLogs.map(l => [
      `"${l.course_title}"`,
      l.program_code,
      `"${l.group_name}"`,
      l.platform,
      l.joined_at,
      `"${l.user_agent ?? ''}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `join-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 w-full max-w-sm">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1
            className="text-xl font-bold text-white text-center mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Admin Access
          </h1>
          <p className="text-slate-400 text-sm text-center mb-6">Enter your password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-extrabold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">IBA Summer Course Groups</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Groups', value: stats.totalGroups, icon: MessageCircle, color: 'text-blue-400' },
              { label: 'Total Joins', value: stats.totalJoins, icon: Users, color: 'text-emerald-400' },
              { label: 'Joins Today', value: stats.joinsToday, icon: Calendar, color: 'text-yellow-400' },
              { label: 'Joins This Week', value: stats.joinsThisWeek, icon: TrendingUp, color: 'text-purple-400' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
                <item.icon className={`w-5 h-5 ${item.color} mb-3`} />
                <div
                  className="text-2xl font-extrabold text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.value}
                </div>
                <div className="text-slate-400 text-sm mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.mostJoined && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-sm">Most joined group: </span>
              <span className="text-white font-semibold">{stats.mostJoined.group_name}</span>
              <span className="text-slate-400 text-sm"> — {stats.mostJoined.count} joins</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
          {(['overview', 'joins', 'groups'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'joins' ? `Join Logs (${joinLogs.length})` : `Groups (${groups.length})`}
            </button>
          ))}
        </div>

        {/* Join Logs */}
        {activeTab === 'joins' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Join Logs
              </h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-2 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Course</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Program</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Group</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Platform</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Joined At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinLogs.map(log => (
                      <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-white">{log.course_title}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                            {log.program_code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{log.group_name}</td>
                        <td className="px-4 py-3">
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                            {log.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(log.joined_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {joinLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-500 py-10">
                          No join logs yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Groups */}
        {activeTab === 'groups' && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              All Groups
            </h2>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Group Name</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Course</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Platform</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Created</th>
                      <th className="text-left text-slate-400 font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <tr key={group.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-white font-medium">{group.group_name}</td>
                        <td className="px-4 py-3 text-slate-300">{group.course_title ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                            {group.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(group.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {groups.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-slate-500 py-10">
                          No groups yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="text-slate-400 text-center py-10">
            <p>Select <strong className="text-slate-200">Join Logs</strong> or <strong className="text-slate-200">Groups</strong> tabs to manage data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
