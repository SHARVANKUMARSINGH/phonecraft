import * as THREE from 'three'

const cache: Record<string, any> = {}
const rand = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

function heightCanvas(n: number, fn: (x: number, y: number) => number) {
  const c = document.createElement('canvas'); c.width = c.height = n
  const g = c.getContext('2d')!, d = g.createImageData(n, n)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = Math.max(0, Math.min(255, fn(x, y) * 255)), i = (y * n + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255 }
  g.putImageData(d, 0, 0); return c
}
function normalCanvas(h: HTMLCanvasElement, k: number) {
  const n = h.width, src = h.getContext('2d')!.getImageData(0, 0, n, n).data
  const H = (x: number, y: number) => src[(((y + n) % n) * n + ((x + n) % n)) * 4] / 255
  const c = document.createElement('canvas'); c.width = c.height = n
  const g = c.getContext('2d')!, o = g.createImageData(n, n)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * k, dy = (H(x, y + 1) - H(x, y - 1)) * k, l = Math.hypot(dx, dy, 1), i = (y * n + x) * 4
    o.data[i] = (-dx / l * 0.5 + 0.5) * 255; o.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; o.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; o.data[i + 3] = 255
  }
  g.putImageData(o, 0, 0); return c
}
function tex(c: HTMLCanvasElement, mmPerTile: number, srgb = false) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / mmPerTile, 1 / mmPerTile); t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}
// returns { roughnessMap, normalMap } built from one height function (cached)
function pbr(key: string, n: number, mm: number, fn: (x: number, y: number) => number, rough: [number, number], k: number) {
  return (cache[key] ??= (() => { const h = heightCanvas(n, fn), r = heightCanvas(n, (x, y) => rough[0] + (rough[1] - rough[0]) * (h.getContext('2d')!.getImageData(x, y, 1, 1).data[0] / 255)); return { height: h, roughnessMap: tex(r, mm), normalMap: tex(normalCanvas(h, k), mm) } })())
}

const brushed = () => pbr('brushed', 256, 20, (x, y) => 0.5 * rand(0, y) + 0.3 * rand(Math.floor(x / 48), y) + 0.2 * rand(x, y), [0.5, 0.95], 1.4)
const grain = () => pbr('grain', 256, 18, (x, y) => rand(x, y), [0.7, 1], 0.3)
const speckle = () => pbr('speckle', 256, 18, (x, y) => (rand(x, y) > 0.985 ? 1 : 0.45 + 0.1 * rand(x, y)), [0.6, 1], 0.5)
const leather = () => pbr('leather', 256, 26, (x, y) => {
  const N = 16, cs = 16, cx = Math.floor(x / cs), cy = Math.floor(y / cs); let m = 1e9
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const gx = cx + i, gy = cy + j, wx = ((gx % N) + N) % N, wy = ((gy % N) + N) % N; m = Math.min(m, Math.hypot(x - (gx + rand(wx, wy)) * cs, y - (gy + rand(wy, wx)) * cs)) }
  return 1 - ss(0, cs * 0.75, m)
}, [0.55, 1], 2.2)
const carbon = () => (cache.carbon ??= (() => {
  const f = (x: number, y: number) => (((x >> 3) + (y >> 3)) & 1 ? Math.sin(Math.PI * ((x % 8) / 8)) : Math.sin(Math.PI * ((y % 8) / 8)))
  const h = heightCanvas(256, (x, y) => 0.5 + 0.5 * f(x, y)), c = heightCanvas(256, (x, y) => 0.04 + 0.2 * (0.5 + 0.5 * f(x, y)))
  return { map: tex(c, 24, true), normalMap: tex(normalCanvas(h, 1.6), 24) }
})())

