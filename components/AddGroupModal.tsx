'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, MessageCircle, ChevronRight, Loader2, Check, PenLine } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { getProgramColor } from '@/lib/programColors'

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

const inputStyle = {
  backgroundColor: '#1a1410',
  border: '1px solid #3d3020',
  color: '#f0e6d3',
  fontFamily: "'DM Sans', sans-serif",
  borderRadius: 8,
  padding: '12px 16px',
  width: '100%',
  outline: 'none',
}

const labelStyle = {
  color: '#8a7560',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  display: 'block',
  marginBottom: 6,
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

  const [manualMode, setManualMode] = useState(false)
  const [programs, setPrograms] = useState<ProgramOption[]>([])
  const [manualCourseName, setManualCourseName] = useState('')
  const [manualCourseCode, setManualCourseCode] = useState('')
  const [manualProgramId, setManualProgramId] = useState('')
  const [manualSemester, setManualSemester] = useState('')

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
      program_color: prog?.color ?? '#c9a96e',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === overlayRef.current && onClose()}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          backgroundColor: '#231c15',
          border: '1px solid #3d3020',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid #3d3020' }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
            >
              Add a Group
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
              Step {step} of 2
            </p>
          </div>
          <button
            onClick={onClose}
            className="transition-opacity opacity-60 hover:opacity-100"
            style={{ color: '#8a7560' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex gap-2 px-5 pt-4">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-0.5 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: s <= step ? '#c9a96e' : '#3d3020' }}
            />
          ))}
        </div>

        <div className="p-5">
          {/* Step 1 — Search */}
          {step === 1 && !manualMode && (
            <div>
              <h3
                className="font-semibold mb-4"
                style={{ color: '#e8d5b0', fontFamily: "'DM Sans', sans-serif" }}
              >
                Select Course
              </h3>
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#5a4a38' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by course name or code..."
                  autoFocus
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                  onBlur={e => (e.target.style.borderColor = '#3d3020')}
                />
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {searching && (
                  <div
                    className="flex items-center gap-2 p-3 text-sm"
                    style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                )}
                {searchResults.map(course => {
                  const c = getProgramColor(course.program_code, course.program_color)
                  return (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left min-h-[44px] hover:bg-[#2a2118]"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${c}20`, color: c, fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {course.program_code.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {course.title}
                        </div>
                        <div className="text-xs" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                          {course.code} · <span style={{ color: c }}>{course.program_code}</span>
                          {course.semester_number ? ` · Sem ${course.semester_number}` : ''}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: '#5a4a38' }} />
                    </button>
                  )
                })}
              </div>

              {showNoResults && (
                <div
                  className="mt-3 text-center pt-4"
                  style={{ borderTop: '1px solid #3d3020' }}
                >
                  <p className="text-sm mb-3" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                    No courses found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button
                    onClick={handleEnterManual}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: '#c9a96e', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <PenLine className="w-4 h-4" />
                    Can&rsquo;t find your course? Add it manually →
                  </button>
                </div>
              )}

              {!hasSearched && searchQuery.length < 2 && (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Type at least 2 characters to search courses
                </p>
              )}
            </div>
          )}

          {/* Step 1 — Manual entry */}
          {step === 1 && manualMode && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <PenLine className="w-4 h-4 shrink-0" style={{ color: '#c9a96e' }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#e8d5b0', fontFamily: "'DM Sans', sans-serif" }}>
                    Manual Course Entry
                  </h3>
                  <p className="text-xs" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                    Fill in your course details below
                  </p>
                </div>
                <button
                  onClick={() => setManualMode(false)}
                  className="ml-auto text-xs transition-colors"
                  style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Back to search
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>
                    Course Name <span style={{ color: '#c47a7a' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={manualCourseName}
                    onChange={e => setManualCourseName(e.target.value)}
                    placeholder="e.g. Database Systems"
                    autoFocus
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Course Code <span style={{ color: '#5a4a38' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={manualCourseCode}
                    onChange={e => setManualCourseCode(e.target.value)}
                    placeholder="e.g. CSC-301"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Program <span style={{ color: '#5a4a38' }}>(optional)</span>
                  </label>
                  <select
                    value={manualProgramId}
                    onChange={e => setManualProgramId(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
                  >
                    <option value="">Select a program...</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Semester <span style={{ color: '#5a4a38' }}>(optional)</span>
                  </label>
                  <select
                    value={manualSemester}
                    onChange={e => setManualSemester(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
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
                className="w-full mt-5 flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: '#c9a96e',
                  color: '#1a1410',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              {selectedCourse && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{
                    backgroundColor: 'rgba(201,169,110,0.06)',
                    border: '1px solid rgba(201,169,110,0.2)',
                  }}
                >
                  <Check className="w-4 h-4 shrink-0" style={{ color: '#c9a96e' }} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {selectedCourse.title}
                    </div>
                    {(selectedCourse.code || selectedCourse.program_code) && (
                      <div className="text-xs" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                        {selectedCourse.code && `${selectedCourse.code} · `}
                        {selectedCourse.program_code || 'Manual entry'}
                        {selectedCourse.id === '__manual__' && (
                          <span className="ml-1" style={{ color: '#c9a96e' }}>(manual)</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!initialCourseId && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs shrink-0 transition-colors"
                      style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Change
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Platform</label>
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-lg"
                    style={{ backgroundColor: '#1a1410', border: '1px solid rgba(74,122,90,0.3)' }}
                  >
                    <MessageCircle className="w-4 h-4" style={{ color: '#a0d4b0' }} />
                    <span className="text-sm" style={{ color: '#f0e6d3', fontFamily: "'DM Sans', sans-serif" }}>
                      WhatsApp
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Group Name</label>
                  <p className="text-xs mb-2" style={{ color: '#5a4a38', fontFamily: "'DM Sans', sans-serif" }}>
                    Recommended: use the exact course name
                  </p>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="e.g. Programming Fundamentals"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Invite Link <span style={{ color: '#c47a7a' }}>*</span>
                  </label>
                  <input
                    type="url"
                    value={inviteLink}
                    onChange={e => { setInviteLink(e.target.value); if (linkError) validateLink(e.target.value) }}
                    placeholder="https://chat.whatsapp.com/..."
                    style={{
                      ...inputStyle,
                      borderColor: linkError ? '#c47a7a' : '#3d3020',
                    }}
                    onFocus={e => (e.target.style.borderColor = linkError ? '#c47a7a' : '#c9a96e')}
                    onBlur={e => { validateLink(inviteLink); e.target.style.borderColor = linkError ? '#c47a7a' : '#3d3020' }}
                  />
                  {linkError && (
                    <p className="text-xs mt-1" style={{ color: '#c47a7a', fontFamily: "'DM Sans', sans-serif" }}>
                      {linkError}
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    Your Name <span style={{ color: '#5a4a38' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={addedBy}
                    onChange={e => setAddedBy(e.target.value)}
                    placeholder="e.g. Ali Hassan"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#c9a96e')}
                    onBlur={e => (e.target.style.borderColor = '#3d3020')}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {!initialCourseId && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 text-sm font-semibold py-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: '#2a2118',
                      color: '#8a7560',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !groupName.trim() || !inviteLink.trim()}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: '#c9a96e',
                    color: '#1a1410',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e' }}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
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
