'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, X, Lock, Check, Loader2 } from 'lucide-react'

type Props = {
  courseId: string
  onInterestRegistered?: (newCount: number) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#1a1410',
  border: '1px solid #3d3020',
  color: '#f0e6d3',
  fontFamily: "'DM Sans', sans-serif",
  borderRadius: 8,
  padding: '12px 16px',
  outline: 'none',
  fontSize: 14,
}

export default function InterestButton({ courseId, onInterestRegistered }: Props) {
  const [alreadyInterested, setAlreadyInterested] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [cmsId, setCmsId] = useState('')
  const [cmsIdError, setCmsIdError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (localStorage.getItem(`interest_${courseId}`) === 'true') {
      setAlreadyInterested(true)
    }
  }, [courseId])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  const handleSubmit = async () => {
    if (!cmsId.trim()) {
      setCmsIdError('Please enter your CMS ID')
      return
    }
    if (!/^\d{3}-\d{2}-\d{4}$/.test(cmsId.trim())) {
      setCmsIdError('Invalid format — should be like 083-23-0012')
      return
    }
    setCmsIdError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, cms_id: cmsId.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'already_registered') {
          localStorage.setItem(`interest_${courseId}`, 'true')
          setAlreadyInterested(true)
          setModalOpen(false)
        } else {
          setCmsIdError(data.message || 'Something went wrong, please try again')
        }
        return
      }

      localStorage.setItem(`interest_${courseId}`, 'true')
      setAlreadyInterested(true)
      setModalOpen(false)
      onInterestRegistered?.(data.count)
    } catch {
      setCmsIdError('Something went wrong, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadyInterested) {
    return (
      <button
        disabled
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-default"
        style={{
          backgroundColor: '#2a2118',
          border: '1px solid #c9a96e',
          color: '#c9a96e',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Check className="w-4 h-4" />
        You&rsquo;re Interested
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #c9a96e',
          color: '#c9a96e',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,169,110,0.08)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
      >
        <Star className="w-4 h-4" />
        I&rsquo;m Interested
      </button>

      {modalOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={e => e.target === overlayRef.current && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              backgroundColor: '#231c15',
              border: '1px solid #3d3020',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
                >
                  Register Your Interest
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Let others know you want to take this course in Summer 2026
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="opacity-60 hover:opacity-100 transition-opacity ml-4 mt-0.5"
                style={{ color: '#8a7560' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CMS ID input */}
            <div className="mb-4">
              <label
                className="block text-sm mb-1.5"
                style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
              >
                Your CMS ID
              </label>
              <input
                type="text"
                value={cmsId}
                onChange={e => { setCmsId(e.target.value); if (cmsIdError) setCmsIdError('') }}
                placeholder="e.g. 083-23-0012"
                autoFocus
                style={{
                  ...inputStyle,
                  borderColor: cmsIdError ? '#c47a7a' : '#3d3020',
                }}
                onFocus={e => (e.target.style.borderColor = cmsIdError ? '#c47a7a' : '#c9a96e')}
                onBlur={e => (e.target.style.borderColor = cmsIdError ? '#c47a7a' : '#3d3020')}
                onKeyDown={e => e.key === 'Enter' && !submitting && handleSubmit()}
              />
              {cmsIdError && (
                <p className="text-xs mt-1" style={{ color: '#c47a7a', fontFamily: "'DM Sans', sans-serif" }}>
                  {cmsIdError}
                </p>
              )}
            </div>

            {/* Privacy notice */}
            <div
              className="flex items-start gap-2.5 p-3 rounded-lg mb-5"
              style={{ backgroundColor: '#1a1410', border: '1px solid #3d3020' }}
            >
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#8a7560' }} />
              <p className="text-xs leading-relaxed" style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}>
                Your CMS ID is completely private and will never be shown to anyone. Only the total number of interested students is visible publicly.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 text-sm font-medium py-3 rounded-lg transition-colors"
                style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 text-sm font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: '#c9a96e',
                  color: '#1a1410',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLElement).style.backgroundColor = '#d4b87e' }}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#c9a96e')}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                ) : (
                  'Register Interest'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
