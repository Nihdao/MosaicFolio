'use client'
import { Pencil, X } from 'lucide-react'
import { useDevMode } from './useDevMode'
import ThemeToggle from './ThemeToggle'

export default function DevModeToggle() {
  const [isDev, setIsDev] = useDevMode()

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {isDev && <ThemeToggle />}
      <button
        onClick={() => setIsDev(!isDev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 22px',
          borderRadius: 9999,
          border: isDev ? '1px solid var(--border)' : 'none',
          background: isDev ? 'var(--card)' : 'var(--accent)',
          color: isDev ? 'var(--muted-foreground)' : 'var(--accent-foreground)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
        }}
        aria-label={isDev ? 'Exit Edit' : 'Edit'}
      >
        {isDev ? <X size={14} /> : <Pencil size={14} />}
        {isDev ? 'Exit Edit' : 'Edit'}
      </button>
    </div>
  )
}
