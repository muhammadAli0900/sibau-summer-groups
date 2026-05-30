'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Program, Course } from '@/lib/supabase'
import { getProgramColor } from '@/lib/programColors'
import AddGroupModal from '@/components/AddGroupModal'

type Props = {
  program: Program
  courses: Course[]
  groupCounts: Record<string, number>
  interestCounts: Record<string, number>
}

export default function ProgramPageClient({ program, courses, groupCounts, interestCounts }: Props) {
  const [activeSemester, setActiveSemester] = useState<number | 'all'>('all')
  const [addGroupCourseId, setAddGroupCourseId] = useState<string | null>(null)

  const color = getProgramColor(program.code, program.color)

  const semesters = Array.from(
    new Set(courses.map(c => c.semester_number).filter(Boolean))
  ).sort((a, b) => (a ?? 0) - (b ?? 0)) as number[]

  const filtered = activeSemester === 'all'
    ? courses
    : courses.filter(c => c.semester_number === activeSemester)

  const grouped: Record<number | string, Course[]> = {}
  for (const c of filtered) {
    const key = c.semester_number ?? 'other'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#1a1410' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-200"
          style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Link>

        {/* Program header */}
        <div className="mb-8">
          <span
            className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: '#2a2118', color, fontFamily: "'DM Sans', sans-serif" }}
          >
            {program.code}
          </span>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
          >
            {program.name}
          </h1>
          <div style={{ width: 60, height: 2, backgroundColor: color, marginTop: 12, marginBottom: 8 }} />
          <p className="text-sm" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
            {courses.length} courses across {semesters.length} semesters
          </p>
        </div>

        {/* Semester tabs */}
        <div className="flex flex-wrap gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid #3d3020' }}>
          {(['all', ...semesters] as (number | 'all')[]).map(s => {
            const isActive = activeSemester === s
            return (
              <button
                key={s}
                onClick={() => setActiveSemester(s)}
                className="px-4 py-2.5 text-sm border-b-2 -mb-px transition-all duration-200 whitespace-nowrap min-h-[44px]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottomColor: isActive ? '#c9a96e' : 'transparent',
                  color: isActive ? '#c9a96e' : '#8a7560',
                  fontWeight: isActive ? 500 : 400,
                  background: 'none',
                }}
              >
                {s === 'all' ? 'All' : `Sem ${s}`}
              </button>
            )
          })}
        </div>

        {/* Course list */}
        {Object.entries(grouped).map(([sem, semCourses]) => (
          <div key={sem} className="mb-10">
            {activeSemester === 'all' && (
              <h2
                className="text-xs font-semibold mb-4 uppercase tracking-widest"
                style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}
              >
                {sem === 'other' ? 'Other Courses' : `Semester ${sem}`}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {semCourses.map(course => {
                const groupCount = groupCounts[course.id] ?? 0
                const interestCount = interestCounts[course.id] ?? 0
                return (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}`}
                    className="group flex rounded-xl overflow-hidden transition-all duration-200 hover:bg-[#2a2118] hover:border-[#4a3a28] min-h-[44px]"
                    style={{ backgroundColor: '#231c15', border: '1px solid #3d3020' }}
                  >
                    <div style={{ width: 3, backgroundColor: color, flexShrink: 0 }} />
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span
                            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mb-2"
                            style={{ backgroundColor: '#2a2118', color, fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {course.code}
                          </span>
                          <h3
                            className="text-sm font-medium leading-snug"
                            style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {course.title}
                          </h3>
                          <p className="text-xs mt-1.5" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                            {course.credit_hours} credit hours
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                          {groupCount > 0 && (
                            <span className="text-xs" style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}>
                              {groupCount} {groupCount === 1 ? 'group' : 'groups'}
                            </span>
                          )}
                          {interestCount > 0 && (
                            <span className="text-xs" style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}>
                              🙋 {interestCount} interested
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#8a7560' }}>
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p style={{ fontFamily: "'DM Sans', sans-serif" }}>No courses found</p>
          </div>
        )}
      </div>

      {addGroupCourseId && (
        <AddGroupModal
          initialCourseId={addGroupCourseId}
          onClose={() => setAddGroupCourseId(null)}
        />
      )}
    </div>
  )
}
