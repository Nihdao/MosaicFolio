import YAML from 'yaml'
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { slugify } from './contentBlockId'

const contentDir = join(process.cwd(), 'content')

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/
const HEX_ERROR = 'must be a 6-digit hex color string starting with # (e.g. "#9c88ff")'

function readContentFile(filename: string): string {
  const filepath = join(contentDir, filename)
  try {
    return readFileSync(filepath, 'utf-8')
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Missing required content file: content/${filename} — create this file to continue`
      )
    }
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Cannot read content/${filename}: ${msg}`)
  }
}

function parseMultiDoc(raw: string): unknown[] {
  return YAML.parseAllDocuments(raw)
    .map(doc => doc.toJS())
    .filter(data => data != null && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0)
}

function normalizePublicPath(v: string | undefined): string | undefined {
  if (!v) return v
  if (v.startsWith('/') || v.startsWith('http')) return v
  return `/${v}`
}

export const ConfigSchema = z.object({
  name: z.string().min(1, { message: 'name must not be empty' }),
  tagline: z.string(),
  description: z.string().optional(),
  accent: z.string().regex(HEX_COLOR, { message: `accent ${HEX_ERROR}` }),
  theme: z.enum(['clean']),
  canonical_url: z.string().url().optional(),
  avatar: z.string().optional().transform(normalizePublicPath),
  status_colors: z.object({
    idea: z.string().regex(HEX_COLOR, { message: `status_colors.idea ${HEX_ERROR}` }).optional(),
    building: z.string().regex(HEX_COLOR, { message: `status_colors.building ${HEX_ERROR}` }).optional(),
    active: z.string().regex(HEX_COLOR, { message: `status_colors.active ${HEX_ERROR}` }).optional(),
    archived: z.string().regex(HEX_COLOR, { message: `status_colors.archived ${HEX_ERROR}` }).optional(),
  }).optional(),
})

export const ProjectSchema = z.object({
  type: z.literal('project'),
  title: z.string(),
  status: z.enum(['idea', 'building', 'active', 'archived']),
  featured: z.boolean().default(false),
  size: z.enum(['square', 'full'], {
    error: "Migration required: replace 'small'→'square', 'wide'/'tall'/'large'→'full' in content/projects.yaml",
  }),
  description: z.string(),
  stack: z.array(z.string()),
  start_date: z.union([z.string(), z.date()]).transform(String),
  link: z.string().url().optional(),
  modal: z.boolean().default(true),
  icon: z.string().optional(),
  tag: z.string().optional(),
  tag_color: z.string().regex(HEX_COLOR, { message: `tag_color ${HEX_ERROR}` }).optional(),
}).superRefine((data, ctx) => {
  if (data.modal && !data.link) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Project '${data.title}': link is required when modal: true`,
      path: ['link'],
    })
  }
})

export const LinkSchema = z.object({
  type: z.literal('link'),
  url: z.string(),
  label: z.string(),
  size: z.enum(['square', 'full'], {
    error: "Migration required: replace 'small'→'square', 'wide'/'tall'/'large'→'full' in content/links.yaml",
  }).default('square'),
  icon: z.string().optional(),
})

export const ImageSchema = z.object({
  type: z.literal('image'),
  src: z.string().transform(v => normalizePublicPath(v) ?? v),
  id: z.string().optional(),
  label: z.string().optional(),
  size: z.enum(['square-sm', 'square', 'full'], {
    error: "Migration required: replace 'small'→'square-sm', 'wide'→'square', 'tall'→'square-sm', 'large'→'full' in content/images.yaml",
  }),
})

export const LayoutSchema = z.object({
  tiles: z.array(z.string()),
})

export type Config = z.infer<typeof ConfigSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Link = z.infer<typeof LinkSchema>
export type PortfolioImage = z.infer<typeof ImageSchema>
export type Layout = z.infer<typeof LayoutSchema>

export function getConfig(): Config {
  const raw = readContentFile('config.yaml')
  const data = YAML.parse(raw)
  const result = ConfigSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid content/config.yaml: ${result.error.message}`)
  }
  return result.data
}

