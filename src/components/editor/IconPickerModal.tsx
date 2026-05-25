'use client'

import { useState, useMemo, useCallback } from 'react'
import { X, Search, Link, Upload as UploadIcon } from 'lucide-react'
import {
  Code, Terminal, Globe, Rocket, Sparkles, Box, Package, Layers,
  Monitor, Smartphone, Server, Database, Cloud, Lock, Shield, Key,
  User, Users, Star, Heart, Bookmark, Folder, FileText, Mail,
  MessageSquare, Bell, Calendar, Clock, Target, Trophy, Briefcase,
  Lightbulb, Brain, Settings, Wrench, Share2, Download, Upload,
  ExternalLink, Zap, Power, Wifi, Play, Book, Pen, Feather,
  GitBranch, Cpu, Eye, type LucideIcon,
} from 'lucide-react'
import {
  siGithub, siGitlab, siGit, siVercel, siNetlify,
  siReact, siVuedotjs, siSvelte, siAngular, siAstro, siThreedotjs,
  siNextdotjs, siTypescript, siJavascript,
  siNodedotjs, siDeno, siNpm, siBun,
  siTailwindcss, siCss, siHtml5, siSass,
  siDocker, siKubernetes,
  siGo, siRust, siSwift, siKotlin, siPython, siPhp, siRuby, siElixir, siScala, siCplusplus,
  siPostgresql, siMongodb, siMysql, siSqlite, siRedis, siFirebase, siSupabase,
  siGraphql, siPrisma, siDrizzle, siStripe,
  siFigma, siNotion, siLinear, siDiscord,
  siVite, siWebpack, siEslint, siPrettier, siTurborepo,
  siGooglecloud, siFlutter, siAndroid, siApple,
  siClaude, siAnthropic,
} from 'simple-icons'

type Tab = 'lucide' | 'brands' | 'url'

interface LucideEntry {
  id: string
  label: string
  Icon: LucideIcon
}

interface BrandEntry {
  id: string
  label: string
  path: string
  hex: string
}

const LUCIDE_LIST: LucideEntry[] = [
  { id: 'lucide:code', label: 'Code', Icon: Code },
  { id: 'lucide:terminal', label: 'Terminal', Icon: Terminal },
  { id: 'lucide:globe', label: 'Globe', Icon: Globe },
  { id: 'lucide:link', label: 'Link', Icon: Link },
  { id: 'lucide:rocket', label: 'Rocket', Icon: Rocket },
  { id: 'lucide:sparkles', label: 'Sparkles', Icon: Sparkles },
  { id: 'lucide:box', label: 'Box', Icon: Box },
  { id: 'lucide:package', label: 'Package', Icon: Package },
  { id: 'lucide:layers', label: 'Layers', Icon: Layers },
  { id: 'lucide:monitor', label: 'Monitor', Icon: Monitor },
  { id: 'lucide:smartphone', label: 'Smartphone', Icon: Smartphone },
  { id: 'lucide:server', label: 'Server', Icon: Server },
  { id: 'lucide:database', label: 'Database', Icon: Database },
  { id: 'lucide:cloud', label: 'Cloud', Icon: Cloud },
  { id: 'lucide:lock', label: 'Lock', Icon: Lock },
  { id: 'lucide:shield', label: 'Shield', Icon: Shield },
  { id: 'lucide:key', label: 'Key', Icon: Key },
  { id: 'lucide:user', label: 'User', Icon: User },
  { id: 'lucide:users', label: 'Users', Icon: Users },
  { id: 'lucide:star', label: 'Star', Icon: Star },
  { id: 'lucide:heart', label: 'Heart', Icon: Heart },
  { id: 'lucide:bookmark', label: 'Bookmark', Icon: Bookmark },
  { id: 'lucide:folder', label: 'Folder', Icon: Folder },
  { id: 'lucide:file-text', label: 'Document', Icon: FileText },
  { id: 'lucide:mail', label: 'Mail', Icon: Mail },
  { id: 'lucide:message-square', label: 'Message', Icon: MessageSquare },
  { id: 'lucide:bell', label: 'Bell', Icon: Bell },
  { id: 'lucide:calendar', label: 'Calendar', Icon: Calendar },
  { id: 'lucide:clock', label: 'Clock', Icon: Clock },
  { id: 'lucide:target', label: 'Target', Icon: Target },
  { id: 'lucide:trophy', label: 'Trophy', Icon: Trophy },
  { id: 'lucide:briefcase', label: 'Briefcase', Icon: Briefcase },
  { id: 'lucide:lightbulb', label: 'Lightbulb', Icon: Lightbulb },
  { id: 'lucide:brain', label: 'Brain', Icon: Brain },
  { id: 'lucide:settings', label: 'Settings', Icon: Settings },
  { id: 'lucide:wrench', label: 'Wrench', Icon: Wrench },
  { id: 'lucide:share-2', label: 'Share', Icon: Share2 },
  { id: 'lucide:download', label: 'Download', Icon: Download },
  { id: 'lucide:upload', label: 'Upload', Icon: Upload },
  { id: 'lucide:external-link', label: 'External Link', Icon: ExternalLink },
  { id: 'lucide:zap', label: 'Zap', Icon: Zap },
  { id: 'lucide:power', label: 'Power', Icon: Power },
  { id: 'lucide:wifi', label: 'Wifi', Icon: Wifi },
  { id: 'lucide:play', label: 'Play', Icon: Play },
  { id: 'lucide:book', label: 'Book', Icon: Book },
  { id: 'lucide:pen', label: 'Pen', Icon: Pen },
  { id: 'lucide:feather', label: 'Feather', Icon: Feather },
  { id: 'lucide:git-branch', label: 'Git Branch', Icon: GitBranch },
  { id: 'lucide:cpu', label: 'CPU', Icon: Cpu },
  { id: 'lucide:eye', label: 'Eye', Icon: Eye },
]

