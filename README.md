# PhoneCraft 3D: Master Sandbox

React 18 + React Three Fiber + Drei + Zustand + Tailwind v4 smartphone builder and teardown visualizer.

## Deploy to Cloudflare Pages (Git)
- Framework preset: Vite (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Node 18+ (set `NODE_VERSION=20` if needed)

## Deploy by direct upload
`dist/` is already built in this zip. In Cloudflare Pages choose "Upload assets" and upload the contents of `dist/`.

## Local
`npm install && npm run dev`

## Modes
- **Showcase**: orbit, flip front/back, flash toggle.
- **Teardown**: staggered exploded view; hover or tap a layer (list on the right) to isolate it.
- **3D Edit**: click the body or any part, move/rotate/scale with the gizmo (W/E/R, Snap toggle), add boxes, spheres, cylinders, capsules, tori, cones and plates, recolour, duplicate (Delete removes).
- **Render**: path-traced render of the current view on a studio set, saved as PNG (Draft / High / Ultra). Needs a GPU with WebGL2 float textures; Ultra at 2x can take minutes.

## Where things are
- `src/textures.ts` procedural PBR maps (brushed metal, leather, carbon weave, matte grain, ceramic speckle, PCB, battery label) and the float studio HDR
- `src/Panels.tsx` mode switch, edit/teardown panels, render controls
- `src/data.ts` glass, chassis, back panels, displays, 16 cameras, 11 batteries, 222 SoCs
- `src/store.ts` Zustand store (schema + derived price, weight, AnTuTu, thermal risk, thickness)
- `src/Phone3D.tsx` CSG chassis, curved glass, camera island, teardown layers
- `src/App.tsx` controls, stats, teardown slider
