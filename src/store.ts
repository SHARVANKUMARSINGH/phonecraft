import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import * as D from './data'

export interface Xf { pos: number[]; rot: number[]; scale: number[] }
export interface Part extends Xf { id: string; kind: string; name: string; color: string; metalness: number; roughness: number; emissive: number }
export interface PhoneState {
  baseWidth: number; baseHeight: number; cornerRounding: number
  frontGlass: D.GlassTech; chassis: D.ChassisMaterial; backPanel: D.BackPanelMaterial; colorHex: string
  soc: D.SoC; ram: D.RAM; storage: D.Storage; battery: D.Battery; cooling: D.CoolingTech; haptics: D.Haptics
  displayType: D.DisplayType; displayCurve: D.DisplayCurve; refreshRate: number
  rearCameras: D.CameraSensor[]; frontCamera: D.FrontCamera; cameraLayout: D.CameraLayout
  isTeardownMode: boolean; explodedSlider: number
  totalPrice: number; estimatedWeightGrams: number; antutuScore: number
  thermalThrottlingRisk: 'Low' | 'Medium' | 'High' | 'Critical'
  // derived + view state
  thicknessMM: number; cameraBumpMM: number; thermalRatio: number
  flashOn: boolean; showBack: boolean; autoRotate: boolean
  editMode: boolean; gizmo: 'translate' | 'rotate' | 'scale'; snap: boolean; selectedId: string | null
  parts: Part[]; body: Xf; focusLayer: number | null
  renderJob: { samples: number; scale: number } | null; renderProgress: number; renderImage: string | null
  addPart: (kind: string) => void; updatePart: (id: string, p: Partial<Part>) => void; removePart: (id: string) => void; duplicatePart: (id: string) => void
  set: (p: Partial<PhoneState>) => void
  toggleCamera: (c: D.CameraSensor) => void
}

function derive(s: any) {
  const cool = D.COOLING[s.cooling as D.CoolingTech]
  const glass = D.GLASS[s.frontGlass as D.GlassTech], ch = D.CHASSIS[s.chassis as D.ChassisMaterial], bk = D.BACK[s.backPanel as D.BackPanelMaterial], disp = D.DISPLAYS[s.displayType as D.DisplayType]
  const hap = D.HAPTICS[s.haptics as D.Haptics]
  const T = 1.5 + cool.t + 1 + s.battery.thickness + 1
  const bump = Math.max(...s.rearCameras.map((c: D.CameraSensor) => c.physicalDepthMM))
  const w = s.baseWidth, h = s.baseHeight
  const cm3 = (mm3: number) => mm3 / 1000
  const frame = cm3(2 * (w + h) * 1.4 * T) * ch.density
  const front = cm3(w * h * 0.6) * glass.density
  const back = cm3(w * h * 1) * bk.density
  const screen = cm3(w * h * 0.9) * 1.6
  const grams = frame + front + back + screen + s.battery.weight + cool.g + hap.g + 18 + s.rearCameras.length * 2.5 + bump * 1.2
  const price = 60 + glass.price + ch.price * (w * h) / 11000 + bk.price + disp.price * (w * h) / 11000 + s.soc.price + s.ram.price + s.storage.price + s.battery.price + cool.price + hap.price
    + s.rearCameras.reduce((a: number, c: D.CameraSensor) => a + c.price, 0) + (s.frontCamera === 'Under-Display (UDC)' ? 35 : s.frontCamera === 'Dynamic Island' ? 18 : 8) + (s.refreshRate - 60) * 0.25
  const ratio = (s.soc.watts + disp.watts * (s.refreshRate / 120) * 0.4) / (cool.cap * ((w * h) / 12000))
  const risk = ratio < 0.7 ? 'Low' : ratio < 1 ? 'Medium' : ratio < 1.3 ? 'High' : 'Critical'
  const mult = { Low: 1, Medium: 0.95, High: 0.85, Critical: 0.7 }[risk]
  const ramBonus = 1 + Math.min(s.ram.gb, 16) * 0.002
  return { thicknessMM: +T.toFixed(2), cameraBumpMM: bump, thermalRatio: ratio, thermalThrottlingRisk: risk as PhoneState['thermalThrottlingRisk'], estimatedWeightGrams: Math.round(grams), totalPrice: Math.round(price), antutuScore: Math.round(s.soc.antutu * 1000 * mult * ramBonus) }
}

const find = (arr: any[], k: string, v: string) => arr.find((x) => x[k] === v)
export const useStore = create<PhoneState>((set) => {
  const base: any = {
    baseWidth: 74, baseHeight: 160, cornerRounding: 1,
    frontGlass: 'Gorilla Armor 2', chassis: 'Grade 5 Titanium', backPanel: 'AG Matte Glass', colorHex: '#3b6ea8',
    soc: D.SOCS.find((x) => x.name === 'Snapdragon 8 Elite'), ram: D.RAMS[4], storage: D.STORAGES[2], battery: find(D.BATTERIES, 'name', '5500mAh Dual-Cell Graphene'),
    cooling: 'Dual VC + Graphene', haptics: 'X-Axis Ultra-Wideband Motor',
    displayType: 'LTPO 4.0 OLED', displayCurve: '2.5D Curved', refreshRate: 120,
    rearCameras: [find(D.CAMERAS, 'id', 'lyt900'), find(D.CAMERAS, 'id', 'imx858uw'), find(D.CAMERAS, 'id', 'ov64b')],
    frontCamera: 'Punch-Hole', cameraLayout: 'Matrix Squircle',
    isTeardownMode: false, explodedSlider: 0.6, flashOn: false, showBack: false, autoRotate: false,
    editMode: false, gizmo: 'translate', snap: false, selectedId: null, parts: [], body: { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] }, focusLayer: null,
    renderJob: null, renderProgress: 0, renderImage: null,
  }
  return {
    ...base, ...derive(base),
    addPart: (kind) => set((s) => { const id = Math.random().toString(36).slice(2, 9); const n = s.parts.filter((p) => p.kind === kind).length + 1
      return { parts: [...s.parts, { id, kind, name: `${kind} ${n}`, pos: [0.6, 0, 0.1], rot: [0, 0, 0], scale: [1, 1, 1], color: '#f0a63a', metalness: 0.4, roughness: 0.35, emissive: 0 }], selectedId: id } }),
    updatePart: (id, p) => set((s) => ({ parts: s.parts.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
    removePart: (id) => set((s) => ({ parts: s.parts.filter((x) => x.id !== id), selectedId: s.selectedId === id ? 'body' : s.selectedId })),
    duplicatePart: (id) => set((s) => { const o = s.parts.find((x) => x.id === id); if (!o) return {}; const n = Math.random().toString(36).slice(2, 9)
      return { parts: [...s.parts, { ...o, id: n, name: o.name + ' copy', pos: [o.pos[0] + 0.15, o.pos[1], o.pos[2]] }], selectedId: n } }),
    set: (p) => set((s) => ({ ...s, ...p, ...derive({ ...s, ...p }) } as any)),
    toggleCamera: (c) => set((s) => {
      const has = s.rearCameras.some((x) => x.id === c.id)
      let next = has ? s.rearCameras.filter((x) => x.id !== c.id) : [...s.rearCameras, c].slice(-4)
      if (!next.length) next = s.rearCameras
      return { ...s, rearCameras: next, ...derive({ ...s, rearCameras: next }) } as any
    }),
  }
})

export const usePick = <K extends keyof PhoneState>(keys: K[]) =>
  useStore((s) => { const o: any = {}; for (const k of keys) o[k] = s[k]; return o as Pick<PhoneState, K> }, shallow)
