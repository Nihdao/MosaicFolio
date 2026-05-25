'use client'
import { useState, useRef, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableFieldProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
  type?: 'text' | 'select'
  options?: string[]
  className?: string
  placeholder?: string
}

const inputStyle: React.CSSProperties = {
  padding: '2px 6px',
  borderRadius: 4,
  border: '1px solid #666',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  background: 'var(--background, #0a0a0a)',
  color: 'var(--foreground, #fafafa)',
  width: '100%',
  boxSizing: 'border-box',
}

export default function EditableField({
  value,
  onSave,
  multiline,
  type = 'text',
  options,
  className,
  placeholder,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [displayValue, setDisplayValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<'idle' | 'saved' | 'error'>('idle')
  // Bypass equality guard after a failed save so the user can retry the same value (AC7)
  const hasPendingErrorRef = useRef(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevents double-save when blur fires after Enter/onChange already triggered a save
  const pendingSaveRef = useRef(false)

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (editing) return
    setDisplayValue(value)
  }, [value, editing])

  const handleSave = async (valueToSave = draft) => {
    if (pendingSaveRef.current) return
    pendingSaveRef.current = true
    if (valueToSave === displayValue && !hasPendingErrorRef.current) {
      setEditing(false)
      pendingSaveRef.current = false
      return
    }
    hasPendingErrorRef.current = false
    setDisplayValue(valueToSave) // optimistic update
    setEditing(false)
    setSaving(true)
    try {
      await onSave(valueToSave)
      setFeedback('saved')
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = setTimeout(() => setFeedback('idle'), 2000)
    } catch {
      // AC7: keep optimistic value on error, show ✗, allow retry
      hasPendingErrorRef.current = true
      setFeedback('error')
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = setTimeout(() => setFeedback('idle'), 3000)
    } finally {
      setSaving(false)
      pendingSaveRef.current = false
    }
  }

  const handleCancel = () => {
    setDraft(displayValue)
    setEditing(false)
  }

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4, width: '100%' }}>
        {type === 'select' ? (
          // AC4: select → immediate PUT on onChange
          <select
            value={draft}
            onChange={e => { setDraft(e.target.value); handleSave(e.target.value) }}
            onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); handleCancel() } }}
            onBlur={() => setEditing(false)}
            autoFocus
            disabled={saving}
            style={inputStyle}
          >
            {options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : multiline ? (
          // AC5: textarea — Enter = newline, Cmd/Ctrl+Enter = save, blur = save
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { e.stopPropagation(); handleCancel() }
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); e.stopPropagation(); handleSave() }
            }}
            onBlur={() => handleSave()}
            autoFocus
            disabled={saving}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        ) : (
          // AC2: text input — Enter = save, blur = save
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleSave() }
              if (e.key === 'Escape') { e.stopPropagation(); handleCancel() }
            }}
            onBlur={() => handleSave()}
            autoFocus
            disabled={saving}
            style={inputStyle}
          />
        )}
      </span>
    )
  }

  const isEmpty = !displayValue && !!placeholder

  return (
    <span
      className={cn('group/ef relative inline-flex items-center gap-1', className)}
      onClick={e => {
        if (saving) return
        e.stopPropagation()
        setDraft(displayValue)
        setEditing(true)
      }}
      title="Click to edit"
      style={{ cursor: saving ? 'default' : 'text' }}
    >
      {isEmpty ? (
        <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>{placeholder}</span>
      ) : displayValue}
      {/* AC10: pencil toujours discret en mode affichage */}
      <Pencil
        size={10}
        aria-hidden
        className="opacity-0 group-hover/ef:opacity-50 transition-opacity shrink-0"
      />
      {/* AC6: indicateurs d'état à droite en mode affichage */}
      {saving && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>…</span>
      )}
      {!saving && feedback === 'saved' && (
        <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 'normal' }}>✓</span>
      )}
      {!saving && feedback === 'error' && (
        <span style={{ fontSize: 10, color: '#f87171', fontWeight: 'normal' }}>✗</span>
      )}
    </span>
  )
}
