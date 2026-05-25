'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import type { Config, Link } from '@/lib/content'
import { getPlatform } from '@/lib/platforms'
import SocialIcon from '@/components/ui/SocialIcon'

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getDisplayUrl(url: string): string {
  if (url.startsWith('mailto:')) return url.replace('mailto:', '')
  try {
    const u = new URL(url)
    return (u.hostname.replace('www.', '') + u.pathname).replace(/\/$/, '')
  } catch {
    return url
  }
}

async function saveConfigField(field: 'name' | 'tagline' | 'description', value: string): Promise<void> {
  const getRes = await fetch('/api/content/config')
  if (!getRes.ok) throw new Error('Failed to read config')
  const { data } = await getRes.json()
  const updated: Record<string, unknown> = { ...data }
  if (!value && field === 'description') {
    delete updated.description
  } else {
    updated[field] = value
  }
  const putRes = await fetch('/api/content/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: updated }),
  })
  if (!putRes.ok) throw new Error('Failed to save config')
  const json = await putRes.json()
  if (!json.ok) throw new Error('Failed to save config')
}

type FieldSaveCallback = (field: 'name' | 'tagline' | 'description', value: string) => void

interface InlineEditableTextProps {
  value: string
  field: 'name' | 'tagline' | 'description'
  as?: 'h1' | 'p'
  className?: string
  style?: React.CSSProperties
  onFieldSave?: FieldSaveCallback
}

function InlineEditableText({ value: initialValue, field, as: Tag = 'p', className, style, onFieldSave }: InlineEditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialValue)
  const [displayed, setDisplayed] = useState(initialValue)

  const commit = async () => {
    const trimmed = draft.trim() || displayed
    if (trimmed === displayed) { setEditing(false); return }
    const prev = displayed
    setDisplayed(trimmed)
    setEditing(false)
    try {
      await saveConfigField(field, trimmed)
      onFieldSave?.(field, trimmed)
    } catch {
      setDisplayed(prev)
    }
  }

  const cancel = () => {
    setDraft(displayed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit() }
          if (e.key === 'Escape') { e.preventDefault(); cancel() }
        }}
        autoFocus
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid currentColor',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%',
          color: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit',
        }}
        className={className}
      />
    )
  }

  return (
    <Tag
      className={className}
      style={{ ...style, cursor: 'text' }}
      onClick={() => { setDraft(displayed); setEditing(true) }}
      title="Click to edit"
    >
      {displayed}
    </Tag>
  )
}

function EditableDescription({ value: initialValue, onFieldSave }: { value: string; onFieldSave?: FieldSaveCallback }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialValue)
  const [displayed, setDisplayed] = useState(initialValue)

  const commit = async () => {
    const trimmed = draft.trim()
    if (trimmed === displayed) { setEditing(false); return }
    setDisplayed(trimmed)
    setEditing(false)
    await saveConfigField('description', trimmed).catch(() => {})
    onFieldSave?.('description', trimmed)
  }

  const cancel = () => {
    setDraft(displayed)
    setEditing(false)
  }

  if (editing) {
    return (
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Escape') { e.preventDefault(); cancel() }
        }}
        autoFocus
        rows={4}
        className="text-[--muted-foreground]/70 text-sm leading-[1.6] mb-6 whitespace-pre-line w-full resize-none bg-transparent outline-none border-b border-[--muted-foreground]/30"
      />
    )
  }

  return (
    <p
      className="text-[--muted-foreground]/70 text-sm leading-[1.6] mb-6 whitespace-pre-line cursor-text min-h-[2.5rem]"
      onClick={() => { setDraft(displayed); setEditing(true) }}
      title="Click to edit"
    >
      {displayed || <span className="opacity-30 italic">Add a description…</span>}
    </p>
  )
}