export const T = {
  metal: () => { const b = brushed(); return { roughnessMap: b.roughnessMap, normalMap: b.normalMap, normalScale: new THREE.Vector2(0.35, 0.35) } },
  back(name: string): any {
    if (name === 'AG Matte Glass') { const g = grain(); return { roughnessMap: g.roughnessMap, normalMap: g.normalMap, normalScale: new THREE.Vector2(0.15, 0.15) } }
    if (name === 'Vegan Leather') { const l = leather(); return { roughnessMap: l.roughnessMap, normalMap: l.normalMap, normalScale: new THREE.Vector2(1.1, 1.1) } }
    if (name === 'Forged Carbon') { const c = carbon(); return { map: c.map, normalMap: c.normalMap, normalScale: new THREE.Vector2(0.8, 0.8) } }
    if (name === 'Ceramic') { const s = speckle(); return { roughnessMap: s.roughnessMap, normalMap: s.normalMap, normalScale: new THREE.Vector2(0.2, 0.2) } }
    return {}
  },
  pcb: () => (cache.pcb ??= (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512
    const g = c.getContext('2d')!; g.fillStyle = '#0f5a3a'; g.fillRect(0, 0, 512, 512)
    g.strokeStyle = 'rgba(201,162,74,.65)'; g.lineWidth = 2
    for (let i = 0; i < 90; i++) { let x = rand(i, 1) * 512, y = rand(i, 2) * 512; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (rand(i, k) > 0.5) x += (rand(k, i) - 0.5) * 160; else y += (rand(i, k + 9) - 0.5) * 160; g.lineTo(x, y) } g.stroke() }
    g.fillStyle = '#d8b45c'; for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(rand(i, 5) * 512, rand(i, 6) * 512, 3, 0, 7); g.fill() }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  })()),
  batt: (label: string) => (cache['b' + label] ??= (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const g = c.getContext('2d')!; g.fillStyle = '#2b3440'; g.fillRect(0, 0, 256, 256)
    g.fillStyle = '#e8ecf1'; g.font = '700 22px system-ui'; g.textAlign = 'center'; g.fillText(label, 128, 120); g.font = '500 14px system-ui'; g.fillStyle = '#9aa7b6'; g.fillText('3.87V · Li-Po · Do not puncture', 128, 148)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
  })()),
}

// Float equirect studio: dark cyclorama + softboxes. HDR values let the path tracer light the phone.
export function studioHDR() {
  const w = 1024, h = 512, d = new Float32Array(w * h * 4)
  const box = (u: number, el: number, u0: number, u1: number, e0: number, e1: number) => ss(u0 - 0.015, u0 + 0.015, u) * ss(u1 + 0.015, u1 - 0.015, u) * ss(e0 - 0.05, e0 + 0.05, el) * ss(e1 + 0.05, e1 - 0.05, el)
  const L: [number, number, number, number, number, number[]][] = [
    [0.68, 0.8, 0.15, 0.75, 16, [1, 0.96, 0.9]], [0.07, 0.11, -0.1, 0.9, 9, [0.6, 0.8, 1]], [0.39, 0.43, -0.1, 0.9, 9, [0.6, 0.8, 1]],
    [0.6, 0.9, 1.0, 1.35, 7, [1, 1, 1]], [0.9, 0.96, -0.05, 0.5, 6, [1, 0.65, 0.3]], [0.2, 0.3, -0.02, 0.12, 2, [0.2, 0.7, 0.8]],
  ]
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const el = (0.5 - (j + 0.5) / h) * Math.PI, u = (i + 0.5) / w
    const b = el > 0 ? 0.015 + 0.05 * (1 - ss(0, 1.3, el)) : 0.008
    let r = b * 0.9, g = b * 1.05, bl = b * 1.35
    for (const [u0, u1, e0, e1, k, c] of L) { const m = box(u, el, u0, u1, e0, e1) * k; r += m * c[0]; g += m * c[1]; bl += m * c[2] }
    const o = (j * w + i) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = bl; d[o + 3] = 1
  }
  const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat, THREE.FloatType)
  t.mapping = THREE.EquirectangularReflectionMapping; t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true
  return t
}
