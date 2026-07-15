'use client';

import { RefObject, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';
import {
  buildPlinth,
  buildWatch,
  createHeroRig,
  createStudioEnvironment,
  PLINTH_Y,
  setWatchHands,
  type WatchConfig,
} from '@/lib/watch-scene';

export interface StageControl {
  pointerX: number;
  pointerY: number;
  reveal: number;
  sweepDeg: number;
  sweepPower: number;
  scrollOut: number;
  floatOn: boolean;
  loupeOn: boolean;
  loupeX: number;
  loupeY: number;
}

export function createStageControl(): StageControl {
  return {
    pointerX: 0,
    pointerY: 0,
    reveal: 0,
    sweepDeg: 0,
    sweepPower: 0,
    scrollOut: 0,
    floatOn: true,
    loupeOn: false,
    loupeX: 0.5,
    loupeY: 0.5,
  };
}

const STAGE_CONFIG: WatchConfig = {
  caseColor: '#242424',
  dialColor: '#0E0E0E',
  caseRoughness: 0.3,
  strap: true,
  strapKind: 'alligator',
  bezelColor: '#C9A84C',
};

const WATCH_BASE_Y = 0.15;
const LENS_FOV = 1.7;
const LENS_RADIUS = 96;
const LENS_BG = new THREE.Color('#0A0A0A');

export function useHeroStage(
  containerRef: RefObject<HTMLDivElement>,
  control: StageControl,
): { supported: boolean } {
  const reduced = useReducedMotion();
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setSupported(false);
      return;
    }

    const size = () => ({ w: container.clientWidth || 1, h: container.clientHeight || 1 });
    let { w, h } = size();
    const mobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 7.4);
    camera.lookAt(0, -0.12, 0);

    const env = createStudioEnvironment(renderer);
    scene.environment = env.environment;

    const rig = createHeroRig(scene);

    const watch = buildWatch(STAGE_CONFIG);
    watch.group.position.y = WATCH_BASE_Y;
    scene.add(watch.group);
    const crystalBuildVisible = watch.crystal.visible;

    const mirror = buildWatch({ ...STAGE_CONFIG, detail: false });
    const mirrorRoot = new THREE.Group();
    mirrorRoot.add(mirror.group);
    mirrorRoot.scale.y = -1;
    mirrorRoot.position.y = 2 * PLINTH_Y;
    scene.add(mirrorRoot);
    mirror.crystal.visible = false;
    const mirrorMats = new Set<THREE.MeshStandardMaterial>();
    mirror.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.isMeshStandardMaterial) mirrorMats.add(mat);
    });
    mirrorMats.forEach((mat) => {
      mat.color.multiplyScalar(0.38);
      mat.envMapIntensity *= 0.35;
      mat.roughness = Math.min(1, mat.roughness + 0.3);
    });

    const veilCanvas = document.createElement('canvas');
    veilCanvas.width = 2;
    veilCanvas.height = 256;
    const veilCtx = veilCanvas.getContext('2d')!;
    const veilGrad = veilCtx.createLinearGradient(0, 0, 0, 256);
    veilGrad.addColorStop(0, 'rgba(10,10,10,0)');
    veilGrad.addColorStop(0.3, 'rgba(10,10,10,0.62)');
    veilGrad.addColorStop(0.8, 'rgba(10,10,10,1)');
    veilGrad.addColorStop(1, 'rgba(10,10,10,1)');
    veilCtx.fillStyle = veilGrad;
    veilCtx.fillRect(0, 0, 2, 256);
    const veilTex = new THREE.CanvasTexture(veilCanvas);
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 4.6),
      new THREE.MeshBasicMaterial({
        map: veilTex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    veil.position.set(0, PLINTH_Y - 2.3, 2.4);
    veil.renderOrder = 3;
    scene.add(veil);

    const plinth = buildPlinth();
    scene.add(plinth.group);

    const lensRadius = mobile ? 74 : LENS_RADIUS;
    const rtt = new THREE.WebGLRenderTarget(512, 512, { colorSpace: THREE.SRGBColorSpace });
    const lensCam = new THREE.PerspectiveCamera(LENS_FOV, 1, 0.1, 100);
    lensCam.position.copy(camera.position);
    const raycaster = new THREE.Raycaster();
    const dialPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.2);
    const dialNormal = new THREE.Vector3();
    const dialPoint = new THREE.Vector3();
    const lensTarget = new THREE.Vector3();
    const lensOffset = new THREE.Vector3();
    const ndc = new THREE.Vector2();

    const overlayScene = new THREE.Scene();
    const overlayCam = new THREE.OrthographicCamera(0, w, h, 0, -1, 1);
    const lensDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({
        map: rtt.texture,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const lensRim = new THREE.Mesh(
      new THREE.RingGeometry(0.965, 1.03, 64),
      new THREE.MeshBasicMaterial({
        color: '#C9A84C',
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const shadeCanvas = document.createElement('canvas');
    shadeCanvas.width = shadeCanvas.height = 256;
    const shadeCtx = shadeCanvas.getContext('2d')!;
    const shadeGrad = shadeCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    shadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadeGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
    shadeGrad.addColorStop(0.94, 'rgba(0,0,0,0.26)');
    shadeGrad.addColorStop(1, 'rgba(0,0,0,0.48)');
    shadeCtx.fillStyle = shadeGrad;
    shadeCtx.fillRect(0, 0, 256, 256);
    const shadeTex = new THREE.CanvasTexture(shadeCanvas);
    const lensEdge = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({
        map: shadeTex,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    lensDisc.renderOrder = 0;
    lensEdge.renderOrder = 1;
    lensRim.renderOrder = 2;
    lensRim.position.z = 0.1;
    lensEdge.position.z = 0.05;
    const lensGroup = new THREE.Group();
    lensGroup.add(lensDisc, lensEdge, lensRim);
    lensGroup.visible = false;
    overlayScene.add(lensGroup);

    const loupe = { x: 0.5, y: 0.5, alpha: 0 };
    const curRot = { x: 0, y: 0 };

    const renderFrame = (elapsed: number) => {
      const floatY = control.floatOn ? Math.sin(elapsed * 1.05) * 0.06 : 0;
      const y = WATCH_BASE_Y + floatY - control.scrollOut * 2.1;

      curRot.x += (control.pointerY * 0.6 - curRot.x) * 0.06;
      curRot.y += (control.pointerX * 0.9 - curRot.y) * 0.06;
      watch.group.rotation.x = curRot.x;
      watch.group.rotation.y = curRot.y + control.scrollOut * 0.9;
      watch.group.position.y = y;

      mirror.group.rotation.copy(watch.group.rotation);
      mirror.group.position.y = y;
      setWatchHands(watch);
      setWatchHands(mirror);

      rig.update({
        pointerX: control.pointerX,
        pointerY: control.pointerY,
        sweepDeg: control.sweepDeg,
        sweepPower: control.sweepPower,
        reveal: control.reveal * (1 - control.scrollOut * 0.88),
      });
      plinth.setIntensity(control.reveal * (1 - control.scrollOut * 0.6));

      loupe.x += (control.loupeX - loupe.x) * 0.12;
      loupe.y += (control.loupeY - loupe.y) * 0.12;
      loupe.alpha += ((control.loupeOn ? 1 : 0) - loupe.alpha) * 0.14;
      const loupeActive = loupe.alpha > 0.02;

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      if (loupeActive) {
        dialNormal.set(0, 0, 1).applyQuaternion(watch.group.quaternion);
        dialPoint.copy(watch.group.position).addScaledVector(dialNormal, 0.2);
        dialPlane.setFromNormalAndCoplanarPoint(dialNormal, dialPoint);
        ndc.set(loupe.x * 2 - 1, -(loupe.y * 2 - 1));
        raycaster.setFromCamera(ndc, camera);
        raycaster.ray.intersectPlane(dialPlane, lensTarget);
        lensOffset.copy(lensTarget).sub(dialPoint);
        if (lensOffset.length() > 1.15) lensOffset.setLength(1.15);
        lensTarget.copy(dialPoint).add(lensOffset);
        lensCam.position.copy(camera.position);
        lensCam.lookAt(lensTarget);

        watch.crystal.visible = false;
        renderer.setClearColor(LENS_BG, 1);
        renderer.setRenderTarget(rtt);
        renderer.clear();
        renderer.render(scene, lensCam);
        renderer.setRenderTarget(null);
        renderer.setClearColor(0x000000, 0);
        watch.crystal.visible = crystalBuildVisible;

        lensGroup.visible = true;
        lensGroup.position.set(loupe.x * w, h - loupe.y * h, 0);
        lensGroup.scale.setScalar(lensRadius * loupe.alpha);
        renderer.autoClear = false;
        renderer.render(overlayScene, overlayCam);
        renderer.autoClear = true;
      } else {
        lensGroup.visible = false;
      }
    };

    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const loop = () => {
      if (!visible) return;
      raf = requestAnimationFrame(loop);
      renderFrame(clock.getElapsedTime());
    };

    const resize = () => {
      ({ w, h } = size());
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      overlayCam.right = w;
      overlayCam.top = h;
      overlayCam.updateProjectionMatrix();
      renderFrame(clock.getElapsedTime());
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting && !document.hidden;
        if (next && !visible && !reduced) {
          visible = next;
          loop();
          return;
        }
        visible = next;
      },
      { threshold: 0.05 },
    );
    io.observe(container);

    const onVisibility = () => {
      const next = !document.hidden;
      if (next && !visible && !reduced) {
        visible = next;
        loop();
        return;
      }
      visible = next;
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced) {
      control.reveal = 1;
      control.floatOn = false;
      renderFrame(0);
    } else {
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      watch.dispose();
      mirror.dispose();
      plinth.dispose();
      rig.dispose();
      env.dispose();
      rtt.dispose();
      shadeTex.dispose();
      veilTex.dispose();
      veil.geometry.dispose();
      (veil.material as THREE.Material).dispose();
      lensDisc.geometry.dispose();
      (lensDisc.material as THREE.Material).dispose();
      lensRim.geometry.dispose();
      (lensRim.material as THREE.Material).dispose();
      lensEdge.geometry.dispose();
      (lensEdge.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [containerRef, control, reduced]);

  return { supported };
}