function LinksEditor({ links: initialLinks }: { links: Link[] }) {
  const [links, setLinks] = useState(initialLinks)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const handleAdd = async () => {
    const url = draft.trim()
    if (!url) { setAdding(false); setDraft(''); return }

    let label = ''
    try {
      if (url.startsWith('mailto:')) {
        label = 'Email'
      } else {
        const domain = new URL(url).hostname.replace('www.', '')
        const platform = getPlatform(domain)
        label = platform.label || domain
      }
    } catch {
      setAdding(false)
      setDraft('')
      return
    }

    const data = { type: 'link' as const, url, label, size: 'square' as const }
    try {
      const res = await fetch('/api/content/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      if (res.ok) {
        setLinks(prev => [...prev, data])
      }
    } catch { /* silent */ }

    setDraft('')
    setAdding(false)
  }

  const handleDelete = async (link: Link) => {
    const id = slugify(link.label)
    setLinks(prev => prev.filter(l => l.label !== link.label))
    try {
      await fetch(`/api/content/links/${id}`, { method: 'DELETE' })
    } catch { /* silent */ }
  }

  return (
    <div className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-3">
      {links.map((link) => (
        <div key={link.label} className="flex items-center gap-2.5 group">
          <span className="md:hidden w-9 h-9 flex items-center justify-center text-[--muted-foreground] bg-[--muted] rounded-lg shrink-0">
            <SocialIcon link={link} size={20} />
          </span>
          <span className="hidden md:flex w-7 h-7 items-center justify-center text-[--muted-foreground] bg-[--muted] rounded-lg shrink-0">
            <SocialIcon link={link} size={18} />
          </span>
          <span className="hidden md:inline text-xs text-[--muted-foreground]/60 underline underline-offset-2 decoration-[--muted-foreground]/25">
            {getDisplayUrl(link.url)}
          </span>
          <button
            onClick={() => handleDelete(link)}
            className="ml-auto opacity-0 group-hover:opacity-100 text-[--muted-foreground]/50 hover:text-red-400 transition-opacity text-sm leading-none"
            aria-label={`Remove ${link.label}`}
          >
            ×
          </button>
        </div>
      ))}

      {adding ? (
        <input
          type="url"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleAdd}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
            if (e.key === 'Escape') { setAdding(false); setDraft('') }
          }}
          placeholder="https://..."
          autoFocus
          className="text-xs bg-transparent border-b border-[--muted-foreground]/30 outline-none text-[--foreground] pb-0.5 w-full placeholder:text-[--muted-foreground]/30"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-[--muted-foreground]/30 hover:text-[--muted-foreground]/60 text-left transition-colors"
        >
          + add link
        </button>
      )}
    </div>
  )
}

function EditableAvatar({ config }: { config: Config }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState(config.avatar ?? '')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const uploadJson = await uploadRes.json()
      if (!uploadJson.ok) return
      const path = uploadJson.path as string
      const getRes = await fetch('/api/content/config')
      if (!getRes.ok) return
      const { data } = await getRes.json()
      await fetch('/api/content/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...data, avatar: path } }),
      })
      setAvatarSrc(path)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div
      className="mb-6 relative group w-fit cursor-pointer"
      onClick={() => fileRef.current?.click()}
      title="Change avatar"
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={config.name}
          width={160}
          height={160}
          className="rounded-full object-cover"
          unoptimized
          priority
          fetchPriority="high"
        />
      ) : (
        <div className="w-[160px] h-[160px] rounded-full bg-[--muted] flex items-center justify-center">
          <Camera size={32} className="text-[--muted-foreground]" />
        </div>
      )}
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        {uploading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={28} className="text-white" />
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}

interface HeroTileEditorProps {
  config: Config
  links?: Link[]
  onFieldSave?: FieldSaveCallback
}

export default function HeroTileEditor({ config, links = [], onFieldSave }: HeroTileEditorProps) {
  return (
    <div className="h-full flex flex-col justify-start px-8 pt-10 pb-8">
      <EditableAvatar config={config} />

      <InlineEditableText
        value={config.name}
        field="name"
        as="h1"
        className="font-bold leading-[1.1] mb-1 text-[--foreground]"
        style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}
        onFieldSave={onFieldSave}
      />

      <InlineEditableText
        value={config.tagline}
        field="tagline"
        as="p"
        className={`text-[--muted-foreground] text-[1rem] leading-[1.5] ${config.description !== undefined ? 'mb-3' : 'mb-6'}`}
        onFieldSave={onFieldSave}
      />

      <EditableDescription value={config.description ?? ''} onFieldSave={onFieldSave} />

      <LinksEditor links={links} />
    </div>
  )
}
