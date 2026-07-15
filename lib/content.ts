

export interface ImageAsset {

  alt: string;

  src: string;
}

export interface NavLink {
  index: string;
  label: string;
  href: string;
}

export interface CraftPanel {
  index: string;
  label: string;
  title: string;
  line: string;
  image: ImageAsset;
}

export interface WatchSpec {
  label: string;
  value: string;
}

export interface CollectionModel {
  name: string;
  reference: string;
  note: string;
  price: string;
  specs: WatchSpec[];
  image: ImageAsset;
}

export interface MovementCallout {
  label: string;
  value: string;
}

export interface HeritageEntry {
  year: string;
  title: string;
  line: string;
}

export interface ConfigOption {
  id: string;
  label: string;

  swatch: string;

  delta: number;
}

export interface ConfigGroup {
  key: 'case' | 'dial' | 'strap';
  label: string;
  options: ConfigOption[];
}

export const SITE = {
  name: 'VANTA',
  kicker: 'Maison Horologère · Est. 1971',
  tagline: 'Time, perfected. Then left alone.',
  reference: 'REF. V—1971',
} as const;

export const HERO = {
  microdata: [
    { label: 'Reference', value: 'V—1971' },
    { label: 'Frequency', value: '28 800 vph' },
    { label: 'Tolerance', value: '−2 s / day' },
  ],
  hint: 'Bring the light closer.',
  sound: { label: 'sound', on: 'on', off: 'off' },
  scrollHint: '↓ Scroll',
} as const;

export const NAV: NavLink[] = [
  { index: '01', label: 'Horology', href: '#hero' },
  { index: '02', label: 'Craft', href: '#craft' },
  { index: '03', label: 'Collection', href: '#collection' },
  { index: '04', label: 'Movement', href: '#movement' },
  { index: '05', label: 'Heritage', href: '#heritage' },
  { index: '06', label: 'Configure', href: '#configure' },
];

export const CRAFT: CraftPanel[] = [
  {
    index: '01',
    label: 'The Dial',
    title: 'Forty-two hours to finish one face.',
    line: 'Each dial is cut with a guilloché lathe by hand. The light it returns is the only ornament we permit.',
    image: {
      alt: 'Macro of a sunburst guilloché watch dial catching raking light against black',
      src: '/images/craft-dial.jpg',
    },
  },
  {
    index: '02',
    label: 'The Case',
    title: 'Polished until the light has nowhere to hide.',
    line: 'Nine stages of hand-polishing. We stop only when the case flank becomes a black mirror.',
    image: {
      alt: 'Macro of a polished gold watch crown and mirror-finished case flank',
      src: '/images/craft-case.jpg',
    },
  },
  {
    index: '03',
    label: 'The Crystal',
    title: 'Sapphire. Scratched only by itself.',
    line: 'Box sapphire, anti-reflective on both faces, so nothing stands between the eye and the time.',
    image: {
      alt: 'Macro of a box sapphire crystal edge above luminous hour indices in the dark',
      src: '/images/craft-crystal.jpg',
    },
  },
];

export const COLLECTION: CollectionModel[] = [
  {
    name: 'Noir',
    reference: 'V—N1',
    note: 'Blackened steel. The discipline of restraint.',
    price: '€18,500',
    specs: [
      { label: 'Case', value: '40.0 MM · DLC STEEL' },
      { label: 'Movement', value: 'CAL. V-01 AUTOMATIC' },
      { label: 'Reserve', value: '72 H' },
      { label: 'Water', value: '100 M' },
    ],
    image: {
      alt: 'Front-on shot of the VANTA Noir blackened-steel watch on pure black',
      src: '/images/model-noir.jpg',
    },
  },
  {
    name: 'Or',
    reference: 'V—O1',
    note: 'Solid champagne gold. Quiet weight.',
    price: '€48,500',
    specs: [
      { label: 'Case', value: '40.0 MM · 18K GOLD' },
      { label: 'Movement', value: 'CAL. V-01 AUTOMATIC' },
      { label: 'Reserve', value: '72 H' },
      { label: 'Water', value: '50 M' },
    ],
    image: {
      alt: 'Front-on shot of the VANTA Or solid-gold watch on pure black',
      src: '/images/model-or.jpg',
    },
  },
  {
    name: 'Tourbillon',
    reference: 'V—T1',
    note: 'Open-worked. The mechanism, laid bare.',
    price: '€146,000',
    specs: [
      { label: 'Case', value: '41.0 MM · PLATINUM' },
      { label: 'Movement', value: 'CAL. V-09 TOURBILLON' },
      { label: 'Reserve', value: '100 H' },
      { label: 'Water', value: '30 M' },
    ],
    image: {
      alt: 'Front-on shot of the VANTA Tourbillon open-worked platinum watch on pure black',
      src: '/images/model-tourbillon.jpg',
    },
  },
];

