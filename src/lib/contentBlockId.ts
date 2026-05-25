export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function resolveBlockId(item: Record<string, unknown>, file: string): string {
  if (file === 'projects') return slugify(String(item.title ?? ''))
  if (file === 'links') return slugify(String(item.label ?? ''))
  if (file === 'images') return String(item.id ?? slugify(String(item.label ?? item.src ?? '')))
  return `__unknown_file_${file}__`
}
