import { useMemo, useState } from 'react'
import { Smartphone, RotateCw, Layers, Zap, SlidersHorizontal, X, FlipHorizontal2 } from 'lucide-react'
import SandboxCanvas from './Phone3D'
import { useStore } from './store'
import * as D from './data'

const box = 'rounded-md border border-[#2a313b] bg-[#161b22]'
function Group({ title, children }: any) {
  return <section className="border-b border-[#232a33] px-4 py-3"><h3 className="mb-2 text-[13px] font-semibold text-amber-300">{title}</h3><div className="space-y-2">{children}</div></section>
}
function Field({ label, children }: any) {
  return <label className="block text-xs text-slate-400"><span className="mb-1 block">{label}</span>{children}</label>
}
function Sel({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return <Field label={label}><select className={`${box} w-full px-2 py-1.5 text-sm text-slate-100`} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></Field>
}
function Range({ label, value, min, max, step, unit, onChange }: any) {
  return <Field label={`${label}: ${value}${unit || ''}`}><input type="range" className="w-full accent-amber-400" {...{ min, max, step, value }} onChange={(e) => onChange(+e.target.value)} /></Field>
}
function Btn({ on, onClick, children }: any) {
  return <button onClick={onClick} className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition ${on ? 'border-amber-400 bg-amber-400/15 text-amber-200' : 'border-[#2a313b] bg-[#161b22] text-slate-300 hover:border-slate-500'}`}>{children}</button>
}

function Panel() {
  const s = useStore()
  const [q, setQ] = useState(''), [vendor, setVendor] = useState('All')
  const socs = useMemo(() => D.SOCS.filter((x) => (vendor === 'All' || x.vendor === vendor) && x.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.antutu - a.antutu), [q, vendor])
  return (
    <div>
      <Group title="Body">
        <Range label="Width" value={s.baseWidth} min={65} max={85} step={1} unit=" mm" onChange={(v: number) => s.set({ baseWidth: v })} />
        <Range label="Height" value={s.baseHeight} min={135} max={175} step={1} unit=" mm" onChange={(v: number) => s.set({ baseHeight: v })} />
        <Range label="Corner rounding" value={s.cornerRounding} min={0.1} max={2} step={0.1} onChange={(v: number) => s.set({ cornerRounding: v })} />
      </Group>
      <Group title="Materials">
        <Sel label="Front glass" value={s.frontGlass} options={Object.keys(D.GLASS)} onChange={(v) => s.set({ frontGlass: v as any })} />
        <p className="text-[11px] text-slate-500">{D.GLASS[s.frontGlass].note}</p>
        <Sel label="Chassis" value={s.chassis} options={Object.keys(D.CHASSIS)} onChange={(v) => s.set({ chassis: v as any })} />
        <Sel label="Back panel" value={s.backPanel} options={Object.keys(D.BACK)} onChange={(v) => s.set({ backPanel: v as any })} />
        <Field label="Color"><div className="flex items-center gap-2"><input type="color" value={s.colorHex} onChange={(e) => s.set({ colorHex: e.target.value })} className="h-8 w-10 rounded border-0 bg-transparent" />
          {['#3b6ea8', '#c9c4b8', '#1d1f24', '#b4472f', '#4f7a5a', '#8b6bb5'].map((c) => <button key={c} onClick={() => s.set({ colorHex: c })} className="h-6 w-6 rounded-full border border-white/20" style={{ background: c }} aria-label={c} />)}</div></Field>
      </Group>
      <Group title={`Silicon (${D.SOCS.length} SoCs)`}>
        <div className="flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chips" className={`${box} min-w-0 flex-1 px-2 py-1.5 text-sm`} />
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className={`${box} px-2 text-sm`}>{D.VENDORS.map((v) => <option key={v}>{v}</option>)}</select></div>
        <select size={6} className={`${box} w-full px-1 py-1 text-sm`} value={s.soc.id} onChange={(e) => s.set({ soc: D.SOCS.find((x) => x.id === e.target.value)! })}>
          {socs.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.year} · {(x.antutu / 1000).toFixed(2)}M</option>)}
        </select>
        <Sel label="RAM" value={`${s.ram.gb}GB ${s.ram.type}`} options={D.RAMS.map((r) => `${r.gb}GB ${r.type}`)} onChange={(v) => s.set({ ram: D.RAMS.find((r) => `${r.gb}GB ${r.type}` === v)! })} />
        <Sel label="Storage" value={`${s.storage.gb}GB ${s.storage.type}`} options={D.STORAGES.map((r) => `${r.gb}GB ${r.type}`)} onChange={(v) => s.set({ storage: D.STORAGES.find((r) => `${r.gb}GB ${r.type}` === v)! })} />
        <Sel label="Battery" value={s.battery.name} options={D.BATTERIES.map((b) => b.name)} onChange={(v) => s.set({ battery: D.BATTERIES.find((b) => b.name === v)! })} />
        <Sel label="Cooling" value={s.cooling} options={Object.keys(D.COOLING)} onChange={(v) => s.set({ cooling: v as any })} />
        <Sel label="Haptics" value={s.haptics} options={Object.keys(D.HAPTICS)} onChange={(v) => s.set({ haptics: v as any })} />
      </Group>
      <Group title="Display">
        <Sel label="Panel" value={s.displayType} options={Object.keys(D.DISPLAYS)} onChange={(v) => s.set({ displayType: v as any })} />
        <p className="text-[11px] text-slate-500">{D.DISPLAYS[s.displayType].note} · {D.DISPLAYS[s.displayType].nits} nits · {D.DISPLAYS[s.displayType].power} power</p>
        <Sel label="Curve" value={s.displayCurve} options={D.CURVES} onChange={(v) => s.set({ displayCurve: v as any })} />
        <Field label="Refresh rate"><div className="flex flex-wrap gap-1.5">{D.REFRESH.map((r) => <Btn key={r} on={s.refreshRate === r} onClick={() => s.set({ refreshRate: r })}>{r}</Btn>)}</div></Field>
        <Sel label="Front camera" value={s.frontCamera} options={['Punch-Hole', 'Under-Display (UDC)', 'Dynamic Island']} onChange={(v) => s.set({ frontCamera: v as any })} />
      </Group>
      <Group title="Rear cameras (up to 4)">
        <Sel label="Island layout" value={s.cameraLayout} options={['Matrix Squircle', 'Circular Oreology', 'Vertical Pill', 'Horizontal Visor']} onChange={(v) => s.set({ cameraLayout: v as any })} />
        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {D.CAMERAS.map((c) => { const on = s.rearCameras.some((x) => x.id === c.id); return (
            <button key={c.id} onClick={() => s.toggleCamera(c)} className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs ${on ? 'border-amber-400 bg-amber-400/10' : 'border-[#2a313b] hover:border-slate-500'}`}>
              <span>{c.name}<br /><span className="text-slate-500">{c.lensType} · {c.mp}MP · f/{c.aperture}{c.ois ? ' · OIS' : ''}</span></span><span className="text-slate-400">{c.physicalDepthMM}mm</span></button>) })}
        </div>
      </Group>
    </div>
  )
}