export function getProjects(): Project[] {
  const raw = readContentFile('projects.yaml')
  const items = parseMultiDoc(raw)
  const projects = items.map((data, i) => {
    const result = ProjectSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Invalid project block ${i + 1} in content/projects.yaml: ${result.error.message}`)
    }
    return result.data
  })

  const slugMap = new Map<string, string>()
  for (const p of projects) {
    const slug = slugify(p.title)
    if (slugMap.has(slug)) {
      throw new Error(
        `projects.yaml: slug collision — '${slug}' is produced by both '${slugMap.get(slug)}' and '${p.title}'`
      )
    }
    slugMap.set(slug, p.title)
  }

  return projects
}

export function getLinks(): Link[] {
  const raw = readContentFile('links.yaml')
  const items = parseMultiDoc(raw)
  return items.map((data, i) => {
    const result = LinkSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Invalid link block ${i + 1} in content/links.yaml: ${result.error.message}`)
    }
    return result.data
  })
}

export function getImages(): PortfolioImage[] {
  const raw = readContentFile('images.yaml')
  const items = parseMultiDoc(raw)
  return items.map((data, i) => {
    const result = ImageSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`Invalid image block ${i + 1} in content/images.yaml: ${result.error.message}`)
    }
    return result.data
  })
}

export function getLayout(): Layout {
  const raw = readContentFile('layout.yaml')
  const data = YAML.parse(raw)
  const result = LayoutSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`Invalid content/layout.yaml: ${result.error.message}`)
  }
  return result.data
}

export function validateLayout(
  layout: Layout,
  projects: Project[],
  links: Link[],
  images: PortfolioImage[]
): void {
  if (layout.tiles.length === 0) {
    throw new Error('layout.yaml: tiles array is empty — add at least one tile ID')
  }

  // Links no longer appear in the tile grid — they live in the hero column only.
  // Any link slug present in layout.yaml is treated as unknown.
  const validIds = new Set<string>()
  projects.forEach(p => validIds.add(slugify(p.title)))
  images.forEach(img => validIds.add(img.id ?? slugify(img.label ?? img.src)))

  const linkSlugs = new Set(links.map(l => slugify(l.label)))

  const seen = new Map<string, number>()
  layout.tiles.forEach((id, i) => {
    if (seen.has(id)) {
      throw new Error(
        `layout.yaml: duplicate tile ID '${id}' at positions ${seen.get(id)! + 1} and ${i + 1}`
      )
    }
    seen.set(id, i)
  })

  layout.tiles.forEach(id => {
    if (id === 'section-') {
      throw new Error(
        `layout.yaml: section tile 'section-' has an empty label — use 'section-my-label' instead`
      )
    }
    if (id.startsWith('section-')) return
    if (linkSlugs.has(id)) {
      throw new Error(
        `layout.yaml: '${id}' is a link — links render in the hero column only, not in the tile grid. Remove this entry from layout.yaml.`
      )
    }
    if (!validIds.has(id)) {
      throw new Error(
        `layout.yaml: unknown tile ID '${id}' — no project or image matches this slug`
      )
    }
  })

  // Non-blocking warning: content blocks not referenced in layout.yaml are invisible.
  const referenced = new Set(layout.tiles)
  const orphans: string[] = []
  projects.forEach(p => { const id = slugify(p.title); if (!referenced.has(id)) orphans.push(`project '${p.title}' (${id})`) })
  images.forEach(img => { const id = img.id ?? slugify(img.label ?? img.src); if (!referenced.has(id)) orphans.push(`image '${img.label ?? img.src}' (${id})`) })
  if (orphans.length > 0) {
    console.warn(`[content] ${orphans.length} orphan block(s) not in layout.yaml — they will not render:\n  - ${orphans.join('\n  - ')}`)
  }
}
