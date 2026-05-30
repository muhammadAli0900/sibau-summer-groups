'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#1a1410', borderBottom: '1px solid #3d3020' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="font-bold text-lg tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: '#e8d5b0' }}
            >
              SIBAU Groups
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '/', label: 'Home' },
              { href: '/#programs', label: 'Programs' },
              { href: '/admin', label: 'Admin' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm transition-colors duration-200"
                style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#c9a96e')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#8a7560')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: '#8a7560' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/#programs', label: 'Programs' },
              { href: '/admin', label: 'Admin' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="block px-3 py-2.5 rounded-lg text-sm transition-colors duration-200"
                style={{ color: '#8a7560', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
