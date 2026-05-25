'use client'
import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-color-scheme: dark)'

let mql: MediaQueryList | null = null
const listeners = new Set<() => void>()

function ensureMql(): MediaQueryList | null {
  if (typeof window === 'undefined') return null
  if (mql) return mql
  mql = window.matchMedia(QUERY)
  mql.addEventListener('change', () => {
    listeners.forEach(l => l())
  })
  return mql
}

function subscribe(callback: () => void): () => void {
  ensureMql()
  listeners.add(callback)
  return () => { listeners.delete(callback) }
}

function getSnapshot(): boolean {
  return ensureMql()?.matches ?? false
}

function getServerSnapshot(): boolean {
  return false
}

export function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
