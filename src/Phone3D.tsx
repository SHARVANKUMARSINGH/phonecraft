import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, ContactShadows, Html } from '@react-three/drei'
import { Geometry, Base, Subtraction } from '@react-three/csg'
import { useStore } from './store'
import { GLASS, CHASSIS, BACK, COOLING, CameraSensor, CameraLayout } from './data'

const S = 0.01 // 1 scene unit = 100 mm; everything below is authored in millimetres
const clamp = THREE.MathUtils.clamp

function rr(w: number, h: number, r: number, ox = 0, oy = 0) {
  const s = new THREE.Shape(), x = -w / 2 + ox, y = -h / 2 + oy
  r = Math.max(0.2, Math.min(r, w / 2, h / 2))
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false)
  return s
}

let carbon: THREE.CanvasTexture | null = null, noise: THREE.CanvasTexture | null = null
function carbonTex() {
  if (carbon) return carbon
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const a = (x + y) % 2, gr = g.createLinearGradient(x * 16, y * 16, x * 16 + 16, y * 16 + 16)
    gr.addColorStop(0, a ? '#34343a' : '#0a0a0c'); gr.addColorStop(1, a ? '#0a0a0c' : '#34343a')
    g.fillStyle = gr; g.fillRect(x * 16, y * 16, 16, 16)
  }
  carbon = new THREE.CanvasTexture(c); carbon.wrapS = carbon.wrapT = THREE.RepeatWrapping; carbon.repeat.set(1 / 8, 1 / 8); carbon.colorSpace = THREE.SRGBColorSpace
  return carbon
}
function noiseTex() {
  if (noise) return noise
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  for (let i = 0; i < 128 * 128; i++) { const v = (Math.random() * 255) | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i % 128, (i / 128) | 0, 1, 1) }
  noise = new THREE.CanvasTexture(c); noise.wrapS = noise.wrapT = THREE.RepeatWrapping; noise.repeat.set(1 / 3, 1 / 3)
  return noise
}

function useScreenTex(w: number, h: number, color: string, hz: number, label: string) {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 1024
    const g = c.getContext('2d') as any
    const gr = g.createLinearGradient(0, 0, 512, 1024)
    gr.addColorStop(0, color); gr.addColorStop(0.55, '#0b1020'); gr.addColorStop(1, '#02030a')
    g.fillStyle = gr; g.fillRect(0, 0, 512, 1024)
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 150px system-ui, sans-serif'; g.fillText('9:41', 256, 300)
    g.font = '500 34px system-ui, sans-serif'; g.globalAlpha = 0.8; g.fillText('Wednesday, October 7', 256, 360); g.globalAlpha = 1
    for (let i = 0; i < 12; i++) { g.fillStyle = `hsla(${(i * 37 + 190) % 360},60%,62%,.9)`; g.beginPath(); g.roundRect(60 + (i % 4) * 112, 620 + Math.floor(i / 4) * 110, 84, 84, 22); g.fill() }
    g.fillStyle = '#fff'; g.font = '600 28px system-ui, sans-serif'; g.fillText(`${label} · ${hz} Hz`, 256, 985)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    t.repeat.set(1 / w, 1 / h); t.offset.set(0.5, 0.5) // extrude UVs are raw mm coordinates
    return t
  }, [w, h, color, hz, label])
}

function glassGeo(w: number, h: number, r: number, curve: string) {
  const g = new THREE.PlaneGeometry(w, h, 64, 128), p = g.attributes.position as THREE.BufferAttribute
  const hw = w / 2, hh = h / 2, cx = hw - r, cy = hh - r
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i)
    const ax = Math.abs(x), ay = Math.abs(y)
    if (ax > cx && ay > cy) { const dx = ax - cx, dy = ay - cy, d = Math.hypot(dx, dy); if (d > r) { x = Math.sign(x) * (cx + (dx * r) / d); y = Math.sign(y) * (cy + (dy * r) / d) } }
    const X = Math.abs(x), Y = Math.abs(y); let z = 0
    if (curve === '2.5D Curved') { const t = clamp((X - (hw - 4)) / 4, 0, 1); z = -0.6 * t * t }
    else if (curve === 'Waterfall 88-degree') { const t = clamp((X - (hw - 10)) / 10, 0, 1); z = (-6 * (1 - Math.cos((t * 88 * Math.PI) / 180))) / 0.965 }
    else if (curve === 'Micro-Quad Curve') { const tx = clamp((X - (hw - 4)) / 4, 0, 1), ty = clamp((Y - (hh - 4)) / 4, 0, 1); z = -0.5 * Math.min(1, tx * tx + ty * ty) }
    p.setXYZ(i, x, y, z)
  }
  g.computeVertexNormals()
  return g
}

