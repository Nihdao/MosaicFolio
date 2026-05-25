import { Suspense } from 'react'
import { getConfig, getProjects, getLinks, getImages, getLayout, validateLayout } from '@/lib/content'
import TileGrid from '@/components/tiles/TileGrid'
import HeroTile from '@/components/tiles/HeroTile'
import DevEditorOverlay from '@/components/editor/DevEditorOverlay'
import DevModeHeroWrapper from '@/components/editor/DevModeHeroWrapper'

export default async function Page() {
  const config = getConfig()
  const projects = getProjects()
  const links = getLinks()
  const images = getImages()
  const layout = getLayout()
  validateLayout(layout, projects, links, images)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--background)]">
      <aside aria-label="Profile" className="md:sticky md:top-0 md:h-screen md:w-1/3 overflow-y-auto">
        <Suspense fallback={<HeroTile config={config} links={links} />}>
          <DevModeHeroWrapper config={config} links={links} />
        </Suspense>
      </aside>
      <main className="md:w-2/3 overflow-y-auto overflow-x-hidden" style={{ position: 'relative' }}>
        <TileGrid
          projects={projects}
          links={links}
          images={images}
          layout={layout}
        />
        <Suspense fallback={null}>
          <DevEditorOverlay
            tileIds={layout.tiles}
            projects={projects}
            images={images}
          />
        </Suspense>
      </main>
    </div>
  )
}
