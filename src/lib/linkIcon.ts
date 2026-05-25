import {
  siGithub, siX, siYoutube, siDiscord, siTwitch, siApple,
  siGitlab, siGit, siVercel, siNetlify,
  siReact, siVuedotjs, siSvelte, siAngular, siAstro, siThreedotjs,
  siNextdotjs, siTypescript, siJavascript,
  siNodedotjs, siDeno, siNpm, siBun,
  siTailwindcss, siCss, siHtml5, siSass,
  siDocker, siKubernetes,
  siGo, siRust, siSwift, siKotlin, siPython, siPhp, siRuby, siElixir, siScala, siCplusplus,
  siPostgresql, siMongodb, siMysql, siSqlite, siRedis, siFirebase, siSupabase,
  siGraphql, siPrisma, siDrizzle, siStripe,
  siFigma, siNotion, siLinear,
  siVite, siWebpack, siEslint, siPrettier, siTurborepo,
  siGooglecloud, siFlutter, siAndroid,
  siClaude, siAnthropic,
} from 'simple-icons'
import {
  Link, Code, Rocket, Box, Sparkles, Terminal, Globe, Package, Layers,
  Monitor, Smartphone, Server, Database, Cloud, Lock, Shield, Key,
  User, Users, Star, Heart, Bookmark, Folder, FileText, Mail,
  MessageSquare, Bell, Calendar, Clock, Target, Trophy, Briefcase,
  Lightbulb, Brain, Settings, Wrench, Share2, Download, Upload,
  ExternalLink, Zap, Power, Wifi, Play, Book, Pen, Feather,
  GitBranch, Cpu, Eye, Link as LucideLink, type LucideIcon,
} from 'lucide-react'
import type { Link as LinkData } from './content'

export type LinkIcon =
  | { kind: 'lucide'; component: LucideIcon }
  | { kind: 'simpleicon'; path: string; hex: string }
  | { kind: 'favicon'; url: string }
  | { kind: 'image'; src: string }

const DOMAIN_TO_SI: Record<string, { path: string; hex: string }> = {
  'github.com': siGithub,
  'x.com': siX,
  'twitter.com': siX,
  'youtube.com': siYoutube,
  'youtu.be': siYoutube,
  'discord.gg': siDiscord,
  'discord.com': siDiscord,
  'twitch.tv': siTwitch,
  'apps.apple.com': siApple,
}

const LUCIDE_LOOKUP: Record<string, LucideIcon> = {
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

const SI_LOOKUP: Record<string, { path: string; hex: string }> = {
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
  x: siX, youtube: siYoutube, twitch: siTwitch,
}

function resolveIconString(iconValue: string): LinkIcon | null {
  if (iconValue.startsWith('si:')) {
    const slug = iconValue.slice(3)
    const si = SI_LOOKUP[slug]
    if (si) return { kind: 'simpleicon', path: si.path, hex: si.hex }
  }
  if (iconValue.startsWith('lucide:')) {
    const name = iconValue.slice(7)
    const comp = LUCIDE_LOOKUP[name]
    return { kind: 'lucide', component: comp ?? Link }
  }
  if (iconValue.startsWith('http') || iconValue.startsWith('/')) {
    return { kind: 'image', src: iconValue }
  }
  const lucide = LUCIDE_LOOKUP[iconValue]
  if (lucide) return { kind: 'lucide', component: lucide }
  return null
}

export function getLinkIcon(link: LinkData): LinkIcon {
  if (link.icon) {
    const resolved = resolveIconString(link.icon)
    if (resolved) return resolved
  }

  if (link.url.startsWith('mailto:')) {
    return { kind: 'lucide', component: Mail }
  }

  try {
    const domain = new URL(link.url).hostname.replace('www.', '')
    const si = DOMAIN_TO_SI[domain]
    if (si) return { kind: 'simpleicon', path: si.path, hex: si.hex }
    return { kind: 'favicon', url: `https://icons.duckduckgo.com/ip3/${domain}.ico` }
  } catch {
    return { kind: 'lucide', component: LucideLink }
  }
}
