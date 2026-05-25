import YAML from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { resolveBlockId } from '@/lib/contentBlockId'

type RouteContext = { params: Promise<{ file: string; id: string }> }

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

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const guard = devOnly()
  if (guard) return guard

  const { file, id } = await params

  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 })
  }

  const { filePath, error } = resolveContentPath(file)
  if (error) return error

  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Read failed' }, { status: 500 })
  }

  const items = parseMultiDoc(raw)
  const before = items.length
  const filtered = items.filter(item => resolveBlockId(item, file) !== id)

  if (filtered.length === before) {
    return NextResponse.json({ error: `Block '${id}' not found in ${file}.yaml` }, { status: 404 })
  }

  try {
    writeFileSync(filePath, serializeMultiDoc(filtered), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const guard = devOnly()
  if (guard) return guard

  const { file, id } = await params

  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid block ID' }, { status: 400 })
  }

  const { filePath, error } = resolveContentPath(file)
  if (error) return error

  let body: { data: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!isPlainObject(body.data)) {
    return NextResponse.json({ error: 'Missing or invalid data field' }, { status: 400 })
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

  const items = parseMultiDoc(raw)
  const targetIdx = items.findIndex(item => resolveBlockId(item, file) === id)

  if (targetIdx === -1) {
    return NextResponse.json({ error: `Block '${id}' not found in ${file}.yaml` }, { status: 404 })
  }

  items[targetIdx] = body.data

  try {
    writeFileSync(filePath, serializeMultiDoc(items), 'utf-8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 })
  }
}