function layoutOf(kind: CameraLayout, n: number, w: number, h: number) {
  let iw = 34, ih = 34, rad = 9, pts: [number, number][] = [], flash: [number, number]
  if (kind === 'Matrix Squircle') {
    ih = n <= 2 ? 20 : 34; pts = [[-8.5, 8.5], [8.5, 8.5], [-8.5, -8.5], [8.5, -8.5]].slice(0, n) as any
    if (n <= 2) pts = pts.map(([x]) => [x, 0] as [number, number]); if (n === 1) pts = [[0, 0]]
    flash = [-(iw / 2 + 6), ih / 2 - 5]
  } else if (kind === 'Circular Oreology') {
    iw = ih = 46; rad = 23
    pts = n === 1 ? [[0, 0]] : Array.from({ length: n }, (_, i) => { const a = Math.PI * 0.75 + (i * Math.PI * 2) / n; return [Math.cos(a) * 11, Math.sin(a) * 11] as [number, number] })
    flash = [-(iw / 2 + 6), 0]
  } else if (kind === 'Vertical Pill') {
    iw = 22; ih = n * 17 + 7; rad = 11; pts = Array.from({ length: n }, (_, i) => [0, ih / 2 - 12 - i * 17] as [number, number]); flash = [-(iw / 2 + 6), ih / 2 - 6]
  } else {
    iw = w - 2; ih = 24; rad = 10; pts = Array.from({ length: n }, (_, i) => [-iw / 2 + 14 + i * 15, 0] as [number, number]); flash = [iw / 2 - 5, 0]
  }
  const cx = kind === 'Horizontal Visor' ? 0 : w / 2 - iw / 2 - 6, cy = kind === 'Horizontal Visor' ? h / 2 - 20 : h / 2 - ih / 2 - 7
  return { iw, ih, rad, pts, flash, cx, cy }
}

const metal = <meshStandardMaterial color="#15171c" metalness={0.9} roughness={0.25} />

function Lens({ cam, x, y }: { cam: CameraSensor; x: number; y: number }) {
  const R = { Main: 8, Ultrawide: 6, Telephoto: 6.5, Periscope: 6.5 }[cam.lensType]
  if (cam.lensType === 'Periscope') return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, -0.4]}><boxGeometry args={[R * 2, R * 2, 0.8]} />{metal}</mesh>
      <mesh position={[0, 0, -0.2]}><boxGeometry args={[R * 1.55, R * 1.55, 0.6]} /><meshPhysicalMaterial color="#05070c" roughness={0.05} clearcoat={1} /></mesh>
      <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 4, 0, 0]}><boxGeometry args={[R * 1.3, 0.2, R * 1.3]} /><meshStandardMaterial color="#9fb4d6" metalness={1} roughness={0.05} /></mesh>
    </group>
  )
  return (
    <group position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, -0.4, 0]}><cylinderGeometry args={[R, R, 0.8, 40]} />{metal}</mesh>
      <mesh position={[0, -0.85, 0]}><torusGeometry args={[R * 0.82, 0.35, 12, 48]} /><meshStandardMaterial color="#c8ccd2" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[R * 0.78, R * 0.78, 0.2, 40]} /><meshPhysicalMaterial color="#0a1226" roughness={0} metalness={0.2} clearcoat={1} iridescence={1} /></mesh>
      <mesh position={[0, -0.95, 0]}><cylinderGeometry args={[R * 0.32, R * 0.32, 0.1, 24]} /><meshStandardMaterial color="#000" roughness={0.1} /></mesh>
    </group>
  )
}

