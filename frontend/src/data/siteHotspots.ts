import type { RegionId } from '../stores/mapStore'

export type SiteHotspot = { id: string; name: string; subtitle: string; x: number; y: number }

export const siteHotspots: Record<RegionId, SiteHotspot[]> = {
  daming: [
    { id: 'daming-city', name: '大名古城', subtitle: '城墙与古城街巷', x: 1430, y: 650 },
    { id: 'daming-gate', name: '大名城门', subtitle: '运河古城入口', x: 1610, y: 790 },
    { id: 'daming-wharf', name: '运河码头', subtitle: '舟楫往来与水乡生活', x: 470, y: 1030 },
  ],
  wuan: [
    { id: 'wuan-east-taihang', name: '东太行', subtitle: '太行奇峰与山崖栈道', x: 2110, y: 370 },
    { id: 'wuan-jingniang-lake', name: '京娘湖', subtitle: '山水相依的湖谷', x: 830, y: 650 },
    { id: 'wuan-qibu-valley', name: '七步沟', subtitle: '峡谷、瀑布与古道', x: 1980, y: 990 },
    { id: 'wuan-wudang', name: '古武当山', subtitle: '山巅古建与道教文化', x: 650, y: 1050 },
  ],
  shexian: [
    { id: 'shexian-nuwa-palace', name: '娲皇宫', subtitle: '女娲文化圣地', x: 1730, y: 400 },
    { id: 'shexian-zhonghuang', name: '中皇山', subtitle: '太行山中古迹', x: 520, y: 650 },
    { id: 'shexian-ancient-road', name: '太行古道', subtitle: '山谷中的历史行旅', x: 1170, y: 820 },
    { id: 'shexian-waterfall', name: '太行瀑布', subtitle: '溪流与峡谷景观', x: 1020, y: 1090 },
  ],
  fengfeng: [
    { id: 'fengfeng-grotto', name: '响堂山石窟', subtitle: '北齐佛教石窟艺术', x: 800, y: 490 },
    { id: 'fengfeng-kiln', name: '磁州窑', subtitle: '千年窑火与陶瓷技艺', x: 2040, y: 830 },
    { id: 'fengfeng-river', name: '滏河水岸', subtitle: '山水相依的古镇生活', x: 1080, y: 1110 },
  ],
  'cixian-linzhang': [
    { id: 'cixian-ye-city', name: '邺城遗址', subtitle: '曹魏古都遗存', x: 1270, y: 760 },
    { id: 'cixian-museum', name: '邺城遗址博物馆', subtitle: '北朝历史展陈', x: 510, y: 1090 },
    { id: 'cixian-beixiangtang', name: '北响堂石窟', subtitle: '北朝石窟造像', x: 2040, y: 470 },
  ],
  yongnian: [
    { id: 'yongnian-guangfu', name: '广府古城', subtitle: '水城古韵与城门楼阁', x: 1290, y: 700 },
    { id: 'yongnian-moat', name: '护城河', subtitle: '环城水系与古桥', x: 790, y: 520 },
    { id: 'yongnian-taiji', name: '太极故里', subtitle: '杨式太极文化', x: 1960, y: 1010 },
  ],
  'handan-urban': [
    { id: 'urban-congtai', name: '丛台', subtitle: '赵都地标与城市记忆', x: 1320, y: 620 },
    { id: 'urban-zhaowang', name: '赵王城', subtitle: '战国赵都遗址', x: 1910, y: 400 },
    { id: 'urban-handandao', name: '邯郸道', subtitle: '古城街巷与成语故事', x: 520, y: 640 },
    { id: 'urban-museum', name: '邯郸市博物馆', subtitle: '邯郸历史文化展陈', x: 2060, y: 1010 },
    { id: 'urban-xuebu', name: '学步桥', subtitle: '邯郸学步典故地', x: 880, y: 1100 },
  ],
}
