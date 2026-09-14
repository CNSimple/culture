/**
 * 本页由 Flask 原型托管在 /knowledge-graph，其余六个页面仍在站点根目录。
 * `npm run dev` 时原型不在同一源，因此开发环境直接指向它的默认地址。
 */
export type PlatformPage = 'home' | 'idioms' | 'ask' | 'study' | 'recognize' | 'story'

const platformOrigin = import.meta.env.DEV ? 'http://127.0.0.1:5000' : ''

export function platformUrl(page: PlatformPage) {
  return `${platformOrigin}/?page=${page}`
}

export function openPlatformPage(page: PlatformPage) {
  window.location.href = platformUrl(page)
}
