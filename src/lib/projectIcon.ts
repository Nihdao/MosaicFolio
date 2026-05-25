import {
  Link, Code, Rocket, Box, Sparkles, Terminal, Globe, Package, Layers,
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
import type { Project } from '@/lib/content'
import React from 'react'

const LUCIDE_LOOKUP: Record<string, LucideIcon> = {
  // Legacy bare names (backward compat)
  link: Link, code: Code, rocket: Rocket, box: Box, sparkles: Sparkles,
  terminal: Terminal, globe: Globe, package: Package, layers: Layers,
  monitor: Monitor, smartphone: Smartphone, server: Server, database: Database,
  cloud: Cloud, lock: Lock, shield: Shield, key: Key,
  user: User, users: Users, star: Star, heart: Heart, bookmark: Bookmark,
  folder: Folder, 'file-text': FileText, mail: Mail,
  'message-square': MessageSquare, bell: Bell, calendar: Calendar, clock: Clock,
  target: Target, trophy: Trophy, briefcase: Briefcase,
  lightbulb: Lightbulb, brain: Brain, settings: Settings, wrench: Wrench,
  'share-2': Share2, download: Download, upload: Upload,
  'external-link': ExternalLink, zap: Zap, power: Power, wifi: Wifi,
  play: Play, book: Book, pen: Pen, feather: Feather,
  'git-branch': GitBranch, cpu: Cpu, eye: Eye,
}

// Same keys but prefixed with "lucide:" (new canonical format from picker)
const LUCIDE_PREFIXED: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(LUCIDE_LOOKUP).map(([k, v]) => [`lucide:${k}`, v])
)

interface SimpleIconData { path: string; hex: string }

const SIMPLE_ICONS_LOOKUP: Record<string, SimpleIconData> = {
  github: siGithub, gitlab: siGitlab, git: siGit,
  vercel: siVercel, netlify: siNetlify,
  react: siReact, vuedotjs: siVuedotjs, svelte: siSvelte, angular: siAngular, astro: siAstro, threedotjs: siThreedotjs,
  nextdotjs: siNextdotjs, typescript: siTypescript, javascript: siJavascript,
  nodedotjs: siNodedotjs, deno: siDeno, npm: siNpm, bun: siBun,
  tailwindcss: siTailwindcss, css: siCss, html5: siHtml5, sass: siSass,
  docker: siDocker, kubernetes: siKubernetes,
  go: siGo, rust: siRust, swift: siSwift, kotlin: siKotlin,
  python: siPython, php: siPhp, ruby: siRuby, elixir: siElixir, scala: siScala, cplusplus: siCplusplus,
  postgresql: siPostgresql, mongodb: siMongodb, mysql: siMysql, sqlite: siSqlite,
  redis: siRedis, firebase: siFirebase, supabase: siSupabase,
  graphql: siGraphql, prisma: siPrisma, drizzle: siDrizzle, stripe: siStripe,
  figma: siFigma, notion: siNotion, linear: siLinear, discord: siDiscord,
  vite: siVite, webpack: siWebpack, eslint: siEslint, prettier: siPrettier, turborepo: siTurborepo,
  googlecloud: siGooglecloud, flutter: siFlutter, android: siAndroid, apple: siApple,
  claude: siClaude, anthropic: siAnthropic,
}

export type ProjectIcon =
  | { kind: 'lucide'; component: LucideIcon }
  | { kind: 'simpleicon'; path: string; hex: string }
  | { kind: 'favicon'; url: string }
  | { kind: 'image'; src: string }

export function getProjectIcon(project: Project): ProjectIcon {
  if (project.icon) {
    // "si:github" → simple icons
    if (project.icon.startsWith('si:')) {
      const slug = project.icon.slice(3)
      const si = SIMPLE_ICONS_LOOKUP[slug]
      if (si) return { kind: 'simpleicon', path: si.path, hex: si.hex }
    }
    // "lucide:rocket" (new picker format)
    if (project.icon.startsWith('lucide:')) {
      const comp = LUCIDE_PREFIXED[project.icon] ?? LUCIDE_LOOKUP[project.icon.slice(7)]
      return { kind: 'lucide', component: comp ?? Link }
    }
    // URL or local path → image
    if (project.icon.startsWith('http') || project.icon.startsWith('/')) return { kind: 'image', src: project.icon }
    // Legacy: bare lucide name
    const lucide = LUCIDE_LOOKUP[project.icon]
    if (lucide) return { kind: 'lucide', component: lucide }
  }
  if (project.link) {
    try {
      const hostname = new URL(project.link).hostname
      return { kind: 'favicon', url: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64` }
    } catch { /* ignore */ }
  }
  return { kind: 'lucide', component: Link }
}

/**
 * Renders an icon value string as a React element (for use in the editor).
 * Returns null if no valid icon can be resolved.
 */
export function renderIconValue(iconValue: string): React.ReactElement | null {
  if (!iconValue) return null

  if (iconValue.startsWith('si:')) {
    const slug = iconValue.slice(3)
    const si = SIMPLE_ICONS_LOOKUP[slug]
    if (!si) return null
    return React.createElement('svg', {
      viewBox: '0 0 24 24',
      width: 20,
      height: 20,
      xmlns: 'http://www.w3.org/2000/svg',
      'aria-hidden': true,
    }, React.createElement('path', { d: si.path, fill: `#${si.hex}` }))
  }

  if (iconValue.startsWith('lucide:')) {
    const comp = LUCIDE_PREFIXED[iconValue] ?? LUCIDE_LOOKUP[iconValue.slice(7)]
    if (!comp) return null
    return React.createElement(comp as React.ComponentType<{ size?: number; className?: string }>, {
      size: 20,
      className: 'text-[--muted-foreground]',
    })
  }

  if (iconValue.startsWith('http') || iconValue.startsWith('/')) {
    return React.createElement('img', {
      src: iconValue,
      alt: '',
      width: 20,
      height: 20,
      style: { borderRadius: 4, objectFit: 'contain' as const },
    })
  }

  // Legacy bare lucide name
  const comp = LUCIDE_LOOKUP[iconValue]
  if (comp) {
    return React.createElement(comp as React.ComponentType<{ size?: number; className?: string }>, {
      size: 20,
      className: 'text-[--muted-foreground]',
    })
  }

  return null
}
