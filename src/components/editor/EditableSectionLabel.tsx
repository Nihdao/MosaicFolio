'use client'
import { useState } from 'react'
import EditableField from '@/components/editor/EditableField'

interface EditableSectionLabelProps {
  label: string
  onSave: (newLabel: string) => Promise<void>
}

export default function EditableSectionLabel({ label, onSave }: EditableSectionLabelProps) {
  const [localLabel, setLocalLabel] = useState(label)

  return (
    <EditableField
      value={localLabel}
      onSave={async (newLabel) => {
        await onSave(newLabel)
        setLocalLabel(newLabel)
      }}
      className="text-[0.875rem] font-medium uppercase tracking-wider text-[--muted-foreground]"
    />
  )
}
