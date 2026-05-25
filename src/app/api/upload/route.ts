import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Unavailable in production' }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const allowed = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'ico', 'avif']
  if (!allowed.includes(ext)) {
    return NextResponse.json({ ok: false, error: 'File type not allowed' }, { status: 400 })
  }

  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9\-_]/gi, '_')
    .slice(0, 60)
  const filename = `${Date.now()}-${safeName}.${ext}`

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ ok: true, path: `/uploads/${filename}` })
}
