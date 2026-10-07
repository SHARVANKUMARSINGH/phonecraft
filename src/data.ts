export type GlassTech = 'Gorilla Armor 2' | 'Gorilla Victus 2' | 'Kunlun Glass 2' | 'Ceramic Shield' | 'Dragontrail Star 2' | 'Sapphire Crystal'
export type ChassisMaterial = 'Grade 5 Titanium' | '7000 Series Aluminum' | 'Stainless Steel' | 'Liquid Metal'
export type BackPanelMaterial = 'AG Matte Glass' | 'Glossy Glass' | 'Vegan Leather' | 'Forged Carbon' | 'Ceramic'
export type DisplayCurve = 'Flat' | '2.5D Curved' | 'Waterfall 88-degree' | 'Micro-Quad Curve'
export type CoolingTech = 'Graphite Sheet' | 'Standard Vapor Chamber' | 'Dual VC + Graphene' | 'Active RedMagic Fan + Liquid Metal'
export type Haptics = 'Z-Axis Linear Motor' | 'X-Axis Ultra-Wideband Motor' | 'Dual X-Axis Motors'
export type DisplayType = 'LTPO 4.0 OLED' | 'Tandem OLED' | 'MicroLED'
export type FrontCamera = 'Punch-Hole' | 'Under-Display (UDC)' | 'Dynamic Island'
export type CameraLayout = 'Matrix Squircle' | 'Circular Oreology' | 'Vertical Pill' | 'Horizontal Visor'

export interface CameraSensor { id: string; name: string; lensType: 'Main' | 'Ultrawide' | 'Telephoto' | 'Periscope'; focalLength: number; aperture: number; ois: boolean; physicalDepthMM: number; mp: number; price: number }
export interface SoC { id: string; name: string; vendor: string; year: number; antutu: number; nm: number; watts: number; price: number }
export interface RAM { gb: number; type: string; price: number }
export interface Storage { gb: number; type: string; price: number }
export interface Battery { id: string; name: string; mAh: number; thickness: number; weight: number; price: number }