const BRAND_LIST: BrandEntry[] = [
  { id: 'si:github', label: 'GitHub', path: siGithub.path, hex: siGithub.hex },
  { id: 'si:gitlab', label: 'GitLab', path: siGitlab.path, hex: siGitlab.hex },
  { id: 'si:git', label: 'Git', path: siGit.path, hex: siGit.hex },
  { id: 'si:vercel', label: 'Vercel', path: siVercel.path, hex: siVercel.hex },
  { id: 'si:netlify', label: 'Netlify', path: siNetlify.path, hex: siNetlify.hex },
  { id: 'si:react', label: 'React', path: siReact.path, hex: siReact.hex },
  { id: 'si:vuedotjs', label: 'Vue.js', path: siVuedotjs.path, hex: siVuedotjs.hex },
  { id: 'si:svelte', label: 'Svelte', path: siSvelte.path, hex: siSvelte.hex },
  { id: 'si:threedotjs', label: 'Three.js', path: siThreedotjs.path, hex: siThreedotjs.hex },
  { id: 'si:angular', label: 'Angular', path: siAngular.path, hex: siAngular.hex },
  { id: 'si:astro', label: 'Astro', path: siAstro.path, hex: siAstro.hex },
  { id: 'si:nextdotjs', label: 'Next.js', path: siNextdotjs.path, hex: siNextdotjs.hex },
  { id: 'si:typescript', label: 'TypeScript', path: siTypescript.path, hex: siTypescript.hex },
  { id: 'si:javascript', label: 'JavaScript', path: siJavascript.path, hex: siJavascript.hex },
  { id: 'si:nodedotjs', label: 'Node.js', path: siNodedotjs.path, hex: siNodedotjs.hex },
  { id: 'si:deno', label: 'Deno', path: siDeno.path, hex: siDeno.hex },
  { id: 'si:npm', label: 'npm', path: siNpm.path, hex: siNpm.hex },
  { id: 'si:bun', label: 'Bun', path: siBun.path, hex: siBun.hex },
  { id: 'si:tailwindcss', label: 'Tailwind CSS', path: siTailwindcss.path, hex: siTailwindcss.hex },
  { id: 'si:css', label: 'CSS', path: siCss.path, hex: siCss.hex },
  { id: 'si:html5', label: 'HTML5', path: siHtml5.path, hex: siHtml5.hex },
  { id: 'si:sass', label: 'Sass', path: siSass.path, hex: siSass.hex },
  { id: 'si:docker', label: 'Docker', path: siDocker.path, hex: siDocker.hex },
  { id: 'si:kubernetes', label: 'Kubernetes', path: siKubernetes.path, hex: siKubernetes.hex },
  { id: 'si:go', label: 'Go', path: siGo.path, hex: siGo.hex },
  { id: 'si:rust', label: 'Rust', path: siRust.path, hex: siRust.hex },
  { id: 'si:swift', label: 'Swift', path: siSwift.path, hex: siSwift.hex },
  { id: 'si:kotlin', label: 'Kotlin', path: siKotlin.path, hex: siKotlin.hex },
  { id: 'si:python', label: 'Python', path: siPython.path, hex: siPython.hex },
  { id: 'si:php', label: 'PHP', path: siPhp.path, hex: siPhp.hex },
  { id: 'si:ruby', label: 'Ruby', path: siRuby.path, hex: siRuby.hex },
  { id: 'si:elixir', label: 'Elixir', path: siElixir.path, hex: siElixir.hex },
  { id: 'si:scala', label: 'Scala', path: siScala.path, hex: siScala.hex },
  { id: 'si:cplusplus', label: 'C++', path: siCplusplus.path, hex: siCplusplus.hex },
  { id: 'si:postgresql', label: 'PostgreSQL', path: siPostgresql.path, hex: siPostgresql.hex },
  { id: 'si:mongodb', label: 'MongoDB', path: siMongodb.path, hex: siMongodb.hex },
  { id: 'si:mysql', label: 'MySQL', path: siMysql.path, hex: siMysql.hex },
  { id: 'si:sqlite', label: 'SQLite', path: siSqlite.path, hex: siSqlite.hex },
  { id: 'si:redis', label: 'Redis', path: siRedis.path, hex: siRedis.hex },
  { id: 'si:firebase', label: 'Firebase', path: siFirebase.path, hex: siFirebase.hex },
  { id: 'si:supabase', label: 'Supabase', path: siSupabase.path, hex: siSupabase.hex },
  { id: 'si:graphql', label: 'GraphQL', path: siGraphql.path, hex: siGraphql.hex },
  { id: 'si:prisma', label: 'Prisma', path: siPrisma.path, hex: siPrisma.hex },
  { id: 'si:drizzle', label: 'Drizzle', path: siDrizzle.path, hex: siDrizzle.hex },
  { id: 'si:stripe', label: 'Stripe', path: siStripe.path, hex: siStripe.hex },
  { id: 'si:figma', label: 'Figma', path: siFigma.path, hex: siFigma.hex },
  { id: 'si:notion', label: 'Notion', path: siNotion.path, hex: siNotion.hex },
  { id: 'si:linear', label: 'Linear', path: siLinear.path, hex: siLinear.hex },
  { id: 'si:discord', label: 'Discord', path: siDiscord.path, hex: siDiscord.hex },
  { id: 'si:vite', label: 'Vite', path: siVite.path, hex: siVite.hex },
  { id: 'si:webpack', label: 'Webpack', path: siWebpack.path, hex: siWebpack.hex },
  { id: 'si:eslint', label: 'ESLint', path: siEslint.path, hex: siEslint.hex },
  { id: 'si:prettier', label: 'Prettier', path: siPrettier.path, hex: siPrettier.hex },
  { id: 'si:turborepo', label: 'Turborepo', path: siTurborepo.path, hex: siTurborepo.hex },
  { id: 'si:googlecloud', label: 'Google Cloud', path: siGooglecloud.path, hex: siGooglecloud.hex },
  { id: 'si:flutter', label: 'Flutter', path: siFlutter.path, hex: siFlutter.hex },
  { id: 'si:android', label: 'Android', path: siAndroid.path, hex: siAndroid.hex },
  { id: 'si:apple', label: 'Apple', path: siApple.path, hex: siApple.hex },
  { id: 'si:claude', label: 'Claude', path: siClaude.path, hex: siClaude.hex },
  { id: 'si:anthropic', label: 'Anthropic', path: siAnthropic.path, hex: siAnthropic.hex },
]

