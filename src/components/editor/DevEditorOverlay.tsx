'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDevMode } from '@/components/editor/useDevMode'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Project, PortfolioImage } from '@/lib/content'
import { slugify } from '@/lib/contentBlockId'
import { getTileSpanClass } from '@/lib/tileLayout'
import SortableTileWrapper from '@/components/editor/SortableTileWrapper'
import SectionTile from '@/components/tiles/SectionTile'
import ProjectTile from '@/components/tiles/ProjectTile'
import ImageTile from '@/components/tiles/ImageTile'
import CreateTilePanel from '@/components/editor/CreateTilePanel'
import TileEditorModal from '@/components/editor/TileEditorModal'

type ResolvedTile =
  | { type: 'project'; id: string; data: Project }
  | { type: 'image'; id: string; data: PortfolioImage }
  | { type: 'section'; id: string; label: string }
  | { type: 'unknown'; id: string }

function resolveTile(
  id: string,
  projects: Project[],
  images: PortfolioImage[]
): ResolvedTile {
  if (id.startsWith('section-')) {
    const label = id.slice('section-'.length).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return { type: 'section', id, label }
  }
  const project = projects.find((p) => slugify(p.title) === id)
  if (project) return { type: 'project', id, data: project }
  const image = images.find((img) => (img.id ?? slugify(img.label ?? img.src)) === id)
  if (image) return { type: 'image', id, data: image }
  return { type: 'unknown', id }
}