export const GLASS: Record<GlassTech, { note: string; transmission: number; roughness: number; clearcoat: number; ior: number; price: number; density: number }> = {
  'Gorilla Armor 2': { note: 'Mohs 7 · 75% less reflection · survives 2.2 m drops', transmission: 0.98, roughness: 0.02, clearcoat: 1, ior: 1.45, price: 22, density: 2.4 },
  'Gorilla Victus 2': { note: 'Ion-exchange strengthened', transmission: 0.96, roughness: 0.02, clearcoat: 1, ior: 1.5, price: 17, density: 2.45 },
  'Kunlun Glass 2': { note: '830 HV · diamond-like carbon coating', transmission: 0.95, roughness: 0.03, clearcoat: 0.8, ior: 1.55, price: 20, density: 2.5 },
  'Ceramic Shield': { note: 'Glass-ceramic nanocrystals', transmission: 0.92, roughness: 0.05, clearcoat: 0.9, ior: 1.6, price: 24, density: 2.6 },
  'Dragontrail Star 2': { note: 'Alkali-aluminosilicate, value flagship glass', transmission: 0.94, roughness: 0.03, clearcoat: 0.85, ior: 1.52, price: 10, density: 2.4 },
  'Sapphire Crystal': { note: 'Mohs 9 · high reflection', transmission: 0.9, roughness: 0, clearcoat: 1, ior: 1.77, price: 70, density: 3.98 },
}
export const CHASSIS: Record<ChassisMaterial, { color: string; metalness: number; roughness: number; density: number; price: number }> = {
  'Grade 5 Titanium': { color: '#8f8c88', metalness: 1, roughness: 0.38, density: 4.43, price: 38 },
  '7000 Series Aluminum': { color: '#b9bec6', metalness: 1, roughness: 0.3, density: 2.7, price: 14 },
  'Stainless Steel': { color: '#c9ccd1', metalness: 1, roughness: 0.14, density: 8.0, price: 22 },
  'Liquid Metal': { color: '#b4bac2', metalness: 1, roughness: 0.1, density: 6.0, price: 46 },
}
export const BACK: Record<BackPanelMaterial, { roughness: number; metalness: number; clearcoat: number; density: number; price: number; tex?: 'carbon' | 'leather' }> = {
  'AG Matte Glass': { roughness: 0.55, metalness: 0.05, clearcoat: 0.05, density: 2.5, price: 8 },
  'Glossy Glass': { roughness: 0.06, metalness: 0.1, clearcoat: 1, density: 2.5, price: 8 },
  'Vegan Leather': { roughness: 0.72, metalness: 0, clearcoat: 0, density: 1.2, price: 6, tex: 'leather' },
  'Forged Carbon': { roughness: 0.25, metalness: 0.2, clearcoat: 0.9, density: 1.6, price: 30, tex: 'carbon' },
  Ceramic: { roughness: 0.15, metalness: 0.05, clearcoat: 0.8, density: 3.9, price: 28 },
}
export const DISPLAYS: Record<DisplayType, { note: string; nits: number; power: string; watts: number; price: number }> = {
  'LTPO 4.0 OLED': { note: 'Variable 1–120 Hz', nits: 3000, power: 'Low', watts: 1.2, price: 70 },
  'Tandem OLED': { note: 'Dual emission layer', nits: 5000, power: 'Medium', watts: 2.0, price: 110 },
  MicroLED: { note: 'Inorganic pixel-level lighting', nits: 10000, power: 'High', watts: 3.2, price: 260 },
}
export const CURVES: DisplayCurve[] = ['Flat', '2.5D Curved', 'Waterfall 88-degree', 'Micro-Quad Curve']
export const REFRESH = [60, 90, 120, 144, 240]
export const COOLING: Record<CoolingTech, { t: number; cap: number; price: number; g: number }> = {
  'Graphite Sheet': { t: 0.3, cap: 5, price: 2, g: 2 },
  'Standard Vapor Chamber': { t: 0.6, cap: 8, price: 8, g: 5 },
  'Dual VC + Graphene': { t: 1.0, cap: 11, price: 18, g: 9 },
  'Active RedMagic Fan + Liquid Metal': { t: 2.2, cap: 16, price: 34, g: 14 },
}
export const HAPTICS: Record<Haptics, { price: number; g: number }> = {
  'Z-Axis Linear Motor': { price: 6, g: 4 },
  'X-Axis Ultra-Wideband Motor': { price: 9, g: 5 },
  'Dual X-Axis Motors': { price: 15, g: 9 },
}

const C = (id: string, name: string, lensType: CameraSensor['lensType'], mp: number, focalLength: number, aperture: number, ois: boolean, physicalDepthMM: number, price: number): CameraSensor => ({ id, name, lensType, mp, focalLength, aperture, ois, physicalDepthMM, price })
export const CAMERAS: CameraSensor[] = [
  C('lyt900', 'Sony LYT-900 1-inch', 'Main', 50, 23, 1.63, true, 5.5, 48),
  C('imx890', 'Sony IMX890 1/1.56"', 'Main', 50, 24, 1.8, true, 3.5, 26),
  C('hp2', 'Samsung ISOCELL HP2 200MP', 'Main', 200, 23, 1.7, true, 4.2, 40),
  C('lyt828', 'Sony LYT-828 1/1.28"', 'Main', 50, 23, 1.88, true, 3.9, 34),
  C('gn5', 'Samsung ISOCELL GN5 1/1.57"', 'Main', 50, 24, 1.9, true, 3.4, 22),
  C('ov50h', 'OmniVision OV50H 1-inch', 'Main', 50, 23, 1.6, true, 5.2, 44),
  C('imx858uw', 'Sony IMX858 Ultrawide', 'Ultrawide', 48, 13, 2.0, false, 3.0, 16),
  C('jn1', 'Samsung ISOCELL JN1 Ultrawide', 'Ultrawide', 50, 14, 2.2, false, 2.8, 12),
  C('ov13b', 'OmniVision OV13B Ultrawide', 'Ultrawide', 13, 15, 2.2, false, 2.6, 8),
  C('imx712', 'Sony IMX712 Ultrawide', 'Ultrawide', 50, 12, 1.9, true, 3.2, 20),
  C('imx882', 'Sony IMX882 3x Telephoto', 'Telephoto', 50, 70, 2.0, true, 4.0, 24),
  C('hp9', 'Samsung ISOCELL HP9 Telephoto', 'Telephoto', 200, 85, 2.4, true, 4.8, 36),
  C('ov32b', 'OmniVision OV32B Telephoto', 'Telephoto', 32, 65, 2.4, true, 3.6, 16),
  C('ov64b', 'OmniVision OV64B Periscope', 'Periscope', 64, 120, 2.6, true, 6.0, 38),
  C('lyt600', 'Sony LYT-600 Periscope 5x', 'Periscope', 50, 120, 2.8, true, 5.8, 34),
  C('3k1', 'Samsung ISOCELL 3K1 Periscope 10x', 'Periscope', 50, 230, 4.9, true, 6.2, 42),
]

