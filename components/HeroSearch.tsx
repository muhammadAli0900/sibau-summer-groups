'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
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

  // Group results by program
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search courses by name or code... e.g. CS102, Programming"
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-10 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base min-h-[56px]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown — z-[100] floats above all page content */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/60 z-[100] max-h-[400px] overflow-y-auto">
          {/* Loading */}
          {loading && (
            <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
          )}

          {/* Empty state */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-10 px-6 text-center">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-white font-semibold text-base">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-slate-500 text-sm mt-1.5">Try searching by course code e.g. CS102</p>
            </div>
          )}

          {/* Grouped results */}
          {!loading && groupEntries.map(([programCode, courses], groupIdx) => (
            <div key={programCode}>
              {/* Thin divider between program groups */}
              {groupIdx > 0 && (
                <div className="mx-3 border-t border-slate-800" />
              )}
              {/* Program label */}
              <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: courses[0].program_color }}
                />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {courses[0].program_name}
                </span>
              </div>
              {/* Course rows */}
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  onClick={() => { setOpen(false); setQuery('') }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/70 transition-colors duration-150 min-h-[44px]"
                >
                  {/* Program color badge */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: `${course.program_color}20`, color: course.program_color }}
                  >
                    {course.program_code.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{course.title}</div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {course.code}
                      {course.semester_number ? ` · Sem ${course.semester_number}` : ''}
                      {' · '}
                      {course.program_name}
                    </div>
                  </div>
                  {/* Group count */}
                  <div className="shrink-0">
                    {course.group_count > 0 ? (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        {course.group_count} {course.group_count === 1 ? 'group' : 'groups'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">no groups</span>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-1" />
                </Link>
              ))}
              {groupIdx < groupEntries.length - 1 && <div className="pb-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
