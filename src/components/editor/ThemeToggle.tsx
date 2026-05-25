'use client'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from './useTheme'

const OPTIONS: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'auto', icon: Monitor, label: 'Auto' },
  { value: 'dark', icon: Moon, label: 'Dark' },
]

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 9999,
        padding: 4,
        gap: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            background: theme === value ? 'var(--muted)' : 'transparent',
            color: theme === value ? 'var(--foreground)' : 'var(--muted-foreground)',
            transition: 'background 150ms, color 150ms',
          }}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