const riskColor = { Low: 'text-emerald-400', Medium: 'text-yellow-300', High: 'text-orange-400', Critical: 'text-red-400' }
function Stat({ k, v, c }: any) { return <div className="flex items-baseline justify-between gap-6 py-1"><dt className="text-xs text-slate-400">{k}</dt><dd className={`text-sm font-semibold tabular-nums ${c || ''}`}>{v}</dd></div> }

export default function App() {
  const s = useStore()
  const [open, setOpen] = useState(true)
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0"><SandboxCanvas /></div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-3">
        <button onClick={() => setOpen(!open)} className="pointer-events-auto rounded-md border border-[#2a313b] bg-[#0d1117]/80 p-2 backdrop-blur" aria-label="Toggle panel">{open ? <X size={18} /> : <SlidersHorizontal size={18} />}</button>
        <div className="flex items-center gap-2"><Smartphone size={20} className="text-amber-400" /><h1 className="text-base font-bold tracking-tight">PhoneCraft 3D <span className="font-normal text-slate-400">Master Sandbox</span></h1></div>
      </header>

      <aside className={`absolute bottom-0 left-0 top-14 z-10 w-[min(340px,92vw)] overflow-y-auto border-r border-[#232a33] bg-[#0d1117]/85 backdrop-blur-md transition-transform ${open ? '' : '-translate-x-full'}`}><Panel /></aside>

      <aside className="pointer-events-none absolute right-3 top-3 z-10 hidden w-60 rounded-lg border border-[#232a33] bg-[#0d1117]/80 p-4 backdrop-blur-md md:block">
        <dl className="divide-y divide-[#232a33]">
          <Stat k="Price" v={`$${s.totalPrice.toLocaleString()}`} />
          <Stat k="Weight" v={`${s.estimatedWeightGrams} g`} />
          <Stat k="AnTuTu" v={s.antutuScore.toLocaleString()} />
          <Stat k="Thermal throttling" v={s.thermalThrottlingRisk} c={riskColor[s.thermalThrottlingRisk]} />
          <Stat k="Thickness" v={`${s.thicknessMM} mm`} />
          <Stat k="Camera bump" v={`+${s.cameraBumpMM} mm`} />
          <Stat k="Peak brightness" v={`${D.DISPLAYS[s.displayType].nits} nits`} />
          <Stat k="Process" v={`${s.soc.nm} nm`} />
        </dl>
      </aside>

      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-3">
        {s.isTeardownMode && (
          <div className="pointer-events-auto flex w-[min(420px,92vw)] items-center gap-3 rounded-lg border border-[#232a33] bg-[#0d1117]/85 px-4 py-2 backdrop-blur-md">
            <span className="text-xs text-slate-400">Exploded</span>
            <input type="range" min={0} max={1} step={0.01} value={s.explodedSlider} onChange={(e) => s.set({ explodedSlider: +e.target.value })} className="flex-1 accent-amber-400" />
            <span className="w-9 text-right text-xs tabular-nums">{Math.round(s.explodedSlider * 100)}%</span>
          </div>)}
        <div className="pointer-events-auto flex flex-wrap justify-center gap-2 rounded-lg border border-[#232a33] bg-[#0d1117]/85 p-2 backdrop-blur-md">
          <Btn on={s.isTeardownMode} onClick={() => s.set({ isTeardownMode: !s.isTeardownMode })}><Layers size={15} />Teardown</Btn>
          <Btn on={s.showBack} onClick={() => s.set({ showBack: !s.showBack })}><FlipHorizontal2 size={15} />{s.showBack ? 'Back' : 'Front'}</Btn>
          <Btn on={s.flashOn} onClick={() => s.set({ flashOn: !s.flashOn })}><Zap size={15} />Flash</Btn>
          <Btn on={s.autoRotate} onClick={() => s.set({ autoRotate: !s.autoRotate })}><RotateCw size={15} />Orbit</Btn>
        </div>
      </footer>
    </div>
  )
}
