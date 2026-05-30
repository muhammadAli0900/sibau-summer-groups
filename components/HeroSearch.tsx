'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { getProgramColor } from '@/lib/programColors'

type SearchResult = {
  id: string
  code: string
  title: string
  semester_number: number | null
  credit_hours: string
  group_count: number
  program_code: string
  program_name: string
  program_color: string
}

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const grouped: Record<string, SearchResult[]> = {}
  for (const r of results) {
    if (!grouped[r.program_code]) grouped[r.program_code] = []
    grouped[r.program_code].push(r)
  }
  const groupEntries = Object.entries(grouped)

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
          style={{ color: '#5a4a38' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={e => {
            if (results.length > 0) setOpen(true)
            e.target.style.borderColor = '#c9a96e'
          }}
          onBlur={e => (e.target.style.borderColor = query ? '#4a3a28' : '#3d3020')}
          placeholder="Search courses by name or code... e.g. CS102, Programming"
          className="w-full rounded-xl pl-12 pr-10 py-4 text-base transition-all duration-200 outline-none"
          style={{
            backgroundColor: '#231c15',
            border: `1px solid ${open || query ? '#4a3a28' : '#3d3020'}`,
            color: '#f0e6d3',
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 56,
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: '#8a7560' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl z-[9999] max-h-[380px] overflow-y-auto"
          style={{
            backgroundColor: '#231c15',
            border: '1px solid #4a3a28',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {loading && (
            <div
              className="p-4 text-center text-sm"
              style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
            >
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-10 px-6 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: '#8a7560' }} />
              <p className="text-base font-semibold" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>
                No courses found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm mt-1.5" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                Try searching by course code e.g. CS102
              </p>
            </div>
          )}

          {!loading && groupEntries.map(([programCode, courses], groupIdx) => {
            const color = getProgramColor(programCode, courses[0].program_color)
            return (
              <div key={programCode}>
                {groupIdx > 0 && (
                  <div style={{ margin: '0 12px', borderTop: '1px solid #3d3020' }} />
                )}
                <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {courses[0].program_name}
                  </span>
                </div>
                {courses.map(course => (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}`}
                    onClick={() => { setOpen(false); setQuery('') }}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 min-h-[44px] hover:bg-[#2a2118]"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {course.title}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {course.code}
                        {course.semester_number ? ` · Sem ${course.semester_number}` : ''}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {course.group_count > 0 ? (
                        <span
                          className="text-xs"
                          style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {course.group_count} {course.group_count === 1 ? 'group' : 'groups'}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>
                          no groups
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
