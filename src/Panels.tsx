import { useEffect, useState } from 'react'
import { Move3d, Rotate3d, Scale3d, Trash2, Copy, Camera, Download, X } from 'lucide-react'
import { useStore } from './store'
import { COOLING } from './data'

const B = ({ on, onClick, children, title }: any) => (
  <button title={title} onClick={onClick} className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition ${on ? 'border-amber-400 bg-amber-400/15 text-amber-200' : 'border-[#2a313b] bg-[#161b22] text-slate-300 hover:border-slate-500'}`}>{children}</button>
)
const card = 'pointer-events-auto absolute right-3 top-3 z-10 w-64 max-h-[calc(100%-7rem)] overflow-y-auto rounded-lg border border-[#232a33] bg-[#0d1117]/85 p-3 backdrop-blur-md'

export function ModeSwitch() {
  const s = useStore()
  const mode = s.editMode ? 'edit' : s.isTeardownMode ? 'teardown' : 'showcase'
  const go = (m: string) => useStore.setState({ editMode: m === 'edit', isTeardownMode: m === 'teardown', focusLayer: null, selectedId: m === 'edit' ? 'body' : null, ...(m === 'edit' ? { showBack: false } : {}) })
  return <>{[['showcase', 'Showcase'], ['teardown', 'Teardown'], ['edit', '3D Edit']].map(([k, l]) => <B key={k} on={mode === k} onClick={() => go(k)}>{l}</B>)}</>
}

const QUALITY = [{ n: 'Draft', samples: 48, scale: 1 }, { n: 'High', samples: 200, scale: 1.5 }, { n: 'Ultra', samples: 800, scale: 2 }]
export function RenderControls() {
  const [open, setOpen] = useState(false), [q, setQ] = useState(1)
  return (
    <div className="relative">
      <B on={open} onClick={() => setOpen(!open)}><Camera size={15} />Render</B>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-60 space-y-2 rounded-lg border border-[#232a33] bg-[#0d1117]/95 p-3">
          <p className="text-xs text-slate-400">Path-traced render of the current view on a cinematic studio set, saved as PNG.</p>
          <div className="flex gap-1.5">{QUALITY.map((x, i) => <B key={x.n} on={q === i} onClick={() => setQ(i)}>{x.n}</B>)}</div>
          <p className="text-[11px] text-slate-500">{QUALITY[q].samples} samples · {QUALITY[q].scale}× resolution</p>
          <button className="w-full rounded-md bg-amber-400 py-1.5 text-sm font-semibold text-black" onClick={() => { setOpen(false); useStore.setState({ renderJob: { samples: QUALITY[q].samples, scale: QUALITY[q].scale }, renderProgress: 0, renderImage: null }) }}>Start render</button>
        </div>)}
    </div>
  )
}

const KINDS = ['box', 'sphere', 'cylinder', 'capsule', 'torus', 'cone', 'plate']
function EditPanel() {
  const s = useStore()
  const part = s.parts.find((p) => p.id === s.selectedId)
  const sl = (label: string, k: 'metalness' | 'roughness' | 'emissive', max = 1) => (
    <label className="block text-xs text-slate-400">{label}: {part![k].toFixed(2)}<input type="range" min={0} max={max} step={0.01} value={part![k]} onChange={(e) => s.updatePart(part!.id, { [k]: +e.target.value })} className="w-full accent-amber-400" /></label>
  )
  return (
    <aside className={card}>
      <div className="mb-2 flex gap-1.5">
        {([['translate', Move3d, 'W'], ['rotate', Rotate3d, 'E'], ['scale', Scale3d, 'R']] as const).map(([m, I, k]) => <B key={m} title={`${m} (${k})`} on={s.gizmo === m} onClick={() => s.set({ gizmo: m })}><I size={16} /></B>)}
        <B on={s.snap} onClick={() => s.set({ snap: !s.snap })}>Snap</B>
      </div>
      <p className="mb-1 text-xs text-slate-400">Add part</p>
      <div className="mb-3 flex flex-wrap gap-1.5">{KINDS.map((k) => <B key={k} onClick={() => s.addPart(k)}>+ {k}</B>)}</div>
      <p className="mb-1 text-xs text-slate-400">Scene</p>
      <div className="mb-3 space-y-1">
        <button onClick={() => s.set({ selectedId: 'body' })} className={`w-full rounded border px-2 py-1 text-left text-sm ${s.selectedId === 'body' ? 'border-amber-400 bg-amber-400/10' : 'border-[#2a313b]'}`}>Phone body</button>
        {s.parts.map((p) => <button key={p.id} onClick={() => s.set({ selectedId: p.id })} className={`flex w-full items-center gap-2 rounded border px-2 py-1 text-left text-sm ${s.selectedId === p.id ? 'border-amber-400 bg-amber-400/10' : 'border-[#2a313b]'}`}><span className="h-3 w-3 rounded-full" style={{ background: p.color }} />{p.name}</button>)}
      </div>
      {s.selectedId === 'body' && <B onClick={() => s.set({ body: { pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] } })}>Reset body transform</B>}
      {part && (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><input type="color" value={part.color} onChange={(e) => s.updatePart(part.id, { color: e.target.value })} className="h-8 w-10 bg-transparent" />
            <B onClick={() => s.duplicatePart(part.id)}><Copy size={14} /></B><B onClick={() => s.removePart(part.id)}><Trash2 size={14} /></B></div>
          {sl('Metalness', 'metalness')}{sl('Roughness', 'roughness')}{sl('Glow', 'emissive', 4)}
        </div>)}
      <p className="mt-3 text-[11px] text-slate-500">Click objects to select. W/E/R switch tools, Delete removes, Esc deselects.</p>
    </aside>
  )
}

function TearPanel() {
  const s = useStore()
  const L = [[5, 'Cover glass', s.frontGlass, 0.6], [4, 'Display', `${s.displayType} · ${s.refreshRate} Hz`, 0.9], [3, 'Cooling', s.cooling, COOLING[s.cooling].t],
    [2, 'Mainboard', `${s.soc.name} · ${s.ram.gb}GB`, 1], [1, 'Battery', s.battery.name, s.battery.thickness], [0, 'Back panel + cameras', s.backPanel, 1]] as const
  return (
    <aside className={card}>
      <p className="mb-2 text-xs text-slate-400">Hover or tap a layer to isolate it · {s.thicknessMM} mm stack</p>
      <div className="space-y-1">{L.map(([i, n, d, t]) => (
        <button key={i} onMouseEnter={() => s.set({ focusLayer: i })} onClick={() => s.set({ focusLayer: s.focusLayer === i ? null : i })} className={`w-full rounded border px-2 py-1.5 text-left text-xs ${s.focusLayer === i ? 'border-amber-400 bg-amber-400/10' : 'border-[#2a313b]'}`}>
          <span className="flex justify-between text-sm text-slate-100">{n}<span className="text-slate-500">{t} mm</span></span><span className="text-slate-400">{d}</span></button>))}</div>
      <div className="mt-2"><B onClick={() => s.set({ focusLayer: null })}>Show all</B></div>
    </aside>
  )
}

export function SidePanels() {
  const s = useStore()
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const st = useStore.getState(); if (!st.editMode || (e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'w') st.set({ gizmo: 'translate' }); else if (e.key === 'e') st.set({ gizmo: 'rotate' }); else if (e.key === 'r') st.set({ gizmo: 'scale' })
      else if (e.key === 'Escape') st.set({ selectedId: null })
      else if ((e.key === 'Delete' || e.key === 'Backspace') && st.selectedId && st.selectedId !== 'body') st.removePart(st.selectedId)
    }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  return (
    <>
      {s.editMode && !s.renderJob && <EditPanel />}
      {s.isTeardownMode && !s.renderJob && <TearPanel />}
      {s.renderJob && (
        <div className="pointer-events-auto absolute left-1/2 top-4 z-30 w-[min(360px,92vw)] -translate-x-1/2 rounded-lg border border-[#232a33] bg-[#0d1117]/95 p-4">
          <div className="mb-2 flex justify-between text-sm"><span>Path tracing… {Math.round(s.renderProgress * 100)}%</span><button onClick={() => useStore.setState({ renderJob: null })} className="text-slate-400 hover:text-white">Cancel</button></div>
          <div className="h-1.5 rounded bg-[#232a33]"><div className="h-full rounded bg-amber-400" style={{ width: `${s.renderProgress * 100}%` }} /></div>
        </div>)}
      {s.renderImage && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/80 p-4">
          <img src={s.renderImage} alt="Render" className="max-h-[75%] max-w-full rounded-lg border border-[#2a313b]" />
          <div className="flex gap-2"><a href={s.renderImage} download="phonecraft-3d-render.png" className="flex items-center gap-1.5 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black"><Download size={15} />Save PNG</a><B onClick={() => useStore.setState({ renderImage: null })}><X size={15} />Close</B></div>
        </div>)}
    </>
  )
}
