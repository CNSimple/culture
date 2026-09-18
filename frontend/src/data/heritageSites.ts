export type HeritageSite = {
  id: string
  name: string
  image: string
  region: string
  era: string
  theme: string
  calligraphy: string
  summary: string
  motto: string
}

const raw = [
  ['daming-city','大名古城','大名','宋明清','古城文脉','千年古城·燕赵重镇'],
  ['daming-wharf','大名运河文化','大名','隋唐至明清','运河文化','古河流韵·商旅通衢'],
  ['yongnian-guangfu','广府古城','永年','明清','水城古韵','水城古韵·太极故里'],
  ['yongnian-moat','广府护城河','永年','明清','古城水系','碧水环城·古韵悠长'],
  ['yongnian-taiji','太极故里','永年','清代','太极文化','刚柔相济·文武相生'],
  ['urban-congtai','丛台','邯郸主城区','战国','赵文化','千年丛台·赵都遗韵'],
  ['urban-xuebu','学步桥','邯郸主城区','明代','成语文化','古桥遗韵·成语之乡'],
  ['urban-zhaowang','赵王城遗址','邯郸主城区','战国','赵都文化','赵都故城·战国雄风'],
  ['urban-museum','邯郸市博物馆','邯郸主城区','当代','城市记忆','一馆阅千年·文脉照古今'],
  ['urban-handandao','邯郸道','邯郸主城区','历史街区','城市文化','古道新生·邯郸记忆'],
  ['fengfeng-grotto','响堂山石窟','峰峰矿区','北齐','石窟艺术','北齐石韵·佛光千年'],
  ['fengfeng-kiln','磁州窑','峰峰矿区','宋金元','陶瓷文化','千年窑火·黑白风华'],
  ['wuan-east-taihang','东太行','武安','自然人文','太行文化','太行雄姿·山河入画'],
  ['wuan-jingniang-lake','京娘湖','武安','宋代传说','山水文化','山水相依·传奇流芳'],
  ['wuan-qibu-valley','七步沟','武安','自然人文','太行文化','峡谷飞瀑·古道寻幽'],
  ['wuan-wudang','古武当山','武安','明清','道教文化','太行古观·道法自然'],
  ['cixian-beixiangtang','北响堂山石窟','磁县／临漳','北齐','石窟艺术','石壁梵音·北齐遗珍'],
  ['cixian-ye-city','邺城遗址','磁县／临漳','魏晋南北朝','都城文化','六朝古都·文脉流长'],
  ['cixian-museum','邺城遗址博物馆','磁县／临漳','当代','考古文化','邺城旧影·文明新章'],
] as const

export const heritageSites: HeritageSite[] = raw.map(([id,name,region,era,theme,calligraphy]) => ({
  id,name,region,era,theme,calligraphy,image:`${import.meta.env.BASE_URL}sites/${id}.jpg`,
  summary:`${name}是${region}重要的历史文化地标，承载着${era}以来的地域记忆与人文积淀。遗存、环境与地方故事彼此交织，呈现出邯郸深厚的历史层次，也为今天理解燕赵文化、开展文化研学提供了鲜活而珍贵的实物见证。`,
  motto:`走近${name}，在真实遗存中读懂燕赵大地的历史回声。`,
}))
export const heritageSitesById = Object.fromEntries(heritageSites.map(site => [site.id, site])) as Record<string, HeritageSite>
