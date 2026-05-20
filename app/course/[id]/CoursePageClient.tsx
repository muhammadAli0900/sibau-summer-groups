'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import AddGroupModal from '@/components/AddGroupModal'

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
}

function getProg(programs: Program | Program[] | undefined): Program | undefined {
  if (!programs) return undefined
  return Array.isArray(programs) ? programs[0] : programs
}

export default function CoursePageClient({ course, siblings, groups, joinCounts }: Props) {
  const [localJoinCounts, setLocalJoinCounts] = useState(joinCounts)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const { showToast } = useToast()

  const prog = getProg(course.programs)

  const handleJoin = async (group: Group) => {
    if (joiningId) return
    setJoiningId(group.id)

    const siblingCourse = siblings.find(s => s.id === group.course_id)
    const siblingProg = siblingCourse ? getProg(siblingCourse.programs) : prog

    // Open the link immediately — don't wait for the log
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
      // Silently fail — the link already opened
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          href={prog ? `/program/${prog.code}` : '/'}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {prog?.name ?? 'Programs'}
        </Link>

        {/* Course Header */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${prog?.color ?? '#3b82f6'}20`, color: prog?.color ?? '#3b82f6' }}
                >
                  {course.code}
                </span>
                {course.semester_number && (
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                    Semester {course.semester_number}
                  </span>
                )}
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                  {course.credit_hours} cr
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-white mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {course.title}
              </h1>

              {uniquePrograms.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Available in:</p>
                  <div className="flex flex-wrap gap-2">
                    {uniquePrograms.map(p => (
                      <Link
                        key={p.id}
                        href={`/program/${p.code}`}
                        className="text-xs px-3 py-1 rounded-full border hover:opacity-80 transition-opacity"
                        style={{ borderColor: `${p.color}40`, backgroundColor: `${p.color}10`, color: p.color }}
                      >
                        {p.code} — {p.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add a Group
            </button>
          </div>
        </div>

        {/* Groups */}
        <div>
          <h2
            className="text-xl font-bold text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            WhatsApp Groups ({groups.length})
          </h2>

          {groups.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-10 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <h3 className="text-white font-semibold mb-2">No groups yet</h3>
              <p className="text-slate-400 text-sm mb-6">
                Be the first to add a group for this course. Help classmates connect!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
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
                const joinCount = localJoinCounts[group.id] ?? 0

                return (
                  <div
                    key={group.id}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold text-sm">{group.group_name}</h3>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {group.platform}
                        </span>
                        {sibProg && prog && sibProg.code !== prog.code && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${sibProg.color}15`, color: sibProg.color }}
                          >
                            {sibProg.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          {joinCount} joined from this site
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {group.added_by && (
                        <p className="text-xs text-slate-500 mt-0.5">Added by {group.added_by}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoin(group)}
                      disabled={joiningId === group.id}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-200 shrink-0 shadow-lg shadow-emerald-500/20"
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
