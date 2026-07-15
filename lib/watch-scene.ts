import * as THREE from 'three';

export type StrapKind = 'alligator' | 'bracelet' | 'rubber';

export interface WatchConfig {

  caseColor: string;

  dialColor: string;

  caseRoughness?: number;

  strap?: boolean;

  strapKind?: StrapKind;

  bezelColor?: string;

  detail?: boolean;
}

export interface StudioEnvironment {
  environment: THREE.Texture;
  dispose: () => void;
}

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): StudioEnvironment {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable for environment map');

  const base = ctx.createLinearGradient(0, 0, 0, 256);
  base.addColorStop(0, '#2e2e2e');
  base.addColorStop(0.45, '#101010');
  base.addColorStop(1, '#040404');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);

  const softbox = ctx.createRadialGradient(150, 56, 0, 150, 56, 135);
  softbox.addColorStop(0, 'rgba(255,255,255,0.85)');
  softbox.addColorStop(0.35, 'rgba(222,222,222,0.28)');
  softbox.addColorStop(1, 'rgba(210,210,210,0)');
  ctx.fillStyle = softbox;
  ctx.fillRect(0, 0, 512, 256);

  const goldGlow = ctx.createRadialGradient(402, 118, 0, 402, 118, 115);
  goldGlow.addColorStop(0, 'rgba(201,168,76,0.5)');
  goldGlow.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, 512, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromEquirectangular(tex);

  return {
    environment: rt.texture,
    dispose: () => {
      tex.dispose();
      rt.texture.dispose();
      pmrem.dispose();
    },
  };
}

export function addLights(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc9a84c, 1.4);
  rim.position.set(-4, 1, -3);
  scene.add(rim);
  const glint = new THREE.PointLight(0xffffff, 8, 20);
  glint.position.set(1.5, 2.5, 3);
  scene.add(glint);
}

