'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const TARGET = new Date('2026-06-04T00:00:00')

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true)
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    if (localStorage.getItem('sibau_banner_v1') !== 'true') {
      setDismissed(false)
    }
  }, [])

  useEffect(() => {
    if (dismissed) return
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [dismissed])

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('sibau_banner_v1', 'true')
  }

  if (dismissed || !timeLeft) return null

  return (
    <div style={{ backgroundColor: '#c9a96e' }} className="w-full px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <p
          className="text-sm text-center sm:text-left"
          style={{ color: '#1a1410', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >
          ⏳ Summer 2026 registration closes June 4, 2026 — Find your course group now
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-1 text-sm font-semibold tabular-nums"
            style={{ color: '#1a1410', fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className="bg-black/10 rounded px-1.5 py-0.5">{pad(timeLeft.days)}d</span>
            <span className="opacity-60">:</span>
            <span className="bg-black/10 rounded px-1.5 py-0.5">{pad(timeLeft.hours)}h</span>
            <span className="opacity-60">:</span>
            <span className="bg-black/10 rounded px-1.5 py-0.5">{pad(timeLeft.minutes)}m</span>
            <span className="opacity-60">:</span>
            <span className="bg-black/10 rounded px-1.5 py-0.5">{pad(timeLeft.seconds)}s</span>
          </div>
          <button
            onClick={dismiss}
            className="opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: '#1a1410' }}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
