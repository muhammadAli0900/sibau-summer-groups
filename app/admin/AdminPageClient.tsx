'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, LogOut, Trash2, Download, RefreshCw, Users, MessageCircle, TrendingUp, Calendar, Star, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
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

type InterestRow = {
  id: string
  course_id: string | null
  course_title: string
  course_code: string
  program_name: string
  program_code: string
  cms_id: string
  created_at: string
}

type InterestStats = {
  total: number
  actionNeeded: { course_id: string; title: string; program_code: string; interest_count: number }[]
  mostInterested: { title: string; count: number } | null
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

const thStyle = {
  color: '#c9a96e',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  padding: '12px 16px',
  textAlign: 'left' as const,
  borderBottom: '1px solid #3d3020',
  fontSize: 13,
}

const tdStyle = {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'joins' | 'groups' | 'interests'>('overview')

  const [joinLogs, setJoinLogs] = useState<JoinLog[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  const [interestRows, setInterestRows] = useState<InterestRow[]>([])
  const [interestStats, setInterestStats] = useState<InterestStats | null>(null)
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestLoaded, setInterestLoaded] = useState(false)
  const [interestFilter, setInterestFilter] = useState('')
  const [interestProgramFilter, setInterestProgramFilter] = useState('')

  const { showToast } = useToast()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_auth') === 'true') setAuthed(true)
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

  const loadInterestData = useCallback(async () => {
    setInterestLoading(true)
    try {
      const res = await fetch('/api/admin/interests')
      const data = await res.json()
      setInterestRows(data.interests ?? [])
      setInterestStats(data.stats ?? null)
      setInterestLoaded(true)
    } finally {
      setInterestLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadData()
  }, [authed, loadData])

  useEffect(() => {
    if (authed && activeTab === 'interests' && !interestLoaded) {
      loadInterestData()
    }
  }, [authed, activeTab, interestLoaded, loadInterestData])

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

  const exportJoinsCSV = () => {
    const headers = ['Course', 'Program', 'Group', 'Platform', 'Joined At']
    const rows = joinLogs.map(l => [
      `"${l.course_title}"`, l.program_code, `"${l.group_name}"`, l.platform, l.joined_at,
    ])
    downloadCSV([headers, ...rows], `join-logs-${today()}`)
  }

  const exportInterestsCSV = () => {
    const headers = ['Course Name', 'Course Code', 'Program', 'CMS ID', 'Date Registered']
    const filtered = filteredInterests()
    const rows = filtered.map(i => [
      `"${i.course_title}"`, i.course_code, i.program_code, `"${i.cms_id}"`, i.created_at,
    ])
    downloadCSV([headers, ...rows], `interests-${today()}`)
  }

  const downloadCSV = (data: string[][], filename: string) => {
    const csv = data.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const today = () => new Date().toISOString().slice(0, 10)

  const filteredInterests = () => {
    let rows = interestRows
    if (interestProgramFilter) rows = rows.filter(r => r.program_code === interestProgramFilter)
    if (interestFilter) {
      const q = interestFilter.toLowerCase()
      rows = rows.filter(r =>
        r.course_title.toLowerCase().includes(q) ||
        r.cms_id.toLowerCase().includes(q)
      )
    }
    return rows
  }

  const uniquePrograms = [...new Set(interestRows.map(r => r.program_code).filter(Boolean))]

  /* ── Login ── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1a1410' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl" style={cardStyle}>
          <div className="w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-6"
            style={{ backgroundColor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
            <Lock className="w-6 h-6" style={{ color: '#c9a96e' }} />
          </div>
          <h1 className="text-xl font-bold text-center mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>
            Admin Access
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
            Enter your password to continue
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#1a1410', border: '1px solid #3d3020', color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
              onFocus={e => (e.target.style.borderColor = '#c9a96e')}
              onBlur={e => (e.target.style.borderColor = '#3d3020')}
            />
            {authError && <p className="text-sm" style={{ color: '#c47a7a', fontFamily: "'DM Sans', sans-serif" }}>{authError}</p>}
            <button type="submit" className="w-full font-semibold py-3 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#c9a96e', color: '#1a1410', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}>
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ── Dashboard ── */
  const tabDef = [
    { key: 'overview', label: 'Overview' },
    { key: 'joins', label: `Join Logs (${joinLogs.length})` },
    { key: 'groups', label: `Groups (${groups.length})` },
    { key: 'interests', label: `Interests (${interestStats?.total ?? '…'})` },
  ] as const

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#1a1410' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              IBA Summer Course Groups
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              <LogOut className="w-4 h-4" /> Logout
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
                <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}>
                  {item.value}
                </div>
                <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.mostJoined && (
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-8"
            style={{ backgroundColor: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)' }}>
            <TrendingUp className="w-5 h-5 shrink-0" style={{ color: '#c9a96e' }} />
            <div>
              <span className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>Most joined group: </span>
              <span className="font-semibold" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>{stats.mostJoined.group_name}</span>
              <span className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}> — {stats.mostJoined.count} joins</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid #3d3020' }}>
          {tabDef.map(({ key, label }) => {
            const isActive = activeTab === key
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className="px-4 py-2.5 text-sm border-b-2 -mb-px transition-all duration-200"
                style={{
                  borderBottomColor: isActive ? '#c9a96e' : 'transparent',
                  color: isActive ? '#c9a96e' : '#8a7560',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  background: 'none',
                }}>
                {label}
              </button>
            )
          })}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="text-center py-12" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
            <p>Select <strong style={{ color: '#e8d5b0' }}>Join Logs</strong>, <strong style={{ color: '#e8d5b0' }}>Groups</strong>, or <strong style={{ color: '#e8d5b0' }}>Interests</strong> tabs to manage data.</p>
          </div>
        )}

        {/* Join Logs */}
        {activeTab === 'joins' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>Join Logs</h2>
              <button onClick={exportJoinsCSV}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr><th style={thStyle}>Course</th><th style={thStyle}>Program</th><th style={thStyle}>Group</th><th style={thStyle}>Platform</th><th style={thStyle}>Joined At</th></tr>
                  </thead>
                  <tbody>
                    {joinLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#2a2118] transition-colors">
                        <td style={tdStyle}>{log.course_title}</td>
                        <td style={tdStyle}>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,169,110,0.1)', color: '#c9a96e' }}>{log.program_code}</span>
                        </td>
                        <td style={{ ...tdStyle, color: '#8a7560' }}>{log.group_name}</td>
                        <td style={tdStyle}>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,122,90,0.15)', color: '#a0d4b0' }}>{log.platform}</span>
                        </td>
                        <td style={{ ...tdStyle, color: '#8a7560' }}>{new Date(log.joined_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {joinLogs.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>No join logs yet</td></tr>
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
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>All Groups</h2>
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr><th style={thStyle}>Group Name</th><th style={thStyle}>Course</th><th style={thStyle}>Platform</th><th style={thStyle}>Created</th><th style={thStyle}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {groups.map(group => (
                      <tr key={group.id} className="hover:bg-[#2a2118] transition-colors">
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{group.group_name}</td>
                        <td style={{ ...tdStyle, color: '#8a7560' }}>{group.course_title ?? '—'}</td>
                        <td style={tdStyle}>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,122,90,0.15)', color: '#a0d4b0' }}>{group.platform}</span>
                        </td>
                        <td style={{ ...tdStyle, color: '#8a7560' }}>{new Date(group.created_at).toLocaleDateString()}</td>
                        <td style={tdStyle}>
                          <button onClick={() => handleDeleteGroup(group.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ backgroundColor: 'rgba(122,74,74,0.15)', color: '#d4a0a0' }}
                            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(122,74,74,0.3)')}
                            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(122,74,74,0.15)')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {groups.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>No groups yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Interests */}
        {activeTab === 'interests' && (
          <div>
            {interestLoading && (
              <div className="text-center py-12" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
            )}

            {!interestLoading && interestLoaded && (
              <>
                {/* Interest stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <Star className="w-5 h-5 mb-3" style={{ color: '#c9a96e' }} />
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}>
                      {interestStats?.total ?? 0}
                    </div>
                    <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>Total Interests</div>
                  </div>
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <AlertTriangle className="w-5 h-5 mb-3" style={{ color: '#c9a96e' }} />
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}>
                      {interestStats?.actionNeeded.length ?? 0}
                    </div>
                    <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>Courses needing a group</div>
                  </div>
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <TrendingUp className="w-5 h-5 mb-3" style={{ color: '#c9a96e' }} />
                    <div className="text-sm font-semibold mt-1 leading-snug" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>
                      {interestStats?.mostInterested?.title ?? '—'}
                    </div>
                    <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                      {interestStats?.mostInterested ? `${interestStats.mostInterested.count} interested` : 'Most interested course'}
                    </div>
                  </div>
                </div>

                {/* Action needed */}
                {(interestStats?.actionNeeded.length ?? 0) > 0 && (
                  <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.25)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" style={{ color: '#c9a96e' }} />
                      <h3 className="font-semibold text-sm" style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}>
                        Action Needed — Courses with 5+ interest but no group
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {interestStats!.actionNeeded.map(c => (
                        <div key={c.course_id} className="flex items-center justify-between gap-4 py-1">
                          <div>
                            <span className="text-sm font-medium" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>{c.title}</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,169,110,0.1)', color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}>{c.program_code}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold" style={{ color: '#c9a96e', fontFamily: "'Playfair Display', serif" }}>{c.interest_count} interested</span>
                            <Link
                              href={`/course/${c.course_id}`}
                              target="_blank"
                              className="text-xs underline"
                              style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filters + table */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>
                    All Interests
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={interestProgramFilter}
                      onChange={e => setInterestProgramFilter(e.target.value)}
                      className="text-sm rounded-lg px-3 py-2 outline-none"
                      style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <option value="">All programs</option>
                      {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input
                      type="text"
                      value={interestFilter}
                      onChange={e => setInterestFilter(e.target.value)}
                      placeholder="Search course or CMS ID..."
                      className="text-sm rounded-lg px-3 py-2 outline-none"
                      style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif", minWidth: 200 }}
                      onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                      onBlur={e => (e.target.style.borderColor = '#3d3020')}
                    />
                    <button onClick={exportInterestsCSV}
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                      style={{ backgroundColor: '#2a2118', border: '1px solid #3d3020', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th style={thStyle}>Course Name</th>
                          <th style={thStyle}>Program</th>
                          <th style={thStyle}>CMS ID</th>
                          <th style={thStyle}>Date Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInterests().map(row => (
                          <tr key={row.id} className="hover:bg-[#2a2118] transition-colors">
                            <td style={tdStyle}>
                              <div style={{ color: '#f0e6d3' }}>{row.course_title}</div>
                              {row.course_code && (
                                <div className="text-xs mt-0.5" style={{ color: '#5a4a38' }}>{row.course_code}</div>
                              )}
                            </td>
                            <td style={tdStyle}>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,169,110,0.1)', color: '#c9a96e' }}>{row.program_code}</span>
                            </td>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{row.cms_id}</td>
                            <td style={{ ...tdStyle, color: '#8a7560' }}>{new Date(row.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {filteredInterests().length === 0 && (
                          <tr><td colSpan={4} className="text-center py-10" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>No interests found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
