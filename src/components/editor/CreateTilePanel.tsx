'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type TileType = 'Card' | 'Section' | 'Image'

interface CreateTilePanelProps {
  currentTiles: string[]
  onClose: () => void
  onCreated: (newTileId: string) => void
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}


export default function CreateTilePanel({ currentTiles, onClose, onCreated }: CreateTilePanelProps) {
  const [activeType, setActiveType] = useState<TileType>('Card')
  const [title, setTitle] = useState('')
  const [label, setLabel] = useState('')
  const [src, setSrc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function resetForm() {
    setTitle('')
    setLabel('')
    setSrc('')
    setError(null)
  }

  function handleTypeChange(type: TileType) {
    setActiveType(type)
    resetForm()
  }

  function isFormValid(): boolean {
    switch (activeType) {
      case 'Card': return title.trim().length > 0
      case 'Section': return label.trim().length > 0
      case 'Image': return src.trim().length > 0
    }
  }

  async function handleSubmit() {
    if (!isFormValid() || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      let newId: string

      if (activeType === 'Section') {
        // Sections live only in layout — no content file POST needed
        newId = `section-${slugify(label.trim())}`
        const layoutRes = await fetch('/api/content/layout', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { tiles: [...currentTiles, newId] } }),
        })
        if (!layoutRes.ok) throw new Error('Layout save failed')
        const layoutJson = await layoutRes.json()
        if (!layoutJson.ok) throw new Error('Layout save failed')
      } else {
        // POST new block to content file
        const today = new Date().toISOString().slice(0, 10)
        let blockData: Record<string, unknown>
        let targetFile: string

        if (activeType === 'Card') {
          targetFile = 'projects'
          blockData = {
            type: 'project',
            title: title.trim(),
            status: 'idea',
            now: false,
            size: 'square',
            modal: false,
            description: '',
            stack: [],
            start_date: today,
          }
        } else {
          // Image
          targetFile = 'images'
          blockData = {
            type: 'image',
            src: src.trim(),
            label: label.trim() || undefined,
            size: 'square-sm',
          }
        }

        const postRes = await fetch(`/api/content/${targetFile}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: blockData }),
        })
        if (!postRes.ok) throw new Error('Block creation failed')
        const postJson = await postRes.json()
        if (!postJson.ok || !postJson.id) throw new Error('Block creation failed')
        newId = postJson.id

        const layoutRes = await fetch('/api/content/layout', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { tiles: [...currentTiles, newId] } }),
        })
        if (!layoutRes.ok) throw new Error('Layout save failed')
        const layoutJson = await layoutRes.json()
        if (!layoutJson.ok) throw new Error('Layout save failed')
      }

      onCreated(newId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const types: TileType[] = ['Card', 'Section', 'Image']

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: '0 24px 88px 0',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={panelRef}
        style={{
          pointerEvents: 'auto',
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl, 16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '20px',
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>
            New block
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 12,
                fontWeight: activeType === type ? 600 : 400,
                borderRadius: 8,
                border: activeType === type ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                background: activeType === type ? 'var(--accent)' : 'transparent',
                color: activeType === type ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {activeType === 'Card' && (
            <input
              autoFocus
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          )}
          {activeType === 'Section' && (
            <input
              autoFocus
              placeholder="Label *"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={inputStyle}
            />
          )}
          {activeType === 'Image' && (
            <input
              autoFocus
              placeholder="Image path or URL *"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              style={inputStyle}
            />
          )}
          <button type="submit" style={{ display: 'none' }} aria-hidden tabIndex={-1} />
        </form>

        {error && (
          <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || submitting}
          style={{
            background: isFormValid() && !submitting ? 'var(--accent)' : 'var(--muted)',
            color: isFormValid() && !submitting ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
            border: 'none',
            borderRadius: 9999,
            padding: '8px 0',
            fontWeight: 600,
            fontSize: 13,
            cursor: isFormValid() && !submitting ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  fontSize: 13,
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--background)',
  color: 'var(--foreground)',
  outline: 'none',
  boxSizing: 'border-box',
}
