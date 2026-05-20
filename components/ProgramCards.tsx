'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Program } from '@/lib/supabase'

type Props = {
  programs: Program[]
}

export default function ProgramCards({ programs }: Props) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>No programs found. Please check database setup.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {programs.map(program => (
        <Link
          key={program.id}
          href={`/program/${program.code}`}
          className="group bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-500/70 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
        >
          {/* Colored accent bar */}
          <div className="h-[3px] w-full" style={{ backgroundColor: program.color }} />
          <div className="p-4 sm:p-5">
            {/* Top row: code badge + course count */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: `${program.color}20`, color: program.color }}
              >
                {program.code}
              </span>
              {(program.course_count ?? 0) > 0 && (
                <span className="text-xs text-slate-500">
                  {program.course_count} courses
                </span>
              )}
            </div>
            {/* Program full name */}
            <h3
              className="text-white font-bold text-sm sm:text-base mb-4 leading-snug"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {program.name}
            </h3>
            {/* Browse link in program color */}
            <div
              className="flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
              style={{ color: program.color }}
            >
              <span>Browse</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
