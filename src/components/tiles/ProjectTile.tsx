'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Link as LucideLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/content'
import { getProjectIcon, type ProjectIcon } from '@/lib/projectIcon'
import StatusBadge from '@/components/ui/StatusBadge'
import TagBadge from '@/components/ui/TagBadge'
import ProjectModal from '@/components/tiles/ProjectModal'

interface ProjectTileProps {
  project: Project
  devMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const interactiveClasses = cn(
  'tile-interactive',
  'transition-[transform,box-shadow] duration-[var(--tile-hover-duration)] ease-[var(--tile-hover-easing)]',
  'hover:-translate-y-0.5',
  'hover:shadow-[var(--shadow-tile-hover)]',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-[--accent]',
  'cursor-pointer',
)

const baseTileClass = cn(
  'relative w-full h-full p-5 min-h-[var(--tile-row-height)]',
  'flex flex-col justify-between text-left',
  interactiveClasses,
)

const tileStyle: React.CSSProperties = {
  background: 'var(--card)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-tile)',
  overflow: 'hidden',
}

const featuredHalo = '0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent), 0 0 16px 2px color-mix(in srgb, var(--accent) 20%, transparent)'

const featuredTileStyle: React.CSSProperties = {
  ...tileStyle,
  boxShadow: `var(--shadow-tile), ${featuredHalo}`,
}

function TileIcon({ iconResult, faviconError, onFaviconError }: {
  iconResult: ProjectIcon
  faviconError: boolean
  onFaviconError: () => void
}) {
  const iconStyle: React.CSSProperties = { pointerEvents: 'none' }

  if (iconResult.kind === 'lucide') {
    const Icon = iconResult.component
    return <Icon size={20} className="text-[--muted-foreground]" style={iconStyle} aria-hidden />
  }

  if (iconResult.kind === 'simpleicon') {
    return (
      <svg viewBox="0 0 24 24" width={20} height={20} xmlns="http://www.w3.org/2000/svg" aria-hidden style={iconStyle}>
        <path d={iconResult.path} fill={`#${iconResult.hex}`} />
      </svg>
    )
  }

  if (iconResult.kind === 'image') {
    return (
      <Image
        src={iconResult.src}
        alt=""
        width={24}
        height={24}
        unoptimized
        style={{ ...iconStyle, borderRadius: 4 }}
      />
    )
  }

  if (faviconError) {
    return <LucideLink size={20} className="text-[--muted-foreground]" style={iconStyle} aria-hidden />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconResult.url}
      alt=""
      width={24}
      height={24}
      style={iconStyle}
      onError={onFaviconError}
    />
  )
}

export default function ProjectTile({ project, devMode, onEdit, onDelete }: ProjectTileProps) {
  const [open, setOpen] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const iconResult = getProjectIcon(project)
  const handleFaviconError = () => setFaviconError(true)

  const tileBody = (
    <>
      <div>
        <div className="mb-2">
          <TileIcon iconResult={iconResult} faviconError={faviconError} onFaviconError={handleFaviconError} />
        </div>
        <h2 className="text-[1.125rem] font-semibold leading-[1.3] text-[--foreground]">
          {project.title}
        </h2>
        {project.description && (
          <p className="mt-1.5 text-[0.9375rem] text-[--muted-foreground] line-clamp-3">
            {project.description}
          </p>
        )}
      </div>
      <div className="flex items-center mt-3 gap-2">
        <StatusBadge status={project.status} />
      </div>
    </>
  )

  return (
    <>
      <div className="relative w-full h-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open ${project.title} details`}
          className={baseTileClass}
          style={project.featured ? featuredTileStyle : tileStyle}
        >
          {project.tag && (
            <div className="absolute top-3 right-3">
              <TagBadge tag={project.tag} color={project.tag_color} />
            </div>
          )}
          {tileBody}
        </button>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${project.title} project — opens in new tab`}
            title="View project"
            className={cn(
              'absolute bottom-3 right-3 z-10',
              'inline-flex items-center justify-center',
              'w-8 h-8 rounded-full',
              'bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]',
              'text-[--muted-foreground]',
              'transition-[background-color,color] duration-150 ease-out',
              'hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]',
              'hover:text-[--accent]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--accent]',
              'cursor-pointer',
            )}
          >
            <ExternalLink size={14} aria-hidden />
          </a>
        )}
      </div>
      <ProjectModal open={open} onOpenChange={setOpen} project={project} devMode={devMode} onEdit={onEdit} onDelete={() => { setOpen(false); onDelete?.() }} />
    </>
  )
}
