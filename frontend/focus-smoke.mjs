import assert from 'node:assert/strict'

const tabs = await (await fetch('http://127.0.0.1:9229/json')).json()
const tab = tabs.find((item) => item.type === 'page' && item.url.includes('knowledge-graph'))
assert.ok(tab, 'graph tab exists')
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
let id = 0
const pending = new Map()
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  pending.get(message.id)?.(message)
  pending.delete(message.id)
}
function send(method, params = {}) {
  return new Promise((resolve) => { const next = ++id; pending.set(next, resolve); ws.send(JSON.stringify({ id: next, method, params })) })
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true })
  if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.text)
  return response.result.result.value
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await send('Page.reload', { ignoreCache: true })
await sleep(450)
const state = () => evaluate(`({
  nodes: document.querySelectorAll('.graph-entity').length,
  links: document.querySelectorAll('.graph-relation').length,
  centerScale: document.querySelector('.network-core').getCTM().a,
  panelOpacity: getComputedStyle(document.querySelector('.entity-detail')).opacity,
  nodeOpacities: [...document.querySelectorAll('.graph-entity:not(.network-core)')].map(x => getComputedStyle(x).opacity),
  lineOpacities: [...document.querySelectorAll('.relation-line--base')].map(x => getComputedStyle(x).opacity)
})`)
const baseline = await state()
await evaluate(`document.querySelector('.network-core').dispatchEvent(new MouseEvent('click', { bubbles: true }))`)
await sleep(110)
const start = await state()
await sleep(680)
const middle = await state()
await sleep(1040)
const end = await state()
console.log(JSON.stringify({ start, middle, end }, null, 2))
assert.equal(start.nodes, 5)
assert.equal(start.links, 4)
assert.equal(start.panelOpacity, '0')
assert.ok(Number(end.panelOpacity) > 0.95)
assert.ok(end.centerScale / baseline.centerScale > 1.17)
assert.ok(end.lineOpacities.every((value) => Number(value) > 0.95))
assert.ok(end.nodeOpacities.every((value) => Number(value) > 0.95))
ws.close()