interface DevEditorOverlayProps {
  tileIds: string[]
  projects: Project[]
  images: PortfolioImage[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const TILE_TYPE_TO_FILE: Record<string, string> = {
  project: 'projects',
  image: 'images',
}

export default function DevEditorOverlay({ tileIds, projects, images }: DevEditorOverlayProps) {
  const [isDev, setIsDev] = useDevMode()
  const router = useRouter()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [order, setOrder] = useState<string[]>(tileIds)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const isSaving = useRef(false)
  const latestOrder = useRef(order)
  latestOrder.current = order
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingTileId, setEditingTileId] = useState<string | null>(null)

  const [tileSizes, setTileSizes] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    tileIds.forEach(id => {
      const tile = resolveTile(id, projects, images)
      if (tile.type === 'project' || tile.type === 'image') {
        map.set(id, tile.data.size ?? (tile.type === 'image' ? 'square-sm' : 'square'))
      }
    })
    return map
  })

  useEffect(() => {
    if (!isDev) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setIsDev(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDev, setIsDev])

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    if (isSaving.current) return
    isSaving.current = true
    const { active, over } = event
    if (!over || active.id === over.id) { isSaving.current = false; return }

    const current = latestOrder.current
    const oldIndex = current.indexOf(String(active.id))
    const newIndex = current.indexOf(String(over.id))
    const newOrder = arrayMove(current, oldIndex, newIndex)

    setOrder(newOrder)
    setSaveStatus('saving')

    try {
      const res = await fetch('/api/content/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { tiles: newOrder } }),
      })
      if (!res.ok) throw new Error('non-200')
      const json = await res.json()
      if (!json.ok) throw new Error('not ok')
      setSaveStatus('saved')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setOrder(current)
      setSaveStatus('error')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      isSaving.current = false
    }
  }, [])

  const handleDelete = useCallback(async (tileId: string) => {
    if (isSaving.current) return
    isSaving.current = true
    const current = latestOrder.current
    const newOrder = current.filter(id => id !== tileId)
    if (newOrder.length === 0) { isSaving.current = false; return }
    setOrder(newOrder)
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/content/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { tiles: newOrder } }),
      })
      if (!res.ok) throw new Error('non-200')
      const json = await res.json()
      if (!json.ok) throw new Error('not ok')
      setSaveStatus('saved')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setOrder(current)
      setSaveStatus('error')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      isSaving.current = false
    }
  }, [])

  const handleSizeChange = useCallback(async (tileId: string, tileType: string, blockId: string, newSize: string) => {
    if (isSaving.current) return
    const file = TILE_TYPE_TO_FILE[tileType]
    if (!file) return

    const previousSize = tileSizes.get(tileId) ?? 'square'
    setTileSizes(prev => new Map(prev).set(tileId, newSize))
    isSaving.current = true
    setSaveStatus('saving')

    try {
      const res = await fetch(`/api/content/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, fieldUpdates: { size: newSize } }),
      })
      if (!res.ok) throw new Error('non-200')
      const json = await res.json()
      if (!json.ok) throw new Error('not ok')
      setSaveStatus('saved')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setTileSizes(prev => new Map(prev).set(tileId, previousSize))
      setSaveStatus('error')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      isSaving.current = false
    }
  }, [tileSizes])

  const handleCreated = useCallback((newTileId: string) => {
    setOrder(prev => [...prev, newTileId])
    setShowCreatePanel(false)
    router.refresh()
  }, [router])

  const handleSaved = useCallback((oldId: string, newId: string) => {
    if (oldId !== newId) {
      setOrder(prev => prev.map(id => id === oldId ? newId : id))
    }
    setEditingTileId(null)
    router.refresh()
  }, [router])

  if (process.env.NODE_ENV === 'production') return null
  if (!isDev) return null

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    saving: 'Saving…',
    saved: 'Layout saved',
    error: 'Save failed — check console',
  }

  return (
    <>
      {/* Save status toast — top-right, non-intrusive */}
      {saveStatus !== 'idle' && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 10002,
            background: saveStatus === 'error' ? '#fef2f2' : saveStatus === 'saved' ? '#f0fdf4' : '#f5f5f5',
            color: saveStatus === 'error' ? '#dc2626' : saveStatus === 'saved' ? '#16a34a' : '#6b7280',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {statusLabel[saveStatus]}
        </div>
      )}

      {/* Sortable tile grid — covers the TileGrid beneath when dev mode is active */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--background)',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 50,
        }}
      >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6">
            {order.map((tileId) => {
              const tile = resolveTile(tileId, projects, images)
              switch (tile.type) {
                case 'section':
                  return (
                    <SortableTileWrapper
                      key={tile.id} id={tile.id}
                      className="col-span-2 md:col-span-4"
                      onDelete={() => handleDelete(tile.id)}
                      onEdit={() => setEditingTileId(tile.id)}
                      tileType="section"
                      currentSize="full"
                      onSizeChange={() => {}}
                    >
                      <SectionTile label={tile.label} />
                    </SortableTileWrapper>
                  )
                case 'project':
                  return (
                    <SortableTileWrapper
                      key={tile.id} id={tile.id}
                      className={getTileSpanClass(tileSizes.get(tile.id) ?? tile.data.size, 'project')}
                      onDelete={() => handleDelete(tile.id)}
                      onEdit={() => setEditingTileId(tile.id)}
                      tileType="project"
                      currentSize={tileSizes.get(tile.id) ?? tile.data.size}
                      onSizeChange={(newSize) => handleSizeChange(tile.id, 'project', slugify(tile.data.title), newSize)}
                    >
                      <ProjectTile project={tile.data} devMode onEdit={() => setEditingTileId(tile.id)} onDelete={() => handleDelete(tile.id)} />
                    </SortableTileWrapper>
                  )
                case 'image':
                  return (
                    <SortableTileWrapper
                      key={tile.id} id={tile.id}
                      className={getTileSpanClass(tileSizes.get(tile.id) ?? tile.data.size, 'image')}
                      onDelete={() => handleDelete(tile.id)}
                      onEdit={() => setEditingTileId(tile.id)}
                      tileType="image"
                      currentSize={tileSizes.get(tile.id) ?? tile.data.size}
                      onSizeChange={(newSize) => handleSizeChange(tile.id, 'image', tile.data.id ?? slugify(tile.data.label ?? tile.data.src ?? ''), newSize)}
                    >
                      <ImageTile image={tile.data} />
                    </SortableTileWrapper>
                  )
                default:
                  return (
                    <SortableTileWrapper key={tile.id} id={tile.id} className="col-span-2 md:col-span-4" onDelete={() => handleDelete(tile.id)}>
                      <div className="bg-[--card] rounded-[--radius] p-5 h-full" />
                    </SortableTileWrapper>
                  )
              }
            })}
          </div>
        </SortableContext>
      </DndContext>
      </div>

      {/* Floating "+" button — fixed bottom-right, visible only in dev mode */}
      <button
        onClick={() => setShowCreatePanel(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 9999,
          background: 'var(--accent)',
          color: 'var(--accent-foreground)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        aria-label="Create a new block"
      >
        <Plus size={24} />
      </button>

      {showCreatePanel && (
        <CreateTilePanel
          currentTiles={order}
          onClose={() => setShowCreatePanel(false)}
          onCreated={handleCreated}
        />
      )}

      {editingTileId && (() => {
        const tile = resolveTile(editingTileId, projects, images)
        if (tile.type === 'unknown') return null
        return (
          <TileEditorModal
            tile={tile}
            currentTiles={order}
            onClose={() => setEditingTileId(null)}
            onSaved={handleSaved}
          />
        )
      })()}
    </>
  )
}
