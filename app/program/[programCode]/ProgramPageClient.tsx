'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'
import { Program, Course } from '@/lib/supabase'
import AddGroupModal from '@/components/AddGroupModal'

type Props = {
  program: Program
  courses: Course[]
  groupCounts: Record<string, number>
}

export default function ProgramPageClient({ program, courses, groupCounts }: Props) {
  const [activeSemester, setActiveSemester] = useState<number | 'all'>('all')
  const [addGroupCourseId, setAddGroupCourseId] = useState<string | null>(null)

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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Link>

        {/* Program header */}
        <div
          className="rounded-xl p-6 mb-8 border"
          style={{
            background: `linear-gradient(135deg, ${program.color}12, transparent)`,
            borderColor: `${program.color}25`,
          }}
        >
          <span
            className="text-xs font-bold px-3 py-1 rounded-lg inline-block mb-3"
            style={{ backgroundColor: `${program.color}20`, color: program.color }}
          >
            {program.code}
          </span>
          <h1
            className="text-3xl font-black text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {program.name}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {courses.length} courses across {semesters.length} semesters
          </p>
        </div>

        {/* Semester tabs — bottom border indicator style */}
        <div className="flex flex-wrap gap-0 mb-8 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSemester('all')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap min-h-[44px] ${
              activeSemester === 'all'
                ? ''
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            style={
              activeSemester === 'all'
                ? { borderColor: program.color, color: program.color }
                : {}
            }
          >
            All
          </button>
          {semesters.map(s => (
            <button
              key={s}
              onClick={() => setActiveSemester(s)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap min-h-[44px] ${
                activeSemester === s
                  ? ''
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
              style={
                activeSemester === s
                  ? { borderColor: program.color, color: program.color }
                  : {}
              }
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Courses grouped by semester */}
        {Object.entries(grouped).map(([sem, semCourses]) => (
          <div key={sem} className="mb-10">
            {activeSemester === 'all' && (
              <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
                {sem === 'other' ? 'Other Courses' : `Semester ${sem}`}
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {semCourses.map(course => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="group bg-slate-800/50 border-l-[3px] border border-slate-700/40 rounded-xl p-4 hover:bg-slate-800 hover:shadow-md hover:shadow-black/20 transition-all duration-200 min-h-[44px]"
                  style={{ borderLeftColor: program.color }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md mb-2"
                        style={{ backgroundColor: `${program.color}15`, color: program.color }}
                      >
                        {course.code}
                      </span>
                      <h3 className="text-white text-sm font-semibold leading-snug group-hover:text-blue-300 transition-colors duration-150">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1.5">{course.credit_hours} credit hours</p>
                    </div>
                    {(groupCounts[course.id] ?? 0) > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                        <Users className="w-3 h-3" />
                        {groupCounts[course.id]}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No courses found</p>
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