export const MOVEMENT = {
  caliber: 'CALIBRE V-01',
  line: 'A movement of 318 parts, finished by hands that will make perhaps forty this year.',
  callouts: [
    { label: 'Balance', value: '28,800 vph' },
    { label: 'Jewels', value: '27' },
    { label: 'Reserve', value: '72 H' },
    { label: 'Components', value: '318' },
    { label: 'Tolerance', value: '−4 / +6 s/day' },
  ] satisfies MovementCallout[],
  backplate: {
    alt: 'Extreme macro of a luxury watch movement with jeweled bearings and golden gears',
    src: '/images/movement-macro.jpg',
  } satisfies ImageAsset,
} as const;

export const HERITAGE: HeritageEntry[] = [
  { year: '1971', title: 'The first VANTA', line: 'A single watchmaker, one bench, in Vallée de Joux.' },
  { year: '1984', title: 'Calibre V-01', line: 'The in-house automatic that still beats in every piece.' },
  { year: '1998', title: 'The black mirror', line: 'Nine-stage hand polishing becomes the house standard.' },
  { year: '2009', title: 'V-09 Tourbillon', line: 'A flying tourbillon, open-worked, under box sapphire.' },
  { year: '2021', title: 'Fifty years', line: 'Fifty years. Still perhaps forty pieces a year.' },
  { year: '2026', title: 'Present', line: 'The bench has not moved.' },
];

export const CONFIG: ConfigGroup[] = [
  {
    key: 'case',
    label: 'Case',
    options: [
      { id: 'steel', label: 'Blackened Steel', swatch: '#3A3A3A', delta: 0 },
      { id: 'gold', label: 'Champagne Gold', swatch: '#C9A84C', delta: 30000 },
      { id: 'platinum', label: 'Platinum', swatch: '#D6D6D6', delta: 60000 },
    ],
  },
  {
    key: 'dial',
    label: 'Dial',
    options: [
      { id: 'noir', label: 'Noir', swatch: '#0E0E0E', delta: 0 },
      { id: 'champagne', label: 'Champagne', swatch: '#C9A84C', delta: 1500 },
      { id: 'slate', label: 'Slate', swatch: '#46505A', delta: 1500 },
    ],
  },
  {
    key: 'strap',
    label: 'Strap',
    options: [
      { id: 'alligator', label: 'Alligator', swatch: '#1A1A1A', delta: 0 },
      { id: 'bracelet', label: 'Bracelet', swatch: '#8A8A8A', delta: 4000 },
      { id: 'rubber', label: 'Rubber', swatch: '#101010', delta: -1000 },
    ],
  },
];

export const CONFIG_BASE_PRICE = 18500;

export const HERO_IMAGE: ImageAsset = {
  alt: 'A luxury watch resting on dark volcanic stone under dramatic raking light with water droplets',
  src: '/images/hero-stone.jpg',
};

export const WRIST_IMAGE: ImageAsset = {
  alt: 'Editorial wrist shot of a luxury watch emerging from a dark suit sleeve',
  src: '/images/wrist.jpg',
};

export const FOOTER = {
  columns: [
    { label: 'Maison', items: ['The House', 'Atelier', 'Craft', 'Sustainability'] },
    { label: 'Care', items: ['Servicing', 'Warranty', 'Authenticity', 'Contact'] },
    { label: 'Contact', items: ['Vallée de Joux', 'Geneva', 'concierge@vanta.example'] },
  ],
  closing: '© VANTA 1971—2026',
} as const;
