'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { Project, Link, PortfolioImage } from '@/lib/content'
import FeaturedToggle from './FeaturedToggle'
import IconPickerModal from './IconPickerModal'
import { renderIconValue } from '@/lib/projectIcon'
import { slugify } from '@/lib/contentBlockId'

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

type ResolvedTile =
  | { type: 'project'; id: string; data: Project }
  | { type: 'link'; id: string; data: Link }
  | { type: 'image'; id: string; data: PortfolioImage }
  | { type: 'section'; id: string; label: string }

interface TileEditorModalProps {
  tile: ResolvedTile
  currentTiles: string[]
  onClose: () => void
  onSaved: (oldId: string, newId: string) => void
}

const STATUS_OPTIONS: Project['status'][] = ['idea', 'building', 'active', 'archived']
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  idea:     { bg: '#F4F4F5', text: '#52525B' },
  building: { bg: '#FEF9C3', text: '#854D0E' },
  active:   { bg: '#DCFCE7', text: '#166534' },
  archived: { bg: '#F4F4F5', text: '#525252' },
}

const TAG_COLOR_PALETTE = [
  '#61BD4F', '#F2D600', '#FF9F1A', '#EB5A46', '#C377E0',
  '#0079BF', '#00C2E0', '#7BC86C', '#FF78CB', '#344563',
  '#51E898', '#F5A623', '#F99CDB', '#5E6C84', '#B3BAC5',
]

function TagColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {TAG_COLOR_PALETTE.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(value === color ? '' : color)}
            title={color}
            style={{
              width: '100%',
              aspectRatio: '2 / 1',
              borderRadius: 4,
              background: color,
              border: value === color ? '3px solid var(--foreground)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'transform 80ms, border-color 80ms',
              position: 'relative',
            }}
            aria-pressed={value === color}
          >
            {value === color && (
              <span style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fff', fontWeight: 700,
              }}>✓</span>
            )}
          </button>
        ))}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            marginTop: 8, fontSize: 12, color: 'var(--muted-foreground)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          × Remove color
        </button>
      )}
    </div>
  )
}

