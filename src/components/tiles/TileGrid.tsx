import type { Project, Link, PortfolioImage, Layout } from '@/lib/content'
import { slugify } from '@/lib/contentBlockId'
import SectionTile from '@/components/tiles/SectionTile'
import ProjectTile from '@/components/tiles/ProjectTile'
import ImageTile from '@/components/tiles/ImageTile'
import { getTileSpanClass } from '@/lib/tileLayout'

interface TileGridProps {
  projects: Project[]
  links: Link[]
  images: PortfolioImage[]
  layout: Layout
}

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

const STAGGER_MS = 60
const MAX_STAGGER_INDEX = 12

export default function TileGrid({ projects, links: _links, images, layout }: TileGridProps) {
  return (
    <div className="tile-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6">
      {layout.tiles.map((tileId, index) => {
        const tile = resolveTile(tileId, projects, images)
        const delay = `${Math.min(index, MAX_STAGGER_INDEX) * STAGGER_MS}ms`
        switch (tile.type) {
          case 'section':
            return (
              <div key={tile.id} className="tile-grid-item col-span-2 md:col-span-4" style={{ animationDelay: delay }}>
                <SectionTile label={tile.label} />
              </div>
            )
          case 'project':
            return (
              <div key={tile.id} className={`tile-grid-item ${getTileSpanClass(tile.data.size, 'project')}`} style={{ animationDelay: delay }}>
                <ProjectTile project={tile.data} />
              </div>
            )
          case 'image':
            return (
              <div key={tile.id} className={`tile-grid-item ${getTileSpanClass(tile.data.size, 'image')}`} style={{ animationDelay: delay }}>
                <ImageTile image={tile.data} />
              </div>
            )
          default:
            return (
              <div key={tile.id} className="tile-grid-item col-span-2 md:col-span-4" style={{ animationDelay: delay }}>
                <div className="bg-[--card] rounded-[--radius] p-5 h-full" />
              </div>
            )
        }
      })}
    </div>
  )
}
