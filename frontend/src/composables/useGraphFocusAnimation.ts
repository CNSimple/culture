import gsap from 'gsap'

const sequence = [
  { link: 'related-lu', node: 'lu-sheng' },
  { link: 'related-lv', node: 'lv-weng' },
  { link: 'related-temple', node: 'lvxian-temple' },
  { link: 'related-book', node: 'zhenzhongji' },
] as const

/** One restrained 1.7s focus sequence; returns the timeline so a replay can cancel it. */
export function playGraphFocusAnimation(svg: SVGSVGElement, panel: HTMLElement) {
  const center = svg.querySelector<SVGGElement>('.network-core')
  const ripple = svg.querySelector<SVGCircleElement>('.focus-ripple')
  if (!center || !ripple) return null

  const related = [...svg.querySelectorAll<SVGGElement>('.graph-entity:not(.network-core)')]
  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })

  // Reset every animated property before replaying. The five-node dataset has no unrelated entities.
  gsap.set(center, { scale: 1, svgOrigin: '568 226' })
  gsap.set(related, { opacity: 1, scale: 1, transformOrigin: '50% 50%' })
  gsap.set(ripple, { attr: { r: 77 }, opacity: 0 })
  gsap.set(panel, { x: 72, autoAlpha: 0 })

  sequence.forEach(({ link }) => {
    const group = svg.querySelector<SVGGElement>(`[data-link-id="${link}"]`)
    if (!group) return
    const path = group.querySelector<SVGPathElement>('.relation-line--base')
    if (path) {
      const length = path.getTotalLength()
      gsap.set(path, { opacity: 0.18, strokeDasharray: length, strokeDashoffset: length })
    }
    gsap.set(group.querySelectorAll('.relation-line--glow, .relation-flow'), { opacity: 0 })
    gsap.set(group.querySelector('.relation-tag'), { opacity: 0.2 })
  })

  timeline.to(related, { opacity: 0.15, duration: 0.16 }, 0)
  timeline.to(center, { scale: 1.18, duration: 0.4 }, 0)
  timeline.fromTo(ripple,
    { attr: { r: 77 }, opacity: 0.82 },
    { attr: { r: 150 }, opacity: 0, duration: 0.7, ease: 'power1.out' },
    0.06,
  )

  sequence.forEach(({ link, node }, index) => {
    const group = svg.querySelector<SVGGElement>(`[data-link-id="${link}"]`)
    const entity = svg.querySelector<SVGGElement>(`[data-node-id="${node}"]`)
    if (!group || !entity) return
    const path = group.querySelector<SVGPathElement>('.relation-line--base')
    const glow = group.querySelector<SVGPathElement>('.relation-line--glow')
    const flow = group.querySelector<SVGPathElement>('.relation-flow')
    const tag = group.querySelector<SVGGElement>('.relation-tag')
    const at = 0.30 + index * 0.19

    if (path) timeline.to(path, { opacity: 1, strokeDashoffset: 0, duration: 0.25, ease: 'power1.out' }, at)
    if (glow) timeline.to(glow, { opacity: 0.65, duration: 0.2 }, at)
    if (flow) timeline.to(flow, { opacity: 1, duration: 0.2 }, at + 0.06)
    if (tag) timeline.to(tag, { opacity: 1, duration: 0.2 }, at + 0.1)
    timeline.to(entity, { opacity: 1, scale: 1.04, duration: 0.2 }, at + 0.13)
    timeline.to(entity, { scale: 1, duration: 0.12, ease: 'power1.out' }, at + 0.33)
  })

  timeline.to(panel, { x: 0, autoAlpha: 1, duration: 0.42, ease: 'power2.out' }, 1.32)
  return timeline
}
