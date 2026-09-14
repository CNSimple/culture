import { GRAPH_VIEWBOX } from '../data/graphData'

/** Paints small moving gold sparks along the four SVG relationship paths. */
export function startRelationParticles(
  canvas: HTMLCanvasElement,
  paths: SVGPathElement[],
): () => void {
  const context = canvas.getContext('2d')
  if (!context) return () => undefined

  const host = canvas.parentElement
  if (!host) return () => undefined

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const lengths = paths.map((path) => path.getTotalLength())
  let frame = 0
  let width = 0
  let height = 0
  let pixelRatio = 1

  const resize = () => {
    const rect = host.getBoundingClientRect()
    width = rect.width
    height = rect.height
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }

  const draw = (time: number) => {
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Match SVG preserveAspectRatio="xMidYMid meet" exactly.
    const scale = Math.min(width / GRAPH_VIEWBOX.width, height / GRAPH_VIEWBOX.height)
    const offsetX = (width - GRAPH_VIEWBOX.width * scale) / 2
    const offsetY = (height - GRAPH_VIEWBOX.height * scale) / 2
    context.setTransform(pixelRatio * scale, 0, 0, pixelRatio * scale, pixelRatio * offsetX, pixelRatio * offsetY)
    context.globalCompositeOperation = 'screen'

    paths.forEach((path, lineIndex) => {
      const length = lengths[lineIndex]
      for (let particleIndex = 0; particleIndex < 5; particleIndex += 1) {
        const phase = reducedMotion.matches ? 0.12 : (time * 0.00011 + particleIndex / 5 + lineIndex * 0.13) % 1
        const point = path.getPointAtLength(phase * length)
        const radius = particleIndex === 0 ? 2.8 : 1.4
        context.beginPath()
        context.fillStyle = particleIndex % 3 === 0 ? 'rgba(255, 239, 184, .95)' : 'rgba(235, 180, 99, .78)'
        context.shadowColor = '#f5c477'
        context.shadowBlur = particleIndex === 0 ? 18 : 9
        context.arc(point.x, point.y, radius, 0, Math.PI * 2)
        context.fill()
      }
    })
    context.shadowBlur = 0
    context.globalCompositeOperation = 'source-over'
    if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw)
  }

  const observer = new ResizeObserver(() => { resize(); if (reducedMotion.matches) draw(0) })
  observer.observe(host)
  resize()
  frame = window.requestAnimationFrame(draw)

  return () => {
    window.cancelAnimationFrame(frame)
    observer.disconnect()
  }
}
