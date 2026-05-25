import type { NextConfig } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

export default function getConfig(phase: string): NextConfig {
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD
  return {
    output: isProdBuild ? 'export' : undefined,
    images: { unoptimized: true },
    pageExtensions: isProdBuild
      ? ['ts', 'tsx', 'js', 'jsx']
      : ['dev.ts', 'dev.tsx', 'ts', 'tsx', 'js', 'jsx'],
  }
}
