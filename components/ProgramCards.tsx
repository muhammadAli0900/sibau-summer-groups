'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Program } from '@/lib/supabase'
import { getProgramColor } from '@/lib/programColors'

type Props = {
  programs: Program[]
}

export default function ProgramCards({ programs }: Props) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: '#8a7560' }}>
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p style={{ fontFamily: "'DM Sans', sans-serif" }}>No programs found. Please check database setup.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {programs.map(program => {
        const color = getProgramColor(program.code, program.color)
        return (
          <Link
            key={program.id}
            href={`/program/${program.code}`}
            className="group flex rounded-xl overflow-hidden transition-all duration-200 hover:bg-[#2a2118] hover:border-[#4a3a28]"
            style={{
              backgroundColor: '#231c15',
              border: '1px solid #3d3020',
            }}
          >
            {/* Left color strip */}
            <div style={{ width: 3, backgroundColor: color, flexShrink: 0 }} />
            {/* Content */}
            <div className="p-4 sm:p-5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#2a2118', color, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {program.code}
                </span>
                {(program.course_count ?? 0) > 0 && (
                  <span
                    className="text-xs"
                    style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {program.course_count} courses
                  </span>
                )}
              </div>
              <h3
                className="font-semibold text-sm sm:text-base mb-4 leading-snug"
                style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
              >
                {program.name}
              </h3>
              <div
                className="text-sm font-semibold"
                style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}
              >
                Browse →
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
