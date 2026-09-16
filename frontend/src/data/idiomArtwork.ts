import { graphNodes } from './graphData'

export const IDIOM_ARTWORK_PATH = `${import.meta.env.BASE_URL}assets/idiom-grid.png`
export const PERSON_ARTWORK_PATH = `${import.meta.env.BASE_URL}assets/idiom-grid_1.png`

type ArtworkGrid = {
  path: string
  width: number
  height: number
  columns: number
  rows: number
  header: number
  tileHeight: number
}

export const IDIOM_ARTWORK_GRID: ArtworkGrid = {
  path: IDIOM_ARTWORK_PATH, width: 1536, height: 1024,
  columns: 10, rows: 9, header: 48, tileHeight: 106,
}

export const PERSON_ARTWORK_GRID: ArtworkGrid = {
  path: PERSON_ARTWORK_PATH, width: 1312, height: 1199,
  columns: 16, rows: 10, header: 49, tileHeight: 115,
}

const artworkIndexByNodeId = new Map<string, number>()
for (const kind of ['idiom', 'person'] as const) {
  graphNodes.filter((node) => node.kind === kind).forEach((node, index) => {
    artworkIndexByNodeId.set(node.id, index)
  })
}

export function nodeArtwork(nodeId: string, kind: 'idiom' | 'person') {
  const index = artworkIndexByNodeId.get(nodeId)
  const grid = kind === 'idiom' ? IDIOM_ARTWORK_GRID : PERSON_ARTWORK_GRID
  if (index == null || index >= grid.columns * grid.rows) return null
  return {
    ...grid,
    column: index % grid.columns,
    row: Math.floor(index / grid.columns),
    tileWidth: grid.width / grid.columns,
  }
}

export function artworkBackgroundPosition(id: string) {
  const tile = nodeArtwork(id, 'idiom')
  if (!tile) return null
  return {
    size: `${tile.width / tile.tileHeight * 100}% ${tile.height / tile.tileHeight * 100}%`,
    position: `${(tile.column * tile.tileWidth) / (tile.width - tile.tileHeight) * 100}% ${(tile.header + tile.row * tile.tileHeight) / (tile.height - tile.tileHeight) * 100}%`,
  }
}