function Island() {
  const { baseWidth: w, baseHeight: h, cameraLayout, rearCameras, flashOn, cameraBumpMM: bump } = useStore()
  const L = useMemo(() => layoutOf(cameraLayout, rearCameras.length, w, h), [cameraLayout, rearCameras.length, w, h])
  const shape = useMemo(() => rr(L.iw, L.ih, L.rad), [L])
  const zTop = -0.5 - bump // back-panel outer face is at local z = -0.5; the island extrudes exactly `bump` mm outward
  return (
    <group position={[L.cx, L.cy, 0]}>
      <mesh position={[0, 0, zTop]} key={`${L.iw}-${L.ih}-${bump}`}>
        <extrudeGeometry args={[shape, { depth: bump, bevelEnabled: false, curveSegments: 32 }]} />
        <meshPhysicalMaterial color="#14161b" metalness={0.6} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <group position={[0, 0, zTop]}>
        {rearCameras.map((c, i) => <Lens key={c.id} cam={c} x={L.pts[i][0]} y={L.pts[i][1]} />)}
        {[[2.6, '#ffcf5a'], [-2.6, '#eef6ff']].map(([dy, col]: any) => (
          <mesh key={col} position={[L.flash[0], L.flash[1] + dy, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.3, 20]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={flashOn ? 3 : 0.05} />
          </mesh>
        ))}
        {flashOn && <>
          <pointLight position={[L.flash[0], L.flash[1] + 2.6, -20]} color="#ffcf5a" intensity={0.12} distance={0} decay={1.4} />
          <pointLight position={[L.flash[0], L.flash[1] - 2.6, -20]} color="#eef6ff" intensity={0.12} distance={0} decay={1.4} />
        </>}
      </group>
    </group>
  )
}

function Layer({ idx, z, name, children }: any) {
  const ref = useRef<THREE.Group>(null!)
  const tear = useStore((s) => s.isTeardownMode), w = useStore((s) => s.baseWidth)
  useFrame((_, dt) => {
    const s = useStore.getState(), e = s.isTeardownMode ? s.explodedSlider : 0
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, z + e * (idx - 2.5) * 30, 6, dt)
  })
  return (
    <group ref={ref}>
      {children}
      {tear && <Html position={[w / 2 + 10, 0, 0]} style={{ pointerEvents: 'none' }}><div className="whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-[11px] text-amber-200 border border-white/10">{name}</div></Html>}
    </group>
  )
}

function Fan({ t }: { t: number }) {
  const r = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { r.current.rotation.z += dt * 9 })
  return <group ref={r}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[2.5, 2.5, t, 20]} /><meshStandardMaterial color="#222" /></mesh>
    {Array.from({ length: 7 }, (_, i) => <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 7]}><mesh position={[5.5, 0, 0]}><boxGeometry args={[7, 1.8, t * 0.6]} /><meshStandardMaterial color="#d6303a" /></mesh></group>)}</group>
}