// ---- Project editor ----
function ProjectEditor({ tile, currentTiles, onClose, onSaved }: TileEditorModalProps & { tile: { type: 'project'; id: string; data: Project } }) {
  const { data: project } = tile
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? '')
  const [status, setStatus] = useState<Project['status']>(project.status)
  const [featured, setFeatured] = useState(project.featured ?? false)
  const [stack, setStack] = useState((project.stack ?? []).join(', '))
  const [link, setLink] = useState(project.link ?? '')
  const [icon, setIcon] = useState(project.icon ?? '')
  const [tag, setTag] = useState(project.tag ?? '')
  const [tagColor, setTagColor] = useState(project.tag_color ?? '')
  const [showTagColors, setShowTagColors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleSave = useCallback(async () => {
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const oldId = slugify(project.title)
      const updatedProject: Record<string, unknown> = {
        ...project,
        title: title.trim(),
        description: description.trim(),
        status,
        featured,
        stack: stack.split(',').map(s => s.trim()).filter(Boolean),
        link: link.trim() && isValidUrl(link.trim()) ? link.trim() : undefined,
        icon: icon.trim() || undefined,
        tag: tag.trim() || undefined,
        tag_color: tagColor || undefined,
      }

      const res = await fetch(`/api/content/projects/${oldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedProject }),
      })
      if (!res.ok) throw new Error('Save failed')
      const json = await res.json()
      if (!json.ok) throw new Error('Save failed')

      const newId = slugify(title.trim())
      if (newId !== oldId) {
        const newTiles = currentTiles.map(id => id === oldId ? newId : id)
        const layoutRes = await fetch('/api/content/layout', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { tiles: newTiles } }),
        })
        if (!layoutRes.ok) throw new Error('Layout save failed')
      }

      onSaved(oldId, newId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }, [project, title, description, status, featured, stack, link, icon, tag, tagColor, currentTiles, onSaved])

  return (
    <>
      <ModalHeader title="Edit Card" onClose={onClose} />
      <div style={scrollBody}>
        <Field label="Icon">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icon ? renderIconValue(icon) : <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>auto</span>}
            </div>
            <button onClick={() => setShowIconPicker(true)} style={secondaryBtn}>
              Change icon
            </button>
            {icon && (
              <button onClick={() => setIcon('')} style={{ ...secondaryBtn, color: 'var(--muted-foreground)' }}>
                Remove
              </button>
            )}
          </div>
        </Field>

        <Field label="Title *">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Project name"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
            placeholder="Describe this project in a few words…"
            rows={3}
          />
        </Field>

        <Field label="Tag (flair)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={tag}
                onChange={e => setTag(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="App, Game, SaaS…"
              />
              {tag && (
                <button
                  type="button"
                  onClick={() => setShowTagColors(v => !v)}
                  title="Choose tag color"
                  style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    border: '1px solid var(--border)', cursor: 'pointer',
                    background: tagColor || 'var(--muted)',
                    transition: 'border-color 150ms',
                  }}
                  aria-expanded={showTagColors}
                />
              )}
            </div>
            {tag && showTagColors && (
              <TagColorPicker value={tagColor} onChange={setTagColor} />
            )}
          </div>
        </Field>

        <Field label="Status">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map(s => {
              const colors = STATUS_COLORS[s]
              const isActive = status === s
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    border: isActive ? 'none' : '1.5px solid var(--border)',
                    background: isActive ? colors.bg : 'transparent',
                    color: isActive ? colors.text : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    transition: 'background 120ms, color 120ms',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Featured">
          <FeaturedToggle checked={featured} onChange={setFeatured} />
        </Field>

        <Field label="Stack (comma-separated)">
          <input
            value={stack}
            onChange={e => setStack(e.target.value)}
            style={inputStyle}
            placeholder="React, TypeScript, Tailwind…"
          />
        </Field>

        <Field label="Link">
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: link && !isValidUrl(link) ? '#dc2626' : 'var(--border)',
            }}
            placeholder="https://…"
          />
          {link && !isValidUrl(link) && (
            <span style={{ fontSize: 11, color: '#dc2626' }}>Invalid URL</span>
          )}
        </Field>
      </div>

      <ModalFooter error={error} saving={saving} onClose={onClose} onSave={handleSave} disabled={!title.trim()} />

      {showIconPicker && (
        <IconPickerModal
          currentValue={icon}
          onSelect={setIcon}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  )
}

// ---- Link editor ----
function LinkEditor({ tile, currentTiles, onClose, onSaved }: TileEditorModalProps & { tile: { type: 'link'; id: string; data: Link } }) {
  const { data: link } = tile
  const [url, setUrl] = useState(link.url)
  const [label, setLabel] = useState(link.label)
  const [icon, setIcon] = useState(link.icon ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleSave = useCallback(async () => {
    if (!url.trim() || !label.trim() || !isValidUrl(url.trim())) return
    setSaving(true)
    setError(null)
    try {
      const oldId = slugify(link.label)
      const updatedLink: Record<string, unknown> = {
        ...link,
        url: url.trim(),
        label: label.trim(),
        icon: icon.trim() || undefined,
      }

      const res = await fetch(`/api/content/links/${oldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedLink }),
      })
      if (!res.ok) throw new Error('Save failed')
      const json = await res.json()
      if (!json.ok) throw new Error('Save failed')

      const newId = slugify(label.trim())
      if (newId !== oldId) {
        const newTiles = currentTiles.map(id => id === oldId ? newId : id)
        await fetch('/api/content/layout', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { tiles: newTiles } }),
        })
      }

      onSaved(oldId, newId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }, [link, url, label, icon, currentTiles, onSaved])

  const urlOk = isValidUrl(url.trim())
  const canSave = url.trim() && label.trim() && urlOk

  return (
    <>
      <ModalHeader title="Edit Link" onClose={onClose} />
      <div style={scrollBody}>
        <Field label="Icon">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icon ? renderIconValue(icon) : <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>auto</span>}
            </div>
            <button onClick={() => setShowIconPicker(true)} style={secondaryBtn}>
              Change icon
            </button>
            {icon && (
              <button onClick={() => setIcon('')} style={{ ...secondaryBtn, color: 'var(--muted-foreground)' }}>
                Remove
              </button>
            )}
          </div>
        </Field>

        <Field label="URL *">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ ...inputStyle, borderColor: url && !urlOk ? '#dc2626' : 'var(--border)' }}
            placeholder="https://…"
          />
          {url && !urlOk && <span style={{ fontSize: 11, color: '#dc2626' }}>Invalid URL</span>}
        </Field>
        <Field label="Label *">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={inputStyle}
            placeholder="Link name"
          />
        </Field>
      </div>
      <ModalFooter error={error} saving={saving} onClose={onClose} onSave={handleSave} disabled={!canSave} />

      {showIconPicker && (
        <IconPickerModal
          currentValue={icon}
          onSelect={setIcon}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  )
}

