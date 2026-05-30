'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import AddGroupModal from '@/components/AddGroupModal'
import InterestButton from '@/components/InterestButton'
import { getProgramColor } from '@/lib/programColors'

type Program = { id: string; code: string; name: string; color: string }

type Course = {
  id: string
  code: string
  title: string
  semester_number: number | null
  credit_hours: string
  programs: Program | Program[]
}

type Group = {
  id: string
  course_id: string
  group_name: string
  platform: string
  invite_link: string
  added_by: string | null
  created_at: string
}

type Props = {
  course: Course
  siblings: Course[]
  groups: Group[]
  joinCounts: Record<string, number>
  interestCount: number
}

function getProg(programs: Program | Program[] | undefined): Program | undefined {
  if (!programs) return undefined
  return Array.isArray(programs) ? programs[0] : programs
}

export default function CoursePageClient({ course, siblings, groups, joinCounts, interestCount: initialInterestCount }: Props) {
  const [localJoinCounts, setLocalJoinCounts] = useState(joinCounts)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [interestCount, setInterestCount] = useState(initialInterestCount)
  const { showToast } = useToast()

  const prog = getProg(course.programs)
  const color = prog ? getProgramColor(prog.code, prog.color) : '#c9a96e'

  const handleJoin = async (group: Group) => {
    if (joiningId) return
    setJoiningId(group.id)
    const siblingCourse = siblings.find(s => s.id === group.course_id)
    const siblingProg = siblingCourse ? getProg(siblingCourse.programs) : prog
    window.open(group.invite_link, '_blank', 'noopener,noreferrer')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: group.id,
          course_id: group.course_id,
          program_code: siblingProg?.code ?? '',
          course_title: course.title,
          group_name: group.group_name,
          platform: group.platform,
        }),
      })
      if (res.ok) {
        setLocalJoinCounts(prev => ({ ...prev, [group.id]: (prev[group.id] ?? 0) + 1 }))
      }
    } catch {
      // link already opened
    } finally {
      setJoiningId(null)
      showToast('WhatsApp group opened!', 'success')
    }
  }

  const uniquePrograms = Array.from(
    new Map(siblings.map(s => {
      const p = getProg(s.programs)
      return [p?.id, p]
    })).values()
  ).filter((p): p is Program => Boolean(p))

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#1a1410' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href={prog ? `/program/${prog.code}` : '/'}
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-200"
          style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {prog?.name ?? 'Programs'}
        </Link>

        {/* Course Header */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#2a2118', color, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {course.code}
                </span>
                {course.semester_number && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#2a2118', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                    Semester {course.semester_number}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#2a2118', color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                  {course.credit_hours} cr
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
              >
                {course.title}
              </h1>
              {uniquePrograms.length > 0 && (
                <div>
                  <p className="text-sm mb-2" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>Available in:</p>
                  <div className="flex flex-wrap gap-2">
                    {uniquePrograms.map(p => {
                      const pColor = getProgramColor(p.code, p.color)
                      return (
                        <Link
                          key={p.id}
                          href={`/program/${p.code}`}
                          className="text-xs px-3 py-1 rounded-full transition-opacity hover:opacity-80"
                          style={{ border: `1px solid ${pColor}40`, backgroundColor: `${pColor}10`, color: pColor, fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {p.code} — {p.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shrink-0"
              style={{ backgroundColor: '#c9a96e', color: '#1a1410', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
            >
              <Plus className="w-4 h-4" />
              Add a Group
            </button>
          </div>
        </div>

        {/* Interest Section */}
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}>
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div>
              <div className="text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#c9a96e' }}>
                {interestCount}
              </div>
              <div className="text-sm mt-1" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                students interested
              </div>
            </div>
            <InterestButton
              courseId={course.id}
              onInterestRegistered={newCount => setInterestCount(newCount)}
            />
          </div>

          {/* Threshold nudge */}
          {interestCount >= 5 && groups.length === 0 && (
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#2a2118', borderLeft: '3px solid #c9a96e' }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>
                🔥 {interestCount} students want this course! Be the first to create a WhatsApp group and add it here.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#c9a96e', color: '#1a1410', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
              >
                <Plus className="w-4 h-4" />
                Add a Group
              </button>
            </div>
          )}

          {interestCount >= 5 && groups.length > 0 && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{ backgroundColor: '#1a2a1a', borderLeft: '3px solid #4a7a5a', color: '#a0d4b0', fontFamily: "'DM Sans', sans-serif" }}
            >
              ✓ This course has active groups — join one below!
            </div>
          )}

          {interestCount < 5 && (
            <p className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              Need {5 - interestCount} more {5 - interestCount === 1 ? 'student' : 'students'} to trigger a group creation reminder
            </p>
          )}
        </div>

        {/* Groups */}
        <div>
          <h2
            className="text-xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
          >
            WhatsApp Groups ({groups.length})
          </h2>

          {groups.length === 0 ? (
            <div className="rounded-xl p-10 text-center" style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}>
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: '#8a7560' }} />
              <h3 className="font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}>
                No groups yet
              </h3>
              <p className="text-sm mb-6" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                Be the first to add a group for this course. Help classmates connect!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#c9a96e', color: '#1a1410', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
              >
                <Plus className="w-4 h-4" />
                Add First Group
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(group => {
                const siblingCourse = siblings.find(s => s.id === group.course_id)
                const sibProg = siblingCourse ? getProg(siblingCourse.programs) : prog
                const sibColor = sibProg ? getProgramColor(sibProg.code, sibProg.color) : color
                const joinCount = localJoinCounts[group.id] ?? 0
                return (
                  <div key={group.id} className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(74,122,90,0.15)', border: '1px solid rgba(74,122,90,0.2)' }}>
                      <MessageCircle className="w-5 h-5" style={{ color: '#a0d4b0' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>{group.group_name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,122,90,0.2)', color: '#a0d4b0', fontFamily: "'DM Sans', sans-serif" }}>
                          {group.platform}
                        </span>
                        {sibProg && prog && sibProg.code !== prog.code && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sibColor}15`, color: sibColor, fontFamily: "'DM Sans', sans-serif" }}>
                            {sibProg.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                          <Users className="w-3 h-3" />{joinCount} joined from this site
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>
                          <Clock className="w-3 h-3" />{new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {group.added_by && (
                        <p className="text-xs mt-0.5" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>Added by {group.added_by}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleJoin(group)}
                      disabled={joiningId === group.id}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shrink-0 disabled:opacity-60"
                      style={{ backgroundColor: '#c9a96e', color: '#1a1410', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">Join on WhatsApp</span>
                      <span className="sm:hidden">Join</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddGroupModal
          initialCourseId={course.id}
          initialCourseTitle={course.title}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            showToast('Group added! Reloading...', 'success')
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
