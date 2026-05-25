export type Platform = {
  bgLight: string
  bgDark: string
  icon: string
  label: string
}

const PLATFORMS: Record<string, Platform> = {
  'github.com': { bgLight: '#F0F0F0', bgDark: '#1B1F23', icon: 'GH', label: 'GitHub' },
  'x.com': { bgLight: '#F0F0F0', bgDark: '#000000', icon: 'X', label: 'X' },
  'twitter.com': { bgLight: '#F0F0F0', bgDark: '#000000', icon: 'X', label: 'X' },
  'linkedin.com': { bgLight: '#EFF6FF', bgDark: '#0A66C2', icon: 'in', label: 'LinkedIn' },
  'youtube.com': { bgLight: '#FEF2F2', bgDark: '#FF0000', icon: '▶', label: 'YouTube' },
  'discord.gg': { bgLight: '#EEF2FF', bgDark: '#5865F2', icon: 'D', label: 'Discord' },
  'twitch.tv': { bgLight: '#F5F3FF', bgDark: '#9146FF', icon: 'T', label: 'Twitch' },
  'apps.apple.com': { bgLight: '#EFF6FF', bgDark: '#0071E3', icon: '⬇', label: 'App Store' },
}

const FALLBACK = (domain: string): Platform => ({
  bgLight: 'var(--card)',
  bgDark: 'var(--card)',
  icon: domain.charAt(0).toUpperCase(),
  label: domain,
})

export function getPlatform(domain: string): Platform {
  const clean = domain.replace('www.', '')
  return PLATFORMS[clean] ?? FALLBACK(clean)
}
