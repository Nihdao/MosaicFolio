'use client'
import { useState, useEffect } from 'react'
import { useContentEdit } from '@/components/editor/useContentEdit'
import EditableField from '@/components/editor/EditableField'
import type { PortfolioImage } from '@/lib/content'

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface EditableImageLabelProps {
  image: PortfolioImage
}

export default function EditableImageLabel({ image }: EditableImageLabelProps) {
  const [localLabel, setLocalLabel] = useState(image.label ?? '')
  const [blockId] = useState(() => image.id ?? slugify(image.label ?? image.src))
  const { save } = useContentEdit('images')

  useEffect(() => {
    setLocalLabel(image.label ?? '')
  }, [image.label])

  const handleSave = async (newLabel: string) => {
    const updated = { ...image, label: newLabel }
    await save(blockId, updated as Record<string, unknown>)
    setLocalLabel(newLabel)
  }

  return (
    <EditableField
      value={localLabel}
      onSave={handleSave}
      className="text-white text-sm font-medium"
      placeholder="Caption…"
    />
  )
}
