import EditableSectionLabel from '@/components/editor/EditableSectionLabel'

interface SectionTileProps {
  label: string
  devMode?: boolean
  onSaveLabel?: (newLabel: string) => Promise<void>
}

export default function SectionTile({ label, devMode, onSaveLabel }: SectionTileProps) {
  if (devMode && onSaveLabel) {
    return (
      <div className="py-2 md:py-3">
        <EditableSectionLabel label={label} onSave={onSaveLabel} />
      </div>
    )
  }

  return (
    <div className="py-2 md:py-3">
      <h2 className="text-[0.875rem] font-bold uppercase tracking-wider text-[--muted-foreground]">
        {label}
      </h2>
    </div>
  )
}
