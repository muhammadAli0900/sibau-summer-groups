'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, MessageCircle, ChevronRight, Loader2, Check, PenLine } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

type SearchResult = {
  id: string
  code: string
  title: string
  semester_number: number | null
  program_code: string
  program_name: string
  program_color: string
}

type ProgramOption = {
  id: string
  code: string
  name: string
  color: string
}

type Props = {
  initialCourseId?: string
  initialCourseTitle?: string
  onClose: () => void
  onSuccess?: () => void
}

export default function AddGroupModal({ initialCourseId, initialCourseTitle, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(initialCourseId ? 2 : 1)
  const [selectedCourse, setSelectedCourse] = useState<SearchResult | null>(
    initialCourseId && initialCourseTitle
      ? { id: initialCourseId, title: initialCourseTitle, code: '', semester_number: null, program_code: '', program_name: '', program_color: '' }
      : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Manual entry mode
  const [manualMode, setManualMode] = useState(false)
  const [programs, setPrograms] = useState<ProgramOption[]>([])
  const [manualCourseName, setManualCourseName] = useState('')
  const [manualCourseCode, setManualCourseCode] = useState('')
  const [manualProgramId, setManualProgramId] = useState('')
  const [manualSemester, setManualSemester] = useState('')

  // Step 2 fields
  const [groupName, setGroupName] = useState(initialCourseTitle ?? '')
  const [inviteLink, setInviteLink] = useState('')
  const [addedBy, setAddedBy] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [linkError, setLinkError] = useState('')

  const { showToast } = useToast()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(d => setPrograms(d.programs ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setHasSearched(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        const data = await res.json()
        setSearchResults(data.results ?? [])
        setHasSearched(true)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectCourse = (course: SearchResult) => {
    setSelectedCourse(course)
    setGroupName(course.title)
    setStep(2)
  }

  const handleEnterManual = () => {
    setManualMode(true)
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
  }

  const handleManualProceed = () => {
    if (!manualCourseName.trim()) return
    const prog = programs.find(p => p.id === manualProgramId)
    setSelectedCourse({
      id: '__manual__',
      title: manualCourseName.trim(),
      code: manualCourseCode.trim(),
      semester_number: manualSemester ? parseInt(manualSemester) : null,
      program_code: prog?.code ?? '',
      program_name: prog?.name ?? '',
      program_color: prog?.color ?? '#6366f1',
    })
    setGroupName(manualCourseName.trim())
    setStep(2)
  }

  const validateLink = (val: string) => {
    if (!val) { setLinkError('Invite link is required'); return false }
    if (!val.startsWith('https://chat.whatsapp.com/') && !val.startsWith('https://t.me/')) {
      setLinkError('Link must start with https://chat.whatsapp.com/ or https://t.me/')
      return false
    }
    setLinkError('')
    return true
  }

  const handleSubmit = async () => {
    if (!selectedCourse) return
    if (!validateLink(inviteLink)) return
    if (!groupName.trim()) return

    setSubmitting(true)
    try {
      const isManual = selectedCourse.id === '__manual__'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        group_name: groupName.trim(),
        platform: 'WhatsApp',
        invite_link: inviteLink.trim(),
        added_by: addedBy.trim() || null,
      }

      if (isManual) {
        body.is_manual = true
        body.course_name_manual = manualCourseName.trim()
        body.manual_course_code = manualCourseCode.trim() || null
        body.manual_program_id = manualProgramId || null
        body.manual_semester_number = manualSemester || null
      } else {
        body.course_id = selectedCourse.id
      }

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add group')

      showToast('Group added successfully!', 'success')
      onSuccess ? onSuccess() : onClose()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to add group', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const showNoResults = !searching && hasSearched && searchResults.length === 0

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2
              className="text-white font-bold text-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Add a Group
            </h2>
            <p className="text-slate-400 text-sm">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 px-5 pt-4">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="p-5">
          {/* Step 1 — Search mode */}
          {step === 1 && !manualMode && (
            <div>
              <h3 className="text-white font-semibold mb-4">Select Course</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by course name or code..."
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {searching && (
                  <div className="flex items-center gap-2 p-3 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {searchResults.map(course => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left min-h-[44px]"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: `${course.program_color}20`, color: course.program_color }}
                    >
                      {course.program_code.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{course.title}</div>
                      <div className="text-slate-400 text-xs">
                        {course.code} ·{' '}
                        <span style={{ color: course.program_color }}>{course.program_code}</span>
                        {course.semester_number ? ` · Sem ${course.semester_number}` : ''}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>

              {/* "Can't find?" button — shown when search returned no results */}
              {showNoResults && (
                <div className="mt-3 text-center border-t border-slate-800 pt-4">
                  <p className="text-slate-500 text-sm mb-3">No courses found for &ldquo;{searchQuery}&rdquo;</p>
                  <button
                    onClick={handleEnterManual}
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
                  >
                    <PenLine className="w-4 h-4" />
                    Can&rsquo;t find your course? Add it manually →
                  </button>
                </div>
              )}

              {!hasSearched && searchQuery.length < 2 && (
                <p className="text-slate-500 text-sm text-center py-8">
                  Type at least 2 characters to search courses
                </p>
              )}
            </div>
          )}

          {/* Step 1 — Manual entry mode */}
          {step === 1 && manualMode && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <PenLine className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Manual Course Entry</h3>
                  <p className="text-slate-500 text-xs">Fill in your course details below</p>
                </div>
                <button
                  onClick={() => setManualMode(false)}
                  className="ml-auto text-slate-500 hover:text-slate-300 text-xs"
                >
                  Back to search
                </button>
              </div>

              <div className="space-y-4">
                {/* Course name */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1">
                    Course Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualCourseName}
                    onChange={e => setManualCourseName(e.target.value)}
                    placeholder="e.g. Database Systems"
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Course code */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1">
                    Course Code <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={manualCourseCode}
                    onChange={e => setManualCourseCode(e.target.value)}
                    placeholder="e.g. CSC-301"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Program */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1">
                    Program <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <select
                    value={manualProgramId}
                    onChange={e => setManualProgramId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm appearance-none"
                  >
                    <option value="">Select a program...</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1">
                    Semester <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <select
                    value={manualSemester}
                    onChange={e => setManualSemester(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm appearance-none"
                  >
                    <option value="">Select semester...</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleManualProceed}
                disabled={!manualCourseName.trim()}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Fill group details */}
          {step === 2 && (
            <div>
              {selectedCourse && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl mb-5 border"
                  style={{
                    backgroundColor: `${selectedCourse.program_color || '#6366f1'}10`,
                    borderColor: `${selectedCourse.program_color || '#6366f1'}30`,
                  }}
                >
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{selectedCourse.title}</div>
                    {(selectedCourse.code || selectedCourse.program_code) && (
                      <div className="text-slate-400 text-xs">
                        {selectedCourse.code && `${selectedCourse.code} · `}
                        {selectedCourse.program_code || 'Manual entry'}
                        {selectedCourse.id === '__manual__' && (
                          <span className="ml-1 text-indigo-400">(manual)</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!initialCourseId && (
                    <button
                      onClick={() => {
                        setStep(1)
                        if (selectedCourse.id === '__manual__') {
                          // go back to manual mode
                        } else {
                          setManualMode(false)
                        }
                      }}
                      className="text-slate-400 hover:text-white text-xs shrink-0"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Platform */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">Platform</label>
                  <div className="flex items-center gap-2 bg-slate-800 border border-emerald-500/30 rounded-xl px-4 py-3">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-white text-sm">WhatsApp</span>
                  </div>
                </div>

                {/* Group name */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-1">Group Name</label>
                  <p className="text-slate-500 text-xs mb-2">Recommended: use the exact course name</p>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. Programming Fundamentals"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Invite link */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Invite Link <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={inviteLink}
                    onChange={e => { setInviteLink(e.target.value); if (linkError) validateLink(e.target.value) }}
                    onBlur={() => validateLink(inviteLink)}
                    placeholder="https://chat.whatsapp.com/..."
                    className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 text-sm transition-colors ${
                      linkError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {linkError && <p className="text-red-400 text-xs mt-1">{linkError}</p>}
                </div>

                {/* Added by */}
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    Your Name <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={addedBy}
                    onChange={e => setAddedBy(e.target.value)}
                    placeholder="e.g. Ali Hassan"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {!initialCourseId && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !groupName.trim() || !inviteLink.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    'Add Group'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