function makeDialTexture(size: number, baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const k = size / 1024;
  const base = new THREE.Color(baseColor);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const dark = hsl.l < 0.5;
  const tone = (dl: number) => '#' + base.clone().offsetHSL(0, 0, dl).getHexString();
  const print = tone(dark ? 0.42 : -0.42);
  const printSoft = tone(dark ? 0.24 : -0.24);

  const dish = ctx.createRadialGradient(c, c, 0, c, c, 452 * k);
  dish.addColorStop(0, tone(0.035));
  dish.addColorStop(0.7, tone(0));
  dish.addColorStop(1, tone(-0.02));
  ctx.fillStyle = dish;
  ctx.fillRect(0, 0, size, size);

  ctx.lineWidth = 10 * k;
  for (let r = 48; r < 442; r += 19) {
    ctx.beginPath();
    ctx.arc(c, c, r * k, 0, Math.PI * 2);
    ctx.strokeStyle = (r / 19) % 2 < 1 ? tone(0.022) : tone(-0.014);
    ctx.stroke();
  }

  const hub = ctx.createRadialGradient(c, c, 0, c, c, 40 * k);
  hub.addColorStop(0, tone(0.06));
  hub.addColorStop(1, tone(0.015));
  ctx.fillStyle = hub;
  ctx.beginPath();
  ctx.arc(c, c, 40 * k, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = printSoft;
  ctx.lineWidth = 3 * k;
  ctx.beginPath();
  ctx.arc(c, c, 452 * k, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r0 = 452 * k;
    const r1 = (major ? 486 : 472) * k;
    ctx.strokeStyle = major ? print : printSoft;
    ctx.lineWidth = (major ? 5 : 2.5) * k;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
    ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

function makeBrushedTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8c8c8c';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * size;
    const x = Math.random() * size;
    const len = 30 + Math.random() * 160;
    const shade = 110 + Math.floor(Math.random() * 60);
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},0.35)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

export interface WatchModel {
  group: THREE.Group;
  caseMat: THREE.MeshStandardMaterial;
  dialMat: THREE.MeshStandardMaterial;
  hourHand: THREE.Object3D;
  minuteHand: THREE.Object3D;
  secondHand: THREE.Object3D;
  crystal: THREE.Object3D;
  setDialColor: (color: string) => void;
  setCaseColor: (color: string, roughness?: number) => void;
  setStrap: (kind: StrapKind) => void;
  dispose: () => void;
}

export function buildWatch(config: WatchConfig): WatchModel {
  const group = new THREE.Group();
  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const detail = config.detail ?? true;
  const brushed = detail ? track(makeBrushedTexture()) : null;
  const dialTex = detail ? track(makeDialTexture(1536, config.dialColor)) : null;

  const caseMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.caseColor),
      metalness: 0.95,
      roughness: config.caseRoughness ?? 0.28,
      roughnessMap: brushed,
      bumpMap: brushed,
      bumpScale: 0.004,
      envMapIntensity: 1.2,
    }),
  );
  const goldMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C9A84C'),
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.4,
    }),
  );
  const bezelMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C9A84C'),
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 1.4,
    }),
  );
  const goldPolished = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E3C977'),
      metalness: 1,
      roughness: 0.1,
      envMapIntensity: 1.6,
    }),
  );
  const dialMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(detail ? '#FFFFFF' : config.dialColor),
      map: dialTex,
      metalness: 0.1,
      roughness: 0.45,
      envMapIntensity: 0.7,
    }),
  );
  const platinumMat = track(
    new THREE.MeshStandardMaterial({ color: '#E8E8E8', metalness: 1, roughness: 0.22, envMapIntensity: 1.7 }),
  );
  const crystalMat = track(
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.35,
      transparent: true,
      opacity: 0.045,
      clearcoat: 0,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.12,
      depthWrite: false,
    }),
  );
  const strapMat = track(
    new THREE.MeshStandardMaterial({ color: '#0D0D0D', metalness: 0.05, roughness: 0.96 }),
  );

  const caseMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(1.6, 1.6, 0.32, 96)), caseMat);
  caseMesh.rotation.x = Math.PI / 2;
  caseMesh.position.z = -0.02;
  group.add(caseMesh);

  const caseback = new THREE.Mesh(track(new THREE.TorusGeometry(1.5, 0.07, 16, 80)), caseMat);
  caseback.position.z = -0.16;
  group.add(caseback);

  const bezel = new THREE.Mesh(track(new THREE.TorusGeometry(1.6, 0.12, 24, 96)), bezelMat);
  bezel.position.z = 0.12;
  group.add(bezel);

  const dial = new THREE.Mesh(track(new THREE.CylinderGeometry(1.48, 1.48, 0.04, 96)), dialMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.z = 0.14;
  group.add(dial);

  const strokeLower = track(new THREE.BoxGeometry(0.042, 0.17, 0.02));
  const strokeUpper = track(new THREE.BoxGeometry(0.024, 0.142, 0.016));
  const romanStrokes: Record<string, { x: number; tilt: number }[]> = {
    I: [{ x: 0, tilt: 0 }],
    V: [
      { x: -0.024, tilt: 0.28 },
      { x: 0.024, tilt: -0.28 },
    ],
    X: [
      { x: 0, tilt: 0.45 },
      { x: 0, tilt: -0.45 },
    ],
  };
  const romanWidth: Record<string, number> = { I: 0.042, V: 0.13, X: 0.12 };
  const addRoman = (text: string, angle: number) => {
    const numeral = new THREE.Object3D();
    const gap = 0.024;
    const chars = text.split('');
    const total =
      chars.reduce((w, ch) => w + romanWidth[ch], 0) + gap * (chars.length - 1);
    let cursor = -total / 2;
    for (const ch of chars) {
      const w = romanWidth[ch];
      for (const s of romanStrokes[ch]) {
        const stroke = new THREE.Object3D();
        const lower = new THREE.Mesh(strokeLower, goldMat);
        const upper = new THREE.Mesh(strokeUpper, goldPolished);
        upper.position.z = 0.018;
        stroke.add(lower);
        stroke.add(upper);
        stroke.position.x = cursor + w / 2 + s.x;
        stroke.rotation.z = s.tilt;
        numeral.add(stroke);
      }
      cursor += w + gap;
    }
    numeral.position.set(Math.sin(angle) * 1.2, Math.cos(angle) * 1.2, 0.175);
    numeral.rotation.z = -angle;
    group.add(numeral);
  };
  const hours = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  hours.forEach((numeral, i) => addRoman(numeral, ((i + 1) / 12) * Math.PI * 2));

  const makeDauphine = (length: number, baseWidth: number, mat: THREE.Material, z: number) => {
    const g = track(new THREE.CylinderGeometry(0.008, baseWidth, length, 4, 1));
    g.translate(0, length / 2 - 0.12, 0);
    const mesh = new THREE.Mesh(g, mat);
    mesh.rotation.y = Math.PI / 4;
    const pivot = new THREE.Object3D();
    pivot.add(mesh);
    pivot.position.z = z;
    group.add(pivot);
    return pivot;
  };
  const hourHand = makeDauphine(0.82, 0.09, platinumMat, 0.2);
  const minuteHand = makeDauphine(1.18, 0.065, platinumMat, 0.22);

  const secondPivot = new THREE.Object3D();
  const secondGeo = track(new THREE.BoxGeometry(0.014, 1.3, 0.012));
  secondGeo.translate(0, 1.3 / 2 - 0.24, 0);
  secondPivot.add(new THREE.Mesh(secondGeo, goldPolished));
  const weightGeo = track(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 20));
  const weight = new THREE.Mesh(weightGeo, goldPolished);
  weight.rotation.x = Math.PI / 2;
  weight.position.y = -0.3;
  secondPivot.add(weight);
  secondPivot.position.z = 0.24;
  group.add(secondPivot);

  const cap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 24)), goldPolished);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.26;
  group.add(cap);

  const crown = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24)), bezelMat);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(1.72, 0, 0);
  group.add(crown);
  const crownGroove = new THREE.Mesh(track(new THREE.TorusGeometry(0.12, 0.018, 10, 28)), bezelMat);
  crownGroove.rotation.y = Math.PI / 2;
  crownGroove.position.set(1.72, 0, 0);
  group.add(crownGroove);

  const lugMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.caseColor),
      metalness: 0.85,
      roughness: 0.5,
      envMapIntensity: 0.55,
    }),
  );
  const lugGeo = track(new THREE.BoxGeometry(0.26, 0.34, 0.2));
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeo, lugMat);
      lug.position.set(0.62 * sx, 1.66 * sy, -0.02);
      lug.rotation.z = -0.16 * sx * sy;
      group.add(lug);
    }
  }

  if (config.strap) {
    const strapGeo = track(new THREE.BoxGeometry(0.96, 0.66, 0.13));
    for (const sy of [-1, 1]) {
      const piece = new THREE.Mesh(strapGeo, strapMat);
      piece.position.set(0, 2.02 * sy, -0.1);
      piece.rotation.x = 0.34 * sy;
      group.add(piece);
    }
  }

  const crystal = new THREE.Mesh(track(new THREE.SphereGeometry(2.58, 96, 24, 0, Math.PI * 2, 0, 0.62)), crystalMat);
  crystal.rotation.x = Math.PI / 2;
  crystal.scale.set(1, 0.32, 1);
  crystal.position.z = -0.48;
  crystal.renderOrder = 2;
  crystal.visible = false;
  group.add(crystal);

  const setDialColor = (color: string) => {
    if (!detail) {
      dialMat.color.set(color);
      return;
    }
    const next = track(makeDialTexture(1536, color));
    const prev = dialMat.map;
    dialMat.map = next;
    dialMat.needsUpdate = true;
    if (prev) prev.dispose();
  };

  let currentStrap: StrapKind = config.strapKind ?? 'alligator';

  const setStrap = (kind: StrapKind) => {
    currentStrap = kind;
    if (kind === 'bracelet') {
      strapMat.color.copy(caseMat.color).multiplyScalar(1.05);
      strapMat.metalness = 0.9;
      strapMat.roughness = 0.32;
    } else if (kind === 'rubber') {
      strapMat.color.set('#141414');
      strapMat.metalness = 0;
      strapMat.roughness = 0.55;
    } else {
      strapMat.color.set('#171009');
      strapMat.metalness = 0.05;
      strapMat.roughness = 0.95;
    }
  };

  const setCaseColor = (color: string, roughness?: number) => {
    caseMat.color.set(color);
    caseMat.roughness = roughness ?? 0.28;
    if (config.bezelColor) {
      bezelMat.color.set(config.bezelColor);
    } else {
      bezelMat.color.set(color).multiplyScalar(1.12);
      bezelMat.roughness = Math.max(0.12, (roughness ?? 0.28) - 0.1);
    }
    lugMat.color.set(color).multiplyScalar(0.85);
    if (currentStrap === 'bracelet') setStrap('bracelet');
  };

  setCaseColor(config.caseColor, config.caseRoughness);
  setStrap(currentStrap);

  return {
    group,
    caseMat,
    dialMat,
    hourHand,
    minuteHand,
    secondHand: secondPivot,
    crystal,
    setDialColor,
    setCaseColor,
    setStrap,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export function setWatchHands(model: Pick<WatchModel, 'hourHand' | 'minuteHand' | 'secondHand'>): void {
  const now = new Date();
  const s = now.getSeconds() + now.getMilliseconds() / 1000;
  const m = now.getMinutes() + s / 60;
  const hr = (now.getHours() % 12) + m / 60;
  model.hourHand.rotation.z = -(hr / 12) * Math.PI * 2;
  model.minuteHand.rotation.z = -(m / 60) * Math.PI * 2;
  model.secondHand.rotation.z = -(s / 60) * Math.PI * 2;
}

export const PLINTH_Y = -2.45;

export interface Plinth {
  group: THREE.Group;
  setIntensity: (p: number) => void;
  dispose: () => void;
}

export function buildPlinth(): Plinth {
  const group = new THREE.Group();
  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const ringMat = track(
    new THREE.MeshBasicMaterial({
      color: '#C9A84C',
      transparent: true,
      opacity: 0,
    }),
  );
  const ring = new THREE.Mesh(track(new THREE.TorusGeometry(2.55, 0.006, 8, 128)), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = PLINTH_Y;
  group.add(ring);

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(201,168,76,0.32)');
  grad.addColorStop(0.45, 'rgba(201,168,76,0.07)');
  grad.addColorStop(1, 'rgba(201,168,76,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const poolTex = track(new THREE.CanvasTexture(canvas));

  const poolMat = track(
    new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const pool = new THREE.Mesh(track(new THREE.CircleGeometry(2.5, 48)), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = PLINTH_Y + 0.004;
  group.add(pool);

  return {
    group,
    setIntensity: (p) => {
      ringMat.opacity = 0.5 * p;
      poolMat.opacity = p;
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

export interface HeroRigState {
  pointerX: number;
  pointerY: number;
  sweepDeg: number;
  sweepPower: number;
  reveal: number;
}

export interface HeroRig {
  update: (state: HeroRigState) => void;
  dispose: () => void;
}

export function createHeroRig(scene: THREE.Scene): HeroRig {
  const ambient = new THREE.AmbientLight(0xffffff, 0.16);
  const key = new THREE.DirectionalLight(0xffffff, 0);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xc9a84c, 0);
  rim.position.set(-4.5, 0.8, -3);
  const fill = new THREE.DirectionalLight(0xffffff, 0);
  fill.position.set(-1, -2.5, 4);
  const sweep = new THREE.SpotLight(0xfff4dc, 0, 40, 0.5, 0.85, 2);
  sweep.position.set(0, 2.5, 7);

  const targets = [key, rim, fill, sweep].map((light) => {
    scene.add(light.target);
    return light.target;
  });
  scene.add(ambient, key, rim, fill, sweep);

  return {
    update: (state) => {
      const az = state.pointerX * 0.85;
      key.position.set(Math.sin(az) * 6, 2.4 - state.pointerY * 2.6, Math.cos(az) * 6);
      key.intensity = 2.8 * state.reveal;
      rim.intensity = 1.3 * state.reveal;
      fill.intensity = 0.22 * state.reveal;
      ambient.intensity = 0.16 * state.reveal;

      const sa = (state.sweepDeg * Math.PI) / 180;
      sweep.position.set(Math.sin(sa) * 7.5, 2.2, Math.cos(sa) * 7.5);
      sweep.intensity = state.sweepPower * 260;
    },
    dispose: () => {
      targets.forEach((t) => scene.remove(t));
      scene.remove(ambient, key, rim, fill, sweep);
    },
  };
}
