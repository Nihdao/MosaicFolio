'use client'

import { useSortable } from '@dnd-kit/sortable'
import React, { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Trash2, Pencil } from 'lucide-react'

type TileType = 'project' | 'link' | 'image' | 'section' | 'unknown'

interface LayoutPickerProps {
  currentSize?: string
  tileType?: TileType
  onSizeChange: (size: string) => void
}

const FORMATS_PROJECT_LINK = [
  { id: 'square', label: 'Square 1/2' },
  { id: 'full',   label: 'Full 4×1'   },
] as const

const FORMATS_IMAGE = [
  { id: 'square-sm', label: 'Small 1/4' },
  { id: 'square',    label: 'Square 1/2' },
  { id: 'full',      label: 'Full 4×1'  },
] as const

function getFormatsForType(type?: TileType) {
  if (type === 'image') return FORMATS_IMAGE
  return FORMATS_PROJECT_LINK
}

function SquareSmIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  )
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="10" height="10" rx="1" fill="currentColor" />
    </svg>
  )
}

function FullIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="7" width="18" height="6" rx="1" fill="currentColor" />
    </svg>
  )
}

const FORMAT_ICONS: Record<string, () => React.ReactElement> = {
  'square-sm': SquareSmIcon,
  square:      SquareIcon,
  full:        FullIcon,
}

function LayoutPicker({ currentSize, tileType, onSizeChange }: LayoutPickerProps) {
  const isSectionType = tileType === 'section'
  const formats = getFormatsForType(tileType)
  const defaultId = tileType === 'image' ? 'square-sm' : 'square'
  return (
    <div
      style={{
        position: 'absolute',
        bottom: tileType === 'image' ? 36 : 6,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 102,
        display: 'flex',
        gap: 4,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 8,
        padding: '4px 6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {formats.map(({ id, label }) => {
        const isActive = currentSize === id || (id === defaultId && !currentSize)
        const isDisabled = isSectionType && id !== 'full'
        const Icon = FORMAT_ICONS[id]
        return (
          <button
            key={id}
            onClick={(e) => { e.stopPropagation(); if (!isDisabled) onSizeChange(id) }}
            aria-label={label}
            disabled={isDisabled}
            style={{
              background: isActive ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: 5,
              padding: 4,
              cursor: isDisabled ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive
                ? 'var(--accent-foreground)'
                : isDisabled
                  ? 'rgba(0,0,0,0.2)'
                  : 'rgba(0,0,0,0.6)',
              transition: 'background 120ms ease, color 120ms ease',
            }}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}

interface SortableTileWrapperProps {
  id: string
  children: ReactNode
  className?: string
  onDelete?: () => void
  onEdit?: () => void
  currentSize?: string
  tileType?: TileType
  onSizeChange?: (size: string) => void
}

export default function SortableTileWrapper({
  id,
  children,
  className,
  onDelete,
  onEdit,
  currentSize,
  tileType,
  onSizeChange,
}: SortableTileWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [hovered, setHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
    }
  }, [])

  function handleMouseEnter() {
    setHovered(true)
    if (onSizeChange) {
      pickerTimerRef.current = setTimeout(() => setShowPicker(true), 200)
    }
  }

  function handleMouseLeave() {
    setHovered(false)
    if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
    setShowPicker(false)
  }

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...attributes}
      {...listeners}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toolbar — visible on hover */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 101,
          display: 'flex',
          gap: 4,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 150ms ease',
        }}
      >
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Delete ${id}`}
            tabIndex={hovered ? 0 : -1}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Edit ${id}`}
            tabIndex={hovered ? 0 : -1}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--foreground)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      {showPicker && onSizeChange && (
        <LayoutPicker
          currentSize={currentSize}
          tileType={tileType}
          onSizeChange={onSizeChange}
        />
      )}
      {children}
    </div>
  )
}
