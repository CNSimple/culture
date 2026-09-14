export const GRAPH_VIEWBOX = { width: 986, height: 700 } as const

// 图片放在 public/assets 下，构建后资源前缀会变成 /static/graph-app/，所以按 BASE_URL 拼接。
const ASSET_BASE = import.meta.env.BASE_URL

export type GraphNode = {
  id: 'huangliang' | 'lu-sheng' | 'lv-weng' | 'zhenzhongji' | 'lvxian-temple'
  label: string
  kind: 'idiom' | 'person' | 'source' | 'site'
  x: number
  y: number
  radius: number
  image: string
  spriteQuadrant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export type GraphLink = {
  id: string
  source: GraphNode['id']
  target: GraphNode['id']
  label: string
  d: string
  tagX: number
  tagY: number
}

// Fixed positions reproduce the supplied 1536×1024 composition.
export const graphNodes: GraphNode[] = [
  { id: 'huangliang', label: '黄粱一梦', kind: 'idiom', x: 568, y: 226, radius: 75, image: `${ASSET_BASE}assets/huangliang-dream.png` },
  { id: 'lu-sheng', label: '卢生', kind: 'person', x: 295, y: 198, radius: 55, image: `${ASSET_BASE}assets/graph-portraits.png`, spriteQuadrant: 'top-left' },
  { id: 'lv-weng', label: '吕翁', kind: 'person', x: 625, y: 28, radius: 49, image: `${ASSET_BASE}assets/graph-portraits.png`, spriteQuadrant: 'top-right' },
  { id: 'zhenzhongji', label: '《枕中记》', kind: 'source', x: 815, y: 293, radius: 59, image: `${ASSET_BASE}assets/graph-portraits.png`, spriteQuadrant: 'bottom-left' },
  { id: 'lvxian-temple', label: '黄粱梦吕仙祠', kind: 'site', x: 482, y: 426, radius: 59, image: `${ASSET_BASE}assets/graph-portraits.png`, spriteQuadrant: 'bottom-right' },
]

export const graphLinks: GraphLink[] = [
  { id: 'related-lu', source: 'lu-sheng', target: 'huangliang', label: '相关人物', d: 'M350 199 Q450 193 492 218', tagX: 397, tagY: 164 },
  { id: 'related-lv', source: 'lv-weng', target: 'huangliang', label: '相关人物', d: 'M620 76 Q596 126 585 151', tagX: 610, tagY: 104 },
  { id: 'related-book', source: 'huangliang', target: 'zhenzhongji', label: '相关史料', d: 'M644 242 Q705 263 755 284', tagX: 718, tagY: 230 },
  { id: 'related-temple', source: 'huangliang', target: 'lvxian-temple', label: '相关古迹', d: 'M543 297 Q510 345 492 368', tagX: 448, tagY: 334 },
]