const B = (mAh: number, type: string, thickness: number, weight: number, price: number): Battery => ({ id: `${mAh}-${type}`, name: `${mAh}mAh ${type}`, mAh, thickness, weight, price })
export const BATTERIES: Battery[] = [
  B(4000, 'Li-Ion', 3.2, 40, 9), B(4500, 'Li-Ion', 3.6, 44, 11), B(5000, 'Li-Ion', 4.2, 52, 13),
  B(5000, 'Silicon-Carbon', 4.0, 50, 17), B(5500, 'Dual-Cell Graphene', 4.5, 55, 24), B(5500, 'Silicon-Carbon', 4.3, 53, 20),
  B(6000, 'Solid State', 5.2, 65, 48), B(6000, 'Silicon-Carbon', 4.8, 60, 26), B(6500, 'Silicon-Carbon', 5.5, 70, 32),
  B(7000, 'Rugged Pack', 7.0, 90, 30), B(7500, 'Silicon-Carbon Max', 6.8, 84, 38),
]
export const RAMS: RAM[] = [
  { gb: 4, type: 'LPDDR4X', price: 8 }, { gb: 6, type: 'LPDDR4X', price: 12 }, { gb: 8, type: 'LPDDR5', price: 20 },
  { gb: 12, type: 'LPDDR5X', price: 32 }, { gb: 16, type: 'LPDDR5X', price: 46 }, { gb: 24, type: 'LPDDR5T', price: 74 },
]
export const STORAGES: Storage[] = [
  { gb: 64, type: 'eMMC 5.1', price: 5 }, { gb: 128, type: 'UFS 3.1', price: 12 }, { gb: 256, type: 'UFS 4.0', price: 24 },
  { gb: 512, type: 'UFS 4.0', price: 48 }, { gb: 1024, type: 'UFS 4.1', price: 96 },
]

