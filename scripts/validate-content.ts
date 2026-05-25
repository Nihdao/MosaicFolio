import {
  getConfig,
  getProjects,
  getLinks,
  getImages,
  getLayout,
  validateLayout,
} from '../src/lib/content'

try {
  const config = getConfig()
  const projects = getProjects()
  const links = getLinks()
  const images = getImages()
  const layout = getLayout()
  validateLayout(layout, projects, links, images)

  console.log('content/ is valid')
  console.log(`  config:   ${config.name}`)
  console.log(`  projects: ${projects.length}`)
  console.log(`  links:    ${links.length}`)
  console.log(`  images:   ${images.length}`)
  console.log(`  layout:   ${layout.tiles.length} tiles`)
} catch (err) {
  console.error('content/ validation failed:')
  console.error('  ' + (err instanceof Error ? err.message : String(err)))
  process.exit(1)
}
