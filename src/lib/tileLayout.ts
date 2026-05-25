export function getTileSpanClass(size?: string, type?: 'image' | 'project' | 'link' | 'section'): string {
  if (type === 'image') {
    if (size === 'square-sm') return 'col-span-1 md:col-span-1'
    if (size === 'square')    return 'col-span-1 md:col-span-2'
    if (size === 'full')      return 'col-span-2 md:col-span-4'
    return ''
  }
  if (size === 'square') return 'col-span-2 md:col-span-2'
  if (size === 'full') return 'col-span-2 md:col-span-4'
  return ''
}
