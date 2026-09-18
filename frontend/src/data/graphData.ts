import rawGraph from './knowledgeGraph.json'
import type { SimulationNodeDatum } from 'd3'
import type { HistoricalEra } from '../stores/knowledgeGraph'

export const GRAPH_VIEWBOX = { width: 986, height: 700 } as const

export type GraphNodeKind = 'idiom' | 'person' | 'site' | 'source' | 'event'

export type GraphNode = SimulationNodeDatum & {
  id: string
  label: string
  kind: GraphNodeKind
  radius: number
  description: string
  eras: HistoricalEra[]
}

export type GraphLink = {
  id: string
  source: string
  target: string
  label: string
}

export const graphNodes = rawGraph.nodes as GraphNode[]
export const graphLinks = rawGraph.links as GraphLink[]
export const graphNodeById = new Map(graphNodes.map((node) => [node.id, node]))

export const relationsByNodeId = new Map<string, GraphLink[]>()
for (const link of graphLinks) {
  for (const id of [link.source, link.target]) {
    const relations = relationsByNodeId.get(id) ?? []
    relations.push(link)
    relationsByNodeId.set(id, relations)
  }
}

export const graphMetrics = {
  entities: graphNodes.length,
  relations: graphLinks.length,
  idioms: graphNodes.filter((node) => node.kind === 'idiom').length,
  categories: 5,
}