function Phone() {
  const s = useStore()
  const w = s.baseWidth, h = s.baseHeight, r = s.cornerRounding * 9, T = s.thicknessMM
  const bt = s.battery.thickness, ct = COOLING[s.cooling].t
  const glass = GLASS[s.frontGlass], ch = CHASSIS[s.chassis], bk = BACK[s.backPanel]
  const z: Record<string, number> = {}
  let zc = -T / 2
  for (const [k, t] of [['back', 1], ['bat', bt], ['pcb', 1], ['cool', ct], ['disp', 0.9], ['glass', 0.6]] as [string, number][]) { z[k] = zc + t / 2; zc += t }

  const chassisColor = useMemo(() => new THREE.Color(ch.color).lerp(new THREE.Color(s.colorHex), 0.3), [ch.color, s.colorHex])
  const frameShape = useMemo(() => rr(w, h, r), [w, h, r])
  const pocket = useMemo(() => rr(w - 2.8, h - 2.8, r - 1.4), [w, h, r])
  const backShape = useMemo(() => rr(w - 0.2, h - 0.2, r - 0.1), [w, h, r])
  const dispShape = useMemo(() => {
    const sh = rr(w - 1.6, h - 1.6, r - 0.8)
    if (s.frontCamera === 'Punch-Hole') { const p = new THREE.Path(); p.absarc(0, h / 2 - 5, 2.2, 0, Math.PI * 2, false); sh.holes.push(p) }
    if (s.frontCamera === 'Dynamic Island') sh.holes.push(rr(18, 5.5, 2.75, 0, h / 2 - 6.5))
    return sh
  }, [w, h, r, s.frontCamera])
  const gGeo = useMemo(() => glassGeo(w - 0.6, h - 0.6, r - 0.3, s.displayCurve), [w, h, r, s.displayCurve])
  const tex = useScreenTex(w - 1.6, h - 1.6, s.colorHex, s.refreshRate, s.displayType)
  const backTex = bk.tex === 'carbon' ? carbonTex() : null
  const bump = bk.tex === 'leather' ? noiseTex() : null
  const speakers = Array.from({ length: 6 }, (_, i) => [12 + i * 2.6, -(12 + i * 2.6)]).flat()

  return (
    <group scale={S}>
      {/* Frame with CSG: hollow pocket + oval USB-C + 12 speaker holes cut through the bottom wall */}
      <mesh key={`${w}-${h}-${T}-${r}`} position={[0, 0, -T / 2]}>
        <Geometry>
          <Base><extrudeGeometry args={[frameShape, { depth: T, bevelEnabled: false, curveSegments: 32 }]} /></Base>
          <Subtraction position={[0, 0, -1]}><extrudeGeometry args={[pocket, { depth: T + 2, bevelEnabled: false, curveSegments: 32 }]} /></Subtraction>
          <Subtraction position={[0, -h / 2 + 1, T / 2]} scale={[2.6, 1, 1]}><cylinderGeometry args={[1.25, 1.25, 8, 24]} /></Subtraction>
          {speakers.map((x, i) => <Subtraction key={i} position={[x, -h / 2 + 1, T / 2]}><cylinderGeometry args={[0.5, 0.5, 8, 12]} /></Subtraction>)}
        </Geometry>
        <meshPhysicalMaterial color={chassisColor} metalness={ch.metalness} roughness={ch.roughness} clearcoat={0.2} />
      </mesh>

      <Layer idx={0} z={z.back} name="Back panel + camera island">
        <mesh position={[0, 0, -0.5]}>
          <extrudeGeometry args={[backShape, { depth: 1, bevelEnabled: false, curveSegments: 32 }]} />
          <meshPhysicalMaterial color={backTex ? '#ffffff' : s.colorHex} map={backTex} bumpMap={bump} bumpScale={bump ? 2 : 0} roughness={bk.roughness} metalness={bk.metalness} clearcoat={bk.clearcoat} />
        </mesh>
        <Island />
      </Layer>

      <Layer idx={1} z={z.bat} name={`${s.battery.name} + ${s.haptics}`}>
        <mesh position={[0, -h * 0.14, 0]}><boxGeometry args={[w - 7, h * 0.36, bt]} /><meshStandardMaterial color="#2b3440" roughness={0.5} metalness={0.3} /></mesh>
        {(s.haptics === 'Z-Axis Linear Motor' ? [[0, 1]] : s.haptics === 'Dual X-Axis Motors' ? [[-w * 0.25, 0], [w * 0.25, 0]] : [[w * 0.2, 0]]).map(([x, round], i) => (
          <mesh key={i} position={[x, -h * 0.42, 0]} rotation={[round ? Math.PI / 2 : 0, 0, 0]}>
            {round ? <cylinderGeometry args={[6, 6, 3.4, 24]} /> : <boxGeometry args={[18, 7, 3.4]} />}<meshStandardMaterial color="#8d9299" metalness={0.8} roughness={0.35} />
          </mesh>))}
      </Layer>

      <Layer idx={2} z={z.pcb} name={`PCB · ${s.soc.name} · ${s.ram.gb}GB ${s.ram.type}`}>
        <mesh position={[0, h * 0.31, 0]}><boxGeometry args={[w - 8, h * 0.3, 1]} /><meshStandardMaterial color="#0f5a3a" roughness={0.6} /></mesh>
        <mesh position={[0, -h / 2 + 5, 0]}><boxGeometry args={[w - 14, 6, 1]} /><meshStandardMaterial color="#0f5a3a" /></mesh>
        <mesh position={[0, -h / 2 + 4.5, 1.2]}><boxGeometry args={[9, 3.4, 2.4]} /><meshStandardMaterial color="#c5c8cc" metalness={1} roughness={0.3} /></mesh>
        <mesh position={[-w * 0.12, h * 0.33, 0.95]}><boxGeometry args={[13, 13, 0.9]} /><meshStandardMaterial color="#3a3f4a" metalness={0.6} roughness={0.35} /></mesh>
        <mesh position={[w * 0.1, h * 0.33, 0.8]}><boxGeometry args={[12, 9, 0.7]} /><meshStandardMaterial color="#1c1e24" metalness={0.5} roughness={0.4} /></mesh>
        {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[-w * 0.3 + (i % 4) * 12, h * 0.23 + Math.floor(i / 4) * 8, 0.7]}><boxGeometry args={[5, 3, 0.5]} /><meshStandardMaterial color="#b0b4ba" metalness={0.8} roughness={0.4} /></mesh>)}
      </Layer>

      <Layer idx={3} z={z.cool} name={s.cooling}>
        {s.cooling === 'Graphite Sheet' && <mesh position={[0, h * 0.05, 0]}><boxGeometry args={[w - 12, h * 0.6, ct]} /><meshStandardMaterial color="#26262b" roughness={0.8} /></mesh>}
        {s.cooling !== 'Graphite Sheet' && <mesh position={[0, h * 0.1, 0]}><boxGeometry args={[w - 14, h * 0.5, ct * (s.cooling === 'Dual VC + Graphene' ? 0.5 : 1)]} /><meshStandardMaterial color="#b87333" metalness={1} roughness={0.3} /></mesh>}
        {s.cooling === 'Dual VC + Graphene' && <mesh position={[0, h * 0.1, ct * 0.35]}><boxGeometry args={[w - 12, h * 0.55, ct * 0.3]} /><meshStandardMaterial color="#1b1b20" roughness={0.7} /></mesh>}
        {s.cooling.startsWith('Active') && <group position={[0, h * 0.25, 0]}><Fan t={ct} /></group>}
      </Layer>

      <Layer idx={4} z={z.disp} name={`${s.displayType} · ${s.refreshRate} Hz`}>
        <mesh position={[0, 0, -0.45]}>
          <extrudeGeometry args={[dispShape, { depth: 0.9, bevelEnabled: false, curveSegments: 32 }]} />
          <meshBasicMaterial attach="material-0" map={tex} toneMapped={false} />
          <meshStandardMaterial attach="material-1" color="#050506" />
        </mesh>
        {s.frontCamera !== 'Under-Display (UDC)' && (
          <mesh position={[s.frontCamera === 'Dynamic Island' ? 5 : 0, s.frontCamera === 'Dynamic Island' ? h / 2 - 6.5 : h / 2 - 5, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.4, 20]} /><meshPhysicalMaterial color="#0b1426" roughness={0} clearcoat={1} iridescence={1} />
          </mesh>)}
      </Layer>

      <Layer idx={5} z={z.glass} name={`${s.frontGlass} · ${s.displayCurve}`}>
        <mesh geometry={gGeo}>
          <meshPhysicalMaterial color="#ffffff" transmission={glass.transmission} roughness={glass.roughness} clearcoat={glass.clearcoat} ior={glass.ior} thickness={0.6} transparent side={THREE.DoubleSide} />
        </mesh>
      </Layer>
    </group>
  )
}

function Rig({ children }: any) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    const s = useStore.getState()
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, (s.showBack ? Math.PI : 0) + (s.isTeardownMode ? -0.55 : 0), 4, dt)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, s.isTeardownMode ? 0.45 : 0, 4, dt)
  })
  return <group ref={ref}>{children}</group>
}

export default function SandboxCanvas() {
  const auto = useStore((s) => s.autoRotate)
  return (
    <Canvas camera={{ position: [0, 0, 4.6], fov: 35 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#0d1117']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={5} position={[0, 5, 4]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={3} position={[-6, 0, 2]} scale={[2, 8, 1]} color="#ffd9a8" />
        <Lightformer form="rect" intensity={3} position={[6, 1, -2]} scale={[2, 8, 1]} color="#a8c8ff" />
        <Lightformer form="ring" intensity={2} position={[0, -3, -5]} scale={6} />
      </Environment>
      <Rig><Phone /></Rig>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={8} blur={2.6} far={3} />
      <OrbitControls enablePan={false} minDistance={1.8} maxDistance={8} autoRotate={auto} autoRotateSpeed={1.4} />
    </Canvas>
  )
}
