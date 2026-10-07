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

## Where things are
- `src/data.ts` glass, chassis, back panels, displays, 16 cameras, 11 batteries, 222 SoCs
- `src/store.ts` Zustand store (schema + derived price, weight, AnTuTu, thermal risk, thickness)
- `src/Phone3D.tsx` CSG chassis, curved glass, camera island, teardown layers
- `src/App.tsx` controls, stats, teardown slider
