import type { RegionId } from '../stores/mapStore'

export type MapRegion = {
  id: RegionId
  name: string
  subtitle: string
  position: { x: number; y: number }
  relatedIdioms: string[]
  relatedSites: string[]
  knowledge: {
    idiomCount: number
    personCount: number
    siteCount: number
    entities: string[]
    questions: string[]
  }
}

export const mapRegions: MapRegion[] = [
  {
    id: 'wuan', name: '武安', subtitle: '太行奇峰 · 山水武安',
    position: { x: 348, y: 360 },
    relatedIdioms: ['完璧归赵', '毛遂自荐'],
    relatedSites: ['东太行', '京娘湖', '古武当山'],
    knowledge: { idiomCount: 7, personCount: 5, siteCount: 8, entities: ['古武当山', '京娘湖', '完璧归赵'], questions: ['武安有哪些成语故事？', '介绍古武当山', '推荐武安研学路线'] },
  },
  {
    id: 'shexian', name: '涉县', subtitle: '女娲文化 · 太行古迹',
    position: { x: 275, y: 875 },
    relatedIdioms: ['女娲补天', '精卫填海'],
    relatedSites: ['娲皇宫', '中皇山', '太行古道'],
    knowledge: { idiomCount: 5, personCount: 4, siteCount: 7, entities: ['娲皇宫', '女娲', '女娲补天'], questions: ['女娲补天与涉县有什么关系？', '介绍娲皇宫', '推荐涉县研学路线'] },
  },
  {
    id: 'fengfeng', name: '峰峰矿区', subtitle: '石窟千年 · 窑火流韵',
    position: { x: 647, y: 925 },
    relatedIdioms: ['炉火纯青', '巧夺天工'],
    relatedSites: ['响堂山石窟', '磁州窑', '滏河'],
    knowledge: { idiomCount: 6, personCount: 5, siteCount: 9, entities: ['响堂山石窟', '磁州窑', '炉火纯青'], questions: ['响堂山石窟有什么故事？', '介绍磁州窑', '推荐峰峰研学路线'] },
  },
  {
    id: 'cixian-linzhang', name: '磁县／临漳', subtitle: '古邺城 · 曹魏文化',
    position: { x: 1260, y: 1010 },
    relatedIdioms: ['一箭双雕', '望梅止渴'],
    relatedSites: ['邺城遗址', '铜雀台遗址', '北响堂石窟'],
    knowledge: { idiomCount: 8, personCount: 9, siteCount: 7, entities: ['邺城遗址', '曹操', '望梅止渴'], questions: ['古邺城经历了哪些朝代？', '曹魏文化与临漳', '推荐邺城研学路线'] },
  },
  {
    id: 'handan-urban', name: '邯郸主城区', subtitle: '赵都文脉 · 成语典故中心',
    position: { x: 1100, y: 468 },
    relatedIdioms: ['邯郸学步', '完璧归赵'],
    relatedSites: ['赵王城', '丛台', '学步桥'],
    knowledge: { idiomCount: 12, personCount: 8, siteCount: 6, entities: ['赵王城', '丛台', '完璧归赵'], questions: ['完璧归赵发生在哪里？', '介绍赵王城和丛台', '推荐主城区研学路线'] },
  },
  {
    id: 'yongnian', name: '永年', subtitle: '广府古城 · 太极文化',
    position: { x: 1810, y: 306 },
    relatedIdioms: ['刚柔并济', '行云流水'],
    relatedSites: ['广府古城', '护城河', '太极故里'],
    knowledge: { idiomCount: 5, personCount: 6, siteCount: 7, entities: ['广府古城', '杨露禅', '太极文化'], questions: ['广府古城为什么建在水中？', '介绍永年太极文化', '推荐永年研学路线'] },
  },
  {
    id: 'daming', name: '大名', subtitle: '运河古城 · 千年遗韵',
    position: { x: 2250, y: 795 },
    relatedIdioms: ['大名鼎鼎', '名不虚传'],
    relatedSites: ['大名古城', '古城街巷', '运河码头'],
    knowledge: { idiomCount: 6, personCount: 5, siteCount: 8, entities: ['大名古城', '大运河', '大名鼎鼎'], questions: ['大名有哪些成语？', '介绍大名古城', '推荐大名研学路线'] },
  },
]

export const mapRegionsById = Object.fromEntries(
  mapRegions.map((region) => [region.id, region]),
) as Record<RegionId, MapRegion>
