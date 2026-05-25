'use client'

import { useState } from 'react'
import { ExternalLink, Link as LucideLink, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { Project } from '@/lib/content'
import { getProjectIcon } from '@/lib/projectIcon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/dialog'
import StatusBadge from '@/components/ui/StatusBadge'

interface ProjectModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  devMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function ProjectModal({ project, open, onOpenChange, devMode, onEdit, onDelete }: ProjectModalProps) {
  const [faviconError, setFaviconError] = useState(false)
  const iconResult = getProjectIcon(project)

  function renderIcon() {
    if (iconResult.kind === 'lucide') {
      const Icon = iconResult.component
      return <Icon size={28} className="text-[--muted-foreground]" aria-hidden />
    }
    if (iconResult.kind === 'simpleicon') {
      return (
        <svg viewBox="0 0 24 24" width={28} height={28} xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d={iconResult.path} fill={`#${iconResult.hex}`} />
        </svg>
      )
    }
    if (iconResult.kind === 'image') {
      return <Image src={iconResult.src} alt="" width={32} height={32} unoptimized style={{ borderRadius: 6 }} />
    }
    if (faviconError) {
      return <LucideLink size={28} className="text-[--muted-foreground]" aria-hidden />
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconResult.url}
        alt=""
        width={32}
        height={32}
        style={{ borderRadius: 4 }}
        onError={() => setFaviconError(true)}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1 pr-10">
            {renderIcon()}
            <DialogTitle className="text-2xl font-bold leading-tight flex-1">
              {project.title}
            </DialogTitle>
            {devMode && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    aria-label="Delete card"
                    style={{
                      background: 'var(--muted)', border: 'none', borderRadius: 8,
                      padding: 8, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#dc2626',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => { onOpenChange(false); onEdit() }}
                    aria-label="Edit card"
                    style={{
                      background: 'var(--muted)', border: 'none', borderRadius: 8,
                      padding: 8, cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)',
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
          </div>
        </DialogHeader>

        {project.description && (
          <p className="text-[--muted-foreground] mb-4">{project.description}</p>
        )}

        {project.stack && project.stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="border border-[var(--border)] text-[var(--foreground)] px-2.5 py-1 rounded-full text-xs font-medium tracking-tight"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.link && (
          <div className="sticky bottom-0 bg-[var(--card)] pt-3 -mx-5 px-5 sm:-mx-6 sm:px-6">
            <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-[var(--card)] to-transparent pointer-events-none" />
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-full font-semibold text-base"
            >
              View Project <ExternalLink size={16} aria-hidden />
            </a>
          </div>
        )}

        <DialogCloseButton />
      </DialogContent>
    </Dialog>
  )
}
