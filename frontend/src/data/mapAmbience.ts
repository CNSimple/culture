import type { RegionId } from '../stores/mapStore'

export type MapId = RegionId | 'handan'
type Point = { x: number; y: number }
type WaterZone = { x: number; y: number; rx: number; ry: number }
type BoatRoute = { start: Point; control1: Point; control2: Point; end: Point; seconds: number }
type Waterfall = { path: string; x: number; y: number; width: number; height: number }

export type MapAmbience = {
  width: number
  height: number
  dustArea: { x: number; y: number; width: number; height: number }
  water: WaterZone[]
  boat?: BoatRoute
  waterfalls?: Waterfall[]
  birds: Point[]
}

// Artwork coordinates restrict motion to illustrated sky, rivers and falls.
// The small overlays never imply a geographic or historical data point.
export const mapAmbience: Record<MapId, MapAmbience> = {
  handan: {
    width: 2560, height: 1440, dustArea: { x: 200, y: 260, width: 2100, height: 900 },
    water: [{ x: 1800, y: 420, rx: 190, ry: 70 }, { x: 2090, y: 900, rx: 230, ry: 88 }],
    boat: { start: { x: 1920, y: 735 }, control1: { x: 2020, y: 770 }, control2: { x: 2180, y: 857 }, end: { x: 2280, y: 916 }, seconds: 30 },
    birds: [{ x: 1020, y: 136 }, { x: 1110, y: 165 }],
  },
  daming: {
    width: 2560, height: 1440, dustArea: { x: 180, y: 250, width: 2200, height: 950 },
    water: [{ x: 320, y: 680, rx: 170, ry: 350 }, { x: 1680, y: 1130, rx: 690, ry: 130 }],
    boat: { start: { x: 1030, y: 1040 }, control1: { x: 1330, y: 1080 }, control2: { x: 1760, y: 1140 }, end: { x: 2130, y: 1180 }, seconds: 34 },
    birds: [{ x: 1640, y: 170 }, { x: 1780, y: 145 }],
  },
  'cixian-linzhang': {
    width: 2560, height: 1440, dustArea: { x: 180, y: 260, width: 2200, height: 960 },
    water: [{ x: 1390, y: 1160, rx: 700, ry: 120 }],
    birds: [{ x: 1680, y: 165 }, { x: 1840, y: 195 }],
  },
  shexian: {
    width: 2560, height: 1440, dustArea: { x: 130, y: 230, width: 2250, height: 1020 },
    water: [{ x: 1160, y: 1210, rx: 650, ry: 100 }],
    waterfalls: [{ path: 'M690 710 Q760 700 820 728 L860 1110 Q780 1130 710 1100 Z', x: 710, y: 720, width: 130, height: 390 }],
    birds: [{ x: 1880, y: 150 }, { x: 2020, y: 180 }],
  },
  wuan: {
    width: 2560, height: 1440, dustArea: { x: 120, y: 220, width: 2280, height: 1060 },
    water: [{ x: 1090, y: 530, rx: 380, ry: 150 }, { x: 1610, y: 1090, rx: 440, ry: 120 }],
    boat: { start: { x: 720, y: 600 }, control1: { x: 920, y: 650 }, control2: { x: 1120, y: 710 }, end: { x: 1320, y: 760 }, seconds: 36 },
    waterfalls: [{ path: 'M1880 650 Q1970 640 2040 680 L2090 1100 Q1980 1130 1900 1090 Z', x: 1900, y: 660, width: 170, height: 450 }],
    birds: [{ x: 1450, y: 130 }, { x: 1600, y: 155 }],
  },
  fengfeng: {
    width: 2560, height: 1440, dustArea: { x: 140, y: 230, width: 2250, height: 1020 },
    water: [{ x: 1080, y: 1120, rx: 650, ry: 150 }],
    birds: [{ x: 1640, y: 150 }, { x: 1780, y: 172 }],
  },
  yongnian: {
    width: 2560, height: 1440, dustArea: { x: 160, y: 230, width: 2240, height: 1020 },
    water: [{ x: 1280, y: 830, rx: 930, ry: 300 }],
    boat: { start: { x: 500, y: 840 }, control1: { x: 820, y: 860 }, control2: { x: 1060, y: 910 }, end: { x: 1350, y: 930 }, seconds: 38 },
    birds: [{ x: 1530, y: 150 }, { x: 1710, y: 180 }],
  },
  'handan-urban': {
    width: 2560, height: 1440, dustArea: { x: 160, y: 230, width: 2240, height: 1020 },
    water: [{ x: 980, y: 1050, rx: 550, ry: 135 }],
    birds: [{ x: 1780, y: 150 }, { x: 1940, y: 180 }],
  },
}
