'use client'
import { useState } from 'react'
import { useDevMode } from '@/components/editor/useDevMode'
import HeroTile from '@/components/tiles/HeroTile'
import type { Config, Link } from '@/lib/content'

export default function DevModeHeroWrapper({ config, links }: { config: Config; links?: Link[] }) {
  const [isDev] = useDevMode()
  const [liveConfig, setLiveConfig] = useState<Config>(config)

  const onFieldSave = (field: 'name' | 'tagline' | 'description', value: string) => {
    if (field === 'description' && !value) {
      setLiveConfig(prev => {
        const { description: _, ...rest } = prev
        return rest as Config
      })
    } else {
      setLiveConfig(prev => ({ ...prev, [field]: value }))
    }
  }

  return <HeroTile config={liveConfig} links={links} devMode={isDev} onFieldSave={onFieldSave} />
}