// name,year,AnTuTu (thousands). Scores are approximate AnTuTu v10 class figures.
const RAW: Record<string, [string, string]> = {
  Snapdragon: ['Snapdragon ', '8 Elite Gen 5,2025,3700;8 Elite,2024,3000;8 Gen 3,2023,2150;8s Gen 4,2025,2000;8s Gen 3,2024,1700;8+ Gen 1,2022,1250;8 Gen 2,2022,1500;8 Gen 1,2021,1000;888+,2021,830;888,2020,790;870,2021,650;865+,2020,640;865,2020,600;855+,2019,480;855,2019,450;845,2018,350;835,2017,270;821,2016,210;820,2016,200;810,2015,170;808,2015,130;805,2014,110;801,2014,100;800,2013,90;7+ Gen 3,2024,1550;7 Gen 3,2023,1050;7s Gen 3,2024,900;7+ Gen 2,2023,1150;7s Gen 2,2023,700;7 Gen 1,2022,590;778G+,2021,570;778G,2021,550;780G,2021,600;768G,2020,420;765G,2020,420;750G,2020,380;732G,2020,300;730G,2019,280;730,2019,270;720G,2020,290;712,2019,270;710,2018,230;675,2020,250;670,2018,210;665,2019,180;660,2017,160;653,2016,130;652,2016,120;650,2016,110;636,2017,110;630,2017,90;626,2017,80;625,2016,75;617,2015,60;6 Gen 3,2024,800;6 Gen 1,2023,450;695,2021,410;690,2020,370;685,2021,260;680,2021,250;662,2020,240;4 Gen 2,2023,430;4 Gen 1,2022,360;4s Gen 2,2024,400;480+,2021,390;480,2021,380;460,2020,200;450,2018,140;439,2019,100;435,2018,90;430,2017,80;425,2016,60'],
  Dimensity: ['Dimensity ', '9500,2025,3300;9400+,2025,3000;9400,2024,2900;9300+,2024,2400;9300,2023,2200;9200+,2023,1600;9200,2022,1500;9000+,2022,1100;9000,2022,1050;8450,2025,1900;8400,2024,1500;8300,2024,1450;8250,2024,1300;8200,2023,1300;8100,2022,880;8050,2022,800;8020,2022,700;7300,2024,700;7200,2023,700;7050,2023,600;7030,2023,500;7025,2023,500;1300,2022,800;1200,2021,700;1100,2021,560;1080,2021,550;1050,2020,500;1000+,2020,570;1000L,2020,520;930,2022,450;920,2021,520;900,2021,500;820,2020,480;810,2021,400;800U,2021,550;800,2020,400;720,2020,350;700,2020,340;6300,2023,400;6100+,2023,400;6020,2022,400;6080,2022,400'],
  Helio: ['Helio ', 'G99,2022,380;G96,2021,370;G95,2020,290;G90T,2019,260;G88,2021,300;G85,2020,260;G80,2020,250;G70,2019,180;G37,2022,200;G36,2023,200;P90,2018,200;P70,2018,160;P65,2019,155;P60,2018,140;P35,2018,90;P22,2018,80;X30,2017,100;X27,2016,100;X25,2015,90;X20,2015,85;X10,2015,60'],
  Exynos: ['Exynos ', '2600,2025,3000;2500,2025,2100;2400,2024,2000;2400e,2024,1900;2200,2022,1050;2100,2021,720;1580,2024,1250;1480,2024,1100;1380,2023,780;1330,2023,520;1280,2022,430;1080,2021,500;990,2020,520;980,2019,380;880,2020,330;850,2020,200;9825,2019,420;9820,2019,380;9810,2018,300;9611,2019,200;9610,2018,185;9609,2019,170;9110,2018,100;8895,2017,200;8890,2016,180;8870,2016,130;7885,2018,150;7884,2018,130;7880,2017,110;7870,2016,90;7580,2016,80;7420,2015,75'],
  Apple: ['Apple ', 'A19 Pro,2025,3400;A19,2025,3000;A18 Pro,2024,2100;A18,2024,1900;A17 Pro,2023,1650;A16 Bionic,2022,1500;A15 Bionic,2021,1300;A14 Bionic,2020,1100;A13 Bionic,2019,900;A12 Bionic,2018,700;A11 Bionic,2017,550;A10 Fusion,2016,400;A9,2015,300;A8,2014,200;A7,2013,150'],
  Tensor: ['Google Tensor ', 'G5,2025,1500;G4,2024,1150;G3,2023,1100;G2,2022,770;G1,2021,700'],
  Kirin: ['Kirin ', '9030,2025,1900;9020,2024,1600;9010,2024,1200;9000S,2023,1000;9000,2021,950;990,2019,550;985,2020,520;980,2018,380;970,2017,230;960,2016,200;955,2016,170;950,2015,150;935,2015,110;930,2015,100;920,2014,90;820,2020,380;810,2019,230;710,2018,140'],
  Unisoc: ['Unisoc ', 'T820,2022,650;T770,2022,380;T760,2020,280;T750,2021,330;T740,2020,250;T7280,2023,320;T7250,2023,300;T7225,2023,300;T7200,2023,290;T618,2020,290;T616,2021,290;T612,2021,180;T610,2020,170;T606,2020,150;T310,2021,60;SC9863A,2019,60;SC9832E,2018,35'],
}
const nmFor = (y: number) => (y >= 2024 ? 3 : y >= 2022 ? 4 : y >= 2020 ? 5 : y >= 2018 ? 7 : y >= 2017 ? 10 : y >= 2015 ? 14 : 28)
export const SOCS: SoC[] = Object.entries(RAW).flatMap(([vendor, [prefix, list]]) =>
  list.split(';').map((row) => {
    const [n, y, a] = row.split(',')
    const antutu = +a, year = +y
    return { id: `${vendor}-${n}`.replace(/\s/g, '_'), name: prefix + n, vendor, year, antutu, nm: nmFor(year), watts: +(1.5 + (antutu / 1000) * 2.3).toFixed(1), price: Math.round(6 + (antutu / 1000) * 28) }
  }),
)
export const VENDORS = ['All', ...Object.keys(RAW)]
