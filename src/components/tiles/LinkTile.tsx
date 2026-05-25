'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink, Link as LucideLink } from 'lucide-react'
import type { Link } from '@/lib/content'
import { getLinkIcon } from '@/lib/linkIcon'
import { getPlatform } from '@/lib/platforms'
import { usePrefersDark } from '@/lib/usePrefersDark'
import { cn } from '@/lib/utils'

interface LinkTileProps {
  link: Link
  devMode?: boolean
}

function LinkIcon({ link }: { link: Link }) {
  const [faviconError, setFaviconError] = useState(false)
  const iconResult = getLinkIcon(link)

  if (iconResult.kind === 'lucide') {
    const Icon = iconResult.component
    return <Icon size={22} className="text-[--foreground]" aria-hidden />
  }

  if (iconResult.kind === 'simpleicon') {
    return (
      <svg viewBox="0 0 24 24" width={22} height={22} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d={iconResult.path} fill="currentColor" className="text-[--foreground]" />
      </svg>
    )
  }

  if (iconResult.kind === 'image') {
    return (
      <Image src={iconResult.src} alt="" width={24} height={24} unoptimized style={{ borderRadius: 4 }} />
    )
  }

  // favicon
  if (faviconError) {
    return <LucideLink size={22} className="text-[--foreground]" aria-hidden />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconResult.url}
      alt=""
      width={24}
      height={24}
      style={{ borderRadius: 3 }}
      onError={() => setFaviconError(true)}
    />
  )
}

export default function LinkTile({ link, devMode }: LinkTileProps) {
  let domain = ''
  let validUrl = true
  try {
    domain = new URL(link.url).hostname.replace('www.', '')
  } catch {
    validUrl = false
  }

  const platform = getPlatform(domain)
  const prefersDark = usePrefersDark()
  const bgColor = prefersDark ? platform.bgDark : platform.bgLight

  if (!validUrl && !devMode) return null

  const tileStyle = {
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-tile)',
    backgroundColor: bgColor,
  }

  const tileClasses = cn(
    'block p-5 min-w-[44px] h-full min-h-[var(--tile-row-height)]',
    'tile-interactive',
    'transition-[transform,box-shadow] duration-[var(--tile-hover-duration)] ease-[var(--tile-hover-easing)]',
  )

  const interactiveClasses = 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-tile-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--accent]'

  const fullLayout = (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span aria-hidden="true" className="w-8 h-8 flex items-center justify-center">
          <LinkIcon link={link} />
        </span>
        <ExternalLink size={14} aria-hidden="true" className="text-[--foreground] opacity-40" />
      </div>
      <div className="mt-auto pt-4">
        <p className="text-sm font-semibold text-[--foreground] leading-tight">{link.label}</p>
        <p className="text-xs text-[--muted-foreground] mt-0.5">{domain}</p>
      </div>
    </div>
  )

  if (devMode) {
    return (
      <div style={tileStyle} className="block p-5 min-w-[44px] h-full min-h-[var(--tile-row-height)]">
        {fullLayout}
      </div>
    )
  }

  const linkProps = {
    href: link.url,
    target: '_blank' as const,
    rel: 'noopener noreferrer',
    'aria-label': `${link.label} — opens in new tab`,
    style: tileStyle,
  }

  return (
    <>
      {link.size !== 'full' && (
        <a
          {...linkProps}
          className={cn(
            'md:hidden flex items-center justify-center aspect-square min-h-[44px]',
            'tile-interactive',
            'transition-[transform,box-shadow] duration-[var(--tile-hover-duration)] ease-[var(--tile-hover-easing)]',
            interactiveClasses,
          )}
        >
          <span aria-hidden="true" className="flex items-center justify-center">
            <LinkIcon link={link} />
          </span>
        </a>
      )}
      <a
        {...linkProps}
        className={cn(
          link.size === 'full' ? 'flex' : 'hidden md:flex',
          tileClasses,
          interactiveClasses,
        )}
      >
        {fullLayout}
      </a>
    </>
  )
}
