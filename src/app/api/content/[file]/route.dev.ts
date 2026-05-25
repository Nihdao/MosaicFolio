import YAML from 'yaml'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { resolveBlockId, slugify } from '@/lib/contentBlockId'

type RouteContext = { params: Promise<{ file: string }> }

const SINGLE_DOC_FILES = new Set(['config', 'layout'])

function devOnly(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }
  return null
}

function resolveContentPath(file: string): { filePath: string; error?: NextResponse } {
  if (!/^[a-z0-9-]+$/.test(file)) {
    return { filePath: '', error: NextResponse.json({ error: 'Invalid file name' }, { status: 400 }) }
  }
  const filePath = join(process.cwd(), 'content', file + '.yaml')
  return { filePath }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0
}

function parseMultiDoc(raw: string): Record<string, unknown>[] {
  return YAML.parseAllDocuments(raw)
    .map(doc => doc.toJS())
    .filter(isPlainObject)
}

function serializeMultiDoc(items: Record<string, unknown>[]): string {
  return items.map(item => '---\n' + YAML.stringify(item)).join('')
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const guard = devOnly()
  if (guard) return guard

  const { file } = await params
  const { filePath, error } = resolveContentPath(file)
  if (error) return error

  try {
    const raw = readFileSync(filePath, 'utf-8')
    const data = SINGLE_DOC_FILES.has(file) ? YAML.parse(raw) : parseMultiDoc(raw)
    return NextResponse.json({ data })
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Read failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const guard = devOnly()
  if (guard) return guard

  const { file } = await params
  const { filePath, error } = resolveContentPath(file)
  if (error) return error

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  if (SINGLE_DOC_FILES.has(file)) {
    return NextResponse.json({ error: `POST not supported on single-document file '${file}'` }, { status: 400 })
  }

  let body: { data: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!isPlainObject(body.data)) {
    return NextResponse.json({ error: 'Missing or invalid data field' }, { status: 400 })
  }

  // Derive the new block ID from the data fields
  let newBlockId: string
  if (typeof body.data.title === 'string' && body.data.title) {
    newBlockId = slugify(body.data.title)
  } else if (typeof body.data.label === 'string' && body.data.label) {
    const prefix = body.data.type === 'section' ? 'section-' : ''
    newBlockId = prefix + slugify(body.data.label)
  } else if (typeof body.data.src === 'string' && body.data.src) {
    newBlockId = slugify(body.data.src)
  } else {
    return NextResponse.json({ error: 'Cannot derive block ID: missing title, label, or src' }, { status: 400 })
  }

  try {
    const existingRaw = readFileSync(filePath, 'utf-8')
    const items = parseMultiDoc(existingRaw)
    items.push(body.data)
    writeFileSync(filePath, serializeMultiDoc(items), 'utf-8')
    return NextResponse.json({ ok: true, id: newBlockId })
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const guard = devOnly()
  if (guard) return guard

  const { file } = await params
  const { filePath, error } = resolveContentPath(file)
  if (error) return error

  let body: { data?: Record<string, unknown>; blockId?: string; blockTitle?: string; fieldUpdates?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Read failed' }, { status: 500 })
  }

  try {
    if ((body.blockId || body.blockTitle) && body.fieldUpdates) {
      const items = parseMultiDoc(raw)
      let targetIdx: number

      if (body.blockId) {
        targetIdx = items.findIndex(item => resolveBlockId(item, file) === body.blockId)
      } else {
        // Legacy fallback: match by title field only (deprecated)
        console.warn(`[API] blockTitle is deprecated, use blockId instead. file=${file}, blockTitle=${body.blockTitle}`)
        targetIdx = items.findIndex(item => item.title === body.blockTitle)
      }

      if (targetIdx === -1) {
        const id = body.blockId ?? body.blockTitle
        return NextResponse.json({ error: `Block not found: ${id}` }, { status: 404 })
      }
      items[targetIdx] = { ...items[targetIdx], ...body.fieldUpdates }
      writeFileSync(filePath, serializeMultiDoc(items), 'utf-8')
      return NextResponse.json({ ok: true })
    }

    // Single-doc overwrite (layout.yaml, config.yaml)
    if (!isPlainObject(body.data)) {
      return NextResponse.json({ error: 'Missing or invalid data field' }, { status: 400 })
    }
    writeFileSync(filePath, YAML.stringify(body.data), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 })
  }
}
