import type { Project } from '@/lib/content'

interface StatusBadgeProps {
  status: Project['status']
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none tracking-wide"
      style={{
        backgroundColor: `var(--status-${status}-bg)`,
        color: `var(--status-${status}-text)`,
      }}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  )
}
