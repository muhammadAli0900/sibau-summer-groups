'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, GraduationCap } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading font-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              SIBAU Summer Groups
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors duration-200">
              Home
            </Link>
            <Link href="/#programs" className="text-slate-300 hover:text-white text-sm transition-colors duration-200">
              Programs
            </Link>
            <Link href="/admin" className="text-slate-300 hover:text-white text-sm transition-colors duration-200">
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/#programs"
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Programs
            </Link>
            <Link
              href="/admin"
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
