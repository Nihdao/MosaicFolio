import Image from 'next/image'
import type { Config, Link } from '@/lib/content'
import SocialIcon from '@/components/ui/SocialIcon'
import HeroTileEditor from '@/components/editor/HeroTileEditor'

type FieldSaveCallback = (field: 'name' | 'tagline' | 'description', value: string) => void

interface HeroTileProps {
  config: Config
  links?: Link[]
  devMode?: boolean
  onFieldSave?: FieldSaveCallback
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

export default function HeroTile({ config, links, devMode, onFieldSave }: HeroTileProps) {
  if (devMode) {
    return <HeroTileEditor config={config} links={links} onFieldSave={onFieldSave} />
  }

  return (
    <div className="h-full flex flex-col justify-start px-8 pt-10 pb-8">
      {config.avatar && (
        <div className="mb-6">
          <Image
            src={config.avatar}
            alt={config.name}
            width={160}
            height={160}
            className="rounded-full object-cover"
            unoptimized
            priority
            fetchPriority="high"
          />
        </div>
      )}

      <h1
        className="font-bold leading-[1.1] mb-1 text-[--foreground]"
        style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}
      >
        {config.name}
      </h1>

      <p className={`text-[--muted-foreground] text-[1rem] leading-[1.5] ${config.description ? 'mb-3' : 'mb-6'}`}>
        {config.tagline}
      </p>

      {config.description && (
        <p className="text-[--muted-foreground]/70 text-sm leading-[1.6] mb-6 whitespace-pre-line">
          {config.description}
        </p>
      )}

      {links && links.length > 0 && (
        <nav aria-label="Contact links" className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target={link.url.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              aria-label={link.label}
              className="flex items-center gap-2.5 group"
            >
              <span className="md:hidden w-9 h-9 flex items-center justify-center text-[--muted-foreground] bg-[--muted] rounded-lg shrink-0">
                <SocialIcon link={link} size={20} />
              </span>
              <span className="hidden md:flex w-7 h-7 items-center justify-center text-[--muted-foreground] bg-[--muted] rounded-lg shrink-0">
                <SocialIcon link={link} size={18} />
              </span>
              <span className="hidden md:inline text-xs text-[--muted-foreground]/60 underline underline-offset-2 decoration-[--muted-foreground]/25 group-hover:text-[--muted-foreground] group-hover:decoration-[--muted-foreground]/50 transition-colors">
                {getDisplayUrl(link.url)}
              </span>
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