// ---- Image editor ----
function ImageEditor({ tile, currentTiles, onClose, onSaved }: TileEditorModalProps & { tile: { type: 'image'; id: string; data: PortfolioImage } }) {
  const { data: image } = tile
  const [src, setSrc] = useState(image.src)
  const [label, setLabel] = useState(image.label ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!src.trim()) return
    setSaving(true)
    setError(null)
    try {
      const oldId = image.id ?? slugify(image.label ?? image.src ?? '')
      const updatedImage: Record<string, unknown> = {
        ...image,
        src: src.trim(),
        label: label.trim() || undefined,
      }

      const res = await fetch(`/api/content/images/${oldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedImage }),
      })
      if (!res.ok) throw new Error('Save failed')
      const json = await res.json()
      if (!json.ok) throw new Error('Save failed')

      onSaved(tile.id, tile.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }, [image, src, label, tile.id, onSaved])

  return (
    <>
      <ModalHeader title="Edit Image" onClose={onClose} />
      <div style={scrollBody}>
        <Field label="Source (path or URL) *">
          <input
            value={src}
            onChange={e => setSrc(e.target.value)}
            style={inputStyle}
            placeholder="/images/photo.jpg or https://…"
          />
        </Field>
        <Field label="Caption (optional)">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={inputStyle}
            placeholder="Image description"
          />
        </Field>
      </div>
      <ModalFooter error={error} saving={saving} onClose={onClose} onSave={handleSave} disabled={!src.trim()} />
    </>
  )
}

// ---- Section editor ----
function SectionEditor({ tile, currentTiles, onClose, onSaved }: TileEditorModalProps & { tile: { type: 'section'; id: string; label: string } }) {
  const [label, setLabel] = useState(tile.label)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    if (!label.trim()) return
    setSaving(true)
    setError(null)
    try {
      const newId = `section-${slugify(label.trim())}`
      if (newId !== tile.id && currentTiles.includes(newId)) {
        setError('A section with this name already exists')
        return
      }
      const newTiles = currentTiles.map(id => id === tile.id ? newId : id)
      const res = await fetch('/api/content/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { tiles: newTiles } }),
      })
      if (!res.ok) throw new Error('Save failed')
      const json = await res.json()
      if (!json.ok) throw new Error('Save failed')
      onSaved(tile.id, newId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }, [tile.id, label, currentTiles, onSaved])

  return (
    <>
      <ModalHeader title="Edit Section" onClose={onClose} />
      <div style={scrollBody}>
        <Field label="Section title *">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            style={inputStyle}
            placeholder="Section name"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
        </Field>
      </div>
      <ModalFooter error={error} saving={saving} onClose={onClose} onSave={handleSave} disabled={!label.trim()} />
    </>
  )
}

// ---- Shared UI pieces ----
function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 20px 0', flexShrink: 0,
    }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>{title}</h2>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 4, display: 'flex', borderRadius: 6 }}
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ModalFooter({ error, saving, onClose, onSave, disabled }: {
  error: string | null
  saving: boolean
  onClose: () => void
  onSave: () => void
  disabled: boolean
}) {
  return (
    <div style={{
      padding: '12px 20px 18px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0,
    }}>
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={secondaryBtn}>Cancel</button>
        <button
          onClick={onSave}
          disabled={disabled || saving}
          style={{
            ...secondaryBtn,
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            border: 'none',
            fontWeight: 600,
            opacity: disabled || saving ? 0.6 : 1,
            cursor: disabled || saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

const scrollBody: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--background)',
  color: 'var(--foreground)',
  outline: 'none',
  boxSizing: 'border-box',
}

const secondaryBtn: React.CSSProperties = {
  padding: '7px 14px',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--foreground)',
  cursor: 'pointer',
}

// ---- Root modal ----
export default function TileEditorModal({ tile, currentTiles, onClose, onSaved }: TileEditorModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <style>{`
        @keyframes editor-modal-enter {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          width: 'min(440px, calc(100vw - 24px))',
          maxHeight: 'min(640px, 90vh)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'editor-modal-enter 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {tile.type === 'project' && (
          <ProjectEditor tile={tile} currentTiles={currentTiles} onClose={onClose} onSaved={onSaved} />
        )}
        {tile.type === 'link' && (
          <LinkEditor tile={tile} currentTiles={currentTiles} onClose={onClose} onSaved={onSaved} />
        )}
        {tile.type === 'image' && (
          <ImageEditor tile={tile} currentTiles={currentTiles} onClose={onClose} onSaved={onSaved} />
        )}
        {tile.type === 'section' && (
          <SectionEditor tile={tile} currentTiles={currentTiles} onClose={onClose} onSaved={onSaved} />
        )}
      </div>
    </div>
  )
}
