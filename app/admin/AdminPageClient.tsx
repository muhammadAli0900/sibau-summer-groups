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

const cardStyle = {
  backgroundColor: '#231c15',
  border: '1px solid #3d3020',
  borderRadius: 12,
}

const tableHeaderStyle = {
  color: '#c9a96e',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  padding: '12px 16px',
  textAlign: 'left' as const,
  borderBottom: '1px solid #3d3020',
  fontSize: 13,
}

const tableCellStyle = {
  color: '#f0e6d3',
  fontFamily: "'DM Sans', sans-serif",
  padding: '12px 16px',
  borderBottom: '1px solid #3d3020',
  fontSize: 14,
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

  /* ── Login screen ── */
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#1a1410' }}
      >
        <div className="w-full max-w-sm p-8 rounded-2xl" style={cardStyle}>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-6"
            style={{ backgroundColor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}
          >
            <Lock className="w-6 h-6" style={{ color: '#c9a96e' }} />
          </div>
          <h1
            className="text-xl font-bold text-center mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
          >
            Admin Access
          </h1>
          <p
            className="text-sm text-center mb-6"
            style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
          >
            Enter your password to continue
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
              style={{
                backgroundColor: '#1a1410',
                border: '1px solid #3d3020',
                color: '#f0e6d3',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => (e.target.style.borderColor = '#c9a96e')}
              onBlur={e => (e.target.style.borderColor = '#3d3020')}
            />
            {authError && (
              <p className="text-sm" style={{ color: '#c47a7a', fontFamily: "'DM Sans', sans-serif" }}>
                {authError}
              </p>
            )}
            <button
              type="submit"
              className="w-full font-semibold py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: '#c9a96e',
                color: '#1a1410',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#1a1410' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
            >
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              IBA Summer Course Groups
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: '#2a2118',
                border: '1px solid #3d3020',
                color: '#8a7560',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: '#2a2118',
                border: '1px solid #3d3020',
                color: '#8a7560',
                fontFamily: "'DM Sans', sans-serif",
              }}
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
              { label: 'Total Groups', value: stats.totalGroups, icon: MessageCircle },
              { label: 'Total Joins', value: stats.totalJoins, icon: Users },
              { label: 'Joins Today', value: stats.joinsToday, icon: Calendar },
              { label: 'Joins This Week', value: stats.joinsThisWeek, icon: TrendingUp },
            ].map(item => (
              <div key={item.label} className="p-5 rounded-2xl" style={cardStyle}>
                <item.icon className="w-5 h-5 mb-3" style={{ color: '#c9a96e' }} />
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}
                >
                  {item.value}
                </div>
                <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {stats?.mostJoined && (
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-8"
            style={{
              backgroundColor: 'rgba(201,169,110,0.06)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}
          >
            <TrendingUp className="w-5 h-5 shrink-0" style={{ color: '#c9a96e' }} />
            <div>
              <span className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                Most joined group:{' '}
              </span>
              <span className="font-semibold" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>
                {stats.mostJoined.group_name}
              </span>
              <span className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                {' '}— {stats.mostJoined.count} joins
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex gap-0 mb-6"
          style={{ borderBottom: '1px solid #3d3020' }}
        >
          {(['overview', 'joins', 'groups'] as const).map(tab => {
            const isActive = activeTab === tab
            const label = tab === 'overview' ? 'Overview'
              : tab === 'joins' ? `Join Logs (${joinLogs.length})`
              : `Groups (${groups.length})`
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2.5 text-sm border-b-2 -mb-px transition-all duration-200"
                style={{
                  borderBottomColor: isActive ? '#c9a96e' : 'transparent',
                  color: isActive ? '#c9a96e' : '#8a7560',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  background: 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div
            className="text-center py-12"
            style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
          >
            <p>
              Select{' '}
              <strong style={{ color: '#e8d5b0' }}>Join Logs</strong>
              {' '}or{' '}
              <strong style={{ color: '#e8d5b0' }}>Groups</strong>
              {' '}tabs to manage data.
            </p>
          </div>
        )}

        {/* Join Logs */}
        {activeTab === 'joins' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
              >
                Join Logs
              </h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: '#2a2118',
                  border: '1px solid #3d3020',
                  color: '#8a7560',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Course</th>
                      <th style={tableHeaderStyle}>Program</th>
                      <th style={tableHeaderStyle}>Group</th>
                      <th style={tableHeaderStyle}>Platform</th>
                      <th style={tableHeaderStyle}>Joined At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinLogs.map(log => (
                      <tr
                        key={log.id}
                        className="transition-colors duration-150 hover:bg-[#2a2118]"
                      >
                        <td style={tableCellStyle}>{log.course_title}</td>
                        <td style={{ ...tableCellStyle }}>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(201,169,110,0.1)',
                              color: '#c9a96e',
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {log.program_code}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, color: '#8a7560' }}>{log.group_name}</td>
                        <td style={tableCellStyle}>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(74,122,90,0.15)',
                              color: '#a0d4b0',
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {log.platform}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, color: '#8a7560' }}>
                          {new Date(log.joined_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {joinLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10"
                          style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}
                        >
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
            <h2
              className="text-lg font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
            >
              All Groups
            </h2>
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Group Name</th>
                      <th style={tableHeaderStyle}>Course</th>
                      <th style={tableHeaderStyle}>Platform</th>
                      <th style={tableHeaderStyle}>Created</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <tr
                        key={group.id}
                        className="transition-colors duration-150 hover:bg-[#2a2118]"
                      >
                        <td style={{ ...tableCellStyle, fontWeight: 500 }}>{group.group_name}</td>
                        <td style={{ ...tableCellStyle, color: '#8a7560' }}>{group.course_title ?? '—'}</td>
                        <td style={tableCellStyle}>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(74,122,90,0.15)',
                              color: '#a0d4b0',
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {group.platform}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, color: '#8a7560' }}>
                          {new Date(group.created_at).toLocaleDateString()}
                        </td>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-1.5 rounded-lg transition-colors duration-150"
                            style={{
                              backgroundColor: 'rgba(122,74,74,0.15)',
                              color: '#d4a0a0',
                            }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(122,74,74,0.3)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(122,74,74,0.15)')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {groups.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-10"
                          style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}
                        >
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
      </div>
    </div>
  )
}
