'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type Toast = {
  id: string
  message: string
  type: 'success' | 'error'
}

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error') => void
}

export const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm"
            style={{
              backgroundColor: '#231c15',
              border: '1px solid #4a3a28',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              fontFamily: "'DM Sans', sans-serif",
              color: '#f0e6d3',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#c9a96e' }} />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" style={{ color: '#c47a7a' }} />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