interface IconPickerModalProps {
  currentValue: string
  onSelect: (value: string) => void
  onClose: () => void
}

export default function IconPickerModal({ currentValue, onSelect, onClose }: IconPickerModalProps) {
  const [tab, setTab] = useState<Tab>(() => {
    if (currentValue.startsWith('si:')) return 'brands'
    if (currentValue.startsWith('http') || currentValue.startsWith('/')) return 'url'
    return 'lucide'
  })
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(currentValue)
  const [urlDraft, setUrlDraft] = useState(
    currentValue.startsWith('http') || currentValue.startsWith('/') ? currentValue : ''
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error ?? 'Upload failed')
      setUrlDraft(json.path)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const filteredLucide = useMemo(() => {
    if (!search) return LUCIDE_LIST
    const q = search.toLowerCase()
    return LUCIDE_LIST.filter(i => i.label.toLowerCase().includes(q))
  }, [search])

  const filteredBrands = useMemo(() => {
    if (!search) return BRAND_LIST
    const q = search.toLowerCase()
    return BRAND_LIST.filter(i => i.label.toLowerCase().includes(q))
  }, [search])

  const handleApply = useCallback(() => {
    if (tab === 'url') {
      onSelect(urlDraft.trim())
    } else {
      onSelect(selected)
    }
    onClose()
  }, [tab, selected, urlDraft, onSelect, onClose])

  const handleClear = useCallback(() => {
    onSelect('')
    onClose()
  }, [onSelect, onClose])

  const tabStyle = (t: Tab) => ({
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: tab === t ? 600 : 400,
    borderRadius: 7,
    border: 'none',
    background: tab === t ? 'var(--accent)' : 'transparent',
    color: tab === t ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'background 120ms, color 120ms',
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          width: 'min(560px, calc(100vw - 24px))',
          maxHeight: 'min(520px, 90vh)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--foreground)' }}>
            Choose an icon
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted-foreground)', padding: 4, display: 'flex', borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 12px', flexShrink: 0 }}>
          <button style={tabStyle('lucide')} onClick={() => { setTab('lucide'); setSearch('') }}>General</button>
          <button style={tabStyle('brands')} onClick={() => { setTab('brands'); setSearch('') }}>Brands</button>
          <button style={tabStyle('url')} onClick={() => { setTab('url'); setSearch('') }}>URL</button>
        </div>

        {/* Search (not for URL tab) */}
        {tab !== 'url' && (
          <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  fontSize: 13,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {/* Icon grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {tab === 'url' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Upload — label wraps the hidden input for a native click, no programmatic .click() */}
              <input
                id="icon-file-upload"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/x-icon,image/avif"
                style={{ display: 'none' }}
                disabled={uploading}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                  e.target.value = ''
                }}
              />
              <label
                htmlFor="icon-file-upload"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px',
                  border: '1.5px dashed var(--border)',
                  borderRadius: 10,
                  background: 'var(--muted)',
                  color: uploading ? 'var(--muted-foreground)' : 'var(--foreground)',
                  fontSize: 13,
                  cursor: uploading ? 'wait' : 'pointer',
                  fontWeight: 500,
                  transition: 'border-color 120ms, background 120ms',
                  userSelect: 'none',
                }}
              >
                <UploadIcon size={15} />
                {uploading ? 'Uploading…' : 'Upload from your computer'}
              </label>
              {uploadError && (
                <span style={{ fontSize: 12, color: '#dc2626' }}>{uploadError}</span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>or enter a path / URL</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <input
                type="text"
                placeholder="/uploads/icon.svg or https://…"
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 13,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {urlDraft && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: 'var(--muted)', borderRadius: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlDraft} alt="" width={28} height={28} style={{ borderRadius: 4, objectFit: 'contain' }} />
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Preview</span>
                </div>
              )}
            </div>
          ) : tab === 'lucide' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6 }}>
              {filteredLucide.map(({ id, label, Icon }) => {
                const isSelected = selected === id
                return (
                  <button
                    key={id}
                    onClick={() => setSelected(id)}
                    title={label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '10px 6px 8px',
                      borderRadius: 8,
                      border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                      background: isSelected ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--muted)',
                      cursor: 'pointer',
                      transition: 'background 120ms, border-color 120ms',
                      color: 'var(--foreground)',
                    }}
                  >
                    <Icon size={20} />
                    <span style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2, color: 'var(--muted-foreground)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6 }}>
              {filteredBrands.map(({ id, label, path, hex }) => {
                const isSelected = selected === id
                return (
                  <button
                    key={id}
                    onClick={() => setSelected(id)}
                    title={label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '10px 6px 8px',
                      borderRadius: 8,
                      border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                      background: isSelected ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--muted)',
                      cursor: 'pointer',
                      transition: 'background 120ms, border-color 120ms',
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={20} height={20} xmlns="http://www.w3.org/2000/svg">
                      <path d={path} fill={`#${hex}`} />
                    </svg>
                    <span style={{ fontSize: 10, textAlign: 'center', lineHeight: 1.2, color: 'var(--muted-foreground)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          gap: 8,
        }}>
          <button
            onClick={handleClear}
            style={{
              background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
              color: 'var(--muted-foreground)', padding: '7px 14px', borderRadius: 8, fontSize: 13,
            }}
          >
            Clear icon
          </button>
          <button
            onClick={handleApply}
            disabled={tab !== 'url' && !selected}
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              cursor: 'pointer',
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              opacity: tab !== 'url' && !selected ? 0.5 : 1,
            }}
          >
            Use this icon
          </button>
        </div>
      </div>
    </div>
  )
}
