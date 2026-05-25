'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const DEV_MODE_EVENT = 'dev-mode-change'

export function useDevMode(): [boolean, (next: boolean) => void] {
  const params = useSearchParams()
  const router = useRouter()
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const fromQuery = params.get('dev') === 'true'
    const fromStorage = localStorage.getItem('dev-mode') === 'true'
    const next = fromQuery || fromStorage
    setIsDev(next)
    if (fromQuery && !fromStorage) localStorage.setItem('dev-mode', 'true')
  }, [params])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const handler = (e: Event) => setIsDev((e as CustomEvent<boolean>).detail)
    window.addEventListener(DEV_MODE_EVENT, handler)
    return () => window.removeEventListener(DEV_MODE_EVENT, handler)
  }, [])

  const toggle = useCallback((next: boolean) => {
    if (process.env.NODE_ENV === 'production') return
    setIsDev(next)
    localStorage.setItem('dev-mode', String(next))
    window.dispatchEvent(new CustomEvent(DEV_MODE_EVENT, { detail: next }))
    if (!next) {
      const url = new URL(window.location.href)
      url.searchParams.delete('dev')
      history.replaceState(null, '', url)
      router.refresh()
    }
  }, [router])

  return [isDev, toggle]
}
