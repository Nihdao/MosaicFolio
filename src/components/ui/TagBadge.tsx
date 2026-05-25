interface TagBadgeProps {
  tag: string
  color?: string
}

export default function TagBadge({ tag, color }: TagBadgeProps) {
  if (color) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none tracking-wide"
        style={{ backgroundColor: color, color: '#fff' }}
      >
        {tag}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none tracking-wide"
      style={{
        backgroundColor: 'var(--muted)',
        color: 'var(--muted-foreground)',
        border: '1px solid var(--border)',
      }}
    >
      {tag}
    </span>
  )
}
