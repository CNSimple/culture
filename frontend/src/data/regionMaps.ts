import type { AIContext, RegionId } from '../stores/mapStore'

// Coordinates follow the 2560×1440 landscape overview artwork.
// Hotspots describe visual regions, not administrative GIS borders.
export const MAP_VIEWBOX = { width: 2560, height: 1440 } as const

export type RegionMap = {
  id: RegionId
  name: string
  subtitle: string
  mainHotspot: string
  regionImage: string
  highlightImage: string
  cameraOrigin: { x: number; y: number }
  tooltipPosition: { x: number; y: number }
  sites: string[]
  aiContext: AIContext
}

// highlightImage is clipped by RegionHighlight.vue, leaving only the original
// pixels of the selected district visible as a transparent SVG image layer.
const mainPixels = '/maps/handan-overview-landscape-v2.webp'

export const regionMaps: RegionMap[] = [
  {
    id: 'wuan', name: '武安', subtitle: '太行奇峰，山水武安',
    mainHotspot: 'M25 95 L120 34 L340 49 L560 156 L674 325 L670 491 L560 629 L335 705 L100 646 L13 433 Z',
    regionImage: '/maps/wuan-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 348, y: 360 }, tooltipPosition: { x: 348, y: 360 },
    sites: ['东太行', '京娘湖', '七步沟', '古武当山'],
    aiContext: { location: '武安', source: 'map', selectedEntity: null },
  },
  {
    id: 'yongnian', name: '永年', subtitle: '太极故里，水城古韵',
    mainHotspot: 'M1530 125 L1725 103 L1935 149 L2160 303 L2168 442 L1952 548 L1712 492 L1515 382 Z',
    regionImage: '/maps/yongnian-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 1810, y: 306 }, tooltipPosition: { x: 1810, y: 306 },
    sites: ['广府古城', '护城河', '太极故里'],
    aiContext: { location: '永年', source: 'map', selectedEntity: null },
  },
  {
    id: 'handan-urban', name: '邯郸主城区', subtitle: '三千年赵都，成语典故之城',
    mainHotspot: 'M755 335 L918 251 L1098 245 L1359 304 L1490 455 L1436 652 L1242 739 L977 692 L719 554 Z',
    regionImage: '/maps/handanzhuchengqu-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 1100, y: 468 }, tooltipPosition: { x: 1100, y: 468 },
    sites: ['赵王城', '丛台', '邯郸道', '邯郸市博物馆', '学步桥'],
    aiContext: { location: '邯郸主城区', source: 'map', selectedEntity: null },
  },
  {
    id: 'daming', name: '大名', subtitle: '运河古城，千年遗韵',
    mainHotspot: 'M1910 545 L2190 469 L2520 583 L2550 836 L2470 1088 L2185 1135 L1910 957 L1845 724 Z',
    regionImage: '/maps/daming-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 2250, y: 795 }, tooltipPosition: { x: 2250, y: 795 },
    sites: ['大名古城', '古城街巷', '运河文化', '码头'],
    aiContext: { location: '大名', source: 'map', selectedEntity: null },
  },
  {
    id: 'shexian', name: '涉县', subtitle: '娲皇圣地，太行古境',
    mainHotspot: 'M0 685 L155 593 L355 625 L470 749 L455 944 L363 1120 L157 1220 L0 1114 Z',
    regionImage: '/maps/shexian-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 275, y: 875 }, tooltipPosition: { x: 275, y: 875 },
    sites: ['娲皇宫', '中皇山', '女娲文化'],
    aiContext: { location: '涉县', source: 'map', selectedEntity: null },
  },
  {
    id: 'fengfeng', name: '峰峰矿区', subtitle: '石窟千年，窑火流韵',
    mainHotspot: 'M455 682 L626 634 L810 746 L895 940 L815 1160 L613 1217 L420 1111 L404 873 Z',
    regionImage: '/maps/fengfeng-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 647, y: 925 }, tooltipPosition: { x: 647, y: 925 },
    sites: ['响堂山石窟', '磁州窑', '滏河'],
    aiContext: { location: '峰峰矿区', source: 'map', selectedEntity: null },
  },
  {
    id: 'cixian-linzhang', name: '磁县／临漳', subtitle: '邺城遗址，北朝风华',
    mainHotspot: 'M905 771 L1103 698 L1380 711 L1598 856 L1708 1080 L1574 1270 L1303 1346 L1054 1278 L855 1076 Z',
    regionImage: '/maps/cixian_linzhang-landscape-v2.webp', highlightImage: mainPixels,
    cameraOrigin: { x: 1260, y: 1010 }, tooltipPosition: { x: 1260, y: 1010 },
    sites: ['邺城遗址', '邺城遗址博物馆', '宫城遗址', '北响堂石窟'],
    aiContext: { location: '磁县／临漳', source: 'map', selectedEntity: null },
  },
]

export const regionMapsById = Object.fromEntries(regionMaps.map((region) => [region.id, region])) as Record<RegionId, RegionMap>
