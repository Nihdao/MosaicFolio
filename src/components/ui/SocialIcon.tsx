'use client'

import { useState } from 'react'
import { Link as LucideLink } from 'lucide-react'
import type { Link } from '@/lib/content'
import { getLinkIcon } from '@/lib/linkIcon'

interface SocialIconProps {
  link: Link
  size?: number
}

export default function SocialIcon({ link, size = 14 }: SocialIconProps) {
  const [faviconError, setFaviconError] = useState(false)
  const icon = getLinkIcon(link)

  if (icon.kind === 'lucide') {
    const Icon = icon.component
    return <Icon size={size} aria-hidden />
  }

  if (icon.kind === 'simpleicon') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d={icon.path} fill="currentColor" />
      </svg>
    )
  }

  if (icon.kind === 'image') {
    return <img src={icon.src} alt="" width={size} height={size} style={{ borderRadius: 2, objectFit: 'contain' }} />
  }

  // favicon — DuckDuckGo retourne 404 si pas d'icône → fallback Link
  if (faviconError) {
    return <LucideLink size={size} aria-hidden />
  }

  return (
    <img
      src={icon.url}
      alt=""
      width={size}
      height={size}
      style={{ borderRadius: 2, objectFit: 'contain' }}
      onError={() => setFaviconError(true)}
    />
  )
}
