'use client'
import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

function applyTheme(t: Theme) {
  const html = document.documentElement
  if (t === 'auto') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', t)
  }
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>('auto')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const t: Theme = (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'auto'
    setTheme(t)
    applyTheme(t)
  }, [])

  const set = useCallback((t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }, [])

  return [theme, set]
}
